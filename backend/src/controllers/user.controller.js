import { UserModel } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { requireDoubleConfirmation } from "../middleware/doubleConfirm.middleware.js";

// GET /api/users  (admin only)
export const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const { rows, total } = await UserModel.list({ limit: Number(limit), offset, search });

  new ApiResponse(200, {
    users: rows,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  }, "List of Users").send(res);
});

// GET /api/users/:id (admin only)
export const getUserById = catchAsync(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  new ApiResponse(200, { user: UserModel.toSafeUser(user) }).send(res);
});

// PATCH /api/users/:id/toggle-active (admin only) — DOUBLE CONFIRMATION REQUIRED
export const toggleUserActive = [
  catchAsync(async (req, res, next) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) throw ApiError.notFound("User not found");
    if (user.role === "admin") throw ApiError.forbidden("Cannot deactivate another admin account");
    req.targetResource = user;
    next();
  }),
  requireDoubleConfirmation(
    "toggle-user-active",
    (user) => user.is_active
      ? `Are you sure you want to deactivate the account "${user.name}"?`
      : `Are you sure you want to reactivate the account "${user.name}"?`
  ),
  catchAsync(async (req, res) => {
    const user = req.targetResource;
    const updated = await UserModel.setActive(user.id, !user.is_active);
    new ApiResponse(200, { user: UserModel.toSafeUser(updated) }, "User status updated successfully").send(res);
  }),
];

// DELETE /api/users/:id (admin only) — DOUBLE CONFIRMATION REQUIRED
export const deleteUser = [
  catchAsync(async (req, res, next) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) throw ApiError.notFound("User not found");
    if (user.role === "admin") throw ApiError.forbidden("Cannot delete another admin account");
    req.targetResource = user;
    next();
  }),
  requireDoubleConfirmation(
    "delete-user",
    (user) => `Are you sure you want to delete the account "${user.name}" permanently? All associated data will be lost.`
  ),
  catchAsync(async (req, res) => {
    await UserModel.remove(req.targetResource.id);
    new ApiResponse(200, null, "User deleted successfully").send(res);
  }),
];
