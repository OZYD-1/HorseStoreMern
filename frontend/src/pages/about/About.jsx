import { Box, Container, Typography } from "@mui/material";
import Logo from "../../img/logo.png";

const heroImage = "https://png.pngtree.com/thumb_back/fh260/background/20231001/pngtree-d-rendering-of-laptop-computer-on-work-desk-offering-a-top-image_13563491.png";

export default function About() {
  return (
    <Box>
      <Box
        sx={{
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: "#fff",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Typography variant="h2" sx={{ fontSize: { xs: 32, md: 48 }, mb: 1.5 }}>
          Welcome to <Box component="strong" sx={{ color: "primary.main" }}>Horse</Box>Store – Power Up Your World
        </Typography>
        <Typography sx={{ fontSize: { xs: 16, md: 19.2 }, color: "#ddd" }}>
          Your trusted destination for technology, electronics, and innovation.
        </Typography>
      </Box>

      <Box sx={{ bgcolor: "background.default", py: { xs: 5, md: 8 }, px: 2 }}>
        <Container maxWidth="md">
          <Box sx={{ bgcolor: "background.paper", p: { xs: 3, md: 5 }, borderRadius: 2, boxShadow: "0 3px 10px rgba(0,0,0,0.08)" }}>
            <Typography variant="h4" sx={{ mb: 2.5 }}>Discover HorseStore</Typography>

            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mb: 2.5 }}>
              At <strong>HorseStore</strong>, we believe technology should empower, inspire, and simplify your life.
              Whether you're looking for the latest smartphones, home appliances, or electronics accessories,
              our mission is to bring you quality and innovation in one place.
            </Typography>

            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mb: 2.5 }}>
              Founded with a vision to make high-quality tech accessible to everyone,
              HorseStore offers an ever-growing collection of products carefully curated for performance, durability, and value.
              We understand that technology is more than gadgets—it's a part of your daily rhythm.
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box component="img" src={Logo} alt="HorseStore products" sx={{ width: { xs: "50%", md: "20%" }, borderRadius: 2, my: 2.5 }} />
            </Box>

            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mb: 2.5 }}>
              Our commitment to customer satisfaction drives everything we do.
              From our sleek website design to secure checkout and fast delivery,
              every detail is crafted to give you a smooth shopping experience.
            </Typography>

            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, mb: 2.5 }}>
              Whether you're upgrading your home setup, finding the perfect phone, or exploring new tech trends,
              HorseStore is your trusted companion. We continue to grow, innovate, and serve you better every day.
            </Typography>

            <Typography sx={{ color: "text.secondary", fontWeight: "bold" }}>
              HorseStore – where performance meets passion.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
