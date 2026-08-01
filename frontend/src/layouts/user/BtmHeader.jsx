import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Container, Menu, MenuItem, ListItemButton, Tooltip, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { categoryApi } from "../../api/categoryApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

const NavLinks = [
  { title: "Home", link: "/" },
  { title: "About", link: "/about" },
  { title: "Accessories", link: "/accessories" },
  { title: "Blog", link: "/blog" },
];

export default function BtmHeader() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    categoryApi
      .list()
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setAnchorEl(null);
  }, [location]);

  return (
    <Box sx={{ bgcolor: "primary.main" }}>
      <Container>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 6 }, height: 50 }}>
            {/* Category dropdown */}
            <Box sx={{ position: "relative" }}>
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  height: 50,
                  minWidth: 220,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  cursor: "pointer",
                  borderLeft: "3px solid",
                  borderRight: "3px solid",
                  borderColor: "divider",
                  color: "#fff",
                }}
              >
                <MenuIcon />
                <Box component="p" sx={{ fontSize: 15, fontWeight: 600, m: 0 }}>Browse Category</Box>
                <ArrowDropDownIcon />
              </Box>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                {categories.map((category) => (
                  <MenuItem key={category.slug} component={Link} to={`/category/${category.slug}`}>
                    {category.name}
                  </MenuItem>
                ))}
                {categories.length === 0 && <MenuItem disabled>No categories yet</MenuItem>}
              </Menu>
            </Box>

            {/* Main nav links */}
            <Box component="ul" sx={{ display: "flex", height: "100%", listStyle: "none", m: 0, p: 0 }}>
              {NavLinks.map((item) => (
                <Box
                  component="li"
                  key={item.link}
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    px: { xs: 1.5, md: 3 },
                    transition: "0.4s ease",
                    bgcolor: (theme) => (location.pathname === item.link ? theme.custom.p : "transparent"),
                  }}
                >
                  <Box component={Link} to={item.link} sx={{ color: "#fff", textDecoration: "none" }}>
                    {item.title}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Auth icons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {user ? (
              <>
                <Tooltip title="My Profile">
                  <IconButton component={Link} to="/profile" sx={{ color: "#fff" }}>
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`Logout (${user.name})`}>
                  <IconButton onClick={logout} sx={{ color: "#fff" }}>
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Sign In">
                  <IconButton component={Link} to="/login" sx={{ color: "#fff" }}>
                    <LoginIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Register">
                  <IconButton component={Link} to="/register" sx={{ color: "#fff" }}>
                    <PersonAddAlt1Icon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}