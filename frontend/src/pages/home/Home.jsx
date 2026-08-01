import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import HeroSlider from "../../components/HeroSlider.jsx";
import ProductCarousel from "../../components/product/ProductCarousel.jsx";
import ProductCarouselLoading from "../../components/product/ProductCarouselLoading.jsx";
import { categoryApi } from "../../api/categoryApi.js";
import { productApi } from "../../api/productApi.js";

export default function Home() {
  const [sections, setSections] = useState([]); // [{ category, products }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: catRes } = await categoryApi.list();
        const categories = catRes.data.categories.slice(0, 4);

        const results = await Promise.all(
          categories.map(async (category) => {
            const { data } = await productApi.list({ categoryId: category.id, limit: 10 });
            return { category, products: data.data.products };
          })
        );

        setSections(results.filter((s) => s.products.length > 0));
      } catch (err) {
        console.error("Error fetching home products:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box>
      <HeroSlider />

      {loading
        ? Array.from({ length: 4 }).map((_, i) => <ProductCarouselLoading key={i} />)
        : sections.map(({ category, products }) => (
            <ProductCarousel key={category.id} title={category.name} products={products} />
          ))}
    </Box>
  );
}
