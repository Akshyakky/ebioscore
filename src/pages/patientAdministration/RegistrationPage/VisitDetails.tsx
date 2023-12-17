import { Row, Col } from "react-bootstrap";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../components/RadioGroup/RadioGroup";
import { RegsitrationFormData } from "../../../types/registrationFormData";

interface VisitDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  handleDropdownChange: (
    name: keyof RegsitrationFormData,
    options: { value: string; label: string }[]
  ) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
const VisitDetails: React.FC<VisitDetailsProps> = ({
  formData,
  setFormData,
}) => {
  const departmentValues = [
    { value: "1", label: "Department 1" },
    { value: "2", label: "Department 2" },
    { value: "3", label: "Department 3" },
  ];
  const attendingPhy = [
    { value: "1", label: "Physician 1" },
    { value: "2", label: "Physician 2" },
    { value: "3", label: "Physician 3" },
  ];
  const primaryIntroducingSource = [
    { value: "1", label: "Primary Introducing Source 1" },
    { value: "2", label: "Primary Introducing Source 2" },
    { value: "3", label: "Primary Introducing Source 3" },
  ];

  const visitOptions = [
    { value: "H", label: "Hospital" },
    { value: "P", label: "Physician" },
    { value: "N", label: "None" },
  ];
  const handleDropdownChange =
    (
      name: keyof RegsitrationFormData,
      options: { value: string; label: string }[]
    ) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      // Find the option that matches the event target value
      const selectedOption = options.find(
        (option) => option.value === e.target.value
      );

      if (selectedOption) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: {
            value: selectedOption.value,
            label: selectedOption.label,
          },
        }));
      }
    };
  const handleRadioButtonChange =
    (name: keyof RegsitrationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: e.target.value,
      }));
    };
  return (
    <section aria-labelledby="visit-details-header">
      <Row>
        <Col>
          <h1 id="visit-details-header" className="section-header">
            Visit Details
          </h1>
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <RadioGroup
            name="visitDetails"
            label="Visit To"
            options={visitOptions}
            selectedValue={formData.visitType}
            onChange={handleRadioButtonChange("visitType")}
            inline={true}
          />
        </Col>
        {formData.visitType === "H" && (
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              label="Department"
              name="Department"
              value={formData.department.value}
              options={departmentValues}
              onChange={handleDropdownChange("department", departmentValues)}
              size="sm"
            />
          </Col>
        )}
        {formData.visitType === "P" && (
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              name="AttendingPhysician"
              label="Attending Physician"
              value={formData.attendingPhy.value}
              options={attendingPhy}
              onChange={handleDropdownChange("attendingPhy", attendingPhy)}
              size="sm"
            />
          </Col>
        )}
        {(formData.visitType === "P" || formData.visitType === "H") && (
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              name="PrimaryIntroducingSource"
              label="Primary Introducing Source"
              value={formData.primaryIntroducingSource.value}
              options={primaryIntroducingSource}
              onChange={handleDropdownChange(
                "primaryIntroducingSource",
                primaryIntroducingSource
              )}
              size="sm"
            />
          </Col>
        )}
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}></Col>
      </Row>
    </section>
  );
};

export default VisitDetails;
