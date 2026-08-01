import { Outlet, Link as RouterLink } from "react-router-dom";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2Icon from "@mui/icons-material/Inventory2Outlined";
import CategoryIcon from "@mui/icons-material/CategoryOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLongOutlined";
import ArticleIcon from "@mui/icons-material/ArticleOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { useThemeMode } from "../../utils/theme/ThemeModeProvider.jsx";

const drawerWidth = 240;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, to: "/bgadmin" },
  { label: "Products", icon: <Inventory2Icon />, to: "/bgadmin/products" },
  { label: "Categories", icon: <CategoryIcon />, to: "/bgadmin/categories" },
  { label: "Orders", icon: <ReceiptLongIcon />, to: "/bgadmin/orders" },
  { label: "Blogs", icon: <ArticleIcon />, to: "/bgadmin/blogs" },
  { label: "Users", icon: <PeopleIcon />, to: "/bgadmin/users" },
];

export default function AdminLayout() {
  const { toggleMode } = useThemeMode();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" } }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Admin Panel</Typography>
        </Toolbar>
        <List>
          {navItems.map((item) => (
            <ListItemButton key={item.to} component={RouterLink} to={item.to}>
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <IconButton onClick={toggleMode}><Brightness4Icon /></IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
