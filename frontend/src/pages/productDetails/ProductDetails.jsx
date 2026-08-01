import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import ProductImages from "./ProductImages.jsx";
import ProductInfo from "./ProductInfo.jsx";
import ProductDetailsLoading from "./ProductDetailsLoading.jsx";
import ProductCarousel from "../../components/product/ProductCarousel.jsx";
import ProductCarouselLoading from "../../components/product/ProductCarouselLoading.jsx";
import { productApi } from "../../api/productApi.js";

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    setLoading(true);
    productApi
      .getBySlug(slug)
      .then(({ data }) => setProduct(data.data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product?.categoryId) {
      setLoadingRelated(false);
      return;
    }
    setLoadingRelated(true);
    productApi
      .list({ categoryId: product.categoryId, limit: 10 })
      .then(({ data }) => setRelatedProducts(data.data.products.filter((p) => p.id !== product.id)))
      .catch(() => setRelatedProducts([]))
      .finally(() => setLoadingRelated(false));
  }, [product?.categoryId, product?.id]);

  if (loading) return <ProductDetailsLoading />;
  if (!product) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5">Product Not Found</Typography>
      </Container>
    );
  }

  return (
    <Box>
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { md: "center" }, gap: 4 }}>
          <ProductImages product={product} />
          <ProductInfo product={product} />
        </Container>
      </Box>

      {loadingRelated ? (
        <ProductCarouselLoading />
      ) : (
        relatedProducts.length > 0 && (
          <ProductCarousel title={product.categoryName || "Related Products"} products={relatedProducts} />
        )
      )}
    </Box>
  );
}
