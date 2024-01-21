//Button/CustomButton.tsx
import React from "react";
import Button from "@mui/material/Button";
import { SvgIconComponent } from "@mui/icons-material";

interface CustomButtonProps {
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
    | "warning"
    | "success";
}

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "contained",
  size = "medium",
  icon: Icon, // using SvgIconComponent
  text,
  onClick,
  className,
  disabled,
  color,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
      disabled={disabled}
      startIcon={Icon ? <Icon /> : null}
      color={color}
      {...props}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
