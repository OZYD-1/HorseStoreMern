import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createUserTheme } from "./userTheme.js";
import { createAdminTheme } from "./adminTheme.js";

const ThemeModeContext = createContext(null);

const STORAGE_KEY = "horsestore-theme-mode";

export function ThemeModeProvider({ children, variant = "user" }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore storage errors (e.g. privacy mode)
    }
  }, [mode]);

  const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(() => {
    return variant === "admin" ? createAdminTheme(mode) : createUserTheme(mode);
  }, [variant, mode]);

  const value = useMemo(() => ({ mode, toggleMode, variant }), [mode, variant]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used inside <ThemeModeProvider>");
  return ctx;
}
