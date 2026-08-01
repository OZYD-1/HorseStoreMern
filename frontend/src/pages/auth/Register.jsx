import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setServerError("");
    setLoading(true);
    try {
      await registerUser(values);
      navigate("/");
    } catch (err) {
      setServerError(err?.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center", color: "primary.main" }}>
          Create Account
        </Typography>

        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Name" {...register("name", { required: "Name is required" })} error={!!errors.name} helperText={errors.name?.message} />
          <TextField label="Email" type="email" {...register("email", { required: "Email is required" })} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Phone" {...register("phone")} />
          <TextField
            label="Password"
            type="password"
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} sx={{ mt: 1 }}>
            {loading ? "..." : "Create Account"}
          </Button>
        </Box>

        <Typography sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
          Already have an account? <Box component={Link} to="/login" sx={{ color: "primary.main", fontWeight: 600 }}>Sign In</Box>
        </Typography>
      </Paper>
    </Container>
  );
}
