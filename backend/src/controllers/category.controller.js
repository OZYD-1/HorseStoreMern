import { CategoryModel } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { generateUniqueSlug } from "../utils/slugHelper.js";
import { deleteUploadedFile } from "../utils/fileHelper.js";
import { requireDoubleConfirmation } from "../middleware/doubleConfirm.middleware.js";

// GET /api/categories (public)
export const getCategories = catchAsync(async (req, res) => {
  const categories = await CategoryModel.findAllActive();
  new ApiResponse(200, { categories }, "Categories retrieved successfully").send(res);
});

// GET /api/categories/:id
export const getCategoryById = catchAsync(async (req, res) => {
  const category = await CategoryModel.findById(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");
  new ApiResponse(200, { category }).send(res);
});

// POST /api/categories (admin)
export const createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;
  const slug = await generateUniqueSlug(CategoryModel.slugExists, name);
  const image = req.file ? req.file.filename : null;

  const category = await CategoryModel.create({ name, slug, image });
  new ApiResponse(201, { category }, "Category created successfully").send(res);
});

// PUT /api/categories/:id (admin)
export const updateCategory = catchAsync(async (req, res) => {
  const existing = await CategoryModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound("Category not found");

  const { name, isActive } = req.body;

  let slug = null;
  if (name && name !== existing.name) {
    slug = await generateUniqueSlug(CategoryModel.slugExists, name, existing.id);
  }

  let image = null;
  if (req.file) {
    deleteUploadedFile("categories", existing.image);
    image = req.file.filename;
  }

  const category = await CategoryModel.update(existing.id, { name, slug, image, isActive });
  new ApiResponse(200, { category }, "Category updated successfully").send(res);
});

// DELETE /api/categories/:id (admin) — DOUBLE CONFIRMATION REQUIRED
export const deleteCategory = [
  catchAsync(async (req, res, next) => {
    const category = await CategoryModel.findById(req.params.id);
    if (!category) throw ApiError.notFound("Category not found");

    const productsCount = await CategoryModel.countProductsInCategory(category.id);
    req.targetResource = { ...category, productsCount };
    next();
  }),
  requireDoubleConfirmation(
    "delete-category",
    (category) => {
      const count = category.productsCount || 0;
      return count > 0
        ? `Are you sure you want to delete the category "${category.name}" which has ${count} products?`
        : `Are you sure you want to delete the category "${category.name}"?`;
    }
  ),
  catchAsync(async (req, res) => {
    const category = req.targetResource;
    deleteUploadedFile("categories", category.image);
    await CategoryModel.remove(category.id);
    new ApiResponse(200, null, "Category deleted successfully").send(res);
  }),
];
