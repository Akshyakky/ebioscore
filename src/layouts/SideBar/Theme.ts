//layouts/SodeBar/Theme.ts
import { createTheme } from "@mui/material/styles";
const drawerWidth = 340;
const theme = createTheme({
  palette: {
    primary: {
      main: "#2979ff",
    },
    background: {
      default: "#fff",
      paper: "#fff",
    },
    text: {
      primary: "#000",
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: drawerWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          padding: "10px 0",
          background: "#253147",
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
          // This targets the Paper component inside the Dialog
          boxShadow: "none", // Example of removing the default shadow
          // ... Add other global dialog styles here
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f5",
          color: "#333",
          borderBottom: "1px solid #ccc",
          // ... Your custom title styles here
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          // ... Your custom content styles here
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: "1px solid #ccc",
          backgroundColor: "#f5f5f5",
          // ... Your custom action styles here
        },
      },
    },
    // ... other component overrides
  },
  typography: {
    fontFamily: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"].join(
      ","
    ),
  },
});

export default theme;
