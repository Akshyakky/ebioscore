import React from "react";
import Grid from "@mui/material/Grid";
import ButtonGroup from "@mui/material/ButtonGroup";
import CustomButton, { CustomButtonProps } from "./CustomButton";
import { SvgIconComponent } from "@mui/icons-material";

export interface ButtonProps extends Omit<CustomButtonProps, 'icon'> {
  icon?: SvgIconComponent;
}

interface ActionButtonGroupProps {
  buttons: ButtonProps[];
  groupVariant?: "text" | "outlined" | "contained"; // Allow setting group-wide variant
  groupSize?: "small" | "medium" | "large"; // Allow setting group-wide size
  orientation?: "horizontal" | "vertical"; // Allow vertical orientation
  color?: "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning"; // Button color
}

const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  buttons,
  groupVariant = "contained",
  groupSize = "medium",
  orientation = "horizontal",
  color = "primary",
}) => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <ButtonGroup
          variant={groupVariant}
          size={groupSize}
          orientation={orientation}
          aria-label="action button group"
          color={color} // Apply color to the entire group
        >
          {buttons.map((button, index) => (
            <CustomButton
              key={index}
              variant={button.variant || groupVariant}
              size={button.size || groupSize}
              icon={button.icon}
              text={button.text}
              onClick={button.onClick}
              className={button.className}
              color={color}
              ariaLabel={button.text || `button-${index}`}
            />
          ))}
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default ActionButtonGroup;
