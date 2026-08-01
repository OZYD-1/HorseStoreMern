import apiClient from "./apiClient.js";

export const userApi = {
  list: (params) => apiClient.get("/users", { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  toggleActive: (id, confirmToken) =>
    apiClient.patch(`/users/${id}/toggle-active`, { confirmToken }, { headers: confirmToken ? { "x-confirm-token": confirmToken } : {} }),
  remove: (id, confirmToken) =>
    apiClient.delete(`/users/${id}`, { headers: confirmToken ? { "x-confirm-token": confirmToken } : {} }),
};
