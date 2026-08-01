import ApiError from "../utils/ApiError.js";
import env from "../config/env.js";

function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // أكواد أخطاء PostgreSQL الخام (بدون أي ORM)
  // المرجع: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (err.code === "23505") {
    return ApiError.conflict("This value is already in use (e.g., email, username, or slug)");
  }
  if (err.code === "23503") {
    return ApiError.badRequest("Cannot perform the operation due to a relationship with other records");
  }
  if (err.code === "23502") {
    return ApiError.badRequest(`The field "${err.column}" is required and cannot be empty`);
  }
  if (err.code === "22P02") {
    return ApiError.badRequest("An invalid value was sent to the server (e.g., an invalid UUID)");
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return ApiError.badRequest("File size exceeds the allowed limit");
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return ApiError.unauthorized("Invalid or expired login session");
  }

  return new ApiError(500, env.nodeEnv === "development" ? err.message : "error.internal", err.errors || []);
}
export function errorHandler(err, req, res, next) {
  const normalized = normalizeError(err);

  if (env.nodeEnv === "development") {
    console.error("Error:", err);
  }

  res.status(normalized.statusCode).json({
    success: false,
    message: normalized.message,
    errors: normalized.errors || [],
    ...(env.nodeEnv === "development" && { stack: err.stack }),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `The path ${req.originalUrl} does not exist`,
  });
}
