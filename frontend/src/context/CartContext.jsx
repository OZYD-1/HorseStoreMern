import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartApi } from "../api/cartApi.js";
import { useAuth } from "./AuthContext.jsx";
import { toast } from "react-toastify";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const { data } = await cartApi.get();
      setItems(data.data.items);
      setTotal(data.data.total);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to fetch cart data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!user) {
        toast.info("Please log in first to add the product to the cart");
        return;
      }
      try {
        await cartApi.add(productId, quantity);
        await refreshCart();
        toast.success("Product added to cart successfully");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to add product to cart");
      }
    },
    [user, refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      try {
        await cartApi.update(itemId, quantity);
        await refreshCart();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to update quantity");
      }
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      try {
        await cartApi.remove(itemId);
        await refreshCart();
        toast.success("Product removed from cart successfully");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to remove product from cart");
      }
    },
    [refreshCart]
  );

  const value = {
    items,
    total,
    loading,
    count: items.reduce((sum, i) => sum + i.quantity, 0),
    addToCart,
    updateQuantity,
    removeItem,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
