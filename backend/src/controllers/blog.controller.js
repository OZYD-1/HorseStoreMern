import { BlogModel } from "../models/index.js";
import catchAsync from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { generateUniqueSlug } from "../utils/slugHelper.js";
import { deleteUploadedFile } from "../utils/fileHelper.js";
import { requireDoubleConfirmation } from "../middleware/doubleConfirm.middleware.js";

// GET /api/blogs (public)
export const getBlogs = catchAsync(async (req, res) => {
  const { page = 1, limit = 9 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const { rows, total } = await BlogModel.list({ limit: Number(limit), offset, onlyPublished: true });

  new ApiResponse(200, {
    blogs: rows,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  }, "List of Blogs").send(res);
});

// GET /api/blogs/slug/:slug
export const getBlogBySlug = catchAsync(async (req, res) => {
  const blog = await BlogModel.findBySlug(req.params.slug, { onlyPublished: true });
  if (!blog) throw ApiError.notFound("Blog not found");
  new ApiResponse(200, { blog }).send(res);
});

// POST /api/blogs (admin)
export const createBlog = catchAsync(async (req, res) => {
  const { title, content, excerpt } = req.body;
  const slug = await generateUniqueSlug(BlogModel.slugExists, title);
  const image = req.file ? req.file.filename : null;

  const blog = await BlogModel.create({ title, content, excerpt, slug, image, authorId: req.user.id });
  new ApiResponse(201, { blog }, "Blog created successfully").send(res);
});

// PUT /api/blogs/:id (admin)
export const updateBlog = catchAsync(async (req, res) => {
  const existing = await BlogModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound("Blog not found");

  const { title, content, excerpt, isPublished } = req.body;

  let slug = null;
  if (title && title !== existing.title) {
    slug = await generateUniqueSlug(BlogModel.slugExists, title, existing.id);
  }

  let image = null;
  if (req.file) {
    deleteUploadedFile("blogs", existing.image);
    image = req.file.filename;
  }

  const blog = await BlogModel.update(existing.id, { title, slug, content, excerpt, image, isPublished });
  new ApiResponse(200, { blog }, "Blog updated successfully").send(res);
});

// DELETE /api/blogs/:id (admin) — DOUBLE CONFIRMATION REQUIRED
export const deleteBlog = [
  catchAsync(async (req, res, next) => {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) throw ApiError.notFound("Blog not found");
    req.targetResource = blog;
    next();
  }),
  requireDoubleConfirmation("delete-blog", (blog) => `Are you sure you want to delete the blog "${blog.title}"?`),
  catchAsync(async (req, res) => {
    const blog = req.targetResource;
    deleteUploadedFile("blogs", blog.image);
    await BlogModel.remove(blog.id);
    new ApiResponse(200, null, "Blog deleted successfully").send(res);
  }),
];
