// src/theme/lightTheme.ts
import { createTheme, alpha, Shadows } from "@mui/material/styles";
import { DRAWER_WIDTH, LIGHT_COLORS, SHADOWS, TYPOGRAPHY, TRANSITIONS, SHAPE, COMPONENT_CONSTANTS } from "./themeConstants";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: LIGHT_COLORS.primary,
    secondary: LIGHT_COLORS.secondary,
    success: LIGHT_COLORS.success,
    error: LIGHT_COLORS.error,
    warning: LIGHT_COLORS.warning,
    info: LIGHT_COLORS.info,
    background: LIGHT_COLORS.background,
    text: LIGHT_COLORS.text,
    divider: LIGHT_COLORS.divider,
    action: LIGHT_COLORS.action,
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 14,
    h1: {
      fontSize: TYPOGRAPHY.fontSizes["4xl"],
      fontWeight: TYPOGRAPHY.fontWeights.bold,
      lineHeight: TYPOGRAPHY.lineHeights.sm,
    },
    h2: {
      fontSize: TYPOGRAPHY.fontSizes["3xl"],
      fontWeight: TYPOGRAPHY.fontWeights.semibold,
      lineHeight: TYPOGRAPHY.lineHeights.sm,
    },
    h3: {
      fontSize: TYPOGRAPHY.fontSizes["2xl"],
      fontWeight: TYPOGRAPHY.fontWeights.semibold,
      lineHeight: TYPOGRAPHY.lineHeights.md,
    },
    h4: {
      fontSize: TYPOGRAPHY.fontSizes.xl,
      fontWeight: TYPOGRAPHY.fontWeights.semibold,
      lineHeight: TYPOGRAPHY.lineHeights.md,
    },
    h5: {
      fontSize: TYPOGRAPHY.fontSizes.lg,
      fontWeight: TYPOGRAPHY.fontWeights.medium,
      lineHeight: TYPOGRAPHY.lineHeights.lg,
    },
    h6: {
      fontSize: TYPOGRAPHY.fontSizes.md,
      fontWeight: TYPOGRAPHY.fontWeights.medium,
      lineHeight: TYPOGRAPHY.lineHeights.lg,
    },
    body1: {
      fontSize: TYPOGRAPHY.fontSizes.md,
      lineHeight: TYPOGRAPHY.lineHeights.md,
    },
    body2: {
      fontSize: TYPOGRAPHY.fontSizes.sm,
      lineHeight: TYPOGRAPHY.lineHeights.md,
    },
    button: {
      textTransform: "none",
      fontWeight: TYPOGRAPHY.fontWeights.medium,
    },
  },
  shape: SHAPE,
  shadows: ["none", ...Array(3).fill(SHADOWS.xs), ...Array(3).fill(SHADOWS.sm), ...Array(4).fill(SHADOWS.md), ...Array(14).fill(SHADOWS.xl)] as Shadows,
  transitions: {
    easing: TRANSITIONS.easing,
    duration: TRANSITIONS.duration,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          boxSizing: "border-box",
          margin: 0,
          padding: 0,
        },
        html: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          height: "100%",
          width: "100%",
        },
        body: {
          height: "100%",
          backgroundColor: LIGHT_COLORS.background.default,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          overflowX: "hidden",
          padding: "10px 0",
          background: LIGHT_COLORS.background.dark,
          color: LIGHT_COLORS.text.primary,
          borderRight: `1px solid ${LIGHT_COLORS.divider}`,
          transition: `all ${TRANSITIONS.duration.standard}ms ${TRANSITIONS.easing.easeInOut}`,
          ".active-submenu-item": {
            backgroundColor: alpha(LIGHT_COLORS.primary.main, 0.08),
            color: LIGHT_COLORS.primary.main,
            borderLeft: `4px solid ${LIGHT_COLORS.primary.main}`,
            "& .MuiListItemIcon-root": {
              color: LIGHT_COLORS.primary.main,
            },
          },
          ".MuiListItem-root": {
            transition: `all ${TRANSITIONS.duration.shorter}ms ${TRANSITIONS.easing.easeInOut}`,
            "&:hover": {
              backgroundColor: LIGHT_COLORS.primary.hover,
              color: LIGHT_COLORS.primary.main,
              "& .MuiListItemIcon-root": {
                color: LIGHT_COLORS.primary.main,
              },
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: SHADOWS.lg,
          borderRadius: SHAPE.borderRadius,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: LIGHT_COLORS.primary.main,
          color: LIGHT_COLORS.primary.contrastText,
          borderBottom: `1px solid ${LIGHT_COLORS.divider}`,
          padding: COMPONENT_CONSTANTS.dialog.spacing,
          height: COMPONENT_CONSTANTS.dialog.titleHeight,
          fontSize: TYPOGRAPHY.fontSizes.lg,
          fontWeight: TYPOGRAPHY.fontWeights.semibold,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: LIGHT_COLORS.background.paper,
          padding: COMPONENT_CONSTANTS.dialog.spacing,
          color: LIGHT_COLORS.text.primary,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${LIGHT_COLORS.divider}`,
          backgroundColor: LIGHT_COLORS.background.dark,
          padding: COMPONENT_CONSTANTS.dialog.spacing / 2,
          height: COMPONENT_CONSTANTS.dialog.footerHeight,
          display: "flex",
          justifyContent: "flex-end",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: LIGHT_COLORS.grey[300],
              transition: `all ${TRANSITIONS.duration.shorter}ms ${TRANSITIONS.easing.easeInOut}`,
            },
            "&:hover fieldset": {
              borderColor: LIGHT_COLORS.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: LIGHT_COLORS.primary.main,
            },
          },
          "& .MuiInputBase-input": {
            color: LIGHT_COLORS.text.primary,
          },
          "& .MuiFormLabel-root": {
            color: LIGHT_COLORS.text.secondary,
            "&.Mui-focused": {
              color: LIGHT_COLORS.primary.main,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: SHAPE.borderRadius,
          fontWeight: TYPOGRAPHY.fontWeights.medium,
          height: COMPONENT_CONSTANTS.button.mediumHeight,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: SHADOWS.sm,
          },
        },
        containedPrimary: {
          backgroundColor: LIGHT_COLORS.primary.main,
          color: LIGHT_COLORS.primary.contrastText,
          "&:hover": {
            backgroundColor: LIGHT_COLORS.primary.dark,
          },
        },
        containedSecondary: {
          backgroundColor: LIGHT_COLORS.secondary.main,
          color: LIGHT_COLORS.secondary.contrastText,
          "&:hover": {
            backgroundColor: LIGHT_COLORS.secondary.dark,
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: LIGHT_COLORS.background.paper,
          color: LIGHT_COLORS.text.primary,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: LIGHT_COLORS.primary.main,
          "& .MuiTableCell-head": {
            color: LIGHT_COLORS.primary.contrastText,
            fontWeight: TYPOGRAPHY.fontWeights.semibold,
            height: COMPONENT_CONSTANTS.table.headerHeight,
            borderBottom: "none",
            "&:not(:last-child)": {
              borderRight: `1px solid ${alpha(LIGHT_COLORS.primary.contrastText, 0.2)}`,
            },
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": {
            "&:nth-of-type(odd)": {
              backgroundColor: alpha(LIGHT_COLORS.grey[100], 0.5),
            },
            "&:hover": {
              backgroundColor: LIGHT_COLORS.primary.hover,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${LIGHT_COLORS.divider}`,
          color: LIGHT_COLORS.text.primary,
          height: COMPONENT_CONSTANTS.table.rowHeight,
          // padding: "6px 8px",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          height: COMPONENT_CONSTANTS.table.paginationHeight,
          borderTop: `1px solid ${LIGHT_COLORS.divider}`,
        },
      },
    },
  },
});

export default lightTheme;
