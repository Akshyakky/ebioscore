import React from "react";
import { Stack, Grid } from "@mui/material";
import ButtonGroup from "@mui/material/ButtonGroup";
import CustomButton, { CustomButtonProps } from "./CustomButton";
import { SvgIconComponent } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled ButtonGroup component
const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  "& .MuiButtonGroup-grouped:not(:last-of-type)": {
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  "& .MuiButton-root": {
    textTransform: "none",
    gap: theme.spacing(1),
    fontSize: "0.875rem",
    fontWeight: 500,
    "& .MuiSvgIcon-root": {
      fontSize: 20,
    },
  },
}));

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
        <StyledButtonGroup orientation={orientation} aria-label="action button group" disableElevation disableRipple>
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
        </StyledButtonGroup>
      </Grid>
    </Stack>
  );
};

export default ActionButtonGroup;
