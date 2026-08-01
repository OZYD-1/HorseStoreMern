import { body } from "express-validator";

export const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("name required")
    .isLength({ min: 2, max: 100 }).withMessage("name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("email required")
    .isEmail().withMessage("invalid email format"),
  body("password")
    .notEmpty().withMessage("password required")
    .isLength({ min: 6 }).withMessage("password must be at least 6 characters long"),
  body("phone")
    .optional({ checkFalsy: true })
    .isMobilePhone("any").withMessage("invalid phone number"),
];

export const loginRules = [
  body("email").trim().notEmpty().isEmail().withMessage("invalid email format"),
  body("password").notEmpty().withMessage("password required"),
];

export const changePasswordRules = [
  body("currentPassword").notEmpty().withMessage("current password required"),
  body("newPassword")
    .isLength({ min: 6 }).withMessage("new password must be at least 6 characters long"),
];
