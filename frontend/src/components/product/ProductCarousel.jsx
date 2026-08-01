import { Box, Container, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "./ProductCard.jsx";

export default function ProductCarousel({ title, products = [] }) {
  if (!products.length) return null;

  return (
    <Box className="slide-products slide" sx={{ py: { xs: 4, md: 6 } }}>
      <Container>
        <Box
          sx={{
            position: "relative",
            mb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
            pt: "15px",
            pr: "20px",
            pb: "20px",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -1,
              width: 100,
              height: 2,
              bgcolor: "primary.main",
            },
          }}
        >
          <Typography variant="h4" sx={{ color: "primary.main", mb: 1, textTransform: "capitalize", fontSize: 30 }}>
            {title}
          </Typography>
          <Typography color="text.secondary">Add bestselling products to weekly line up</Typography>
        </Box>

        <Swiper
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          navigation
          slidesPerView={5}
          spaceBetween={20}
          modules={[Autoplay, Navigation]}
          breakpoints={{
            0: { slidesPerView: 1.3 },
            600: { slidesPerView: 2.3 },
            900: { slidesPerView: 3.3 },
            1200: { slidesPerView: 5 },
          }}
        >
          {products.map((item) => (
            <SwiperSlide key={item.id} style={{ display: "flex", justifyContent: "center" }}>
              <ProductCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </Box>
  );
}
