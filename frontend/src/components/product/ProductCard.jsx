import { Link, useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import CheckIcon from "@mui/icons-material/Check";
import { useCart } from "../../context/CartContext.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import { getProductImageUrl } from "../../utils/getImageUrl.js";

export default function ProductCard({ item }) {
  const navigate = useNavigate();
  const { items: cartItems, addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isInCart = cartItems.some((i) => i.productId === item.id);
  const inFavorites = isFavorite(item.id);
  const rating = Number(item.rating) || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(item.id);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    toggleFavorite(item.id);
  };

  return (
    <Box
      className={isInCart ? "in-cart" : ""}
      sx={{
        width: 250,
        bgcolor: "background.paper",
        p: "25px 15px",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "5px",
        position: "relative",
        overflow: "hidden",
        transition: "0.6s ease",
        "&:hover": { borderColor: "primary.main", boxShadow: "10px 10px 15px #94949429" },
        "&:hover .product-icons": { right: "20px" },
      }}
    >
      <Box component={Link} to={`/product/${item.slug}`} sx={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Box
          sx={{
            position: "absolute",
            top: isInCart ? 10 : -30,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 14,
            transition: "0.6s ease",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.primary",
            whiteSpace: "nowrap",
          }}
        >
          <CheckIcon sx={{ fontSize: 16, color: "rgb(44,252,3)" }} /> in Cart
        </Box>

        <Box sx={{ height: 180, px: 2.5, display: "flex", alignItems: "center", justifyContent: "center", mb: 3.5 }}>
          <Box component="img" src={getProductImageUrl(item.images?.[0])} alt={item.name} sx={{ height: 160, width: "auto" }} />
        </Box>

        <Typography
          className="name-product"
          sx={{ mb: 1, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {item.name}
        </Typography>

        <Box sx={{ display: "flex", gap: 0.5, my: 2 }}>
          {Array.from({ length: fullStars }).map((_, i) => (
            <StarIcon key={i} sx={{ fontSize: 18, color: "primary.main" }} />
          ))}
          {hasHalfStar && <StarHalfIcon sx={{ fontSize: 18, color: "primary.main" }} />}
        </Box>

        <Typography sx={{ fontWeight: "bold", fontSize: 20 }}>
          $ {Number(item.salePrice || item.price).toFixed(2)}
        </Typography>
      </Box>

      <Box
        className="product-icons"
        sx={{
          position: "absolute",
          top: "40%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          right: -50,
          gap: 1.25,
          transition: "0.4s ease",
        }}
      >
        <Box
          onClick={handleAddToCart}
          sx={{
            width: 40, height: 40, borderRadius: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", bgcolor: isInCart ? "primary.main" : "background.default",
            pointerEvents: isInCart ? "none" : "auto",
          }}
        >
          <ShoppingCartOutlinedIcon sx={{ color: isInCart ? "#fff" : "text.primary" }} />
        </Box>
        <Box
          onClick={handleToggleFavorite}
          sx={{
            width: 40, height: 40, borderRadius: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", bgcolor: inFavorites ? "primary.main" : "background.default",
          }}
        >
          <FavoriteBorderIcon sx={{ color: inFavorites ? "#fff" : "text.primary" }} />
        </Box>
        <Box
          onClick={(e) => { e.preventDefault(); navigator.share ? navigator.share({ title: item.name, url: window.location.origin + `/product/${item.slug}` }) : null; }}
          sx={{ width: 40, height: 40, borderRadius: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", bgcolor: "background.default" }}
        >
          <ShareOutlinedIcon sx={{ color: "text.primary" }} />
        </Box>
      </Box>
    </Box>
  );
}
