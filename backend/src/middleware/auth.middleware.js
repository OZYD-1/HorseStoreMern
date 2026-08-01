import { verifyAccessToken } from "../utils/generateTokens.js";
import { UserModel } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";

export const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    throw ApiError.unauthorized("you do not have permission to access this resource, please log in");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized("your session has expired, please log in again");
  }

  const user = await UserModel.findById(payload.id);
  if (!user || !user.is_active) {
    throw ApiError.unauthorized("the account does not exist or has been deactivated");
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw ApiError.forbidden("you do not have permission to access this resource");
  }
  next();
};

export const optionalAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      const user = await UserModel.findById(payload.id);
      if (user && user.is_active) req.user = user;
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }
  next();
});
