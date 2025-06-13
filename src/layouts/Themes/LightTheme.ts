// src/layouts/Themes/LightTheme.ts
import { alpha, createTheme } from "@mui/material";
import type {} from "@mui/x-data-grid/themeAugmentation";
import { COMPONENT_CONSTANTS, DATAGRID_CONSTANTS, DRAWER_WIDTH, LIGHT_COLORS, SHADOWS, SHAPE, SPACING_UNIT, TRANSITIONS, TYPOGRAPHY } from "./themeConstants";

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
          backgroundColor: LIGHT_COLORS.background.default,
        },
        // Global scrollbar styles for light theme
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: LIGHT_COLORS.grey[100],
          borderRadius: "4px",
        },
        "*::-webkit-scrollbar-thumb": {
          background: LIGHT_COLORS.grey[400],
          borderRadius: "4px",
          border: `2px solid ${LIGHT_COLORS.grey[100]}`,
          transition: "background-color 0.2s ease",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: LIGHT_COLORS.primary.main,
        },
        "*::-webkit-scrollbar-corner": {
          background: LIGHT_COLORS.grey[100],
        },
        // Sidebar specific scrollbar (thinner)
        ".sidebar-scroll::-webkit-scrollbar": {
          width: "6px",
        },
        ".sidebar-scroll::-webkit-scrollbar-track": {
          background: "transparent",
        },
        ".sidebar-scroll::-webkit-scrollbar-thumb": {
          background: LIGHT_COLORS.grey[300],
          borderRadius: "3px",
          border: "none",
        },
        ".sidebar-scroll::-webkit-scrollbar-thumb:hover": {
          background: LIGHT_COLORS.primary.main,
        },
        // DataGrid specific styles
        ".row-valid": {
          backgroundColor: `${DATAGRID_CONSTANTS.colors.light.rowValid} !important`,
          "&:hover": {
            backgroundColor: `${alpha(LIGHT_COLORS.success.main, 0.08)} !important`,
          },
        },
        ".row-invalid": {
          backgroundColor: `${DATAGRID_CONSTANTS.colors.light.rowInvalid} !important`,
          "&:hover": {
            backgroundColor: `${alpha(LIGHT_COLORS.warning.main, 0.08)} !important`,
          },
        },
        ".row-error": {
          backgroundColor: `${DATAGRID_CONSTANTS.colors.light.rowError} !important`,
          "&:hover": {
            backgroundColor: `${alpha(LIGHT_COLORS.error.main, 0.08)} !important`,
          },
        },
        // Grid edit cell styles
        ".grid-product-search": {
          width: "100%",
          "& .MuiOutlinedInput-root": {
            height: "32px",
            fontSize: COMPONENT_CONSTANTS.dataGrid.fontSize,
            "& fieldset": {
              borderColor: LIGHT_COLORS.divider,
            },
            "&:hover fieldset": {
              borderColor: LIGHT_COLORS.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: LIGHT_COLORS.primary.main,
            },
          },
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
              backgroundColor: alpha(LIGHT_COLORS.primary.main, 0.04),
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
          padding: `${SPACING_UNIT}px ${COMPONENT_CONSTANTS.dialog.spacing}px`,
          minHeight: COMPONENT_CONSTANTS.dialog.titleHeight,
          fontSize: TYPOGRAPHY.fontSizes.lg,
          fontWeight: TYPOGRAPHY.fontWeights.semibold,
          display: "flex",
          alignItems: "center",
          "& .MuiBox-root": {
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          },
          "& .MuiTypography-root": {
            flex: 1,
            marginRight: SPACING_UNIT,
            fontSize: "inherit",
            fontWeight: "inherit",
            lineHeight: 1.2,
          },
          "& .MuiIconButton-root": {
            color: LIGHT_COLORS.primary.contrastText,
            padding: SPACING_UNIT / 2,
            "&:hover": {
              backgroundColor: alpha(LIGHT_COLORS.primary.contrastText, 0.1),
            },
          },
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
          "& .MuiTableHead-root": {
            backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
          "& .MuiTableCell-root": {
            backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
            color: `${LIGHT_COLORS.primary.contrastText} !important`,
            fontWeight: `${TYPOGRAPHY.fontWeights.semibold} !important`,
            height: COMPONENT_CONSTANTS.table.headerHeight,
            borderBottom: "none !important",
            fontSize: `${TYPOGRAPHY.fontSizes.sm} !important`,
            "&:not(:last-child)": {
              borderRight: `1px solid ${alpha(LIGHT_COLORS.primary.contrastText, 0.2)} !important`,
            },
          },
          "& .MuiTableCell-head": {
            backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
            color: `${LIGHT_COLORS.primary.contrastText} !important`,
            fontWeight: `${TYPOGRAPHY.fontWeights.semibold} !important`,
            height: COMPONENT_CONSTANTS.table.headerHeight,
            borderBottom: "none !important",
            fontSize: `${TYPOGRAPHY.fontSizes.sm} !important`,
            "&:not(:last-child)": {
              borderRight: `1px solid ${alpha(LIGHT_COLORS.primary.contrastText, 0.2)} !important`,
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
              backgroundColor: alpha(LIGHT_COLORS.primary.main, 0.04),
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
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: `0 2px 8px ${alpha(LIGHT_COLORS.primary.main, 0.08)}`,
          borderRadius: SHAPE.borderRadius,
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: `${SPACING_UNIT}px 0`,
          },
          transition: `box-shadow ${TRANSITIONS.duration.short}ms ${TRANSITIONS.easing.easeInOut}, margin ${TRANSITIONS.duration.short}ms ${TRANSITIONS.easing.easeInOut}`,
          "&:hover": {
            boxShadow: `0 4px 12px ${alpha(LIGHT_COLORS.primary.main, 0.12)}`,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${alpha(LIGHT_COLORS.primary.main, 0.05)}, ${alpha(LIGHT_COLORS.primary.main, 0.1)})`,
          color: LIGHT_COLORS.primary.main,
          minHeight: "42px !important",
          height: "42px",
          borderRadius: `${SHAPE.borderRadius}px ${SHAPE.borderRadius}px 0 0`,
          "&.Mui-expanded": {
            minHeight: "48px",
          },
          "&:hover": {
            background: `linear-gradient(135deg, ${alpha(LIGHT_COLORS.primary.main, 0.1)}, ${alpha(LIGHT_COLORS.primary.main, 0.15)})`,
          },
          transition: `background ${TRANSITIONS.duration.shortest}ms ${TRANSITIONS.easing.easeInOut}`,
          "& .MuiAccordionSummary-expandIconWrapper": {
            color: LIGHT_COLORS.primary.main,
            transition: `transform ${TRANSITIONS.duration.shortest}ms ${TRANSITIONS.easing.easeInOut}`,
            "&.Mui-expanded": {
              transform: "rotate(180deg)",
            },
          },
        },
        content: {
          margin: "12px 0",
          "& .MuiTypography-root": {
            fontSize: "1rem",
            fontWeight: TYPOGRAPHY.fontWeights.semibold,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            color: LIGHT_COLORS.primary.main,
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: SPACING_UNIT * 2,
          borderTop: `1px solid ${alpha(LIGHT_COLORS.divider, 0.5)}`,
          backgroundColor: alpha(LIGHT_COLORS.background.paper, 0.8),
          borderRadius: `0 0 ${SHAPE.borderRadius}px ${SHAPE.borderRadius}px`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: LIGHT_COLORS.primary.main,
          color: LIGHT_COLORS.primary.contrastText,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          borderBottom: `1px solid ${LIGHT_COLORS.divider}`,
          "& .MuiToolbar-root": {
            backgroundColor: "inherit",
            color: "inherit",
          },
          "& .MuiIconButton-root": {
            color: LIGHT_COLORS.primary.contrastText,
            "&:hover": {
              backgroundColor: alpha(LIGHT_COLORS.primary.contrastText, 0.1),
            },
          },
          "& .MuiTypography-root": {
            color: LIGHT_COLORS.primary.contrastText,
            fontWeight: TYPOGRAPHY.fontWeights.semibold,
          },
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          "& .MuiButtonGroup-grouped:not(:last-of-type)": {
            borderColor: alpha(LIGHT_COLORS.primary.main, 0.15),
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
            borderColor: alpha(LIGHT_COLORS.primary.main, 0.15),
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: LIGHT_COLORS.background.paper,
          color: LIGHT_COLORS.text.primary,
          border: `${COMPONENT_CONSTANTS.dataGrid.borderWidth} solid ${LIGHT_COLORS.divider}`,
          borderRadius: SHAPE.borderRadius,
          fontSize: COMPONENT_CONSTANTS.dataGrid.fontSize,
          fontFamily: TYPOGRAPHY.fontFamily,
          "& .MuiDataGrid-withBorderColor": {
            borderColor: `${LIGHT_COLORS.divider} !important`,
          },
          // Enhanced Header styling with higher specificity
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
            color: `${LIGHT_COLORS.primary.contrastText} !important`,
            fontWeight: `${COMPONENT_CONSTANTS.dataGrid.headerFontWeight} !important`,
            fontSize: `${COMPONENT_CONSTANTS.dataGrid.headerFontSize} !important`,
            minHeight: `${COMPONENT_CONSTANTS.dataGrid.headerHeight}px !important`,
            maxHeight: `${COMPONENT_CONSTANTS.dataGrid.headerHeight}px !important`,
            borderBottom: `${COMPONENT_CONSTANTS.dataGrid.borderWidth} solid ${LIGHT_COLORS.divider} !important`,
            borderRadius: 0,
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
              color: `${LIGHT_COLORS.primary.contrastText} !important`,
              padding: COMPONENT_CONSTANTS.dataGrid.cellPadding,
              "&:focus": {
                outline: "none !important",
              },
              "&:focus-within": {
                outline: "none !important",
              },
              "&:not(:last-child)": {
                borderRight: `${COMPONENT_CONSTANTS.dataGrid.borderWidth} solid ${alpha(LIGHT_COLORS.primary.contrastText, 0.2)} !important`,
              },
            },
            "& .MuiDataGrid-columnHeader--sorted": {
              backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
              color: `${LIGHT_COLORS.primary.contrastText} !important`,
            },
            "& .MuiDataGrid-columnHeader--sortable": {
              backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
              color: `${LIGHT_COLORS.primary.contrastText} !important`,
            },
            "& .MuiDataGrid-columnHeader--moving": {
              backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
              color: `${LIGHT_COLORS.primary.contrastText} !important`,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: COMPONENT_CONSTANTS.dataGrid.headerFontWeight,
              color: `${LIGHT_COLORS.primary.contrastText} !important`,
              fontSize: "inherit",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
            "& .MuiDataGrid-iconSeparator": {
              display: "none",
            },
            "& .MuiDataGrid-menuIcon, & .MuiDataGrid-sortIcon": {
              color: `${LIGHT_COLORS.primary.contrastText} !important`,
              opacity: 0.7,
              "&:hover": {
                opacity: 1,
                color: `${LIGHT_COLORS.primary.contrastText} !important`,
              },
            },
          },
          // Force header background on all possible selectors
          "& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader": {
            backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
            color: `${LIGHT_COLORS.primary.contrastText} !important`,
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
            color: `${LIGHT_COLORS.primary.contrastText} !important`,
          },
          "& .MuiDataGrid-columnHeadersInner": {
            backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
          },
          "& .MuiDataGrid-columnHeadersInner .MuiDataGrid-columnHeader": {
            backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
            color: `${LIGHT_COLORS.primary.contrastText} !important`,
          },
          // Cell styling
          "& .MuiDataGrid-cell": {
            borderRight: `${COMPONENT_CONSTANTS.dataGrid.borderWidth} solid ${DATAGRID_CONSTANTS.colors.light.cellBorder}`,
            borderBottom: `${COMPONENT_CONSTANTS.dataGrid.borderWidth} solid ${DATAGRID_CONSTANTS.colors.light.cellBorder}`,
            color: LIGHT_COLORS.text.primary,
            fontSize: COMPONENT_CONSTANTS.dataGrid.fontSize,
            padding: COMPONENT_CONSTANTS.dataGrid.cellPadding,
            minHeight: `${COMPONENT_CONSTANTS.dataGrid.rowHeight}px !important`,
            maxHeight: `${COMPONENT_CONSTANTS.dataGrid.rowHeight}px !important`,
            display: "flex",
            alignItems: "center",
            "&:focus": {
              outline: "none",
            },
            "&:focus-within": {
              outline: `2px solid ${DATAGRID_CONSTANTS.colors.light.cellFocus}`,
              outlineOffset: "-2px",
              zIndex: DATAGRID_CONSTANTS.zIndex.editCell,
            },
            "&.MuiDataGrid-cell--editable": {
              cursor: "pointer",
              "&:hover": {
                backgroundColor: alpha(LIGHT_COLORS.primary.main, 0.02),
              },
            },
            userSelect: "text",
            WebkitUserSelect: "text",
          },
          // Row styling
          "& .MuiDataGrid-row": {
            minHeight: `${COMPONENT_CONSTANTS.dataGrid.rowHeight}px !important`,
            maxHeight: `${COMPONENT_CONSTANTS.dataGrid.rowHeight}px !important`,
            "&:nth-of-type(even)": {
              backgroundColor: DATAGRID_CONSTANTS.colors.light.rowEven,
            },
            "&:nth-of-type(odd)": {
              backgroundColor: DATAGRID_CONSTANTS.colors.light.rowOdd,
            },
            "&:hover": {
              backgroundColor: `${DATAGRID_CONSTANTS.colors.light.rowHover} !important`,
              transition: DATAGRID_CONSTANTS.transitions.rowHover,
            },
            "&.Mui-selected": {
              backgroundColor: `${DATAGRID_CONSTANTS.colors.light.rowSelected} !important`,
              "&:hover": {
                backgroundColor: `${alpha(LIGHT_COLORS.primary.main, 0.12)} !important`,
              },
            },
            // Custom row states
            "&.row-valid": {
              backgroundColor: `${DATAGRID_CONSTANTS.colors.light.rowValid} !important`,
              borderLeft: `3px solid ${LIGHT_COLORS.success.main}`,
              "&:hover": {
                backgroundColor: `${alpha(LIGHT_COLORS.success.main, 0.08)} !important`,
              },
            },
            "&.row-invalid": {
              backgroundColor: `${DATAGRID_CONSTANTS.colors.light.rowInvalid} !important`,
              borderLeft: `3px solid ${LIGHT_COLORS.warning.main}`,
              "&:hover": {
                backgroundColor: `${alpha(LIGHT_COLORS.warning.main, 0.08)} !important`,
              },
            },
            "&.row-error": {
              backgroundColor: `${DATAGRID_CONSTANTS.colors.light.rowError} !important`,
              borderLeft: `3px solid ${LIGHT_COLORS.error.main}`,
              "&:hover": {
                backgroundColor: `${alpha(LIGHT_COLORS.error.main, 0.08)} !important`,
              },
            },
          },
          // Footer styling
          "& .MuiDataGrid-footerContainer": {
            borderTop: `${COMPONENT_CONSTANTS.dataGrid.borderWidth} solid ${LIGHT_COLORS.divider}`,
            backgroundColor: LIGHT_COLORS.background.dark,
            color: LIGHT_COLORS.text.primary,
            minHeight: `${COMPONENT_CONSTANTS.dataGrid.paginationHeight}px`,
            "& .MuiTablePagination-root": {
              color: LIGHT_COLORS.text.primary,
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              color: LIGHT_COLORS.text.secondary,
            },
          },
          "& .MuiDataGrid-selectedRowCount": {
            color: LIGHT_COLORS.text.secondary,
          },
          // Empty state and overlay styling
          "& .MuiDataGrid-overlay": {
            backgroundColor: DATAGRID_CONSTANTS.colors.light.emptyStateBg,
            color: LIGHT_COLORS.text.primary,
            minHeight: COMPONENT_CONSTANTS.dataGrid.emptyStateMinHeight,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: SPACING_UNIT * 2,
            "& .MuiTypography-root": {
              color: LIGHT_COLORS.text.secondary,
            },
          },
          "& .MuiDataGrid-overlayWrapper": {
            minHeight: COMPONENT_CONSTANTS.dataGrid.loadingOverlayMinHeight,
          },
          "& .MuiDataGrid-loadingOverlay": {
            backgroundColor: DATAGRID_CONSTANTS.colors.light.loadingOverlay,
            backdropFilter: "blur(2px)",
          },
          // Scrollbar styling
          "& .MuiDataGrid-virtualScroller": {
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: LIGHT_COLORS.grey[100],
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: LIGHT_COLORS.grey[400],
              borderRadius: "4px",
              border: `2px solid ${LIGHT_COLORS.grey[100]}`,
              transition: "background-color 0.2s ease",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: LIGHT_COLORS.primary.main,
            },
            "&::-webkit-scrollbar-corner": {
              background: LIGHT_COLORS.grey[100],
            },
          },
          // Edit cell styling
          "& .MuiDataGrid-cell--editing": {
            backgroundColor: `${alpha(LIGHT_COLORS.primary.main, 0.04)} !important`,
            padding: COMPONENT_CONSTANTS.dataGrid.editCellPadding,
            "& .MuiInputBase-root": {
              fontSize: COMPONENT_CONSTANTS.dataGrid.fontSize,
              height: "32px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: LIGHT_COLORS.primary.main,
                borderWidth: "2px",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: LIGHT_COLORS.primary.dark,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: LIGHT_COLORS.primary.main,
                borderWidth: "2px",
              },
            },
            "& .MuiTextField-root": {
              "& .MuiOutlinedInput-root": {
                height: "32px",
                fontSize: COMPONENT_CONSTANTS.dataGrid.fontSize,
              },
            },
          },
          // Actions cell styling
          "& .MuiDataGrid-actionsCell": {
            "& .MuiButton-root": {
              minWidth: "auto",
              padding: `${SPACING_UNIT / 2}px ${SPACING_UNIT}px`,
              fontSize: TYPOGRAPHY.fontSizes.xs,
            },
            "& .MuiIconButton-root": {
              padding: SPACING_UNIT / 2,
              "&:hover": {
                backgroundColor: alpha(LIGHT_COLORS.primary.main, 0.08),
              },
            },
          },
          // Column separator and menu
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "& .MuiDataGrid-menuIcon": {
            visibility: "hidden",
            opacity: 0,
            transition: `visibility ${TRANSITIONS.duration.shorter}ms, opacity ${TRANSITIONS.duration.shorter}ms`,
            color: `${LIGHT_COLORS.primary.contrastText} !important`,
          },
          "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-menuIcon": {
            visibility: "visible",
            opacity: 1,
          },
          // Density modifications
          "&.MuiDataGrid-root--densityCompact": {
            "& .MuiDataGrid-cell": {
              padding: COMPONENT_CONSTANTS.dataGrid.compactCellPadding,
              minHeight: `${COMPONENT_CONSTANTS.dataGrid.compactRowHeight}px !important`,
              maxHeight: `${COMPONENT_CONSTANTS.dataGrid.compactRowHeight}px !important`,
            },
            "& .MuiDataGrid-row": {
              minHeight: `${COMPONENT_CONSTANTS.dataGrid.compactRowHeight}px !important`,
              maxHeight: `${COMPONENT_CONSTANTS.dataGrid.compactRowHeight}px !important`,
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
              minHeight: `${COMPONENT_CONSTANTS.dataGrid.headerHeight - 8}px !important`,
              maxHeight: `${COMPONENT_CONSTANTS.dataGrid.headerHeight - 8}px !important`,
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: `${LIGHT_COLORS.primary.main} !important`,
                color: `${LIGHT_COLORS.primary.contrastText} !important`,
              },
            },
          },
        },
      },
    },
  },
});

export default lightTheme;
