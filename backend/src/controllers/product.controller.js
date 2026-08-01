import { ProductModel, CategoryModel } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { generateUniqueSlug } from "../utils/slugHelper.js";
import { deleteMultipleFiles } from "../utils/fileHelper.js";
import { requireDoubleConfirmation } from "../middleware/doubleConfirm.middleware.js";

// GET /api/products  (public - list + filter + search + pagination)
export const getProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 12, search = "", categoryId, minPrice, maxPrice, sort = "newest", featured } = req.query;

  const { rows, total } = await ProductModel.list({
    page, limit, search, categoryId, minPrice, maxPrice, sort, featured, onlyActive: true,
  });

  new ApiResponse(200, {
    products: rows,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
  }, "List of Products").send(res);
});

// GET /api/products/slug/:slug
export const getProductBySlug = catchAsync(async (req, res) => {
  const product = await ProductModel.findBySlug(req.params.slug, { onlyActive: true });
  if (!product) throw ApiError.notFound("Product not found");
  new ApiResponse(200, { product }, "Product Details").send(res);
});

// GET /api/products/admin/:id  (admin - includes inactive)
export const getProductById = catchAsync(async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) throw ApiError.notFound("Product not found");
  new ApiResponse(200, { product }, "Product Details").send(res);
});

// POST /api/products  (admin)
export const createProduct = catchAsync(async (req, res) => {
  const { name, description, price, salePrice, stock, brand, categoryId, isFeatured } = req.body;

  if (categoryId) {
    const category = await CategoryModel.findById(categoryId);
    if (!category) throw ApiError.badRequest("Selected category does not exist");
  }

  const slug = await generateUniqueSlug(ProductModel.slugExists, name);
  const images = (req.files || []).map((f) => f.filename);

  const product = await ProductModel.create({
    name, description, price, salePrice: salePrice || null, stock: stock || 0,
    brand, categoryId: categoryId || null, isFeatured: !!isFeatured, slug, images,
  });

  new ApiResponse(201, { product }, "Product added successfully").send(res);
});

// PUT /api/products/:id  (admin)
export const updateProduct = catchAsync(async (req, res) => {
  const existing = await ProductModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound("Product not found");

  const { name, description, price, salePrice, stock, brand, categoryId, isFeatured, isActive } = req.body;

  if (categoryId) {
    const category = await CategoryModel.findById(categoryId);
    if (!category) throw ApiError.badRequest("Selected category does not exist");
  }

  let slug = null;
  if (name && name !== existing.name) {
    slug = await generateUniqueSlug(ProductModel.slugExists, name, existing.id);
  }

  let images = null;
  if (req.files && req.files.length > 0) {
    deleteMultipleFiles("products", existing.images);
    images = req.files.map((f) => f.filename);
  }

  const product = await ProductModel.update(existing.id, {
    name, slug, description, price, salePrice, stock, brand, categoryId, isFeatured, isActive, images,
  });

  new ApiResponse(200, { product }, "Product updated successfully").send(res);
});

// DELETE /api/products/:id  (admin) — DOUBLE CONFIRMATION REQUIRED
export const deleteProduct = [
  catchAsync(async (req, res, next) => {
    const product = await ProductModel.findById(req.params.id);
    if (!product) throw ApiError.notFound("Product not found");
    req.targetResource = product;
    next();
  }),
  requireDoubleConfirmation(
    "delete-product",
    (product) => `Are you sure you want to delete the product "${product.name}" permanently? This action cannot be undone.`
  ),
  catchAsync(async (req, res) => {
    const product = req.targetResource;
    deleteMultipleFiles("products", product.images);
    await ProductModel.remove(product.id);
    new ApiResponse(200, null, "Product deleted successfully").send(res);
  }),
];
