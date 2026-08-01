import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export default function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  throw ApiError.badRequest("the input data is invalid", formatted);
}
