const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export function getUploadUrl(subfolder, filename) {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${API_ORIGIN}/uploads/${subfolder}/${filename}`;
}

export function getProductImageUrl(filename) {
  return getUploadUrl("products", filename);
}

export function getCategoryImageUrl(filename) {
  return getUploadUrl("categories", filename);
}

export function getBlogImageUrl(filename) {
  return getUploadUrl("blogs", filename);
}

export function getAvatarImageUrl(filename) {
  return getUploadUrl("avatars", filename);
}