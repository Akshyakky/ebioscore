import React from "react";
import { Stack, useMediaQuery, Box, CircularProgress } from "@mui/material";
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
  isLoading?: boolean; // Added isLoading property
  orientation?: "horizontal" | "vertical"; // Added orientation property
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
  isLoading = false,
  orientation = "horizontal",
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isVertical = orientation === "vertical";

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "8px",
        backgroundColor: "#fff",
        borderTop: "1px solid #e0e0e0",
        zIndex: 1100,
      }}
    >
      <Stack direction={isVertical ? "column" : "row"} spacing={2} justifyContent="space-between">
        <Box sx={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
          <Button
            variant={clearVariant}
            color={clearColor}
            onClick={onClear}
            startIcon={ClearIcon && <ClearIcon />}
            fullWidth={isMobile}
            aria-label="clear form"
            disabled={isLoading}
          >
            {clearText}
          </Button>
        </Box>
        <Box sx={{ flex: 1, textAlign: isMobile ? "center" : "right" }}>
          <Button
            variant={saveVariant}
            color={saveColor}
            onClick={onSave}
            startIcon={!isLoading && SaveIcon && <SaveIcon />}
            fullWidth={isMobile}
            aria-label="save form"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              saveText
            )}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default FormSaveClearButton;
