// Theme.ts
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
    // ... other component overrides
  },
  typography: {
    fontFamily: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"].join(
      ","
    ),
  },
});

export default theme;
