import React from "react";
import { Form, Col } from "react-bootstrap";
import { TextBoxProps } from "../../../interfaces/Common/TextBoxProps";

const NormalTextBox: React.FC<TextBoxProps> = ({
  ControlID,
  title,
  value = "",
  onChange,
  placeholder,
  type = "text",
  className,
  style,
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
  const isInvalid = (isMandatory && isSubmitted && !value) || !!errorMessage;
  const errorToShow =
    errorMessage || (isMandatory && !value ? `${title} is required.` : "");

  return (
    <Form.Group
      as={Col}
      controlId={controlId}
      className={`mb-3 ${className}`}
      style={style}
    >
      {title && <Form.Label>{title}</Form.Label>}
      <Form.Control
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || title}
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
    </Form.Group>
  );
};

export default NormalTextBox;
