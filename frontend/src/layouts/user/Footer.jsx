import { Link } from "react-router-dom";
import { Box, Container, Grid, Typography, Stack, Link as MuiLink } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/accessories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "#312203", color: "#999999", py: { xs: 6, md: 8 }, px: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 4 }}>
          {/* Brand */}
          <Grid item xs={12} md={4}>
            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.05em", mb: 2 }}>
              HorseStore
            </Typography>
            <Typography sx={{ color: "#e5e5e5d5", lineHeight: 1.7, maxWidth: 320 }}>
              🐎 Horse Store – Power up your world with the latest phones, screens & electronics. Top quality. Best prices. Fast delivery.
            </Typography>
          </Grid>

          {/* Quick links */}
          <Grid item xs={12} md={4} sx={{ ml: { md: "10%" } }}>
            <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
              Quick Links
            </Typography>
            <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
              {quickLinks.map((link) => (
                <Box component="li" key={link.label}>
                  <MuiLink
                    component={Link}
                    to={link.href}
                    sx={{ color: "#999999", textDecoration: "none", transition: "0.3s", "&:hover": { color: "primary.main" } }}
                  >
                    {link.label}
                  </MuiLink>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={2}>
            <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", p: 0, m: 0 }}>
              <Box component="li" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <MailOutlineIcon sx={{ width: 18, height: 18, color: "primary.main", flexShrink: 0 }} />
                <MuiLink
                  href="mailto:HorseStore25@gmail.com"
                  sx={{ color: "#999999", textDecoration: "none", "&:hover": { color: "primary.main" } }}
                >
                  HorseStore25@gmail.com
                </MuiLink>
              </Box>
              <Box component="li" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneOutlinedIcon sx={{ width: 18, height: 18, color: "primary.main", flexShrink: 0 }} />
                <MuiLink
                  href="tel:+962798560614"
                  sx={{ color: "#999999", textDecoration: "none", "&:hover": { color: "primary.main" } }}
                >
                  (+962) 798560614
                </MuiLink>
              </Box>
              <Box component="li" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <LocationOnOutlinedIcon sx={{ width: 18, height: 18, color: "primary.main", flexShrink: 0 }} />
                <Typography component="span" sx={{ color: "#999999" }}>
                  Al-Sharqi District, Irbid 21110, Jordan
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom bar */}
        <Box sx={{ mt: 7, pt: 4, borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
          <Typography sx={{ color: "#999999", fontSize: "0.875rem" }}>
            © {new Date().getFullYear()} HorseStore. All rights reserved.
          </Typography>
          <Typography sx={{ color: "#999999", fontSize: "0.875rem", pt: "20px" }}>
            Created By <Typography sx={{color: "primary.main"}}>OZYD</Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
