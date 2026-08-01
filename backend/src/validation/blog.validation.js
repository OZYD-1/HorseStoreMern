import { body, param } from "express-validator";

export const createBlogRules = [
  body("title").trim().notEmpty().withMessage("title required")
    .isLength({ min: 3, max: 200 }).withMessage("title must be between 3 and 200 characters"),
  body("content").trim().notEmpty().withMessage("content required"),
  body("excerpt").optional().isLength({ max: 300 }),
];

export const idParamRule = [param("id").isUUID().withMessage("invalid ID format")];
