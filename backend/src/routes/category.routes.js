import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { uploadCategoryImage } from "../middleware/upload.middleware.js";
import validate from "../validation/validate.js";
import { createCategoryRules, idParamRule } from "../validation/category.validation.js";

const router = Router();

router.get("/", categoryController.getCategories);
router.get("/:id", idParamRule, validate, categoryController.getCategoryById);

router.post("/", protect, authorize("admin"), uploadCategoryImage, createCategoryRules, validate, categoryController.createCategory);
router.put("/:id", protect, authorize("admin"), uploadCategoryImage, idParamRule, validate, categoryController.updateCategory);
router.delete("/:id", protect, authorize("admin"), idParamRule, validate, categoryController.deleteCategory);

export default router;
