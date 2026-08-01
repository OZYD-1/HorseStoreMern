import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import validate from "../validation/validate.js";
import { createOrderRules, updateStatusRules, idParamRule } from "../validation/order.validation.js";

const router = Router();
router.use(protect);

router.post("/", createOrderRules, validate, orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);
router.get("/:id", idParamRule, validate, orderController.getOrderById);
router.patch("/:id/cancel", idParamRule, validate, orderController.cancelOrder);

// admin
router.get("/", authorize("admin"), orderController.getAllOrders);
router.patch("/:id/status", authorize("admin"), idParamRule, updateStatusRules, validate, orderController.updateOrderStatus);

export default router;
