import { body, param } from "express-validator";

export const createCategoryRules = [
  body("name")
    .trim().notEmpty().withMessage("the category name is required")
    .isLength({ min: 2, max: 80 }).withMessage("the category name must be between 2 and 80 characters"),
];

export const idParamRule = [param("id").isUUID().withMessage("invalid ID format")];
