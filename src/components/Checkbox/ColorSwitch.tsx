import { styled } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import React from "react";

interface CustomSwitchProps {
  label?: string;
  size?: "small" | "medium";
  color?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const ColorSwitch = styled(Switch, {
  shouldForwardProp: (prop) => prop !== "switchColor",
})<{ switchColor?: string }>(({ theme, switchColor }) => ({
  "& .MuiSwitch-switchBase": {
    color: "#fff",
    "&.Mui-checked": {
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: switchColor || theme.palette.primary.main,
      },
      "&:hover": {
        backgroundColor: switchColor ? `${switchColor}B2` : `${theme.palette.primary.main}B2`,
      },
    },
    "&.Mui-disabled": {
      "& + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
      "&.Mui-checked": {
        "& + .MuiSwitch-track": {
          backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
        },
      },
    },
  },
  "& .MuiSwitch-track": {
    backgroundColor: "#ccc",
  },
}));

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label = "",
  size = "medium",
  color = "#4CAF50",
  checked,
  onChange,
  disabled = false, // Added with default value
}) => {
  return (
    <FormControlLabel
      control={
        <ColorSwitch
          checked={checked}
          onChange={onChange}
          size={size}
          switchColor={color}
          disabled={disabled} // Added disabled prop
          sx={{
            "& .MuiSwitch-thumb": {
              color: disabled ? "#BDBDBD" : "#fff",
            },
            "& .MuiSwitch-switchBase:not(.Mui-checked)": {
              color: disabled ? "#BDBDBD" : "#ccc",
            },
          }}
        />
      }
      label={label}
      labelPlacement="end"
      disabled={disabled} // Added disabled prop to FormControlLabel
    />
  );
};

export default CustomSwitch;
