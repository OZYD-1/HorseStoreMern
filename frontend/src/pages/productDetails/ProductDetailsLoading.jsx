import { Box, Container, Skeleton } from "@mui/material";

export default function ProductDetailsLoading() {
  return (
    <Container sx={{ py: 6 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        <Skeleton variant="rounded" sx={{ width: { xs: "100%", md: "40%" }, height: 450 }} />
        <Box sx={{ width: { xs: "100%", md: "58%" }, pt: { md: "50px" } }}>
          <Skeleton variant="text" height={60} width="70%" />
          <Skeleton variant="text" height={30} width="40%" sx={{ my: 2 }} />
          <Skeleton variant="text" height={30} width="90%" />
          <Skeleton variant="text" height={30} width="90%" />
          <Skeleton variant="rounded" height={45} width={150} sx={{ mt: 3 }} />
        </Box>
      </Box>
    </Container>
  );
}
