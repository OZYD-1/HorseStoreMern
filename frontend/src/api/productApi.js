import apiClient from "./apiClient.js";

export const productApi = {
  list: (params) => apiClient.get("/products", { params }),
  getBySlug: (slug) => apiClient.get(`/products/slug/${slug}`),
  getById: (id) => apiClient.get(`/products/admin/${id}`),
  create: (formData) =>
    apiClient.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    apiClient.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  // confirmToken  is optional, only needed if the server requires double confirmation for deletion
  remove: (id, confirmToken) =>
    apiClient.delete(`/products/${id}`, { headers: confirmToken ? { "x-confirm-token": confirmToken } : {} }),
};
