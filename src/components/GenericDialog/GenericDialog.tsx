import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, SxProps, Theme, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useRef } from "react";

interface GenericDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | false;
  fullWidth?: boolean;
  showCloseButton?: boolean;
  actions?: React.ReactNode;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
  dialogContentSx?: SxProps<Theme>;
  titleSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
  closeButtonSx?: SxProps<Theme>;
  fullScreen?: boolean;
  titleVariant?: "h4" | "h5" | "h6";
  TransitionProps?: {
    onEntered: () => void;
  };
}

const GenericDialog: React.FC<GenericDialogProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "sm",
  fullWidth = true,
  showCloseButton = true,
  actions,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  dialogContentSx,
  titleSx,
  actionsSx,
  closeButtonSx,
  fullScreen,
  titleVariant = "h6",
  TransitionProps,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (disableBackdropClick && reason === "backdropClick") {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth === "xxl" ? false : maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
      aria-labelledby="dialog-title"
      fullScreen={fullScreen || isMobile}
      {...(TransitionProps && { TransitionProps })}
    >
      <DialogTitle sx={titleSx || {}}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant={titleVariant} component="h2" id="dialog-title">
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton edge="end" onClick={onClose} aria-label="close dialog" sx={closeButtonSx || {}}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent
        ref={contentRef}
        dividers
        sx={{
          ...(dialogContentSx || {}),
          overflowY: "auto",
          maxHeight: isMobile ? "calc(100vh - 56px)" : "100vh",
          position: "relative",
        }}
      >
        {children}
      </DialogContent>

      {actions && <DialogActions sx={actionsSx || {}}>{React.Children.toArray(actions)}</DialogActions>}
    </Dialog>
  );
};

export default React.memo(GenericDialog);
