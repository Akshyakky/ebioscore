import React from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled, useTheme } from "@mui/material/styles";

interface CustomSwitchProps {
  label?: string;
  size?: "small" | "medium";
  color?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ColorSwitch = styled(Switch)<{ switchColor?: string }>(({ theme, switchColor }) => ({
  "& .MuiSwitch-switchBase": {
    color: "#fff",
  },
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#fff",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: switchColor || theme.palette.primary.main,
  },
  "& .MuiSwitch-track": {
    backgroundColor: "#ccc",
  },
  "& .MuiSwitch-switchBase.Mui-checked:hover": {
    backgroundColor: switchColor ? `${switchColor}B2` : `${theme.palette.primary.main}B2`,
  },
}));

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  label = "",
  size = "medium",
  color = "#4CAF50",
  checked,
  onChange,
}) => {
  const theme = useTheme();

  return (
    <FormControlLabel
      control={
        <ColorSwitch
          checked={checked}
          onChange={onChange}
          size={size}
          switchColor={color}
          sx={{
            "& .MuiSwitch-thumb": {
              color: "#fff",
            },
            "& .MuiSwitch-switchBase:not(.Mui-checked)": {
              color: "#ccc",
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
