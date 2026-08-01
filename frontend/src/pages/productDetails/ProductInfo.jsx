import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { useCart } from "../../context/CartContext.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";

export default function ProductInfo({ product }) {
  const navigate = useNavigate();
  const { items: cartItems, addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isInCart = cartItems.some((i) => i.productId === product.id);
  const inFavorites = isFavorite(product.id);
  const rating = Number(product.rating) || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const price = Number(product.salePrice || product.price);

  return (
    <Box sx={{ width: { xs: "100%", md: "58%" } }}>
      <Typography variant="h4" sx={{ mb: 4 }}>{product.name}</Typography>

      <Box sx={{ display: "flex", gap: 0.5, my: 2 }}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarIcon key={i} sx={{ fontSize: 20, color: "primary.main" }} />
        ))}
        {hasHalfStar && <StarHalfIcon sx={{ fontSize: 20, color: "primary.main" }} />}
      </Box>

      <Typography sx={{ fontSize: 22, my: 2.5 }}>$ {price.toFixed(2)}</Typography>

      <Typography variant="h6" sx={{ fontWeight: 500, mb: 2.5, fontSize: 16 }}>
        Availability: <Box component="span" sx={{ color: product.stock > 0 ? "success.main" : "error.main" }}>
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </Box>
      </Typography>

      {product.brand && (
        <Typography variant="h6" sx={{ fontWeight: 500, mb: 2.5, fontSize: 16 }}>
          Brand: <Box component="span" sx={{ color: "text.secondary" }}>{product.brand}</Box>
        </Typography>
      )}

      <Typography sx={{ lineHeight: 1.6, color: "text.secondary" }}>{product.description}</Typography>

      {product.stock > 0 && product.stock <= 10 && (
        <Typography sx={{ fontSize: 20, mt: 2.5, color: "secondary.main" }}>
          Hurry Up! Only {product.stock} products left in stock.
        </Typography>
      )}

      <Button
        onClick={() => { addToCart(product.id); }}
        disabled={isInCart || product.stock === 0}
        variant={isInCart ? "outlined" : "contained"}
        color="primary"
        startIcon={<ShoppingCartOutlinedIcon />}
        sx={{ mt: 3, borderRadius: "5px", px: 3, py: 1.5 }}
      >
        {isInCart ? "Item in Cart" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>

      <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
        <Box
          onClick={() => toggleFavorite(product.id)}
          sx={{
            width: 40, height: 40, borderRadius: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", bgcolor: inFavorites ? "primary.main" : "background.default", transition: "0.4s ease",
          }}
        >
          <FavoriteBorderIcon sx={{ color: inFavorites ? "#fff" : "text.primary" }} />
        </Box>
        <Box
          onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
          sx={{ width: 40, height: 40, borderRadius: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", bgcolor: "background.default" }}
        >
          <ShareOutlinedIcon sx={{ color: "text.primary" }} />
        </Box>
      </Box>
    </Box>
  );
}
