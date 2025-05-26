// src/layouts/Themes/darkTheme.ts
import { DRAWER_WIDTH, DARK_COLORS, SHADOWS, TYPOGRAPHY, TRANSITIONS, SHAPE, COMPONENT_CONSTANTS, SPACING_UNIT } from "./themeConstants";
import { createTheme, alpha } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: DARK_COLORS.primary,
    secondary: DARK_COLORS.secondary,
    success: DARK_COLORS.success,
    error: DARK_COLORS.error,
    warning: DARK_COLORS.warning,
    info: DARK_COLORS.info,
    background: DARK_COLORS.background,
    text: DARK_COLORS.text,
    divider: DARK_COLORS.divider,
    action: DARK_COLORS.action,
  },
  typography: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 14,
    h1: {
      fontSize: TYPOGRAPHY.fontSizes["4xl"],
      fontWeight: TYPOGRAPHY.fontWeights.bold,
      lineHeight: TYPOGRAPHY.lineHeights.sm,
      color: DARK_COLORS.text.primary,
    },
    h2: {
      fontSize: TYPOGRAPHY.fontSizes["3xl"],
      fontWeight: TYPOGRAPHY.fontWeights.semibold,
      lineHeight: TYPOGRAPHY.lineHeights.sm,
      color: DARK_COLORS.text.primary,
    },
    h3: {
      fontSize: TYPOGRAPHY.fontSizes["2xl"],
      fontWeight: TYPOGRAPHY.fontWeights.semibold,
      lineHeight: TYPOGRAPHY.lineHeights.md,
      color: DARK_COLORS.text.primary,
    },
    h4: {
      fontSize: TYPOGRAPHY.fontSizes.xl,
      fontWeight: TYPOGRAPHY.fontWeights.semibold,
      lineHeight: TYPOGRAPHY.lineHeights.md,
      color: DARK_COLORS.text.primary,
    },
    h5: {
      fontSize: TYPOGRAPHY.fontSizes.lg,
      fontWeight: TYPOGRAPHY.fontWeights.medium,
      lineHeight: TYPOGRAPHY.lineHeights.lg,
      color: DARK_COLORS.text.primary,
    },
    h6: {
      fontSize: TYPOGRAPHY.fontSizes.md,
      fontWeight: TYPOGRAPHY.fontWeights.medium,
      lineHeight: TYPOGRAPHY.lineHeights.lg,
      color: DARK_COLORS.text.primary,
    },
    body1: {
      fontSize: TYPOGRAPHY.fontSizes.md,
      lineHeight: TYPOGRAPHY.lineHeights.md,
      color: DARK_COLORS.text.primary,
    },
    body2: {
      fontSize: TYPOGRAPHY.fontSizes.sm,
      lineHeight: TYPOGRAPHY.lineHeights.md,
      color: DARK_COLORS.text.secondary,
    },
    button: {
      textTransform: "none",
      fontWeight: TYPOGRAPHY.fontWeights.medium,
    },
  },
  shape: SHAPE,
  spacing: SPACING_UNIT,
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
          backgroundColor: DARK_COLORS.background.default,
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
          background: DARK_COLORS.background.dark,
          color: DARK_COLORS.text.primary,
          borderRight: `1px solid ${DARK_COLORS.divider}`,
          transition: `all ${TRANSITIONS.duration.standard}ms ${TRANSITIONS.easing.easeInOut}`,
          ".active-submenu-item": {
            backgroundColor: DARK_COLORS.primary.main,
            color: DARK_COLORS.primary.contrastText,
            borderLeft: `4px solid ${DARK_COLORS.primary.light}`,
            "& .MuiListItemIcon-root": {
              color: DARK_COLORS.primary.contrastText,
            },
          },
          ".MuiListItem-root": {
            transition: `all ${TRANSITIONS.duration.shorter}ms ${TRANSITIONS.easing.easeInOut}`,
            "&:hover": {
              backgroundColor: DARK_COLORS.action.hover,
              color: DARK_COLORS.primary.light,
              "& .MuiListItemIcon-root": {
                color: DARK_COLORS.primary.light,
              },
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: DARK_COLORS.background.paper,
          boxShadow: SHADOWS.xl,
          borderRadius: SHAPE.borderRadius,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: DARK_COLORS.primary.main,
          color: DARK_COLORS.primary.contrastText,
          borderBottom: `1px solid ${DARK_COLORS.divider}`,
          padding: `${SPACING_UNIT}px ${COMPONENT_CONSTANTS.dialog.spacing}px`, // Reduced vertical padding
          minHeight: COMPONENT_CONSTANTS.dialog.titleHeight,
          fontSize: TYPOGRAPHY.fontSizes.lg,
          fontWeight: TYPOGRAPHY.fontWeights.semibold,
          display: "flex",
          alignItems: "center",
          // Ensure proper flex container behavior for title content
          "& .MuiBox-root": {
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          },
          // Style the typography element
          "& .MuiTypography-root": {
            flex: 1,
            marginRight: SPACING_UNIT,
            fontSize: "inherit",
            fontWeight: "inherit",
            lineHeight: 1.2,
          },
          // Style the close button
          "& .MuiIconButton-root": {
            color: DARK_COLORS.primary.contrastText,
            padding: SPACING_UNIT / 2,
            "&:hover": {
              backgroundColor: alpha(DARK_COLORS.primary.contrastText, 0.1),
            },
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: DARK_COLORS.background.paper,
          padding: COMPONENT_CONSTANTS.dialog.spacing,
          color: DARK_COLORS.text.primary,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${DARK_COLORS.divider}`,
          backgroundColor: DARK_COLORS.background.dark,
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
            backgroundColor: DARK_COLORS.background.dark,
            "& fieldset": {
              borderColor: DARK_COLORS.divider,
              transition: `all ${TRANSITIONS.duration.shorter}ms ${TRANSITIONS.easing.easeInOut}`,
            },
            "&:hover fieldset": {
              borderColor: DARK_COLORS.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: DARK_COLORS.primary.main,
            },
          },
          "& .MuiInputBase-input": {
            color: DARK_COLORS.text.primary,
          },
          "& .MuiFormLabel-root": {
            color: DARK_COLORS.text.secondary,
            "&.Mui-focused": {
              color: DARK_COLORS.primary.main,
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
          "& .MuiSvgIcon-root": {
            fontSize: 20,
          },
        },
        sizeSmall: {
          height: COMPONENT_CONSTANTS.button.smallHeight,
          fontSize: TYPOGRAPHY.fontSizes.xs,
          "& .MuiSvgIcon-root": {
            fontSize: 16,
          },
        },
        sizeLarge: {
          height: COMPONENT_CONSTANTS.button.largeHeight,
          fontSize: TYPOGRAPHY.fontSizes.md,
          "& .MuiSvgIcon-root": {
            fontSize: 24,
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: SHADOWS.sm,
          },
        },
        containedPrimary: {
          backgroundColor: DARK_COLORS.primary.main,
          color: DARK_COLORS.primary.contrastText,
          "&:hover": {
            backgroundColor: DARK_COLORS.primary.dark,
          },
        },
        containedSecondary: {
          backgroundColor: DARK_COLORS.secondary.main,
          color: DARK_COLORS.secondary.contrastText,
          "&:hover": {
            backgroundColor: DARK_COLORS.secondary.dark,
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: DARK_COLORS.background.paper,
          color: DARK_COLORS.text.primary,
          "& .MuiTableHead-root": {
            backgroundColor: `${DARK_COLORS.primary.main} !important`,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: `${DARK_COLORS.primary.main} !important`,
          "& .MuiTableCell-root": {
            backgroundColor: `${DARK_COLORS.primary.main} !important`,
            color: `${DARK_COLORS.primary.contrastText} !important`,
            fontWeight: `${TYPOGRAPHY.fontWeights.semibold} !important`,
            height: COMPONENT_CONSTANTS.table.headerHeight,
            borderBottom: "none !important",
            fontSize: `${TYPOGRAPHY.fontSizes.sm} !important`,
            "&:not(:last-child)": {
              borderRight: `1px solid ${alpha(DARK_COLORS.primary.contrastText, 0.2)} !important`,
            },
          },
          "& .MuiTableCell-head": {
            backgroundColor: `${DARK_COLORS.primary.main} !important`,
            color: `${DARK_COLORS.primary.contrastText} !important`,
            fontWeight: `${TYPOGRAPHY.fontWeights.semibold} !important`,
            height: COMPONENT_CONSTANTS.table.headerHeight,
            borderBottom: "none !important",
            fontSize: `${TYPOGRAPHY.fontSizes.sm} !important`,
            "&:not(:last-child)": {
              borderRight: `1px solid ${alpha(DARK_COLORS.primary.contrastText, 0.2)} !important`,
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
              backgroundColor: alpha(DARK_COLORS.background.light, 0.05),
            },
            "&:hover": {
              backgroundColor: DARK_COLORS.action.hover,
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${DARK_COLORS.divider}`,
          color: DARK_COLORS.text.primary,
          height: COMPONENT_CONSTANTS.table.rowHeight,
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          height: COMPONENT_CONSTANTS.table.paginationHeight,
          borderTop: `1px solid ${DARK_COLORS.divider}`,
          color: DARK_COLORS.text.primary,
        },
        selectLabel: {
          color: DARK_COLORS.text.secondary,
        },
        displayedRows: {
          color: DARK_COLORS.text.secondary,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: SHAPE.borderRadius,
        },
        standardError: {
          backgroundColor: alpha(DARK_COLORS.error.main, 0.12),
          color: DARK_COLORS.error.light,
        },
        standardSuccess: {
          backgroundColor: alpha(DARK_COLORS.success.main, 0.12),
          color: DARK_COLORS.success.light,
        },
        standardWarning: {
          backgroundColor: alpha(DARK_COLORS.warning.main, 0.12),
          color: DARK_COLORS.warning.light,
        },
        standardInfo: {
          backgroundColor: alpha(DARK_COLORS.info.main, 0.12),
          color: DARK_COLORS.info.light,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: `0 2px 8px ${alpha(DARK_COLORS.background.default, 0.3)}`,
          borderRadius: SHAPE.borderRadius,
          backgroundColor: DARK_COLORS.background.paper,
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: `${SPACING_UNIT}px 0`,
          },
          transition: `box-shadow ${TRANSITIONS.duration.short}ms ${TRANSITIONS.easing.easeInOut}, margin ${TRANSITIONS.duration.short}ms ${TRANSITIONS.easing.easeInOut}`,
          "&:hover": {
            boxShadow: `0 4px 12px ${alpha(DARK_COLORS.background.default, 0.5)}`,
          },
        },
      },
    },

    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${alpha(DARK_COLORS.primary.main, 0.1)}, ${alpha(DARK_COLORS.primary.main, 0.15)})`,
          color: DARK_COLORS.primary.light,
          minHeight: "42px !important",
          height: "42px",
          borderRadius: `${SHAPE.borderRadius}px ${SHAPE.borderRadius}px 0 0`,
          "&.Mui-expanded": {
            minHeight: "48px",
          },
          "&:hover": {
            background: `linear-gradient(135deg, ${alpha(DARK_COLORS.primary.main, 0.15)}, ${alpha(DARK_COLORS.primary.main, 0.2)})`,
            color: DARK_COLORS.primary.main,
          },
          transition: `background ${TRANSITIONS.duration.shortest}ms ${TRANSITIONS.easing.easeInOut}, color ${TRANSITIONS.duration.shortest}ms ${TRANSITIONS.easing.easeInOut}`,
          "& .MuiAccordionSummary-expandIconWrapper": {
            color: DARK_COLORS.primary.light,
            transition: `transform ${TRANSITIONS.duration.shortest}ms ${TRANSITIONS.easing.easeInOut}, color ${TRANSITIONS.duration.shortest}ms ${TRANSITIONS.easing.easeInOut}`,
            "&.Mui-expanded": {
              transform: "rotate(180deg)",
            },
          },
          "&:hover .MuiAccordionSummary-expandIconWrapper": {
            color: DARK_COLORS.primary.main,
          },
        },
        content: {
          margin: "12px 0",
          "& .MuiTypography-root": {
            fontSize: "1rem",
            fontWeight: TYPOGRAPHY.fontWeights.semibold,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: "inherit",
          },
        },
      },
    },

    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: SPACING_UNIT * 2,
          borderTop: `1px solid ${alpha(DARK_COLORS.divider, 0.5)}`,
          backgroundColor: alpha(DARK_COLORS.background.dark, 0.6),
          borderRadius: `0 0 ${SHAPE.borderRadius}px ${SHAPE.borderRadius}px`,
          color: DARK_COLORS.text.primary,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: DARK_COLORS.primary.main,
          color: DARK_COLORS.primary.contrastText,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          borderBottom: `1px solid ${DARK_COLORS.divider}`,
          "& .MuiToolbar-root": {
            backgroundColor: "inherit",
            color: "inherit",
          },
          "& .MuiIconButton-root": {
            color: DARK_COLORS.primary.contrastText,
            "&:hover": {
              backgroundColor: alpha(DARK_COLORS.primary.contrastText, 0.1),
            },
          },
          "& .MuiTypography-root": {
            color: DARK_COLORS.primary.contrastText,
            fontWeight: TYPOGRAPHY.fontWeights.semibold,
          },
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          "& .MuiButtonGroup-grouped:not(:last-of-type)": {
            borderColor: alpha(DARK_COLORS.primary.main, 0.2),
          },
          "& .MuiButton-root": {
            textTransform: "none",
            gap: SPACING_UNIT,
            fontSize: TYPOGRAPHY.fontSizes.sm,
            fontWeight: TYPOGRAPHY.fontWeights.medium,
            "& .MuiSvgIcon-root": {
              fontSize: 20,
            },
          },
        },
        grouped: {
          "&:not(:last-of-type)": {
            borderColor: alpha(DARK_COLORS.primary.main, 0.2),
          },
        },
      },
    },
  },
});

export default darkTheme;
