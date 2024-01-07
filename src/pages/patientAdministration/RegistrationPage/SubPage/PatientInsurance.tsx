import React, { useEffect, useState } from "react";
import { Modal, Button, Col, Row } from "react-bootstrap";
import { InsuranceFormState } from "../../../../interfaces/PatientAdministration/InsuranceDetails";
import TextBox from "../../../../components/TextBox/TextBox ";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { InsuranceCarrierService } from "../../../../services/CommonService/InsuranceCarrierService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { AppModifyListService } from "../../../../services/CommonService/AppModifyListService";
import { ConstantValues } from "../../../../services/CommonService/ConstantValuesService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

interface PatientInsuranceModalProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (insuranceData: InsuranceFormState) => void;
  editData?: InsuranceFormState | null;
}

const PatientInsurancePopup: React.FC<PatientInsuranceModalProps> = ({
  show,
  handleClose,
  handleSave,
  editData,
}) => {
  // State for the insurance form
  const [insuranceForm, setInsuranceForm] = useState<InsuranceFormState>({
    OPIPInsID: 0,
    InsurID: 0,
    InsurName: "",
    PolicyHolder: "",
    PolicyNumber: "",
    GroupNumber: "",
    PolicyStartDate: "",
    PolicyEndDate: "",
    Guarantor: "",
    RelationValue: "",
    Relation: "",
    CoveredID: 0,
    CoveredFor: "",
    Address1: "",
    Address2: "",
    Phone1: "",
    Phone2: "",
    Remarks: "",
  });
  const [insuranceOptions, setInsuranceOptions] = useState<DropdownOption[]>(
    []
  );
  const [relationValues, setRelationValues] = useState<DropdownOption[]>([]);
  const [coverForValues, setCoverForValues] = useState<DropdownOption[]>([]);
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;

  const { handleDropdownChange } =
    useDropdownChange<InsuranceFormState>(setInsuranceForm);

  useEffect(() => {
    if (editData) {
      setInsuranceForm(editData);
    }
  }, [editData]);
  // Function to handle form submission
  const handleSubmit = () => {
    handleSave(insuranceForm);
    handleClose();
  };
  const endpoint = "GetAllActiveForDropDown";
  const endPointAppModifyList = "GetActiveAppModifyFieldsAsync";
  const endpointConstantValues = "GetConstantValues";
  useEffect(() => {
    const loadDropdownData = async () => {
      const InsuranceCarrier =
        await InsuranceCarrierService.fetchInsuranceOptions(token, endpoint);
      const InsuranceCarrierOptions: DropdownOption[] = InsuranceCarrier.map(
        (item) => ({
          value: item.value,
          label: item.label,
        })
      );
      setInsuranceOptions(InsuranceCarrierOptions);
      const responseRelation = await AppModifyListService.fetchAppModifyList(
        token,
        endPointAppModifyList,
        "RELATION"
      );
      const transformedRelationData: DropdownOption[] = responseRelation.map(
        (item) => ({
          value: item.value,
          label: item.label,
        })
      );
      setRelationValues(transformedRelationData);
      const responseCoverFor = await ConstantValues.fetchConstantValues(
        token,
        endpointConstantValues,
        "COVR"
      );
      const transformedCoverForData: DropdownOption[] = responseCoverFor.map(
        (item) => ({
          value: item.value,
          label: item.label,
        })
      );
      setCoverForValues(transformedCoverForData);
    };
    loadDropdownData();
  }, [token]);
  return (
    <Modal
      className="custom-large-modal"
      show={show}
      onHide={handleClose}
      scrollable={true}
    >
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>Patient Insurance</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              label="Insurance"
              name="Insurance"
              value={String(insuranceForm.InsurID)}
              options={insuranceOptions}
              onChange={handleDropdownChange(
                ["InsurID"],
                ["InsurName"],
                insuranceOptions
              )}
              isMandatory={true}
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="PolicyHolder"
              title="Policy Holder"
              type="text"
              size="sm"
              placeholder="Policy Holder"
              value={insuranceForm.PolicyHolder}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  PolicyHolder: e.target.value,
                })
              }
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="PolicyNumber"
              title="Policy Number"
              type="text"
              size="sm"
              placeholder="Policy Number"
              value={insuranceForm.PolicyNumber}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  PolicyNumber: e.target.value,
                })
              }
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="GroupNumber"
              title="Group Number"
              type="text"
              size="sm"
              placeholder="Group Number"
              value={insuranceForm.GroupNumber}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  GroupNumber: e.target.value,
                })
              }
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="PolicyStartDate"
              title="Policy Start Date"
              type="date"
              size="sm"
              placeholder="Policy Start Date"
              value={insuranceForm.PolicyStartDate}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  PolicyStartDate: e.target.value,
                })
              }
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="PolicyEndDate"
              title="Policy End Date"
              type="date"
              size="sm"
              placeholder="Policy End Date"
              value={insuranceForm.PolicyEndDate}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  PolicyEndDate: e.target.value,
                })
              }
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="Guarantor"
              title="Guarantor"
              type="text"
              size="sm"
              placeholder="Guarantor"
              value={insuranceForm.Guarantor}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Guarantor: e.target.value,
                })
              }
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              label="Relationship"
              name="Relationship"
              value={insuranceForm.RelationValue}
              options={relationValues}
              onChange={handleDropdownChange(
                ["RelationValue"],
                ["Relation"],
                relationValues
              )}
              size="sm"
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              label="CoveredFor"
              name="Covered For"
              value={String(insuranceForm.CoveredID)}
              options={coverForValues}
              onChange={handleDropdownChange(
                ["CoveredID"],
                ["CoveredFor"],
                coverForValues
              )}
              size="sm"
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="Address1"
              title="Address 1"
              type="text"
              size="sm"
              placeholder="Address 1"
              value={insuranceForm.Address1}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Address1: e.target.value,
                })
              }
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="Address2"
              title="Address 2"
              type="text"
              size="sm"
              placeholder="Address 2"
              value={insuranceForm.Address2}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Address2: e.target.value,
                })
              }
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="Phone1"
              title="Phone 1"
              type="text"
              size="sm"
              placeholder="Phone 1"
              value={insuranceForm.Phone1}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Phone1: e.target.value,
                })
              }
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="Phone2"
              title="Phone 2"
              type="text"
              size="sm"
              placeholder="Phone 2"
              value={insuranceForm.Phone2}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Phone2: e.target.value,
                })
              }
            />
          </Col>
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <TextBox
              ControlID="Remarks"
              title="Remarks"
              type="text"
              size="sm"
              placeholder="Remarks"
              value={insuranceForm.Remarks}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Remarks: e.target.value,
                })
              }
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={handleClose}>
          <FontAwesomeIcon icon={faTimes} /> Close
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          <FontAwesomeIcon icon={faSave} /> Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PatientInsurancePopup;
