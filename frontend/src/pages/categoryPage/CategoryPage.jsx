import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import ProductGrid from "../../components/product/ProductGrid.jsx";
import ProductCarouselLoading from "../../components/product/ProductCarouselLoading.jsx";
import { categoryApi } from "../../api/categoryApi.js";
import { productApi } from "../../api/productApi.js";

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const { data: catRes } = await categoryApi.list();
        const found = catRes.data.categories.find((c) => c.slug === slug);
        setCategory(found || null);

        if (found) {
          const { data } = await productApi.list({ categoryId: found.id, limit: 50 });
          setProducts(data.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <ProductCarouselLoading />;

  return (
    <Container sx={{ py: 2 }}>
      <Box sx={{ mt: 2.5, mb: 2 }}>
        <Typography variant="h4" sx={{ color: "primary.main", textTransform: "capitalize" }}>
          {category?.name || slug}
        </Typography>
        <Typography color="text.secondary">Add bestselling products to weekly line up</Typography>
      </Box>
      <ProductGrid products={products} />
    </Container>
  );
}
