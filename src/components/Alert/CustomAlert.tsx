import React from "react";
import { Typography, Box, useTheme } from "@mui/material";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import GenericDialog from "../GenericDialog/GenericDialog";
import CustomButton from "../Button/CustomButton";

export type AlertType = "success" | "error" | "warning" | "info" | "question";

interface CustomAlertProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type: AlertType;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  showPrintButton?: boolean;
  showCloseButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  printButtonText?: string;
  closeButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPrint?: () => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  open,
  onClose,
  title,
  message,
  type,
  showConfirmButton = true,
  showCancelButton = false,
  showPrintButton = false,
  showCloseButton = false,
  confirmButtonText = "OK",
  cancelButtonText = "Cancel",
  printButtonText = "Print",
  closeButtonText = "Close",
  onConfirm,
  onCancel,
  onPrint,
  maxWidth = "sm",
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
}) => {
  const theme = useTheme();

  // Icon and color configuration for different alert types
  const alertConfig = {
    success: {
      icon: SuccessIcon,
      color: theme.palette.success.main,
      buttonColor: "success" as const,
    },
    error: {
      icon: ErrorIcon,
      color: theme.palette.error.main,
      buttonColor: "error" as const,
    },
    warning: {
      icon: WarningIcon,
      color: theme.palette.warning.main,
      buttonColor: "warning" as const,
    },
    info: {
      icon: InfoIcon,
      color: theme.palette.info.main,
      buttonColor: "info" as const,
    },
    question: {
      icon: InfoIcon,
      color: theme.palette.primary.main,
      buttonColor: "primary" as const,
    },
  };

  const { icon: Icon, color, buttonColor } = alertConfig[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    }
    // Don't close dialog after print
  };

  // Render action buttons
  const renderActions = () => {
    const buttons = [];

    if (showPrintButton) {
      buttons.push(<CustomButton key="print" variant="outlined" color="inherit" icon={PrintIcon} text={printButtonText} onClick={handlePrint} ariaLabel="print" />);
    }

    if (showCancelButton) {
      buttons.push(<CustomButton key="cancel" variant="outlined" color="inherit" icon={ClearIcon} text={cancelButtonText} onClick={handleCancel} ariaLabel="cancel" />);
    }

    if (showConfirmButton) {
      buttons.push(
        <CustomButton
          key="confirm"
          variant="contained"
          color={buttonColor}
          icon={CheckIcon}
          text={confirmButtonText}
          onClick={handleConfirm}
          ariaLabel="confirm"
          sx={{ minWidth: 100 }}
        />
      );
    }

    return buttons;
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={title || getDefaultTitle(type)}
      maxWidth={maxWidth}
      fullWidth
      showCloseButton={showCloseButton}
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
      actions={renderActions()}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
        <Icon sx={{ fontSize: 36, color, flexShrink: 0 }} />
        <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
          {message}
        </Typography>
      </Box>
    </GenericDialog>
  );
};

// Helper function to provide default titles based on alert type
const getDefaultTitle = (type: AlertType): string => {
  const defaultTitles = {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information",
    question: "Confirmation",
  };
  return defaultTitles[type];
};

export default CustomAlert;
