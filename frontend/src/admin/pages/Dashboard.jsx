import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, List, ListItem, ListItemText, Chip } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2Outlined";
import CategoryIcon from "@mui/icons-material/CategoryOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLongOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActionsOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmberOutlined";
import PaidIcon from "@mui/icons-material/PaidOutlined";
import { adminApi } from "../../api/adminApi.js";

const statusColors = {
  pending: "warning",
  confirmed: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "error",
};

function StatCard({ icon, label, value, color = "primary.main" }) {
  return (
    <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, border: "1px solid", borderColor: "divider" }}>
      <Box sx={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: color, color: "#fff" }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 14 }}>{label}</Typography>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(({ data }) => {
        setStats(data.data.stats);
        setRecentOrders(data.data.recentOrders);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<Inventory2Icon />} label="Products" value={stats.productsCount} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<CategoryIcon />} label="Categories" value={stats.categoriesCount} color="secondary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleIcon />} label="Users" value={stats.usersCount} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<ReceiptLongIcon />} label="Orders" value={stats.ordersCount} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PendingActionsIcon />} label="Pending Orders" value={stats.pendingOrders} color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<WarningAmberIcon />} label="Low Stock Products" value={stats.lowStockProducts} color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PaidIcon />} label="Total Revenue" value={`$${Number(stats.totalRevenue).toFixed(2)}`} color="primary.dark" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Orders</Typography>
        <List>
          {recentOrders.map((order) => (
            <ListItem
              key={order.id}
              secondaryAction={<Chip label={order.status} color={statusColors[order.status] || "default"} size="small" />}
              divider
            >
              <ListItemText
                primary={`Order #${order.id.slice(0, 8)} — $${Number(order.totalPrice).toFixed(2)}`}
                secondary={new Date(order.createdAt).toLocaleString("ar-EG")}
              />
            </ListItem>
          ))}
          {recentOrders.length === 0 && <Typography color="text.secondary">No orders yet</Typography>}
        </List>
      </Paper>
    </Box>
  );
}
