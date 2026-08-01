import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Chip, MenuItem, Select } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { orderApi } from "../../api/orderApi.js";
import { useDoubleConfirmAction } from "../../utils/hooks/useDoubleConfirmAction.js";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const statusColors = { pending: "warning", confirmed: "info", shipped: "primary", delivered: "success", cancelled: "error" };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingChange, setPendingChange] = useState(null); // { orderId, status }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderApi.allOrders({ limit: 100 });
      setOrders(data.data.orders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Double confirmation for status change ---
  const { trigger: triggerStatusChange, dialogProps } = useDoubleConfirmAction({
    actionFn: (confirmToken) => orderApi.updateStatus(pendingChange.orderId, pendingChange.status, confirmToken),
    onSuccess: () => fetchData(),
  });

  const handleStatusSelect = (orderId, status) => {
    setPendingChange({ orderId, status });
    setTimeout(() => triggerStatusChange(), 0);
  };

  const columns = [
    { field: "id", headerName: "Order ID", width: 110, valueFormatter: (value) => `#${value.slice(0, 8)}` },
    { field: "totalPrice", headerName: "Total", width: 100, valueFormatter: (value) => `$${Number(value).toFixed(2)}` },
    { field: "shippingAddress", headerName: "Shipping Address", flex: 1, minWidth: 160 },
    { field: "phone", headerName: "Phone", width: 130 },
    {
      field: "status", headerName: "Status", width: 180,
      renderCell: (params) => (
        <Select
          size="small"
          value={params.row.status}
          onChange={(e) => handleStatusSelect(params.row.id, e.target.value)}
          sx={{ minWidth: 140 }}
          renderValue={(val) => <Chip label={val} color={statusColors[val]} size="small" />}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </Select>
      ),
    },
    { field: "createdAt", headerName: "Date", width: 160, valueFormatter: (value) => new Date(value).toLocaleDateString("ar-EG") },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Orders</Typography>

      <Box sx={{ height: 560, bgcolor: "background.paper" }}>
        <DataGrid
          rows={orders}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>

      <ConfirmDialog {...dialogProps} title="Change Order Status" severity="warning" confirmText="Yes, Change Status" />
    </Box>
  );
}
