import { FavoriteModel, ProductModel } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";

// GET /api/favorites
export const getFavorites = catchAsync(async (req, res) => {
  const favorites = await FavoriteModel.findByUser(req.user.id);
  new ApiResponse(200, { favorites }, "Favorites retrieved successfully").send(res);
});

// POST /api/favorites
export const addFavorite = catchAsync(async (req, res) => {
  const { productId } = req.body;

  const product = await ProductModel.findById(productId);
  if (!product) throw ApiError.notFound("Product not found");

  const existing = await FavoriteModel.findOne(req.user.id, productId);
  if (existing) throw ApiError.conflict("Product already exists in favorites");

  const favorite = await FavoriteModel.create({ userId: req.user.id, productId });
  new ApiResponse(201, { favorite }, "Product added to favorites successfully").send(res);
});

// DELETE /api/favorites/:productId
export const removeFavorite = catchAsync(async (req, res) => {
  const favorite = await FavoriteModel.findOne(req.user.id, req.params.productId);
  if (!favorite) throw ApiError.notFound("Product not found in favorites");

  await FavoriteModel.remove(req.user.id, req.params.productId);
  new ApiResponse(200, null, "Product removed from favorites successfully").send(res);
});
