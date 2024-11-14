//darkTheme.ts
import { createTheme } from "@mui/material/styles";

const drawerWidth = 340;

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // Keep the primary color vibrant
    },
    background: {
      default: "#121212", // Very dark background for the app
      paper: "#1e1e1e", // Slightly lighter for cards, drawers, dialogs
    },
    text: {
      primary: "#ffffff", // Bright text for dark mode
      secondary: "#b0bec5", // Muted light gray for less important text
    },
    divider: "#424242", // Use a muted gray for dividers and borders
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: drawerWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          padding: "10px 0",
          background: "#253147", // Keep drawer background dark blue
          color: "white",
          ".active-submenu-item": {
            backgroundColor: "#2979ff",
            color: "#fff",
            "& .MuiListItemIcon-root": {
              color: "#fff",
            },
          },
          ".MuiListItem-root": {
            transition: "background-color 0.3s",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              "& .MuiListItemIcon-root": {
                color: "#fff",
              },
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1e1e1e", // Dark dialog background
          boxShadow: "none",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#2979ff", // Use primary color for dialog headers
          color: "#ffffff", // White text for header
          borderBottom: "1px solid #424242",
          padding: "16px",
          fontSize: "18px",
          fontWeight: "bold",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e", // Dark content background
          padding: "16px",
          color: "#ffffff", // White text in content
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: "1px solid #424242",
          backgroundColor: "#2e2e2e", // Darker background for actions
          padding: "8px",
          display: "flex",
          justifyContent: "flex-end",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#2e2e2e", // Dark background for inputs
            "& fieldset": {
              borderColor: "#424242", // Darker border for text fields
            },
            "&:hover fieldset": {
              borderColor: "#2979ff", // Primary blue border on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2979ff", // Primary blue border on focus
            },
          },
          "& .MuiInputBase-input": {
            color: "#ffffff", // White text for input
          },
          "& .MuiFormLabel-root": {
            color: "#b0bec5", // Light gray label
          },
          "& .MuiFormLabel-root.Mui-focused": {
            color: "#2979ff", // Primary color for focused labels
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px", // Add slight border-radius for buttons
          "&.MuiButton-containedPrimary": {
            backgroundColor: "#2979ff", // Use primary color for filled buttons
            color: "#fff", // White text
          },
          "&.MuiButton-containedSecondary": {
            backgroundColor: "#f44336", // Use red for danger actions
            color: "#fff", // White text
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e", // Dark background for tables
          color: "#ffffff", // White text
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #424242", // Darker table borders
          color: "#ffffff", // White text
        },
        head: {
          backgroundColor: "#253147", // Dark blue for table headers
          color: "#ffffff", // White text
        },
      },
    },
  },
  typography: {
    fontFamily: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"].join(","),
    fontSize: 14, // Slightly smaller text for better contrast
  },
});

export default darkTheme;
