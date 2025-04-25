// src/components/Dialog/ConfirmationDialog.tsx
import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon, CheckCircle as SuccessIcon } from "@mui/icons-material";
import GenericDialog from "../GenericDialog/GenericDialog";
import CustomButton from "../Button/CustomButton";

export type ConfirmationType = "warning" | "error" | "info" | "success";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  maxWidth = "sm",
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
}) => {
  const theme = useTheme();

  // Configuration for different confirmation types
  const typeConfig = {
    warning: {
      icon: WarningIcon,
      color: theme.palette.warning.main,
      buttonColor: "warning" as const,
    },
    error: {
      icon: ErrorIcon,
      color: theme.palette.error.main,
      buttonColor: "error" as const,
    },
    info: {
      icon: InfoIcon,
      color: theme.palette.info.main,
      buttonColor: "info" as const,
    },
    success: {
      icon: SuccessIcon,
      color: theme.palette.success.main,
      buttonColor: "success" as const,
    },
  };

  const { icon: Icon, color, buttonColor } = typeConfig[type];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text={cancelText} onClick={onClose} color="inherit" size="medium" />
      <CustomButton variant="contained" text={confirmText} onClick={handleConfirm} color={buttonColor} size="medium" />
    </>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
      fullWidth
      showCloseButton={false}
      actions={dialogActions}
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 2 }}>
        <Icon sx={{ fontSize: 36, color, flexShrink: 0, mt: 0.5 }} />
        <Typography variant="body1">{message}</Typography>
      </Box>
    </GenericDialog>
  );
};

export default ConfirmationDialog;
