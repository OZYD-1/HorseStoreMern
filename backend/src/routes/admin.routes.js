import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect, authorize("admin"));

router.get("/dashboard", adminController.getDashboardStats);

export default router;
