import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box, SxProps, useTheme, useMediaQuery, Fade } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Theme } from "@mui/material/styles";
import { styled } from "@mui/system";

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
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
  zIndex: 1300,
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.primary.main,
  color: theme.palette.mode === "dark" ? theme.palette.text.primary : theme.palette.primary.contrastText,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  overflowX: "hidden",
  backgroundColor: theme.palette.background.paper,
  position: "relative",
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const ScrollIndicator = styled(Box)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(1),
  zIndex: 1,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: "50%",
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "opacity 0.3s ease",
  //boxShadow: theme.shadows[4],
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "scale(1.1)",
  },
}));

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
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth === "xxl" ? false : maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
      aria-labelledby="dialog-title"
      fullScreen={fullScreen || isMobile}
    >
      <StyledDialogTitle sx={titleSx}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant={titleVariant} component="h2" id="dialog-title" color={theme.palette.mode === "dark" ? "text.primary" : "inherit"}>
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              edge="end"
              onClick={onClose}
              aria-label="close dialog"
              sx={{
                color: theme.palette.mode === "dark" ? theme.palette.text.secondary : theme.palette.primary.contrastText,
                "&:hover": {
                  color: theme.palette.mode === "dark" ? theme.palette.text.primary : theme.palette.primary.light,
                },
                ...closeButtonSx,
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </StyledDialogTitle>
      <StyledDialogContent
        ref={contentRef}
        dividers
        sx={{
          ...dialogContentSx,
          overflowY: "auto",
          maxHeight: isMobile ? "calc(100vh - 56px)" : "70vh",
          // Ensure scrollbar is always visible
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: theme.palette.grey[100],
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.grey[400],
            border: "none",
            borderRadius: "10px",
            "&:hover": {
              backgroundColor: theme.palette.grey[600],
            },
          },
        }}
      >
        {children}

        {/* Scroll Down Indicator */}
        <Fade in={showScrollDown}>
          <ScrollIndicator bottom={16} onClick={() => scrollToDirection("down")} aria-label="Scroll down to see more content">
            <KeyboardArrowDownIcon />
          </ScrollIndicator>
        </Fade>

        {/* Scroll Up Indicator */}
        <Fade in={showScrollUp}>
          <ScrollIndicator top={16} onClick={() => scrollToDirection("up")} aria-label="Scroll up">
            <KeyboardArrowUpIcon />
          </ScrollIndicator>
        </Fade>
      </StyledDialogContent>
      {actions && <StyledDialogActions sx={actionsSx}>{React.Children.toArray(actions)}</StyledDialogActions>}
    </StyledDialog>
  );
};

export default React.memo(GenericDialog);
