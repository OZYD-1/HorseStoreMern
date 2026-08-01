import { UserModel, RefreshTokenModel } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  expiryToDate,
} from "../utils/generateTokens.js";
import env from "../config/env.js";

const REFRESH_COOKIE_NAME = "refreshToken";

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  };
}

async function issueTokensForUser(user, res) {
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await RefreshTokenModel.create({
    token: refreshToken,
    userId: user.id,
    expiresAt: expiryToDate(env.jwt.refreshExpires),
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
}

export const register = catchAsync(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const existing = await UserModel.findByEmail(email);
  if (existing) throw ApiError.conflict(" this email is already registered");

  const user = await UserModel.create({ name, email, password, phone, address });
  const accessToken = await issueTokensForUser(user, res);

  new ApiResponse(201, { user: UserModel.toSafeUser(user), accessToken }, "Account created successfully").send(res);
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findByEmail(email);
  if (!user || !(await UserModel.comparePassword(password, user.password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (!user.is_active) {
    throw ApiError.forbidden("This account has been disabled, please contact support");
  }

  const accessToken = await issueTokensForUser(user, res);
  new ApiResponse(200, { user: UserModel.toSafeUser(user), accessToken }, "Login successful").send(res);
});

export const adminLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findByEmail(email);
  if (!user || !(await UserModel.comparePassword(password, user.password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (user.role !== "admin") {
    throw ApiError.forbidden("This account does not have permission to access the admin panel");
  }

  const accessToken = await issueTokensForUser(user, res);
  new ApiResponse(200, { user: UserModel.toSafeUser(user), accessToken }, "Admin login successful").send(res);
});

export const refresh = catchAsync(async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  if (!token) throw ApiError.unauthorized("No active session found");

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    throw ApiError.unauthorized("Session expired, please login again");
  }

  const stored = await RefreshTokenModel.findValid({ token, userId: payload.id });
  if (!stored || new Date(stored.expires_at) < new Date()) {
    throw ApiError.unauthorized("Session expired, please login again");
  }

  const user = await UserModel.findById(payload.id);
  if (!user || !user.is_active) throw ApiError.unauthorized("Account not found or disabled");

  await RefreshTokenModel.revokeByToken(token);

  const accessToken = await issueTokensForUser(user, res);
  new ApiResponse(200, { accessToken }, "Session renewed").send(res);
});

export const logout = catchAsync(async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  if (token) {
    await RefreshTokenModel.revokeByToken(token);
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  new ApiResponse(200, null, "Logout successful").send(res);
});

export const getMe = catchAsync(async (req, res) => {
  new ApiResponse(200, { user: UserModel.toSafeUser(req.user) }, "Account data").send(res);
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  if (!(await UserModel.comparePassword(currentPassword, user.password))) {
    throw ApiError.badRequest("Invalid current password");
  }

  await UserModel.updatePassword(user.id, newPassword);
  await RefreshTokenModel.revokeAllForUser(user.id);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });

  new ApiResponse(200, null, "Password changed successfully, please login again").send(res);
});
