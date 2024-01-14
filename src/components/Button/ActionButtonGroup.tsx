//Button/ActionButtonGroup.tsx
import React from "react";
import { Col, Row, ButtonGroup } from "react-bootstrap";
import CustomButton from "./CustomButton";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface ButtonProps {
  variant?: string;
  size?: "sm" | "lg";
  icon?: IconProp;
  text?: string;
  onClick?: () => void;
  className?: string;
}

interface ActionButtonGroupProps {
  buttons: ButtonProps[];
}

const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({ buttons }) => {
  return (
    <Row className="mb-1">
      <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
        <ButtonGroup>
          {buttons.map((button, index) => (
            <CustomButton
              key={index}
              variant={button.variant || "dark"}
              size={button.size || "sm"}
              icon={button.icon}
              text={button.text}
              onClick={button.onClick}
              className={button.className}
            />
          ))}
        </ButtonGroup>
      </Col>
    </Row>
  );
};

export default ActionButtonGroup;
