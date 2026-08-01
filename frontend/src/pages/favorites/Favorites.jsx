import { Box, Container, Typography } from "@mui/material";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import ProductGrid from "../../components/product/ProductGrid.jsx";

export default function Favorites() {
  const { favorites, loading } = useFavorites();

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mt: 2.5, mb: 2 }}>
        <Typography variant="h4" sx={{ color: "primary.main" }}>Your Favorites</Typography>
      </Box>
      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : (
        <ProductGrid products={favorites} emptyMessage="No Favorites Products Yet." />
      )}
    </Container>
  );
}
