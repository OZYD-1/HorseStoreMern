import apiClient from "./apiClient.js";

export const orderApi = {
  create: (payload) => apiClient.post("/orders", payload),
  myOrders: () => apiClient.get("/orders/my-orders"),
  getById: (id) => apiClient.get(`/orders/${id}`),
  allOrders: (params) => apiClient.get("/orders", { params }),
  cancel: (id, confirmToken) =>
    apiClient.patch(`/orders/${id}/cancel`, {}, { headers: confirmToken ? { "x-confirm-token": confirmToken } : {} }),
  updateStatus: (id, status, confirmToken) =>
    apiClient.patch(
      `/orders/${id}/status`,
      { status, confirmToken },
      { headers: confirmToken ? { "x-confirm-token": confirmToken } : {} }
    ),
};
