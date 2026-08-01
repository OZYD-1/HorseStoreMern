import { Box } from "@mui/material";
import TopHeader from "./TopHeader.jsx";
import BtmHeader from "./BtmHeader.jsx";

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        bgcolor: "background.paper",
      }}
    >
      <TopHeader />
      <BtmHeader />
    </Box>
  );
}
