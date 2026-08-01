import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../validation/validate.js";
import { addToCartRules, updateCartRules, idParamRule } from "../validation/cart.validation.js";

const router = Router();
router.use(protect);

router.get("/", cartController.getCart);
router.post("/", addToCartRules, validate, cartController.addToCart);
router.patch("/:id", idParamRule, updateCartRules, validate, cartController.updateCartItem);
router.delete("/:id", idParamRule, validate, cartController.removeCartItem);
router.delete("/", cartController.clearCart);

export default router;
