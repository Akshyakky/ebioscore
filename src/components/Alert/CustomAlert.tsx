import React, { useEffect, useState } from "react";
import { Typography, Box, useTheme, Stack } from "@mui/material";
import { CheckCircle as SuccessIcon, Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon, Print as PrintIcon } from "@mui/icons-material";
import GenericDialog from "../GenericDialog/GenericDialog";
import CustomButton from "../Button/CustomButton";

export type AlertType = "success" | "error" | "warning" | "info" | "question";

interface CustomAlertProps {
  title?: string;
  message: string;
  type: AlertType;
  show: boolean;
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
  onClose?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  title = "",
  message,
  type,
  show,
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
  onClose,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    setOpen(show);
  }, [show]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    }
  };

  // Render action buttons using CustomButton
  const renderActions = () => {
    const buttons = [];

    if (showPrintButton) {
      buttons.push(<CustomButton key="print" variant="outlined" color="inherit" icon={PrintIcon} text={printButtonText} onClick={handlePrint} ariaLabel="print" />);
    }

    if (showCancelButton) {
      buttons.push(<CustomButton key="cancel" variant="outlined" color="inherit" text={cancelButtonText} onClick={handleCancel} ariaLabel="cancel" />);
    }

    if (showConfirmButton) {
      buttons.push(
        <CustomButton key="confirm" variant="contained" color={buttonColor} text={confirmButtonText} onClick={handleConfirm} ariaLabel="confirm" sx={{ minWidth: 100 }} />
      );
    }

    return buttons.length > 0 ? (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {buttons}
      </Stack>
    ) : null;
  };

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={title || getDefaultTitle(type)}
      maxWidth="sm"
      fullWidth={true}
      showCloseButton={showCloseButton}
      disableBackdropClick={false}
      disableEscapeKeyDown={false}
      actions={renderActions()}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 2 }}>
        <Icon sx={{ fontSize: 36, color, flexShrink: 0, mt: 0.5 }} />
        <Typography variant="body1">{message}</Typography>
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
