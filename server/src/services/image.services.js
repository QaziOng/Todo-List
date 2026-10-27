import dns from "dns/promises";
import fs from "fs/promises";
import http from "http";
import https from "https";
import net from "net";
import path from "path";
import { randomUUID } from "crypto";
import { uploadDirectory } from "../middleware/upload.js";
import AppError from "../utils/app-error.js";
import { detectImageFormat } from "../utils/image-format.js";

const maximumImageBytes = 8 * 1024 * 1024;
const maximumRedirects = 3;
const requestTimeoutMs = 10_000;

const blockedIpv4Ranges = [
  ([a]) => a === 0,
  ([a]) => a === 10,
  ([a, b]) => a === 100 && b >= 64 && b <= 127,
  ([a]) => a === 127,
  ([a, b]) => a === 169 && b === 254,
  ([a, b]) => a === 172 && b >= 16 && b <= 31,
  ([a, b, c]) => a === 192 && b === 0 && c === 0,
  ([a, b, c]) => a === 192 && b === 0 && c === 2,
  ([a, b]) => a === 192 && b === 168,
  ([a, b, c]) => a === 192 && b === 88 && c === 99,
  ([a, b]) => a === 198 && (b === 18 || b === 19),
  ([a, b, c]) => a === 198 && b === 51 && c === 100,
  ([a, b, c]) => a === 203 && b === 0 && c === 113,
  ([a]) => a >= 224,
];

function isPublicIpv4(address) {
  if (net.isIP(address) !== 4) return false;
  const octets = address.split(".").map(Number);
  return !blockedIpv4Ranges.some((isBlocked) => isBlocked(octets));
}

async function resolvePublicIpv4(hostname) {
  if (net.isIP(hostname)) {
    if (isPublicIpv4(hostname)) return hostname;
    throw new AppError("Image URL must point to a public IPv4 address.", 400);
  }

  let addresses;
  try {
    addresses = await dns.lookup(hostname, {
      all: true,
      family: 4,
      verbatim: true,
    });
  } catch {
    throw new AppError("Could not resolve the image URL host.", 422);
  }

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicIpv4(address))
  ) {
    throw new AppError("Image URL must resolve only to public IPv4 addresses.", 400);
  }

  return addresses[0].address;
}

function validateRemoteUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new AppError("Enter a valid image URL.", 400);
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && url.port !== (url.protocol === "https:" ? "443" : "80"))
  ) {
    throw new AppError("Image URL must use HTTP or HTTPS on a standard port.", 400);
  }

  if (net.isIP(url.hostname) === 6) {
    throw new AppError("IPv6 image URLs are not supported.", 400);
  }

  return url;
}

function requestRemoteResponse(url, address) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    const request = transport.get(
      url,
      {
        headers: {
          Accept: "image/jpeg,image/png,image/webp,image/gif",
          "User-Agent": "TodoListImageImporter/1.0",
        },
        lookup: (_hostname, options, callback) => {
          if (options?.all) {
            callback(null, [{ address, family: 4 }]);
            return;
          }
          callback(null, address, 4);
        },
      },
      (response) => resolve({ request, response }),
    );

    request.setTimeout(requestTimeoutMs, () => {
      request.destroy(new Error("Remote image request timed out."));
    });
    request.once("error", reject);
  });
}

async function readLimitedResponse(response, request) {
  const chunks = [];
  let totalBytes = 0;
  const timeout = setTimeout(
    () => request.destroy(new Error("Remote image download timed out.")),
    requestTimeoutMs,
  );

  try {
    for await (const chunk of response) {
      totalBytes += chunk.length;
      if (totalBytes > maximumImageBytes) {
        request.destroy();
        throw new AppError("Image URL response exceeds the 8 MB limit.", 413);
      }
      chunks.push(chunk);
    }
    return Buffer.concat(chunks, totalBytes);
  } finally {
    clearTimeout(timeout);
  }
}

export async function importRemoteImage(value) {
  let currentUrl = validateRemoteUrl(value);

  for (let redirectCount = 0; redirectCount <= maximumRedirects; redirectCount += 1) {
    const address = await resolvePublicIpv4(currentUrl.hostname);
    let remoteResponse;
    try {
      remoteResponse = await requestRemoteResponse(currentUrl, address);
    } catch {
      throw new AppError("Could not connect to the image URL.", 422);
    }
    const { request, response } = remoteResponse;
    const statusCode = response.statusCode ?? 0;

    if ([301, 302, 303, 307, 308].includes(statusCode)) {
      const location = response.headers.location;
      response.destroy();
      if (!location || redirectCount === maximumRedirects) {
        throw new AppError("Image URL redirected too many times or had no destination.", 422);
      }
      const redirectedUrl = validateRemoteUrl(
        new URL(location, currentUrl).toString(),
      );
      if (currentUrl.protocol === "https:" && redirectedUrl.protocol !== "https:") {
        throw new AppError("HTTPS image URLs cannot redirect to HTTP.", 422);
      }
      currentUrl = redirectedUrl;
      continue;
    }

    if (statusCode !== 200) {
      response.destroy();
      throw new AppError("The image URL did not return a successful response.", 422);
    }

    const contentLength = Number(response.headers["content-length"]);
    if (Number.isFinite(contentLength) && contentLength > maximumImageBytes) {
      response.destroy();
      throw new AppError("Image URL response exceeds the 8 MB limit.", 413);
    }

    const expectedMimeType = String(response.headers["content-type"] ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    let buffer;
    try {
      buffer = await readLimitedResponse(response, request);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Could not download the image response.", 422);
    }
    const imageFormat = detectImageFormat(buffer);

    if (!imageFormat || imageFormat.mimeType !== expectedMimeType) {
      throw new AppError("URL response is not a supported image.", 422);
    }

    const filename = `${randomUUID()}${imageFormat.extension}`;
    const filePath = path.join(uploadDirectory, filename);
    try {
      await fs.writeFile(filePath, buffer, { flag: "wx" });
    } catch (error) {
      await fs.unlink(filePath).catch((cleanupError) => {
        if (cleanupError.code !== "ENOENT") {
          console.error("Could not remove incomplete imported image", cleanupError);
        }
      });
      throw error;
    }
    return { filename, filePath };
  }

  throw new AppError("Could not follow the image URL.", 422);
}

export async function removeStoredImage(filename) {
  if (
    typeof filename !== "string" ||
    !/^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i.test(filename)
  ) {
    return;
  }

  const filePath = path.resolve(uploadDirectory, filename);
  if (path.dirname(filePath) !== path.resolve(uploadDirectory)) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
