import React from "react";
import { Stack, Grid } from "@mui/material";
import ButtonGroup from "@mui/material/ButtonGroup";
import CustomButton, { CustomButtonProps } from "./CustomButton";
import { SvgIconComponent } from "@mui/icons-material";

export interface ButtonProps extends Omit<CustomButtonProps, "icon"> {
  icon?: SvgIconComponent;
  color?: "inherit" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  variant?: "text" | "outlined" | "contained";
}

interface ActionButtonGroupProps {
  buttons: ButtonProps[];
  orientation?: "horizontal" | "vertical";
}

const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({ buttons, orientation = "horizontal" }) => {
  return (
    <Stack spacing={1}>
      <Grid>
        <ButtonGroup orientation={orientation} aria-label="action button group" disableElevation disableRipple>
          {buttons.map((button, index) => (
            <CustomButton
              key={index}
              variant={button.variant}
              size={button.size}
              icon={button.icon}
              text={button.text}
              onClick={button.onClick}
              className={button.className}
              color={button.color}
              ariaLabel={button.text || `button-${index}`}
            />
          ))}
        </ButtonGroup>
      </Grid>
    </Stack>
  );
};
export default ActionButtonGroup;
