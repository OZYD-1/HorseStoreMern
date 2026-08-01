import apiClient from "./apiClient.js";

export const adminApi = {
  dashboard: () => apiClient.get("/admin/dashboard"),
};
