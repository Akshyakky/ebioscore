// layouts/Theme/Themes.ts
import { createTheme } from "@mui/material/styles";

const drawerWidth = 340;
const LightTheme = createTheme({
  palette: {
    mode: "light",
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
          boxShadow: "none",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: "#3371d9",
          color: "#ffffff",
          borderBottom: "1px solid #b0c4de",
          padding: "16px",
          fontSize: "18px",
          fontWeight: "bold",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          padding: "16px",
          color: "#333333",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: "1px solid #b0c4de",
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
              borderColor: "#3371d9",
            },
            "&:hover fieldset": {
              borderColor: "#2979ff",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2979ff",
            },
          },
          "& .MuiInputBase-input": {
            color: "#333",
          },
          "& .MuiFormLabel-root": {
            color: "#3371d9",
          },
          "& .MuiFormLabel-root.Mui-focused": {
            color: "#2979ff",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#3371d9",
            },
            "&:hover fieldset": {
              borderColor: "#2979ff",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2979ff",
            },
          },
          "& .MuiInputBase-input": {
            color: "#333",
          },
          "& .MuiFormLabel-root": {
            color: "#3371d9",
          },
          "& .MuiFormLabel-root.Mui-focused": {
            color: "#2979ff",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#3371d9",
          "&.Mui-checked": {
            color: "#2979ff",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#3371d9",
          "&.Mui-checked": {
            color: "#2979ff",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: "#333",
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiFormLabel-root": {
            color: "#3371d9",
          },
          "& .MuiFormLabel-root.Mui-focused": {
            color: "#2979ff",
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#3371d9",
            },
            "&:hover fieldset": {
              borderColor: "#2979ff",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2979ff",
            },
          },
          "& .MuiInputBase-input": {
            color: "#333",
          },
        },
      },
    },
  },
  typography: {
    fontFamily: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"].join(
      ","
    ),
  },
});

export default LightTheme;
