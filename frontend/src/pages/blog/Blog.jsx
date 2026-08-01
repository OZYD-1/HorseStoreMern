import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Skeleton } from "@mui/material";
import { blogApi } from "../../api/blogApi.js";
import { getBlogImageUrl } from "../../utils/getImageUrl.js";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi
      .list({ limit: 9 })
      .then(({ data }) => setBlogs(data.data.blogs))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: "text.primary", color: "background.paper", minHeight: "70vh", py: { xs: 5, md: 7.5 }, px: 2.5, m: { xs: 2, md: 6 }, borderRadius: { xs: 4, md: 8 }, textAlign: "center" }}>
      <Typography variant="h3" sx={{ color: "primary.main", mb: 1.5 }}>HorseStore Blog</Typography>
      <Typography sx={{ color: "divider", mb: 6 }}>
        Discover trends, shopping tips, and updates from our store.
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={320} height={220} sx={{ bgcolor: "grey.800" }} />
          ))}
        </Box>
      ) : blogs.length === 0 ? (
        <Typography sx={{ color: "divider" }}>No articles published yet.</Typography>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 4, md: 12.5 }, flexWrap: "wrap" }}>
          {blogs.map((blog) => (
            <Box
              key={blog.id}
              sx={{
                bgcolor: "#1a1d21",
                p: 3.5,
                borderRadius: 3,
                width: 320,
                textAlign: "left",
                border: "1px solid transparent",
                transition: "0.3s ease",
                "&:hover": { borderColor: "primary.main", transform: "translateY(-5px)" },
              }}
            >
              {blog.image && (
                <Box component="img" src={getBlogImageUrl(blog.image)} alt={blog.title} sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 1, mb: 2 }} />
              )}
              <Typography variant="h6" sx={{ color: "primary.main", mb: 1.5 }}>{blog.title}</Typography>
              <Typography sx={{ fontSize: 12, color: "divider", mb: 2.5 }}>
                {blog.excerpt || blog.content.slice(0, 100) + "..."}
              </Typography>
              <Button component={Link} to={`/blog/${blog.slug}`} variant="contained" color="primary" sx={{ fontWeight: "bold" }}>
                Read More
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
