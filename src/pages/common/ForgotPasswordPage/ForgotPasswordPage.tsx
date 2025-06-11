import { ArrowBack } from "@mui/icons-material";
import EmailIcon from "@mui/icons-material/Email";
import { Alert, Box, Button, Card, CardContent, Container, TextField, Typography, styled } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/eBios.png";

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: "400px",
  background: theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(24, 26, 32, 0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  border: theme.palette.mode === "light" ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(255, 255, 255, 0.08)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.25)",
  },
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.palette.mode === "light" ? "linear-gradient(-45deg, #f0f8ff, #e6f3ff, #f5f5f5, #ffffff)" : "linear-gradient(-45deg, #1a1a1a, #2d2d2d)",
  padding: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: "48px",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: "8px",
  backgroundColor: theme.palette.primary.main,
  color: "#ffffff",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: "10px",
  marginBottom: theme.spacing(2),
  animation: "slideIn 0.3s ease-out",
  "@keyframes slideIn": {
    from: { transform: "translateY(-10px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  },
}));

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implement password reset logic here
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (error) {
      setError("Failed to process password reset request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      <StyledCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              component="img"
              src={logo}
              alt="Company Logo"
              sx={{
                maxWidth: "120px",
                mb: 2,
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            />
            <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your email address to reset your password
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField id="email" label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} type="email" size="small" required fullWidth sx={{ mb: 3 }} />

            {error && (
              <StyledAlert severity="error" sx={{ mb: 2 }}>
                {error}
              </StyledAlert>
            )}
            {success && (
              <StyledAlert severity="success" sx={{ mb: 2 }}>
                {success}
              </StyledAlert>
            )}

            <StyledButton type="submit" fullWidth disabled={isSubmitting} startIcon={<EmailIcon />} sx={{ mb: 2 }}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </StyledButton>

            <StyledButton fullWidth variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/login")}>
              Back to Login
            </StyledButton>
          </Box>
        </CardContent>
      </StyledCard>
    </StyledContainer>
  );
};

export default ForgotPasswordPage;
