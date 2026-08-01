import { Link } from "react-router-dom";
import { Box, Container, Typography, Button } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import banner1 from "../img/banner_Hero1.jpg";
import banner2 from "../img/banner_Hero2.jpg";
import banner3 from "../img/banner_Hero3.jpg";

const slides = [
  { img: banner1 },
  { img: banner2 },
  { img: banner3 },
];

export default function HeroSlider() {
  return (
    <Box sx={{ position: "relative", mb: { xs: 8, md: "135px" }, pt: { xs: 3, md: "90px" } }}>
      <Container>
        <Swiper
          loop
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination]}
          style={{ "--swiper-pagination-color": "#735607" }}
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i}>
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: "5%",
                    zIndex: 2,
                  }}
                >
                  <Typography sx={{ textTransform: "capitalize", fontStyle: "italic", color: "#000", fontSize: { xs: 12, md: "1vw" }, mb: 1 }}>
                    Introducing the new
                  </Typography>
                  <Typography sx={{ fontSize: { xs: 24, md: "3vw" }, textTransform: "capitalize", mb: 4, color: "primary.main", fontWeight: 800, lineHeight: 1.1 }}>
                    Microsoft Xbox <br /> 360 Controller
                  </Typography>
                  <Typography sx={{ fontSize: { xs: 14, md: "1.1vw" }, my: { xs: 2, md: "2.5vw" } }}>
                    Windows Xp/10/7/8 Ps3, Tv Box
                  </Typography>
                  <Button component={Link} to="/accessories" variant="contained" color="primary">
                    Shop Now
                  </Button>
                </Box>
                <Box component="img" src={slide.img} alt={`slider hero ${i + 1}`} sx={{ width: "100%", display: "block" }} />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </Box>
  );
}
