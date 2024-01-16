import { useCallback, useContext, useEffect, useState } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import { debounce } from "../../../../utils/Common/debounceUtils";
import { PatientSearchResult } from "../../../../interfaces/PatientAdministration/registrationFormData";

interface PatientSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditPatient: (patientId: string) => void;
}
const PatientSearch = ({
  show,
  handleClose,
  onEditPatient,
}: PatientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { performSearch, searchResults } = useContext(PatientSearchContext);
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, 500),
    []
  );
  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);
  const handleEditAndClose = (patientId: string) => {
    onEditPatient(patientId);
    handleClose();
  };
  const columns = [
    {
      key: "PatientEdit",
      header: "Edit",
      visible: true,
      render: (row: PatientSearchResult) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row.pChartID.toString())}
          icon={faPen}
          // Add any additional styling or properties needed
        />
      ),
    },
    { key: "pChartCode", header: "UHID", visible: true },
    {
      key: "patientName",
      header: "Patient Name",
      visible: true,
      render: (row: PatientSearchResult) =>
        `${row.pTitle} ${row.pfName} ${row.plName}`,
    },
    {
      key: "RegDate",
      header: "Registration Date",
      visible: true,
      render: (row: PatientSearchResult) => `${row.pRegDate.split("T")[0]} `,
    },
    { key: "pGender", header: "Gender", visible: true },
    {
      key: "MobileNo ",
      header: "Mobile No",
      visible: true,
      render: (row: any) => `${row.pAddPhone1}`,
    },
    {
      key: "Dob",
      header: "DOB",
      visible: true,
      render: (row: PatientSearchResult) => `${row.pDob.split("T")[0]} `,
    },
    { key: "pssnID", header: "Identity No", visible: true },
    { key: "pTypeName", header: "Payment Source", visible: true },
  ];

  return (
    <Modal
      show={show}
      className="custom-large-modal"
      onHide={handleClose}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Patient Search</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="pb-2">
            <Col md={3} lg={3} sm={12} xs={12} xl={3} xxl={3}>
              <Form.Control
                type="text"
                placeholder="Search through the result"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>
        </Form>
        <CustomGrid columns={columns} data={searchResults} maxHeight="600px" />
      </Modal.Body>
      <Modal.Footer>
        <CustomButton
          variant="secondary"
          text="Close"
          icon={faTimes}
          size="sm"
          onClick={handleClose}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default PatientSearch;
