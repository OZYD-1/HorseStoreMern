import { CartItemModel, ProductModel } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { requireDoubleConfirmation } from "../middleware/doubleConfirm.middleware.js";

// GET /api/cart
export const getCart = catchAsync(async (req, res) => {
  const items = await CartItemModel.findByUser(req.user.id);

  const total = items.reduce((sum, item) => {
    const price = item.sale_price || item.price || 0;
    return sum + Number(price) * item.quantity;
  }, 0);

  new ApiResponse(200, { items, total }, "Contents of the cart").send(res);
});

// POST /api/cart
export const addToCart = catchAsync(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await ProductModel.findById(productId);
  if (!product || !product.is_active) throw ApiError.notFound("Product not found");
  if (product.stock < quantity) throw ApiError.badRequest("Requested quantity is not available in stock");

  let item = await CartItemModel.findOne(req.user.id, productId);

  if (item) {
    item = await CartItemModel.updateQuantity(item.id, item.quantity + Number(quantity));
  } else {
    item = await CartItemModel.create({ userId: req.user.id, productId, quantity });
  }

  new ApiResponse(201, { item }, "Product added to cart successfully").send(res);
});

// PATCH /api/cart/:id
export const updateCartItem = catchAsync(async (req, res) => {
  const { quantity } = req.body;

  const item = await CartItemModel.findById(req.params.id, req.user.id);
  if (!item) throw ApiError.notFound("Item not found in cart");
  if (item.stock < quantity) throw ApiError.badRequest("Requested quantity is not available in stock");

  const updated = await CartItemModel.updateQuantity(item.id, quantity);
  new ApiResponse(200, { item: updated }, "Quantity updated successfully").send(res);
});

// DELETE /api/cart/:id  (removing a single cart item is low-risk, no double confirm needed)
export const removeCartItem = catchAsync(async (req, res) => {
  const item = await CartItemModel.findById(req.params.id, req.user.id);
  if (!item) throw ApiError.notFound("Item not found in cart");

  await CartItemModel.remove(item.id);
  new ApiResponse(200, null, "Product removed from cart successfully").send(res);
});

// DELETE /api/cart  (clear whole cart) — DOUBLE CONFIRMATION REQUIRED
export const clearCart = [
  catchAsync(async (req, res, next) => {
    const count = await CartItemModel.countForUser(req.user.id);
    if (count === 0) throw ApiError.badRequest("Cart is already empty");
    req.targetResource = { id: req.user.id };
    next();
  }),
  requireDoubleConfirmation("clear-cart", () => "Are you sure you want to clear the entire cart?"),
  catchAsync(async (req, res) => {
    await CartItemModel.clearForUser(req.user.id);
    new ApiResponse(200, null, "Cart cleared successfully").send(res);
  }),
];
