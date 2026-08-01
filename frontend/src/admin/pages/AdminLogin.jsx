import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setServerError("");
    setLoading(true);
    try {
      await adminLogin(values);
      navigate("/bgadmin");
    } catch (err) {
      setServerError(err?.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", bgcolor: "background.default" }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="h4" sx={{ mb: 1, textAlign: "center", color: "primary.main" }}>
            Admin panel
          </Typography>
          <Typography sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}>
            HorseStore Admin Panel
          </Typography>

          {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              {...register("email", { required: "Email is required" })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              {...register("password", { required: "Password is required" })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} sx={{ mt: 1 }}>
              {loading ? "..." : "Login"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
