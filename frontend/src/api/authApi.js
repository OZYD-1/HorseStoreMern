import apiClient from "./apiClient.js";

export const authApi = {
  register: (payload) => apiClient.post("/auth/register", payload),
  login: (payload) => apiClient.post("/auth/login", payload),
  adminLogin: (payload) => apiClient.post("/auth/admin-login", payload),
  logout: () => apiClient.post("/auth/logout"),
  refresh: () => apiClient.post("/auth/refresh"),
  getMe: () => apiClient.get("/auth/me"),
  updateProfile: (formData) =>
    apiClient.patch("/auth/profile", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  changePassword: (payload) => apiClient.patch("/auth/change-password", payload),
};