import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../validation/validate.js";
import { registerRules, loginRules, changePasswordRules } from "../validation/auth.validation.js";

const router = Router();

router.post("/register", registerRules, validate, authController.register);
router.post("/login", loginRules, validate, authController.login);
router.post("/admin-login", loginRules, validate, authController.adminLogin);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);
router.patch("/change-password", protect, changePasswordRules, validate, authController.changePassword);

export default router;
