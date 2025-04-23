import React, { ReactNode } from "react";
import { Grid, Typography, Divider, Box } from "@mui/material";

interface FormSectionContainerProps {
  title: string;
  children: React.ReactNode;
}
const FormSectionContainer: React.FC<FormSectionContainerProps> = ({ title, children }) => {
  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {children}
    </Box>
  );
};

export default FormSectionContainer;
