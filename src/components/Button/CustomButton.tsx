//Button/CustomButton.tsx
import React, { MouseEventHandler } from "react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface CustomButtonProps {
  variant?: string;
  size?: "sm" | "lg"; // Update this line
  icon?: IconProp;
  text?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = "primary",
  size, // Remove the default value for size
  icon,
  text,
  onClick,
  className,
  disabled,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
      disabled={disabled}
      {...props}
    >
      {icon && <FontAwesomeIcon icon={icon} className={text ? "me-1" : ""} />}
      {text}
    </Button>
  );
};

export default CustomButton;
