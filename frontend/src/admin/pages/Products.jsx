import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Button, IconButton, Chip, Avatar } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { productApi } from "../../api/productApi.js";
import { categoryApi } from "../../api/categoryApi.js";
import { getProductImageUrl } from "../../utils/getImageUrl.js";
import { useDoubleConfirmAction } from "../../utils/hooks/useDoubleConfirmAction.js";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";
import ProductFormDialog from "../components/ProductFormDialog.jsx";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productApi.list({ limit: 100 }),
        categoryApi.list(),
      ]);
      setProducts(prodRes.data.data.products);
      setCategories(catRes.data.data.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Double confirmation delete flow ---
  const { trigger: triggerDelete, dialogProps } = useDoubleConfirmAction({
    actionFn: (confirmToken) => productApi.remove(deletingId, confirmToken),
    onSuccess: () => fetchData(),
  });

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setTimeout(() => triggerDelete(), 0);
  };

  const columns = [
    {
      field: "image", headerName: "Image", width: 70, sortable: false,
      renderCell: (params) => <Avatar variant="rounded" src={getProductImageUrl(params.row.images?.[0])} />,
    },
    { field: "name", headerName: "Product Name", flex: 1, minWidth: 180 },
    { field: "price", headerName: "Price", width: 90, valueFormatter: (value) => `$${Number(value).toFixed(2)}` },
    { field: "stock", headerName: "Stock", width: 90 },
    {
      field: "isActive", headerName: "Status", width: 100,
      renderCell: (params) => <Chip label={params.value ? "Active" : "Inactive"} color={params.value ? "success" : "default"} size="small" />,
    },
    {
      field: "actions", headerName: "Actions", width: 110, sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => { setEditingProduct(params.row); setFormOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDeleteClick(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingProduct(null); setFormOpen(true); }}>
          Add Product
        </Button>
      </Box>

      <Box sx={{ height: 560, bgcolor: "background.paper" }}>
        <DataGrid
          rows={products}
          columns={columns}
          loading={loading}
          density="comfortable"
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchData}
        product={editingProduct}
        categories={categories}
      />

      <ConfirmDialog {...dialogProps} title="Delete Product" severity="error" confirmText="Yes, Delete Permanently" />
    </Box>
  );
}
