import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, IconButton, CircularProgress, FormControlLabel, Switch } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { blogApi } from "../../api/blogApi.js";
import { getBlogImageUrl } from "../../utils/getImageUrl.js";

export default function BlogFormDialog({ open, onClose, onSaved, blog }) {
  const isEdit = Boolean(blog);
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm();
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      reset({
        title: blog?.title || "",
        excerpt: blog?.excerpt || "",
        content: blog?.content || "",
        isPublished: blog?.isPublished ?? true,
      });
      setFile(null);
    }
  }, [open, blog, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => formData.append(key, val));
      if (file) formData.append("image", file);

      if (isEdit) {
        await blogApi.update(blog.id, formData);
        toast.success("updated successfully");
      } else {
        await blogApi.create(formData);
        toast.success("blog published successfully");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "an error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isEdit ? "Edit Blog" : "New Blog"}
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Title" fullWidth {...register("title", { required: "Title is required" })} error={!!errors.title} helperText={errors.title?.message} />
          <TextField label="Excerpt (Optional)" fullWidth {...register("excerpt")} />
          <TextField label="Content" fullWidth multiline rows={6} {...register("content", { required: "Content is required" })} error={!!errors.content} helperText={errors.content?.message} />

          <Controller
            name="isPublished"
            control={control}
            render={({ field }) => (
              <FormControlLabel control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Published" />
            )}
          />

          <Box>
            <Typography sx={{ mb: 1 }}>Blog Image</Typography>
            <Button variant="outlined" component="label">
              Select Image
              <input type="file" hidden accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            </Button>
            {isEdit && blog?.image && !file && (
              <Box component="img" src={getBlogImageUrl(blog.image)} sx={{ width: 100, height: 60, objectFit: "cover", borderRadius: 1, mt: 1.5, display: "block" }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            {isEdit ? "Save Changes" : "Publish Blog"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
