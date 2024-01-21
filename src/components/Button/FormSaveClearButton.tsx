// FormSaveClearButton.tsx
import React from "react";
import { Grid } from "@mui/material";
import CustomButton from "./CustomButton";
import { SvgIconComponent } from "@mui/icons-material";
import "./Button.css";

interface FormSaveClearButtonProps {
  clearText: string;
  saveText: string;
  onClear: () => void;
  onSave: () => void;
  clearIcon?: SvgIconComponent;
  saveIcon?: SvgIconComponent;
}

const FormSaveClearButton: React.FC<FormSaveClearButtonProps> = ({
  clearText,
  saveText,
  onClear,
  onSave,
  clearIcon,
  saveIcon,
}) => {
  return (
    <Grid container className="fixed-buttons-container">
      <Grid item xs={6} className="text-start">
        <CustomButton
          text={clearText}
          onClick={onClear}
          icon={clearIcon}
          variant="contained" // You can customize this as needed
          color="error" // Material UI color scheme
        />
      </Grid>
      <Grid item xs={6} className="text-end">
        <CustomButton
          text={saveText}
          onClick={onSave}
          icon={saveIcon}
          variant="contained" // You can customize this as needed
          color="success" // Material UI color scheme
        />
      </Grid>
    </Grid>
  );
};

export default FormSaveClearButton;
