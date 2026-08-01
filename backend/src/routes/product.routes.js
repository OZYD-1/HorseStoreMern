import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { uploadProductImages } from "../middleware/upload.middleware.js";
import validate from "../validation/validate.js";
import { createProductRules, idParamRule } from "../validation/product.validation.js";

const router = Router();

// Public
router.get("/", productController.getProducts);
router.get("/slug/:slug", productController.getProductBySlug);

// Admin
router.get("/admin/:id", protect, authorize("admin"), idParamRule, validate, productController.getProductById);
router.post("/", protect, authorize("admin"), uploadProductImages, createProductRules, validate, productController.createProduct);
router.put("/:id", protect, authorize("admin"), uploadProductImages, idParamRule, validate, productController.updateProduct);
router.delete("/:id", protect, authorize("admin"), idParamRule, validate, productController.deleteProduct);

export default router;
