import React from "react";
import { FloatingLabel, Col, Form } from "react-bootstrap";
import { TextBoxProps } from "../../../interfaces/Common/TextBoxProps";

const FloatingLabelTextBox: React.FC<TextBoxProps> = ({
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
  maxLength,
  isSubmitted = false,
  errorMessage,
  max,
}) => {
  const controlId = `txt${ControlID}`;
  // Determine if the textbox is invalid
  const isInvalid = (isMandatory && isSubmitted && !value) || !!errorMessage;

  // Determine the error message to display
  const errorToShow =
    errorMessage || (isMandatory && !value ? `${title} is required.` : "");
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
          isInvalid={isInvalid}
          maxLength={maxLength}
          max={max}
        />
        {isInvalid && (
          <Form.Control.Feedback type="invalid">
            {errorToShow}
          </Form.Control.Feedback>
        )}
      </FloatingLabel>
    </Form.Group>
  );
};

export default FloatingLabelTextBox;
