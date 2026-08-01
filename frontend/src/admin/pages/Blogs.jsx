import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Button, IconButton, Chip, Avatar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { blogApi } from "../../api/blogApi.js";
import { getBlogImageUrl } from "../../utils/getImageUrl.js";
import { useDoubleConfirmAction } from "../../utils/hooks/useDoubleConfirmAction.js";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import BlogFormDialog from "../components/BlogFormDialog.jsx";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await blogApi.list({ limit: 100 });
      setBlogs(data.data.blogs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { trigger: triggerDelete, dialogProps } = useDoubleConfirmAction({
    actionFn: (confirmToken) => blogApi.remove(deletingId, confirmToken),
    onSuccess: () => fetchData(),
  });

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setTimeout(() => triggerDelete(), 0);
  };

  const columns = [
    { field: "image", headerName: "Image", width: 70, sortable: false, renderCell: (p) => <Avatar variant="rounded" src={getBlogImageUrl(p.row.image)} /> },
    { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
    {
      field: "isPublished", headerName: "Status", width: 100,
      renderCell: (p) => <Chip label={p.value ? "Published" : "Draft"} color={p.value ? "success" : "default"} size="small" />,
    },
    { field: "createdAt", headerName: "Date", width: 140, valueFormatter: (value) => new Date(value).toLocaleDateString("ar-EG") },
    {
      field: "actions", headerName: "Actions", width: 110, sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => { setEditingBlog(params.row); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => handleDeleteClick(params.row.id)}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Blogs</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingBlog(null); setFormOpen(true); }}>New Post</Button>
      </Box>

      <Box sx={{ height: 560, bgcolor: "background.paper" }}>
        <DataGrid rows={blogs} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Box>

      <BlogFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={fetchData} blog={editingBlog} />
      <ConfirmDialog {...dialogProps} title="Delete Post" severity="error" confirmText="Yes, Delete" />
    </Box>
  );
}
