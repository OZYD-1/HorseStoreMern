class ApiError extends Error {
  constructor(statusCode, message = "An error occurred", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = "you are not authorized to perform this action") {
    return new ApiError(401, message);
  }
  static forbidden(message = "you do not have permission to perform this action") {
    return new ApiError(403, message);
  }
  static notFound(message = "The requested resource was not found") {
    return new ApiError(404, message);
  }
  static conflict(message = "Data conflict") {
    return new ApiError(409, message);
  }
  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}

export default ApiError;
