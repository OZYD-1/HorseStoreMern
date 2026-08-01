import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Container, Typography, Skeleton, Button } from "@mui/material";
import { blogApi } from "../../api/blogApi.js";
import { getBlogImageUrl } from "../../utils/getImageUrl.js";

export default function BlogDetails() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    blogApi
      .getBySlug(slug)
      .then(({ data }) => setBlog(data.data.blog))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Skeleton variant="text" width={320} height={60} sx={{ mx: "auto" }} />
        <Skeleton variant="rounded" height={360} sx={{ mt: 3 }} />
        <Skeleton variant="text" sx={{ mt: 3 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Article Not Found</Typography>
        <Button component={Link} to="/blog" variant="contained">
          Back to Blog
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 5, md: 7.5 } }}>
      <Typography variant="h3" sx={{ mb: 1.5 }}>{blog.title}</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {blog.authorName ? `${blog.authorName} — ` : ""}
        {new Date(blog.createdAt).toLocaleDateString()}
      </Typography>

      {blog.image && (
        <Box
          component="img"
          src={getBlogImageUrl(blog.image)}
          alt={blog.title}
          sx={{ width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: 2, mb: 4 }}
        />
      )}

      <Typography sx={{ whiteSpace: "pre-line", lineHeight: 1.9 }}>
        {blog.content}
      </Typography>

      <Box sx={{ mt: 6 }}>
        <Button component={Link} to="/blog" variant="outlined">
          Back to Blog
        </Button>
      </Box>
    </Container>
  );
}