import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useThemeMode } from "../../utils/theme/ThemeModeProvider.jsx";

export default function DarkModeButton() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"}>
      <IconButton onClick={toggleMode} sx={{ color: "primary.main" }}>
        {mode === "dark" ? <DarkModeIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
