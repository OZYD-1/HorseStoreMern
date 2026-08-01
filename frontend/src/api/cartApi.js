import apiClient from "./apiClient.js";

export const cartApi = {
  get: () => apiClient.get("/cart"),
  add: (productId, quantity = 1) => apiClient.post("/cart", { productId, quantity }),
  update: (id, quantity) => apiClient.patch(`/cart/${id}`, { quantity }),
  remove: (id) => apiClient.delete(`/cart/${id}`),
  clear: (confirmToken) =>
    apiClient.delete("/cart", { headers: confirmToken ? { "x-confirm-token": confirmToken } : {} }),
};
