export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  if (statusCode > 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    message: statusCode >= 500 ? "An unexpected Error occurred" : err.message,
  });
}
