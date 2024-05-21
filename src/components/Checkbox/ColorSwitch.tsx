import React from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";

interface CustomSwitchProps {
  label?: string;
  size?: "small" | "medium";
  color?: string; // Custom color as a string
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Custom styling for color
const ColorSwitch = styled(Switch)(({ theme, color }) => ({
  "& .MuiSwitch-switchBase": {
    color: "#fff", // default handle color
  },
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#fff", // handle color when checked
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: color || theme.palette.primary.main, // Use passed color or primary theme color if no color passed
  },
  "& .MuiSwitch-track": {
    backgroundColor: "#ccc", // default track color when not checked
  },
  "& .MuiSwitch-switchBase.Mui-checked:hover": {
    backgroundColor: color ? `${color}B2` : `${theme.palette.primary.main}B2`, // hover with opacity, using the custom color
  },
}));

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label = "Default Label",
  size = "medium",
  color = "#4CAF50", // Default color green
  checked,
  onChange,
}) => {
  return (
    <FormControlLabel
      control={
        <ColorSwitch
          checked={checked}
          onChange={onChange}
          size={size}
          sx={{
            // Additional MUI System properties can be used here for further customization
            "& .MuiSwitch-thumb": {
              color: "#fff", // Thumb color
            },
            "& .MuiSwitch-switchBase:not(.Mui-checked)": {
              color: "#ccc", // Handle color when not checked
            },
          }}
        />
      }
      label={label}
      labelPlacement="end"
    />
  );
};

export default CustomSwitch;
