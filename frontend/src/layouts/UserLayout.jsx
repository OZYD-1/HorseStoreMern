import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "./user/Header.jsx";
import Footer from "./user/Footer.jsx";

export default function UserLayout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />
      <Box sx={{ height: { xs: 172, md: 128 } }} />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
