import { createTheme } from "@mui/material/styles";
import { userLightTokens, userDarkTokens, fontFamilyHeading, fontFamilyBody } from "./tokens.js";

export function createUserTheme(mode = "light") {
  const tokens = mode === "dark" ? userDarkTokens : userLightTokens;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: tokens.main,
        contrastText: tokens.surface === "#ffffff" ? "#ffffff" : tokens.heading,
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
      borderRadius: 12,
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
          root: {
            borderRadius: 30,
            padding: "10px 18px",
            transition: "0.3s ease",
          },
          containedPrimary: {
            color: "#ffffff",
            "&:hover": { transform: "scale(1.05)" },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            maxWidth: "1350px !important",
          },
        },
      },
    },
    custom: tokens,
  });
}

export const userThemeLight = createUserTheme("light");
export const userThemeDark = createUserTheme("dark");
