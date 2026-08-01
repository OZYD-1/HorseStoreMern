import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, IconButton, Button, TextField, MenuItem, Divider, Paper,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext.jsx";
import { orderApi } from "../../api/orderApi.js";
import { getProductImageUrl } from "../../utils/getImageUrl.js";
import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";

const SHIPPING_FEE = 5;

export default function Cart() {
  const navigate = useNavigate();
  const { items, total, updateQuantity, removeItem, refreshCart } = useCart();
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  const subTotal = Number(total) || 0;
  const grandTotal = subTotal + (items.length ? SHIPPING_FEE : 0);

  const onSubmit = () => {
    if (items.length === 0) {
      toast.info("Your cart is empty");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmPlaceOrder = async () => {
    setPlacing(true);
    try {
      const values = getValues();
      await orderApi.create({
        shippingAddress: values.address,
        phone: values.phone,
        paymentMethod: "cash_on_delivery",
        notes: `Name: ${values.name}, Email: ${values.email}`,
      });
      toast.success("Your order has been created successfully!");
      await refreshCart();
      setConfirmOpen(false);
      navigate("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to complete the order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Box sx={{ py: { xs: 4, md: "50px" }, pb: 6 }}>
      <Container>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}
        >
          {/* Order Summary */}
          <Paper sx={{ width: { xs: "100%", md: "45%" }, px: 2.5, border: "1px solid", borderColor: "divider", borderRadius: "5px" }}>
            <Typography variant="h4" sx={{ borderBottom: "1px solid", borderColor: "divider", py: 2.5, color: "primary.main" }}>
              Order Summary
            </Typography>

            <Box sx={{ maxHeight: 350, overflowY: "auto" }}>
              {items.length === 0 ? (
                <Typography sx={{ py: 3 }}>Your Cart is empty.</Typography>
              ) : (
                items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box component="img" src={getProductImageUrl(item.images?.[0])} alt="" sx={{ width: 80 }} />
                      <Box>
                        <Typography sx={{ fontSize: 14, mb: 0.5, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.name}
                        </Typography>
                        <Typography sx={{ fontWeight: "bold" }}>$ {Number(item.salePrice || item.price).toFixed(2)}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "2px", width: 27, height: 27 }}>
                            <RemoveIcon fontSize="inherit" />
                          </IconButton>
                          <Box sx={{ minWidth: 35, textAlign: "center", bgcolor: "divider", py: "3px" }}>{item.quantity}</Box>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "2px", width: 27, height: 27 }}>
                            <AddIcon fontSize="inherit" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton onClick={() => removeItem(item.id)} sx={{ "&:hover": { color: "error.main" } }}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>

            <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography>SubTotal :</Typography>
                <Typography sx={{ fontWeight: "bold", color: "primary.main" }}>${subTotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography>Shipping :</Typography>
                <Typography sx={{ fontWeight: "bold", color: "primary.main" }}>${items.length ? SHIPPING_FEE.toFixed(2) : "0.00"}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography>Total :</Typography>
                <Typography sx={{ fontWeight: "bold", color: "primary.main" }}>${grandTotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3 }}>
                <Button type="submit" fullWidth variant="contained" color="primary" sx={{ py: 1.7, fontWeight: "bold", fontSize: 18 }}>
                  Place Order
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Delivery Address */}
          <Box sx={{ width: { xs: "100%", md: "45%" } }}>
            <Paper sx={{ mb: 3, borderRadius: "5px", overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
              <Typography sx={{ px: 2.5, py: 1.5, bgcolor: "primary.main", color: "#fff" }} variant="h6">
                Delivery Address
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", p: 2.5, gap: 2 }}>
                <TextField label="Email" type="email" size="small" {...register("email", { required: true })} error={!!errors.email} required />
                <TextField label="Name" size="small" {...register("name", { required: true })} error={!!errors.name} required />
                <TextField label="Address" size="small" {...register("address", { required: true })} error={!!errors.address} required />
                <TextField label="Phone" size="small" {...register("phone", { required: true })} error={!!errors.phone} required />
              </Box>
            </Paper>

            <Paper sx={{ borderRadius: "5px", overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
              <Typography sx={{ px: 2.5, py: 1.5, bgcolor: "primary.main", color: "#fff" }} variant="h6">
                Coupon Code (Coming Soon)
              </Typography>
              <Box sx={{ p: 2.5 }}>
                <TextField label="Coupon Code" size="small" fullWidth disabled sx={{ mb: 2 }} />
                <Box sx={{ textAlign: "center" }}>
                  <Button variant="contained" color="primary" disabled sx={{ width: "50%" }}>Apply Coupon</Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Order"
        message={`Are you sure you want to place the order for a total amount of $${grandTotal.toFixed(2)}? No refunds will be issued after submission.`}
        loading={placing}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmPlaceOrder}
        confirmText="Yes, Place Order"
      />
    </Box>
  );
}
