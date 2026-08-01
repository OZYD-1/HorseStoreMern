import { Link } from "react-router-dom";
import { Box, Container, IconButton, Badge, Tooltip } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchBox from "./SearchBox.jsx";
import DarkModeButton from "./DarkModeButton.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import Logo from "../../img/logo.png";

export default function TopHeader() {
  const { count: cartCount } = useCart();
  const { count: favoritesCount } = useFavorites();

  return (
    <Box sx={{ bgcolor: "background.paper" }}>
      <Container>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3, py: 2 }}>
          <Box
            component={Link}
            to="/"
            sx={{ width: 160, bgcolor: "divider", p: 1.25, borderRadius: "20px", display: "flex" }}
          >
            <Box component="img" src={Logo} alt="Logo" sx={{ width: "100%", objectFit: "contain" }} />
          </Box>

          <SearchBox />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <DarkModeButton />

            <Tooltip title="Favorites">
              <IconButton component={Link} to="/favorites">
                <Badge badgeContent={favoritesCount} color="primary">
                  <FavoriteBorderIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Cart">
              <IconButton component={Link} to="/cart">
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
