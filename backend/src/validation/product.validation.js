import { body, param } from "express-validator";

export const createProductRules = [
  body("name")
    .trim().notEmpty().withMessage("the product name is required")
    .isLength({ min: 2, max: 150 }).withMessage("the product name must be between 2 and 150 characters"),
  body("price")
    .notEmpty().withMessage("the price is required")
    .isFloat({ min: 0 }).withMessage("the price must be a positive number"),
  body("salePrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage("the sale price must be a positive number"),
  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("the stock must be a positive integer"),
  body("categoryId")
    .optional({ checkFalsy: true })
    .isUUID().withMessage("the category ID is invalid"),
  body("description").optional().isLength({ max: 5000 }),
];

export const idParamRule = [
  param("id").isUUID().withMessage("invalid ID format"),
];
