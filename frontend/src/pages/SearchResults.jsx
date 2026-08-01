import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import ProductGrid from "../components/product/ProductGrid.jsx";
import ProductCarouselLoading from "../components/product/ProductCarouselLoading.jsx";
import { productApi } from "../api/productApi.js";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productApi
      .list({ search: query, limit: 50 })
      .then(({ data }) => setProducts(data.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query]);

  if (loading) return <ProductCarouselLoading />;

  return (
    <Container sx={{ py: 2 }}>
      <Box sx={{ mt: 2.5, mb: 2 }}>
        <Typography variant="h4" sx={{ color: "primary.main" }}>
          Search results for: "{query}"
        </Typography>
        <Typography color="text.secondary">{products.length} product(s) found</Typography>
      </Box>
      <ProductGrid products={products} emptyMessage="No products matched your search." />
    </Container>
  );
}
