import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Button, IconButton, Avatar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { categoryApi } from "../../api/categoryApi.js";
import { getCategoryImageUrl } from "../../utils/getImageUrl.js";
import { useDoubleConfirmAction } from "../../utils/hooks/useDoubleConfirmAction.js";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import CategoryFormDialog from "../components/CategoryFormDialog.jsx";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await categoryApi.list();
      setCategories(data.data.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { trigger: triggerDelete, dialogProps } = useDoubleConfirmAction({
    actionFn: (confirmToken) => categoryApi.remove(deletingId, confirmToken),
    onSuccess: () => fetchData(),
  });

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setTimeout(() => triggerDelete(), 0);
  };

  const columns = [
    { field: "image", headerName: "Image", width: 70, sortable: false, renderCell: (p) => <Avatar variant="rounded" src={getCategoryImageUrl(p.row.image)} /> },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "slug", headerName: "Slug", flex: 1 },
    {
      field: "actions", headerName: "Actions", width: 110, sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => { setEditingCategory(params.row); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" color="error" onClick={() => handleDeleteClick(params.row.id)}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingCategory(null); setFormOpen(true); }}>Add Category</Button>
      </Box>

      <Box sx={{ height: 500, bgcolor: "background.paper" }}>
        <DataGrid rows={categories} columns={columns} loading={loading} disableRowSelectionOnClick pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
      </Box>

      <CategoryFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSaved={fetchData} category={editingCategory} />
      <ConfirmDialog {...dialogProps} title="Delete Category" severity="error" confirmText="Yes, Delete" />
    </Box>
  );
}
