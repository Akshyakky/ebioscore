import React, { ReactNode } from "react";
import { Grid, Typography, Divider } from "@mui/material";

interface FormSectionContainerProps {
  title: string;
  children: ReactNode;
}

const FormSectionContainer: React.FC<FormSectionContainerProps> = ({ title, children }) => {
  return (
    <>
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      {children}
    </>
  );
};

export default FormSectionContainer;
