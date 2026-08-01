import { Router } from "express";
import * as blogController from "../controllers/blog.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { uploadBlogImage } from "../middleware/upload.middleware.js";
import validate from "../validation/validate.js";
import { createBlogRules, idParamRule } from "../validation/blog.validation.js";

const router = Router();

router.get("/", blogController.getBlogs);
router.get("/slug/:slug", blogController.getBlogBySlug);

router.post("/", protect, authorize("admin"), uploadBlogImage, createBlogRules, validate, blogController.createBlog);
router.put("/:id", protect, authorize("admin"), uploadBlogImage, idParamRule, validate, blogController.updateBlog);
router.delete("/:id", protect, authorize("admin"), idParamRule, validate, blogController.deleteBlog);

export default router;
