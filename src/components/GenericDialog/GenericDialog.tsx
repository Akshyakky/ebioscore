import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box, SxProps, useTheme, useMediaQuery, Fade, Theme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

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
    onEntered?: () => void;
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
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showScrollUp, setShowScrollUp] = useState(false);

  const handleClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (disableBackdropClick && reason === "backdropClick") {
      return;
    }
    onClose();
  };

  const checkScrollPosition = () => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px tolerance

    setShowScrollDown(!isAtBottom && scrollHeight > clientHeight);
    setShowScrollUp(!isAtTop && scrollHeight > clientHeight);
  };

  const scrollToDirection = (direction: "up" | "down") => {
    if (!contentRef.current) return;

    const { clientHeight } = contentRef.current;
    const scrollAmount = clientHeight * 0.8; // Scroll 80% of visible height

    contentRef.current.scrollBy({
      top: direction === "down" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Initial check
    checkScrollPosition();

    // Add scroll listener
    content.addEventListener("scroll", checkScrollPosition);

    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(content);

    return () => {
      content.removeEventListener("scroll", checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth === "xxl" ? false : maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
      aria-labelledby="dialog-title"
      fullScreen={fullScreen || isMobile}
      TransitionProps={TransitionProps}
    >
      <DialogTitle sx={titleSx}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant={titleVariant} component="h2" id="dialog-title">
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton edge="end" onClick={onClose} aria-label="close dialog" sx={closeButtonSx}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent
        ref={contentRef}
        dividers
        sx={{
          ...dialogContentSx,
          overflowY: "auto",
          maxHeight: isMobile ? "calc(100vh - 56px)" : "70vh",
          position: "relative",
          // Enhanced scrollbar styling that works with both themes
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: theme.palette.action.hover,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.action.disabled,
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: theme.palette.action.active,
            },
          },
        }}
      >
        {children}
      </DialogContent>

      {actions && <DialogActions sx={actionsSx}>{React.Children.toArray(actions)}</DialogActions>}
    </Dialog>
  );
};

export default React.memo(GenericDialog);
