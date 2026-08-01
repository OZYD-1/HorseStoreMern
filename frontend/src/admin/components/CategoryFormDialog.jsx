import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { categoryApi } from "../../api/categoryApi.js";
import { getCategoryImageUrl } from "../../utils/getImageUrl.js";

export default function CategoryFormDialog({ open, onClose, onSaved, category }) {
  const isEdit = Boolean(category);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      reset({ name: category?.name || "" });
      setFile(null);
    }
  }, [open, category, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (file) formData.append("image", file);

      if (isEdit) {
        await categoryApi.update(category.id, formData);
        toast.success("Category updated successfully");
      } else {
        await categoryApi.create(formData);
        toast.success("Category added successfully");
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isEdit ? "Edit Category" : "Add New Category"}
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Category Name" fullWidth
            {...register("name", { required: "Category name is required" })}
            error={!!errors.name} helperText={errors.name?.message}
          />
          <Box>
            <Typography sx={{ mb: 1 }}>Category Image</Typography>
            <Button variant="outlined" component="label">
              Select Image
              <input type="file" hidden accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            </Button>
            {isEdit && category?.image && !file && (
              <Box component="img" src={getCategoryImageUrl(category.image)} sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1, mt: 1.5, display: "block" }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            {isEdit ? "Save Changes" : "Add Category"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
