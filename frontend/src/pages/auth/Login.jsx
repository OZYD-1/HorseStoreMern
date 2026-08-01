import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setServerError("");
    setLoading(true);
    try {
      await login(values);
      navigate("/");
    } catch (err) {
      setServerError(err?.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "primary.main" }}>
          Sign In
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
            {loading ? "..." : "Sign In"}
          </Button>
        </Box>

        <Typography sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
          Don't have an account? <Box component={Link} to="/register" sx={{ color: "primary.main", fontWeight: 600 }}>Register</Box>
        </Typography>
      </Paper>
    </Container>
  );
}
