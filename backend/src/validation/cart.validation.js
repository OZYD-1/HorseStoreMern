import { body, param } from "express-validator";

export const addToCartRules = [
  body("productId").isUUID().withMessage("invalid product ID"),
  body("quantity")
    .optional()
    .isInt({ min: 1 }).withMessage("quantity must be a positive integer"),
];

export const updateCartRules = [
  body("quantity")
    .isInt({ min: 1 }).withMessage("quantity must be a positive integer"),
];

export const idParamRule = [param("id").isUUID().withMessage("invalid ID format")];
