import { Container, Typography, Box } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

export default function Contact() {
  return (
    <Container sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="h4" sx={{ color: "primary.main", mb: 4 }}>Contact Us</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MailOutlineIcon color="primary" /> HorseStore25@gmail.com
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PhoneOutlinedIcon color="primary" /> (+962) 798560614
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocationOnOutlinedIcon color="primary" /> Al-Sharqi District, Irbid 21110, Jordan
        </Box>
      </Box>
    </Container>
  );
}
