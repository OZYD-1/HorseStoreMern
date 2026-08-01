import { useState, useRef } from "react";
import { Box, Container, Paper, Typography, TextField, Button, Avatar, Divider, Alert, IconButton } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";
import { authApi } from "../../api/authApi.js";
import { getAvatarImageUrl } from "../../utils/getImageUrl.js";

export default function Profile() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: { name: user?.name || "", phone: user?.phone || "", address: user?.address || "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm();

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmitProfile = async (values) => {
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone || "");
      formData.append("address", values.address || "");
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await authApi.updateProfile(formData);
      setUser(data.data.user);
      setAvatarFile(null);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const onSubmitPassword = async (values) => {
    setPasswordError("");
    setSavingPassword(true);
    try {
      await authApi.changePassword(values);
      toast.success("Password changed successfully, please login again");
      resetPasswordForm();
    } catch (err) {
      setPasswordError(err?.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 4, color: "primary.main" }}>My Profile</Typography>

      {/* ----- Profile info + avatar ----- */}
      <Paper sx={{ p: 4, mb: 4, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={avatarPreview || getAvatarImageUrl(user.avatar)}
              sx={{ width: 100, height: 100, fontSize: 36, bgcolor: "primary.main" }}
            >
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
            <IconButton
              onClick={handleAvatarClick}
              size="small"
              sx={{ position: "absolute", bottom: 0, right: 0, bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmitProfile(onSubmitProfile)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            {...registerProfile("name", { required: "Name is required" })}
            error={!!profileErrors.name}
            helperText={profileErrors.name?.message}
          />
          <TextField label="Email" value={user.email} disabled helperText="Email cannot be changed" />
          <TextField label="Phone" {...registerProfile("phone")} />
          <TextField label="Address" {...registerProfile("address")} />

          <Button type="submit" variant="contained" color="primary" size="large" disabled={savingProfile} sx={{ mt: 1 }}>
            {savingProfile ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>

      {/* ----- Change password ----- */}
      <Paper sx={{ p: 4, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Change Password</Typography>
        {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}

        <Box component="form" onSubmit={handleSubmitPassword(onSubmitPassword)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Current Password"
            type="password"
            {...registerPassword("currentPassword", { required: "Current password is required" })}
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword?.message}
          />
          <TextField
            label="New Password"
            type="password"
            {...registerPassword("newPassword", {
              required: "New password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword?.message}
          />
          <Button type="submit" variant="outlined" color="primary" size="large" disabled={savingPassword} sx={{ mt: 1 }}>
            {savingPassword ? "Saving..." : "Change Password"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}