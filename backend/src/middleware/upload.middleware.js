import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function makeStorage(subfolder) {
  const dest = path.join(process.cwd(), env.upload.dir, subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = EXT_BY_MIME[file.mimetype] || ".jpg";
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(
      ApiError.badRequest(
        "The image format is not supported (jpg, png, webp only)",
      ),
    );
  }
  cb(null, true);
}

export const uploadProductImages = multer({
  storage: makeStorage("products"),
  fileFilter,
  limits: { fileSize: env.upload.maxSizeMb * 1024 * 1024 },
}).array("images", 6);

export const uploadCategoryImage = multer({
  storage: makeStorage("categories"),
  fileFilter,
  limits: { fileSize: env.upload.maxSizeMb * 1024 * 1024 },
}).single("image");

export const uploadBlogImage = multer({
  storage: makeStorage("blogs"),
  fileFilter,
  limits: { fileSize: env.upload.maxSizeMb * 1024 * 1024 },
}).single("image");
