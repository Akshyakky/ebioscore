import { useAppSelector } from "@/store/hooks";
import { ArrowBack } from "@mui/icons-material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import { Box, Button, Container, Paper, Typography, styled } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
  background: theme.palette.mode === "light" ? "linear-gradient(-45deg, #f0f8ff, #e6f3ff, #f5f5f5, #ffffff)" : "linear-gradient(-45deg, #1a1a1a, #2d2d2d)",
  backgroundSize: "400% 400%",
  animation: "gradientBG 15s ease infinite",
  "@keyframes gradientBG": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  maxWidth: "500px",
  width: "100%",
  borderRadius: "16px",
  background: theme.palette.mode === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(24, 26, 32, 0.95)",
  backdropFilter: "blur(20px)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  border: theme.palette.mode === "light" ? "1px solid rgba(255, 255, 255, 0.18)" : "1px solid rgba(255, 255, 255, 0.08)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: `linear-gradient(to right, ${theme.palette.error.main}, ${theme.palette.error.light})`,
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
  },
}));

const ErrorIcon = styled(ErrorOutlineIcon)(({ theme }) => ({
  fontSize: "80px",
  color: theme.palette.error.main,
  marginBottom: theme.spacing(2),
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
    "100%": { transform: "scale(1)" },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  height: "48px",
  textTransform: "none",
  borderRadius: "8px",
  padding: "0 24px",
  fontSize: "16px",
  fontWeight: 600,
}));

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => !!state.auth.token);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate(isAuthenticated ? "/dashboard" : "/login");
  };

  return (
    <StyledContainer maxWidth={false}>
      <StyledPaper elevation={3}>
        <ErrorIcon />

        <Typography variant="h4" component="h1" fontWeight="bold" color="error.main" gutterBottom>
          Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please check the URL or navigate back to a known location.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <StyledButton variant="outlined" startIcon={<ArrowBack />} onClick={handleGoBack} color="primary">
            Go Back
          </StyledButton>

          <StyledButton variant="contained" startIcon={<HomeIcon />} onClick={handleGoHome} color="primary">
            {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
          </StyledButton>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
};

export default NotFoundPage;
