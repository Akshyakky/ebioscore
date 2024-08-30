import React from "react";
import Button from "@mui/material/Button";
import { SvgIconComponent } from "@mui/icons-material";
import clsx from "clsx";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";

export interface CustomButtonProps {
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  icon?: SvgIconComponent;
  text?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  color?:
  | "inherit"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";
  ariaLabel?: string;
  sx?: SxProps<Theme>;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "contained",
  size = "medium",
  icon: Icon,
  text,
  onClick,
  className,
  disabled,
  color = "primary",
  ariaLabel,
  sx,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={clsx(className)}
      disabled={disabled}
      startIcon={Icon ? <Icon /> : null}
      color={color}
      aria-label={ariaLabel || text}
      sx={sx}
      {...props}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
