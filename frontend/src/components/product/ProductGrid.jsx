import { Box, Typography } from "@mui/material";
import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products = [], emptyMessage = "No products found." }) {
  if (!products.length) {
    return (
      <Typography sx={{ py: 4 }} color="text.secondary">
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: { xs: "center", sm: "space-between" }, alignItems: "center", gap: 2.5, py: 2.5 }}>
      {products.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </Box>
  );
}
