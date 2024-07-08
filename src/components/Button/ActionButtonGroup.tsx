import React from "react";
import Grid from "@mui/material/Grid";
import ButtonGroup from "@mui/material/ButtonGroup";
import CustomButton from "./CustomButton";
import { SvgIconComponent } from "@mui/icons-material";

export interface ButtonProps {
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  icon?: SvgIconComponent;
  text?: string;
  onClick?: () => void | Promise<void>;
  className?: string;
}

interface ActionButtonGroupProps {
  buttons: ButtonProps[];
}

const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({ buttons }) => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
        >
          {buttons.map((button, index) => (
            <CustomButton
              key={index}
              variant={button.variant || "text"}
              size={button.size || "small"}
              icon={button.icon}
              text={button.text}
              onClick={button.onClick}
              className={button.className}
            />
          ))}
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default ActionButtonGroup;
