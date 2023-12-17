import React from "react";
import { FloatingLabel, Col, Form } from "react-bootstrap";

// Define TypeScript interface for the component props
interface TextBoxProps {
  ControlID: string;
  title?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  style?: React.CSSProperties; 
  size?: "sm" | "lg";
  isMandatory?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  ariaLabel?: string; 
  maxLength?: number; 
}

const TextBox: React.FC<TextBoxProps> = ({
  ControlID,
  title,
  value = "",
  onChange,
  placeholder,
  type = "text",
  className,
  style, // Added inline style
  size,
  isMandatory = false,
  disabled = false,
  readOnly = false,
  ariaLabel = "",
  maxLength
}) => {
  const controlId = `txt${ControlID}`;

  return (
    <Form.Group as={Col} controlId={controlId} className="mb-3">
      <FloatingLabel
        controlId={controlId}
        label={title || ""}
        className={className}
        style={style}
      >
        <Form.Control
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder || title} // placeholder must be set for floating label to work
          size={size}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel || title} 
          isInvalid={isMandatory && !value} 
          maxLength={maxLength}
        />
        {isMandatory && !value && (
          <Form.Control.Feedback type="invalid">
            {title} is required.
          </Form.Control.Feedback>
        )}
      </FloatingLabel>
    </Form.Group>
  );
};

export default TextBox;
