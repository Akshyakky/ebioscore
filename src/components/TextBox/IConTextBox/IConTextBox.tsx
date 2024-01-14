import React from "react";
import { FormControl, FormGroup, FormLabel, InputGroup } from "react-bootstrap";

interface TextBoxProps {
  ControlID: string;
  title?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  size?: "sm" | "lg";
  disabled?: boolean;
  icon?: React.ReactNode;
  onIconClick?: () => void; // Add an onClick handler for the icon
  isMandatory?: boolean;
  readOnly?: boolean;
  ariaLabelIcon?: string;
}

const IConTextBox: React.FC<TextBoxProps> = ({
  ControlID,
  title,
  value = "",
  onChange,
  placeholder,
  type = "text",
  className,
  size,
  disabled = false,
  icon,
  onIconClick,
  isMandatory = false,
  readOnly = false,
  ariaLabelIcon, // Accessible label for the icon
}) => {
  const controlId = `txt${ControlID}`;

  return (
    <FormGroup controlId={controlId}>
      {title && (
        <FormLabel>
          {title}
          {isMandatory && <span className="text-danger">*</span>}
        </FormLabel>
      )}
      <InputGroup size={size}>
        <FormControl
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
          readOnly={readOnly}
        />
        {icon && (
          <InputGroup.Text
            onClick={onIconClick ? onIconClick : undefined}
            style={{ cursor: onIconClick ? "pointer" : "default" }}
            aria-label={ariaLabelIcon}
          >
            {icon}
          </InputGroup.Text>
        )}
      </InputGroup>
    </FormGroup>
  );
};

export default IConTextBox;
