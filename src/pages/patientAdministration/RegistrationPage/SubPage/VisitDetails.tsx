import { Row, Col } from "react-bootstrap";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import { RegsitrationFormData } from "../../../../interfaces/PatientAdministration/registrationFormData";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { DepartmentService } from "../../../../services/CommonService/DepartmentService";
import { ContactMastService } from "../../../../services/CommonService/ContactMastService";
import { useLoading } from "../../../../context/LoadingContext";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

interface VisitDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  isSubmitted: boolean;
}
interface DropdownOption {
  value: string;
  label: string;
}
const VisitDetails: React.FC<VisitDetailsProps> = ({
  formData,
  setFormData,
  isSubmitted,
}) => {
  const [departmentValues, setDepartmentValues] = useState<DropdownOption[]>(
    []
  );
  const [attendingPhy, setAttendingPhy] = useState<DropdownOption[]>([]);
  const [primaryIntroducingSource, setprimaryIntroducingSource] = useState<
    DropdownOption[]
  >([]);
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const compID = userInfo.compID!;
  const { setLoading } = useLoading();
  const endpointDepartment = "GetActiveRegistrationDepartments";
  const endpointAttendingPhy = "GetActiveConsultants";
  const endpointPrimaryIntroducingSource = "GetActiveReferralContacts";
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoading(true);
        const departmentValues = await DepartmentService.fetchDepartments(
          token,
          endpointDepartment,
          compID
        );
        const departmentOptions = departmentValues.map((item) => ({
          value: item.value,
          label: item.label,
        }));
        setDepartmentValues(departmentOptions);

        const attendingPhy = await ContactMastService.fetchAttendingPhysician(
          token,
          endpointAttendingPhy,
          compID
        );
        const attendingPhyOptions: DropdownOption[] = attendingPhy.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setAttendingPhy(attendingPhyOptions);
        const primaryIntroducingSource =
          await ContactMastService.fetchRefferalPhy(
            token,
            endpointPrimaryIntroducingSource,
            compID
          );
        const primaryIntroducingSourceOption: DropdownOption[] =
          primaryIntroducingSource.map((item) => ({
            value: item.value,
            label: item.label,
          }));
        setprimaryIntroducingSource(primaryIntroducingSourceOption);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    loadDropdownData();
  }, [token]);

  const visitOptions = [
    { value: "H", label: "Hospital" },
    { value: "P", label: "Physician" },
    { value: "N", label: "None" },
  ];
  const handleDropdownChange =
    (
      valuePath: (string | number)[],
      textPath: (string | number)[],
      options: DropdownOption[]
    ) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      const selectedOption = options.find(
        (option) => option.value === selectedValue
      );

      setFormData((prevFormData) => {
        // Recursive function to update the state
        function updateState(
          obj: any,
          path: (string | number)[],
          newValue: any
        ): any {
          const [first, ...rest] = path;

          if (rest.length === 0) {
            return { ...obj, [first]: newValue };
          } else {
            return { ...obj, [first]: updateState(obj[first], rest, newValue) };
          }
        }

        const newData = updateState(prevFormData, valuePath, selectedValue);
        return updateState(
          newData,
          textPath,
          selectedOption ? selectedOption.label : ""
        );
      });
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
            <Button
              variant="dark border"
              size="sm"
              style={{ marginRight: "8px" }}
            >
              <FontAwesomeIcon icon={faStar} />
            </Button>
            VISIT DETAILS
          </h1>
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <RadioGroup
            name="visitDetails"
            label="Visit To"
            options={visitOptions}
            selectedValue={formData.RNote}
            onChange={handleRadioButtonChange("RNote")}
            inline={true}
          />
        </Col>
        {formData.RNote === "H" && (
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              label="Department"
              name="Department"
              value={String(formData.DeptID)}
              options={departmentValues}
              onChange={handleDropdownChange(
                ["DeptID"],
                ["DeptName"],
                departmentValues
              )}
              isSubmitted={isSubmitted}
              isMandatory={true}
            />
          </Col>
        )}
        {formData.RNote === "P" && (
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              name="AttendingPhysician"
              label="Attending Physician"
              value={String(formData.ConsultantID)}
              options={attendingPhy}
              onChange={handleDropdownChange(
                ["ConsultantID"],
                ["ConsultantName"],
                attendingPhy
              )}
              isSubmitted={isSubmitted}
              isMandatory={true}
            />
          </Col>
        )}
        {(formData.RNote === "P" || formData.RNote === "H") && (
          <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
            <DropdownSelect
              name="PrimaryIntroducingSource"
              label="Primary Introducing Source"
              value={String(formData.SourceID)}
              options={primaryIntroducingSource}
              onChange={handleDropdownChange(
                ["SourceID"],
                ["SourceName"],
                attendingPhy
              )}
              isSubmitted={isSubmitted}
              isMandatory={true}
            />
          </Col>
        )}
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}></Col>
      </Row>
    </section>
  );
};

export default VisitDetails;
