import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { getProductImageUrl } from "../../utils/getImageUrl.js";

export default function ProductImages({ product }) {
  const images = product.images?.length ? product.images : [null];
  const [activeImg, setActiveImg] = useState(images[0]);

  useEffect(() => setActiveImg(images[0]), [product.id]);

  return (
    <Box sx={{ width: { xs: "100%", md: "40%" } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5 }}>
        <Box
          component="img"
          src={getProductImageUrl(activeImg)}
          alt={product.name}
          sx={{ maxHeight: 450, width: "auto", maxWidth: "100%" }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {images.map((img, index) => (
          <Box
            key={index}
            onClick={() => setActiveImg(img)}
            sx={{
              cursor: "pointer",
              border: "2px solid",
              borderColor: activeImg === img ? "primary.main" : "transparent",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Box component="img" src={getProductImageUrl(img)} alt={product.name} sx={{ width: 60, height: 60, objectFit: "cover" }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
