import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box, IconButton, useTheme, useMediaQuery } from "@mui/material";
import { CheckCircle as SuccessIcon, Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon, Close as CloseIcon, Print as PrintIcon } from "@mui/icons-material";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const handleBackdropClick = (event: React.MouseEvent, reason: string) => {
    if (reason === "backdropClick") {
      handleClose();
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

  return (
    <Dialog
      open={open}
      onClose={handleBackdropClick}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: isMobile ? 0 : 2,
          minWidth: isMobile ? "100%" : "400px",
        },
      }}
    >
      {(title || showCloseButton) && (
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton edge="end" onClick={handleClose} aria-label="close" sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent sx={{ pt: title ? 1 : 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            py: 1,
          }}
        >
          <Icon
            sx={{
              fontSize: 40,
              color,
              flexShrink: 0,
              mt: 0.5,
            }}
          />
          <Typography
            id="alert-dialog-description"
            variant="body1"
            sx={{
              mt: 0.5,
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {showPrintButton && (
          <Button startIcon={<PrintIcon />} onClick={handlePrint} color="inherit" variant="outlined" size="medium">
            {printButtonText}
          </Button>
        )}

        {showCancelButton && (
          <Button onClick={handleCancel} color="inherit" variant="outlined" size="medium">
            {cancelButtonText}
          </Button>
        )}

        {showConfirmButton && (
          <Button onClick={handleConfirm} color={buttonColor} variant="contained" size="medium" autoFocus>
            {confirmButtonText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomAlert;
