import fs from "fs";
import path from "path";
import env from "../config/env.js";

export function deleteUploadedFile(subfolder, filename) {
  if (!filename) return;
  const filePath = path.join(process.cwd(), env.upload.dir, subfolder, filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete file:", filePath, err.message);
    }
  });
}

export function deleteMultipleFiles(subfolder, filenames = []) {
  filenames.forEach((f) => deleteUploadedFile(subfolder, f));
}
