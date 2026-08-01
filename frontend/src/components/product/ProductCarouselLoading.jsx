import { Box, Container, Skeleton } from "@mui/material";

export default function ProductCarouselLoading() {
  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={250} height={40} />
          <Skeleton variant="text" width={350} height={25} />
        </Box>
        <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} sx={{ width: 250, flexShrink: 0 }}>
              <Skeleton variant="rounded" height={180} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={30} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
