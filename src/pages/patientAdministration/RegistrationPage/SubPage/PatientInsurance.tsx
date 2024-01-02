import React, { useState } from "react";
import { Modal, Button, Form, Col } from "react-bootstrap";
import { InsuranceFormState } from "../../../../interfaces/PatientAdministration/InsuranceDetails";

// Define props for the PatientInsuranceModal component
interface PatientInsuranceModalProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (insuranceData: InsuranceFormState) => void;
}

const PatientInsurancePopup: React.FC<PatientInsuranceModalProps> = ({
  show,
  handleClose,
  handleSave,
}) => {
  // State for the insurance form
  const [insuranceForm, setInsuranceForm] = useState<InsuranceFormState>({
    insurance: "",
    policyHolder: "",
    policyNumber: "",
    groupNumber: "",
    policyStartDate: "",
    policyEndDate: "",
    guarantor: "",
    relation: "",
    coveredFor: "",
    address1: "",
    address2: "",
  });

  // Function to handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInsuranceForm({ ...insuranceForm, [name]: value });
  };

  // Function to handle form submission
  const handleSubmit = () => {
    handleSave(insuranceForm);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>Patient Insurance</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Example form field */}
          <Form.Group as={Col} controlId="formGridInsurance">
            <Form.Label>Insurance</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter insurance"
              name="insurance"
              value={insuranceForm.insurance}
              onChange={handleChange}
            />
          </Form.Group>
          {/* Add other form fields here */}
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

export default PatientInsurancePopup;
