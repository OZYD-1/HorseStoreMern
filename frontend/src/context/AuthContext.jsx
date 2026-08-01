import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/authApi.js";
import { setAccessToken } from "../api/apiClient.js";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.data.accessToken);
        const me = await authApi.getMe();
        setUser(me.data.data.user);
      } catch (err) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => setUser(null);
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  const login = useCallback(async (payload) => {
    const { data } = await authApi.login(payload);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data;
  }, []);

  const adminLogin = useCallback(async (payload) => {
    const { data } = await authApi.adminLogin(payload);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      //  ignore errors during logout
    }
    setAccessToken(null);
    setUser(null);
    toast.info("Logged out successfully");
  }, []);

  const value = { user, loading, login, adminLogin, register, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
