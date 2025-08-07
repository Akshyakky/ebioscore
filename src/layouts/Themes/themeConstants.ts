// src/layouts/Themes/themeConstants.ts
import { alpha } from "@mui/material";

// Layout Constants - Compact Design
export const DRAWER_WIDTH = 280; // Reduced from 340
export const APPBAR_HEIGHT = 52; // Reduced from 64
export const BOTTOM_NAV_HEIGHT = 48; // Reduced from 56

// Breakpoints (in pixels)
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Spacing - Compact Design
export const SPACING_UNIT = 4; // Reduced from 6

// Border Radius - Compact Design
export const BORDER_RADIUS = {
  xs: 2, // Reduced from 4
  sm: 4, // Reduced from 8
  md: 6, // Reduced from 12
  lg: 8, // Reduced from 16
  xl: 12, // Reduced from 24
  round: "50%",
};

// Z-Index
export const Z_INDEX = {
  drawer: 1200,
  appBar: 1100,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Light Theme Colors
export const LIGHT_COLORS = {
  primary: {
    main: "#1976d2",
    light: "#42a5f5",
    dark: "#1565c0",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#f50057",
    light: "#ff4081",
    dark: "#c51162",
    contrastText: "#ffffff",
  },
  success: {
    main: "#2e7d32",
    light: "#4caf50",
    dark: "#1b5e20",
    contrastText: "#ffffff",
  },
  error: {
    main: "#d32f2f",
    light: "#ef5350",
    dark: "#c62828",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#ed6c02",
    light: "#ff9800",
    dark: "#e65100",
    contrastText: "#ffffff",
  },
  info: {
    main: "#0288d1",
    light: "#03a9f4",
    dark: "#01579b",
    contrastText: "#ffffff",
  },
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
    A100: "#f5f5f5",
    A200: "#eeeeee",
    A400: "#bdbdbd",
    A700: "#616161",
  },
  text: {
    primary: "#333333",
    secondary: "#666666",
    disabled: "#9e9e9e",
  },
  background: {
    default: "#f4f6f8",
    paper: "#ffffff",
    dark: "#f0f2f5",
    light: "#ffffff",
  },
  action: {
    active: alpha("#000000", 0.54),
    hover: alpha("#000000", 0.04),
    selected: alpha("#000000", 0.08),
    disabled: alpha("#000000", 0.26),
    disabledBackground: alpha("#000000", 0.12),
    focus: alpha("#000000", 0.12),
  },
  divider: "#e0e0e0",
  border: "#e6e8eb",
};

// Dark Theme Colors
export const DARK_COLORS = {
  primary: {
    main: "#1976d2",
    light: "#42a5f5",
    dark: "#1565c0",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#f48fb1",
    light: "#f8bbd0",
    dark: "#c2185b",
    contrastText: "#000000",
  },
  success: {
    main: "#66bb6a",
    light: "#81c784",
    dark: "#388e3c",
    contrastText: "#000000",
  },
  error: {
    main: "#f44336",
    light: "#e57373",
    dark: "#d32f2f",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#ffa726",
    light: "#ffb74d",
    dark: "#f57c00",
    contrastText: "#000000",
  },
  info: {
    main: "#29b6f6",
    light: "#4fc3f7",
    dark: "#0288d1",
    contrastText: "#000000",
  },
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
    A100: "#f5f5f5",
    A200: "#eeeeee",
    A400: "#bdbdbd",
    A700: "#616161",
  },
  text: {
    primary: "#ffffff",
    secondary: "#b0bec5",
    disabled: "rgba(255, 255, 255, 0.5)",
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
    dark: "#151515",
    light: "#2d2d2d",
  },
  action: {
    active: "#ffffff",
    hover: alpha("#ffffff", 0.08),
    selected: alpha("#ffffff", 0.16),
    disabled: alpha("#ffffff", 0.3),
    disabledBackground: alpha("#ffffff", 0.12),
    focus: alpha("#ffffff", 0.12),
  },
  divider: "#424242",
  border: "#2d2d2d",
};

// Shadow Constants - Compact Design
export const SHADOWS = {
  xs: "0 1px 2px rgba(0,0,0,0.04)", // Reduced
  sm: "0 2px 4px rgba(0,0,0,0.08)", // Reduced
  md: "0 4px 8px rgba(0,0,0,0.08)", // Reduced
  lg: "0 8px 16px rgba(0,0,0,0.08)", // Reduced
  xl: "0 12px 20px rgba(0,0,0,0.08)", // Reduced
};

// Typography Constants - Compact Design
export const TYPOGRAPHY = {
  fontFamily: ["Inter", "Segoe UI", "Roboto", "Arial", "sans-serif"].join(","),
  fontSizes: {
    xs: "0.6875rem", // 11px - Reduced from 12px
    sm: "0.8125rem", // 13px - Reduced from 14px
    md: "0.875rem", // 14px - Reduced from 16px
    lg: "1rem", // 16px - Reduced from 18px
    xl: "1.125rem", // 18px - Reduced from 20px
    "2xl": "1.25rem", // 20px - Reduced from 24px
    "3xl": "1.5rem", // 24px - Reduced from 30px
    "4xl": "1.875rem", // 30px - Reduced from 36px
    "5xl": "2.25rem", // 36px - Reduced from 48px
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    xs: 1.2, // Reduced from 1.25
    sm: 1.3, // Reduced from 1.375
    md: 1.4, // Reduced from 1.5
    lg: 1.5, // Reduced from 1.625
    xl: 1.8, // Reduced from 2
  },
};

// Animation Constants - Faster for Compact Design
export const TRANSITIONS = {
  duration: {
    shortest: 120, // Reduced from 150
    shorter: 160, // Reduced from 200
    short: 200, // Reduced from 250
    standard: 240, // Reduced from 300
    complex: 300, // Reduced from 375
    enteringScreen: 180, // Reduced from 225
    leavingScreen: 150, // Reduced from 195
  },
  easing: {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  },
};

// Component-specific constants - Compact Design
export const COMPONENT_CONSTANTS = {
  table: {
    headerHeight: 36, // Reduced from 44
    rowHeight: 32, // Reduced from 40
    paginationHeight: 44, // Reduced from 52
    denseHeaderHeight: 30, // Reduced from 36
    denseRowHeight: 26, // Reduced from 32
    densePaginationHeight: 36, // Reduced from 40
  },
  dataGrid: {
    headerHeight: 40, // Reduced from 48
    rowHeight: 36, // Reduced from 44
    compactRowHeight: 30, // Reduced from 36
    denseRowHeight: 26, // Reduced from 32
    paginationHeight: 44, // Reduced from 52
    cellPadding: "4px 8px", // Reduced from "8px 12px"
    compactCellPadding: "3px 6px", // Reduced from "6px 10px"
    denseCellPadding: "2px 4px", // Reduced from "4px 8px"
    editCellPadding: "2px 4px", // Reduced from "4px 8px"
    borderWidth: "1px",
    fontSize: "0.8125rem", // Reduced from "0.875rem"
    headerFontSize: "0.8125rem", // Reduced from "0.875rem"
    headerFontWeight: 600,
    emptyStateMinHeight: 240, // Reduced from 300
    loadingOverlayMinHeight: 160, // Reduced from 200
  },
  dialog: {
    spacing: 12, // Reduced from 16
    titleHeight: 36, // Reduced from 40
    footerHeight: 40, // Reduced from 48
  },
  drawer: {
    miniWidth: 48, // Reduced from 56
    standardWidth: DRAWER_WIDTH,
  },
  tooltip: {
    fontSize: "0.6875rem", // Reduced from "0.75rem"
    padding: "2px 6px", // Reduced from "4px 8px"
    arrowSize: 4, // Reduced from 6
  },
  button: {
    smallHeight: 24, // Reduced from 28
    mediumHeight: 28, // Reduced from 32
    largeHeight: 34, // Reduced from 40
  },
};

// Shape Constants - Compact Design
export const SHAPE = {
  borderRadius: 2, // Reduced from 4
  borderWidth: 1,
  borderStyle: "solid",
};

// DataGrid Specific Constants - Compact Design
export const DATAGRID_CONSTANTS = {
  colors: {
    light: {
      headerBackground: "#1976d2",
      headerText: "#ffffff",
      rowEven: "rgba(0, 0, 0, 0.02)",
      rowOdd: "#ffffff",
      rowHover: "rgba(25, 118, 210, 0.04)",
      rowSelected: "rgba(25, 118, 210, 0.08)",
      rowValid: "rgba(76, 175, 80, 0.04)",
      rowInvalid: "rgba(255, 152, 0, 0.04)",
      rowError: "rgba(244, 67, 54, 0.04)",
      cellBorder: "#e0e0e0",
      cellFocus: "#1976d2",
      emptyStateBg: "#fafafa",
      emptyStateBorder: "#e0e0e0",
      loadingOverlay: "rgba(255, 255, 255, 0.8)",
    },
    dark: {
      headerBackground: "#1976d2",
      headerText: "#ffffff",
      rowEven: "rgba(255, 255, 255, 0.02)",
      rowOdd: "#1e1e1e",
      rowHover: "rgba(255, 255, 255, 0.08)",
      rowSelected: "rgba(25, 118, 210, 0.16)",
      rowValid: "rgba(76, 175, 80, 0.08)",
      rowInvalid: "rgba(255, 152, 0, 0.08)",
      rowError: "rgba(244, 67, 54, 0.08)",
      cellBorder: "#424242",
      cellFocus: "#42a5f5",
      emptyStateBg: "#151515",
      emptyStateBorder: "#424242",
      loadingOverlay: "rgba(0, 0, 0, 0.8)",
    },
  },
  transitions: {
    rowHover: "background-color 120ms cubic-bezier(0.4, 0, 0.2, 1)", // Faster
    cellFocus: "outline 160ms cubic-bezier(0.4, 0, 0.2, 1)", // Faster
    cellEdit: "all 160ms cubic-bezier(0.4, 0, 0.2, 1)", // Faster
  },
  zIndex: {
    overlay: 1000,
    editCell: 1001,
    columnMenu: 1002,
  },
};

export default {
  DRAWER_WIDTH,
  APPBAR_HEIGHT,
  BOTTOM_NAV_HEIGHT,
  BREAKPOINTS,
  SPACING_UNIT,
  BORDER_RADIUS,
  Z_INDEX,
  LIGHT_COLORS,
  DARK_COLORS,
  SHADOWS,
  TYPOGRAPHY,
  TRANSITIONS,
  COMPONENT_CONSTANTS,
  SHAPE,
  DATAGRID_CONSTANTS,
};
