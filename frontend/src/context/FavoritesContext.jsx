import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { favoriteApi } from "../api/favoriteApi.js";
import { useAuth } from "./AuthContext.jsx";
import { toast } from "react-toastify";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await favoriteApi.list();
      setFavorites(data.data.favorites);
    } catch (err) {
      // صامت
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback(
    (productId) => favorites.some((f) => f.id === productId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productId) => {
      if (!user) {
        toast.info("Please log in first to add the product to favorites");
        return;
      }
      try {
        if (isFavorite(productId)) {
          await favoriteApi.remove(productId);
          toast.success("Product removed from favorites successfully");
        } else {
          await favoriteApi.add(productId);
          toast.success("Product added to favorites successfully");
        }
        await refreshFavorites();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to update favorite status");
      }
    },
    [user, isFavorite, refreshFavorites]
  );

  const value = {
    favorites,
    loading,
    count: favorites.length,
    isFavorite,
    toggleFavorite,
    refreshFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside <FavoritesProvider>");
  return ctx;
}
