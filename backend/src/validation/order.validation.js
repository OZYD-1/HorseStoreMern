import { body, param } from "express-validator";

export const createOrderRules = [
  body("shippingAddress").trim().notEmpty().withMessage("shipping address is required"),
  body("phone").trim().notEmpty().withMessage("phone number is required")
    .isMobilePhone("any").withMessage("invalid phone number"),
  body("paymentMethod")
    .optional()
    .isIn(["cash_on_delivery", "card"]).withMessage("unsupported payment method"),
];

export const updateStatusRules = [
  body("status")
    .isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"])
    .withMessage("invalid order status"),
];

export const idParamRule = [param("id").isUUID().withMessage("invalid ID format")];
