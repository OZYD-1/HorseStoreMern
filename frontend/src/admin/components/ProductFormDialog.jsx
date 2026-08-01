import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid,
  MenuItem, Box, Typography, IconButton, CircularProgress, FormControlLabel, Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { productApi } from "../../api/productApi.js";
import { getProductImageUrl } from "../../utils/getImageUrl.js";

export default function ProductFormDialog({ open, onClose, onSaved, product, categories }) {
  const isEdit = Boolean(product);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm();
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      reset({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price || "",
        salePrice: product?.salePrice || "",
        stock: product?.stock ?? 0,
        brand: product?.brand || "",
        categoryId: product?.categoryId || "",
        isFeatured: product?.isFeatured || false,
      });
      setFiles([]);
    }
  }, [open, product, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") formData.append(key, val);
      });
      files.forEach((file) => formData.append("images", file));

      if (isEdit) {
        await productApi.update(product.id, formData);
        toast.success("Product updated successfully");
      } else {
        await productApi.create(formData);
        toast.success("Product added successfully");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isEdit ? "Edit Product" : "Add New Product"}
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Product Name" fullWidth
                {...register("name", { required: "Product name is required" })}
                error={!!errors.name} helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Price" type="number" fullWidth
                {...register("price", { required: "Price is required" })}
                error={!!errors.price} helperText={errors.price?.message}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Sale Price (Optional)" type="number" fullWidth {...register("salePrice")} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Stock Quantity" type="number" fullWidth {...register("stock")} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Brand (Optional)" fullWidth {...register("brand")} />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Category" fullWidth>
                    <MenuItem value="">Without Category</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline rows={3} {...register("description")} />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Featured Product" />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography sx={{ mb: 1 }}>Images (Up to 6 images)</Typography>
              <Button variant="outlined" component="label">
                Select Images
                <input type="file" hidden multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files))} />
              </Button>
              {files.length > 0 && <Typography sx={{ mt: 1, fontSize: 13 }} color="text.secondary">{files.length} images selected</Typography>}

              {isEdit && product?.images?.length > 0 && files.length === 0 && (
                <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                  {product.images.map((img, i) => (
                    <Box key={i} component="img" src={getProductImageUrl(img)} sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1 }} />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            {isEdit ? "Save Changes" : "Add Product"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
