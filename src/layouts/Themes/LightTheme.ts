//LightTheme.ts
import { createTheme } from "@mui/material/styles";

const drawerWidth = 340;

const LightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
    divider: "#e0e0e0",
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: drawerWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          padding: "10px 0",
          background: "#f0f4f8",
          color: "#333333",
          borderRight: "1px solid #e0e0e0",
          ".active-submenu-item": {
            backgroundColor: "rgba(25, 118, 210, 0.08)",
            color: "#1976d2",
            borderLeft: "4px solid #1976d2",
            "& .MuiListItemIcon-root": {
              color: "#1976d2",
            },
          },
          ".MuiListItem-root": {
            transition: "background-color 0.3s",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.04)",
              color: "#1976d2",
              "& .MuiListItemIcon-root": {
                color: "#1976d2",
              },
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#1976d2",
          color: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
          padding: "16px",
          fontSize: "18px",
          fontWeight: "bold",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          padding: "16px",
          color: "#333333",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#f5f5f5",
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
            "& fieldset": {
              borderColor: "#c4c4c4",
            },
            "&:hover fieldset": {
              borderColor: "#1976d2",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1976d2",
            },
          },
          "& .MuiInputBase-input": {
            color: "#333333",
          },
          "& .MuiFormLabel-root": {
            color: "#666666",
          },
          "& .MuiFormLabel-root.Mui-focused": {
            color: "#1976d2",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c4c4c4",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1976d2",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1976d2",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#1976d2",
          "&.Mui-checked": {
            color: "#1976d2",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#1976d2",
          "&.Mui-checked": {
            color: "#1976d2",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: "#333333",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "4px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
          },
        },
        containedPrimary: {
          backgroundColor: "#1976d2",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#1565c0",
          },
        },
        containedSecondary: {
          backgroundColor: "#f50057",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#c51162",
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#333333",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #e0e0e0",
          color: "#333333",
        },
        head: {
          backgroundColor: "#f0f4f8",
          color: "#1976d2",
          fontWeight: 600,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiFormLabel-root": {
            color: "#666666",
          },
          "& .MuiFormLabel-root.Mui-focused": {
            color: "#1976d2",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#c4c4c4",
            },
            "&:hover fieldset": {
              borderColor: "#1976d2",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1976d2",
            },
          },
          "& .MuiInputBase-input": {
            color: "#333333",
          },
        },
      },
    },
  },
  typography: {
    fontFamily: ["Segoe UI", "Roboto", "Arial", "sans-serif"].join(","),
    fontSize: 14,
  },
});

export default LightTheme;
