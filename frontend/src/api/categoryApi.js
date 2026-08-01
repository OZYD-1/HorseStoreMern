import apiClient from "./apiClient.js";

export const categoryApi = {
  list: () => apiClient.get("/categories"),
  getById: (id) => apiClient.get(`/categories/${id}`),
  create: (formData) =>
    apiClient.post("/categories", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    apiClient.put(`/categories/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id, confirmToken) =>
    apiClient.delete(`/categories/${id}`, { headers: confirmToken ? { "x-confirm-token": confirmToken } : {} }),
};
