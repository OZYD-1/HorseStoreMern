import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect, authorize("admin"));

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id/toggle-active", userController.toggleUserActive);
router.delete("/:id", userController.deleteUser);

export default router;
