import multer from "multer";

export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (err instanceof multer.MulterError) {
    statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image exceeds the 8 MB upload limit."
        : "Image upload was not accepted.";
  }

  if (statusCode >= 500) {
    console.error(err);
    message = "An unexpected error occurred";
  }

  return res.status(statusCode).json({
    message: message || "Request failed",
  });
}
