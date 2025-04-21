// FormSaveClearButton.tsx
import React from "react";
import { Stack, useMediaQuery, useTheme, Box } from "@mui/material";
import Button from "@mui/material/Button";
import { SvgIconComponent } from "@mui/icons-material";

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
  clearIcon: ClearIcon,
  saveIcon: SaveIcon,
  clearColor = "error",
  saveColor = "success",
  clearVariant = "contained",
  saveVariant = "contained",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Box sx={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
          <Button variant={clearVariant} color={clearColor} onClick={onClear} startIcon={ClearIcon && <ClearIcon />} fullWidth={isMobile} aria-label="clear form">
            {clearText}
          </Button>
        </Box>
        <Box sx={{ flex: 1, textAlign: isMobile ? "center" : "right" }}>
          <Button variant={saveVariant} color={saveColor} onClick={onSave} startIcon={SaveIcon && <SaveIcon />} fullWidth={isMobile} aria-label="save form">
            {saveText}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default FormSaveClearButton;
