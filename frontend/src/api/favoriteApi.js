import apiClient from "./apiClient.js";

export const favoriteApi = {
  list: () => apiClient.get("/favorites"),
  add: (productId) => apiClient.post("/favorites", { productId }),
  remove: (productId) => apiClient.delete(`/favorites/${productId}`),
};
