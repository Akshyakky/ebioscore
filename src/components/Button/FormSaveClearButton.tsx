// FormSaveClearButton.tsx
import React from "react";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import CustomButton from "./CustomButton";
import { SvgIconComponent } from "@mui/icons-material";
import styles from "./FormSaveClearButton.module.css";

interface FormSaveClearButtonProps {
  clearText: string;
  saveText: string;
  onClear: () => void;
  onSave: () => void;
  clearIcon?: SvgIconComponent;
  saveIcon?: SvgIconComponent;
  clearColor?: "error" | "primary" | "secondary";
  saveColor?: "success" | "primary" | "secondary";
  clearVariant?: "contained" | "outlined" | "text";
  saveVariant?: "contained" | "outlined" | "text";
}

const FormSaveClearButton: React.FC<FormSaveClearButtonProps> = ({
  clearText,
  saveText,
  onClear,
  onSave,
  clearIcon,
  saveIcon,
  clearColor = "error",
  saveColor = "success",
  clearVariant = "contained",
  saveVariant = "contained",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Grid container className={styles.fixedButtonsContainer} spacing={2}>
      <Grid item xs={6} className={isMobile ? styles.textCenter : styles.textStart}>
        <CustomButton
          text={clearText}
          onClick={onClear}
          icon={clearIcon}
          variant={clearVariant}
          color={clearColor}
          aria-label="clear form"
        />
      </Grid>
      <Grid item xs={6} className={isMobile ? styles.textCenter : styles.textEnd}>
        <CustomButton
          text={saveText}
          onClick={onSave}
          icon={saveIcon}
          variant={saveVariant}
          color={saveColor}
          aria-label="save form"
        />
      </Grid>
    </Grid>
  );
};

export default FormSaveClearButton;