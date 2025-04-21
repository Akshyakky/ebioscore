// src/components/ResponsiveFormLayout/ResponsiveFormLayout.tsx
import React from "react";
import { Grid, Paper, Typography, Box, useMediaQuery, Theme } from "@mui/material";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

interface ResponsiveFormLayoutProps {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  onClear: () => void;
  saveText?: string;
  clearText?: string;
  isLoading?: boolean;
}

const ResponsiveFormLayout: React.FC<ResponsiveFormLayoutProps> = ({ title, children, onSave, onClear, saveText = "Save", clearText = "Clear", isLoading = false }) => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  return (
    <Paper
      variant="elevation"
      sx={{
        padding: { xs: 1.5, sm: 2, md: 3 },
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.25rem" },
          fontWeight: 600,
          color: "primary.main",
          mb: 2,
          pb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {title}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={isMobile ? 1.5 : 2}>
          {children}
        </Grid>
      </Box>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <FormSaveClearButton saveText={saveText} clearText={clearText} onSave={onSave} onClear={onClear} isLoading={isLoading} orientation={isMobile ? "vertical" : "horizontal"} />
      </Box>
    </Paper>
  );
};

export default ResponsiveFormLayout;
