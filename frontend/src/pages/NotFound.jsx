import { Link } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";

export default function NotFound() {
  return (
    <Container sx={{ py: 10, textAlign: "center" }}>
      <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>404</Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist.
      </Typography>
      <Box>
        <Button component={Link} to="/" variant="contained">
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}