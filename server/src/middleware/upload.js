import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";
import AppError from "../utils/app-error.js";
import { detectImageFormat } from "../utils/image-format.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const uploadDirectory = path.resolve(currentDirectory, "../../uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },
  filename: (_req, file, callback) => {
    const readName = crypto.randomUUID();
    const extension = allowedTypes[file.mimetype];

    if (!extension) {
      return callback(new AppError("Unsupported image type.", 400));
    }
    callback(null, `${readName}${extension}`);
  },
});

export const uploadImage = multer({
  storage,

  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedTypes[file.mimetype]) {
      return callback(new AppError("Only JPEG, PNG, WebP and GIF are allowed.", 400));
    }
    callback(null, true);
  },
});

export async function verifyUploadedImage(req, res, next) {
  if (!req.file) return next();

  try {
    const file = await fs.promises.readFile(req.file.path);
    const actualFormat = detectImageFormat(file);
    const claimedExtension = allowedTypes[req.file.mimetype];

    if (!actualFormat || actualFormat.extension !== claimedExtension) {
      await fs.promises.unlink(req.file.path);
      return next(new AppError("Uploaded file content is not a supported image.", 400));
    }

    return next();
  } catch (error) {
    try {
      await fs.promises.unlink(req.file.path);
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") {
        console.error("Could not remove invalid upload", cleanupError);
      }
    }
    return next(error);
  }
}
