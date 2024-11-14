// src/theme/themeConstants.ts
import { alpha } from "@mui/material/styles";

// Layout Constants
export const DRAWER_WIDTH = 340;
export const APPBAR_HEIGHT = 64;
export const BOTTOM_NAV_HEIGHT = 56;

// Breakpoints (in pixels)
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Spacing
export const SPACING_UNIT = 8;

// Border Radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
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
    hover: alpha("#1976d2", 0.04),
    active: alpha("#1976d2", 0.12),
    disabled: alpha("#1976d2", 0.38),
  },
  secondary: {
    main: "#f50057",
    light: "#ff4081",
    dark: "#c51162",
    contrastText: "#ffffff",
    hover: alpha("#f50057", 0.04),
    active: alpha("#f50057", 0.12),
    disabled: alpha("#f50057", 0.38),
  },
  success: {
    main: "#2e7d32",
    light: "#4caf50",
    dark: "#1b5e20",
    contrastText: "#ffffff",
    hover: alpha("#2e7d32", 0.04),
    active: alpha("#2e7d32", 0.12),
    disabled: alpha("#2e7d32", 0.38),
  },
  error: {
    main: "#d32f2f",
    light: "#ef5350",
    dark: "#c62828",
    contrastText: "#ffffff",
    hover: alpha("#d32f2f", 0.04),
    active: alpha("#d32f2f", 0.12),
    disabled: alpha("#d32f2f", 0.38),
  },
  warning: {
    main: "#ed6c02",
    light: "#ff9800",
    dark: "#e65100",
    contrastText: "#ffffff",
    hover: alpha("#ed6c02", 0.04),
    active: alpha("#ed6c02", 0.12),
    disabled: alpha("#ed6c02", 0.38),
  },
  info: {
    main: "#0288d1",
    light: "#03a9f4",
    dark: "#01579b",
    contrastText: "#ffffff",
    hover: alpha("#0288d1", 0.04),
    active: alpha("#0288d1", 0.12),
    disabled: alpha("#0288d1", 0.38),
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
    main: "#90caf9",
    light: "#e3f2fd",
    dark: "#42a5f5",
    contrastText: "#000000",
    hover: alpha("#90caf9", 0.08),
    active: alpha("#90caf9", 0.16),
    disabled: alpha("#90caf9", 0.38),
  },
  secondary: {
    main: "#f48fb1",
    light: "#f8bbd0",
    dark: "#c2185b",
    contrastText: "#000000",
    hover: alpha("#f48fb1", 0.08),
    active: alpha("#f48fb1", 0.16),
    disabled: alpha("#f48fb1", 0.38),
  },
  success: {
    main: "#66bb6a",
    light: "#81c784",
    dark: "#388e3c",
    contrastText: "#000000",
    hover: alpha("#66bb6a", 0.08),
    active: alpha("#66bb6a", 0.16),
    disabled: alpha("#66bb6a", 0.38),
  },
  error: {
    main: "#f44336",
    light: "#e57373",
    dark: "#d32f2f",
    contrastText: "#ffffff",
    hover: alpha("#f44336", 0.08),
    active: alpha("#f44336", 0.16),
    disabled: alpha("#f44336", 0.38),
  },
  warning: {
    main: "#ffa726",
    light: "#ffb74d",
    dark: "#f57c00",
    contrastText: "#000000",
    hover: alpha("#ffa726", 0.08),
    active: alpha("#ffa726", 0.16),
    disabled: alpha("#ffa726", 0.38),
  },
  info: {
    main: "#29b6f6",
    light: "#4fc3f7",
    dark: "#0288d1",
    contrastText: "#000000",
    hover: alpha("#29b6f6", 0.08),
    active: alpha("#29b6f6", 0.16),
    disabled: alpha("#29b6f6", 0.38),
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

// Shadow Constants
export const SHADOWS = {
  xs: "0 2px 4px rgba(0,0,0,0.05)",
  sm: "0 4px 8px rgba(0,0,0,0.1)",
  md: "0 8px 16px rgba(0,0,0,0.1)",
  lg: "0 16px 24px rgba(0,0,0,0.1)",
  xl: "0 24px 32px rgba(0,0,0,0.1)",
};

// Typography Constants
export const TYPOGRAPHY = {
  fontFamily: ["Segoe UI", "Roboto", "Arial", "sans-serif"].join(","),
  fontSizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    md: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    xs: 1.25,
    sm: 1.375,
    md: 1.5,
    lg: 1.625,
    xl: 2,
  },
};

// Animation Constants
export const TRANSITIONS = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  },
};

// Component-specific constants
export const COMPONENT_CONSTANTS = {
  table: {
    headerHeight: 40, // Reduced from 56
    rowHeight: 36, // Reduced from 52
    paginationHeight: 40, // Reduced from 52
    denseHeaderHeight: 32, // Reduced from 44
    denseRowHeight: 32, // Reduced from 40
    densePaginationHeight: 32, // Reduced from 44
  },
  dialog: {
    spacing: 16, // Reduced from 24
    titleHeight: 48, // Reduced from 64
    footerHeight: 48, // Reduced from 64
  },
  drawer: {
    miniWidth: 56, // Reduced from 72
    standardWidth: DRAWER_WIDTH,
  },
  tooltip: {
    fontSize: "0.75rem",
    padding: "4px 8px", // Reduced from "8px 16px"
    arrowSize: 6, // Reduced from 8
  },
  button: {
    smallHeight: 28, // Reduced from 32
    mediumHeight: 32, // Reduced from 40
    largeHeight: 40, // Reduced from 48
  },
};

// Media Query Breakpoints
export const MEDIA_QUERIES = {
  up: (breakpoint: keyof typeof BREAKPOINTS) => `@media (min-width: ${BREAKPOINTS[breakpoint]}px)`,
  down: (breakpoint: keyof typeof BREAKPOINTS) => `@media (max-width: ${BREAKPOINTS[breakpoint] - 0.05}px)`,
  between: (start: keyof typeof BREAKPOINTS, end: keyof typeof BREAKPOINTS) => `@media (min-width: ${BREAKPOINTS[start]}px) and (max-width: ${BREAKPOINTS[end] - 0.05}px)`,
};

// Shape Constants
export const SHAPE = {
  borderRadius: 4,
  borderWidth: 1,
  borderStyle: "solid",
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
  MEDIA_QUERIES,
  SHAPE,
};
