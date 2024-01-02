import React, { useState, ChangeEvent } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { Kin } from "../../../../interfaces/PatientAdministration/NextOfKinData";
import "./NextOfKin.css";
// Update handleSave in NextOfKinPopupProps
interface NextOfKinPopupProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (kinDetails: Kin) => void;
}

const NextOfKinPopup: React.FC<NextOfKinPopupProps> = ({
  show,
  handleClose,
  handleSave,
}) => {
  const [kinData, setKinData] = useState<Kin>({
    name: "",
    mobile: "",
    relationship: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKinData({ ...kinData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    handleSave(kinData);
    handleClose();
  };

  return (
    <Modal className="custom-modal" show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Next of Kin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={kinData.name}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mobile Number</Form.Label>
            <Form.Control
              type="text"
              name="mobile"
              value={kinData.mobile}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Relationship</Form.Label>
            <Form.Control
              type="text"
              name="relationship"
              value={kinData.relationship}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NextOfKinPopup;
