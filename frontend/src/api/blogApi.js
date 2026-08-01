import apiClient from "./apiClient.js";

export const blogApi = {
  list: (params) => apiClient.get("/blogs", { params }),
  getBySlug: (slug) => apiClient.get(`/blogs/slug/${slug}`),
  create: (formData) =>
    apiClient.post("/blogs", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    apiClient.put(`/blogs/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id, confirmToken) =>
    apiClient.delete(`/blogs/${id}`, { headers: confirmToken ? { "x-confirm-token": confirmToken } : {} }),
};
