import { createTheme } from "@mui/material/styles";
import { adminLightTokens, adminDarkTokens, fontFamilyHeading, fontFamilyBody } from "./tokens.js";

export function createAdminTheme(mode = "light") {
  const tokens = mode === "dark" ? adminDarkTokens : adminLightTokens;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.main,
        contrastText: "#ffffff",
      },
      secondary: {
        main: tokens.sale,
      },
      background: {
        default: tokens.bg,
        paper: tokens.surface,
      },
      text: {
        primary: tokens.heading,
        secondary: tokens.p,
      },
      divider: tokens.border,
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: fontFamilyBody,
      h1: { fontFamily: fontFamilyHeading, fontWeight: 700 },
      h2: { fontFamily: fontFamilyHeading, fontWeight: 700 },
      h3: { fontFamily: fontFamilyHeading, fontWeight: 700 },
      h4: { fontFamily: fontFamilyHeading, fontWeight: 600 },
      h5: { fontFamily: fontFamilyHeading, fontWeight: 600 },
      h6: { fontFamily: fontFamilyHeading, fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: tokens.sidebar,
            color: tokens.sidebarText,
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
      },
    },
    custom: tokens,
  });
}

export const adminThemeLight = createAdminTheme("light");
export const adminThemeDark = createAdminTheme("dark");
