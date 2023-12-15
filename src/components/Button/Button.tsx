// FixedButtons.tsx
import React from "react";
import { Button, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface FixedButtonProps {
  clearText: string;
  saveText: string;
  onClear: () => void;
  onSave: () => void;
  clearIcon?: IconDefinition;
  saveIcon?: IconDefinition;
}

const FixedButtons: React.FC<FixedButtonProps> = ({
  clearText,
  saveText,
  onClear,
  onSave,
  clearIcon,
  saveIcon,
}) => {
  return (
    <Row className="fixed-buttons-container">
      <Col className="text-start">
        <Button variant="secondary" onClick={onClear}>
          {clearIcon && <FontAwesomeIcon icon={clearIcon} className="me-2" />}
          {clearText}
        </Button>
      </Col>
      <Col className="text-end">
        <Button variant="primary" onClick={onSave}>
          {saveIcon && <FontAwesomeIcon icon={saveIcon} className="me-2" />}
          {saveText}
        </Button>
      </Col>
    </Row>
  );
};

export default FixedButtons;
