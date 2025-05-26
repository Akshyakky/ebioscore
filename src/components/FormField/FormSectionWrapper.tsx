import React from "react";
import { Grid, Box } from "@mui/material";

interface FormSectionWrapperProps {
  title: string;
  children: React.ReactNode;
  spacing?: number;
  actionButton?: React.ReactNode;
}

const FormSectionWrapper: React.FC<FormSectionWrapperProps> = ({ title, children, spacing = 1, actionButton }) => {
  return (
    <Box mb={1}>
      <Grid container spacing={spacing}>
        {children}
      </Grid>
    </Box>
  );
};

export default FormSectionWrapper;
