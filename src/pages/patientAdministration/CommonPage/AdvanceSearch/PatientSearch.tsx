import { useCallback, useContext, useEffect, useState } from "react";
import { Modal, Form, Row, Col } from "react-bootstrap";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import { debounce } from "../../../../utils/Common/debounceUtils";

interface PatientSearchProps {
  show: boolean;
  handleClose: () => void;
}
const PatientSearch = ({ show, handleClose }: PatientSearchProps) => {
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

  const columns = [
    {
      key: "pChartID",
      header: "Edit",
      visible: true,
    },
    { key: "pChartCode", header: "UHID", visible: true },
    { key: "pfName", header: "Patient Name", visible: true },
    { key: "pRegDate", header: "Registration Date", visible: true },
    { key: "gender", header: "Gender", visible: true },
    { key: "pAddPhone1", header: "Mobile No", visible: true },
    { key: "pDob", header: "DOB", visible: true },
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
