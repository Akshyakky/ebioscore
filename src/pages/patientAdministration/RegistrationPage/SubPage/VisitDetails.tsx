import React, { useState, useEffect } from "react";
import { Grid, Typography, Box } from "@mui/material";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { DepartmentService } from "../../../../services/CommonServices/DepartmentService";
import { ContactMastService } from "../../../../services/CommonServices/ContactMastService";
import { useLoading } from "../../../../context/LoadingContext";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";

interface VisitDetailsProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  isSubmitted: boolean;
  isEditMode: boolean;
}

const VisitDetails: React.FC<VisitDetailsProps> = ({
  formData,
  setFormData,
  isSubmitted,
  isEditMode = false,
}) => {
  const [departmentValues, setDepartmentValues] = useState<DropdownOption[]>(
    []
  );
  const [attendingPhy, setAttendingPhy] = useState<DropdownOption[]>([]);
  const [primaryIntroducingSource, setprimaryIntroducingSource] = useState<
    DropdownOption[]
  >([]);
  const { handleDropdownChange } =
    useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<PatientRegistrationDto>(setFormData);
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
          endpointDepartment,
          compID
        );
        const departmentOptions = departmentValues.map((item) => ({
          value: item.value,
          label: item.label,
        }));
        setDepartmentValues(departmentOptions);

        const attendingPhy = await ContactMastService.fetchAttendingPhysician(
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
        setLoading(false);
      }
    };

    loadDropdownData();
  }, [token]);

  const visitOptions = [
    { value: "H", label: "Hospital" },
    { value: "P", label: "Physician" },
    { value: "N", label: "None" },
  ];
  const isHospitalVisit = formData.opvisits.visitTypeVal === "H";
  const isPhysicianVisit = formData.opvisits.visitTypeVal === "P";

  // Conditionally render the section based on isEditMode
  if (isEditMode) {
    return null; // Do not render the section in edit mode
  }

  return (
    <section aria-labelledby="visit-details-header">
      <Box>
        <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
          Visit Details
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <RadioGroup
            name="visitDetails"
            label="Visit To"
            options={visitOptions}
            selectedValue={formData.opvisits.visitTypeVal}
            onChange={handleRadioButtonChange(
              ["opvisits", "visitTypeVal"],
              ["opvisits", "visitType"],
              visitOptions
            )}
            inline={true}
          />
        </Grid>
        {isHospitalVisit && (
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              label="Department"
              name="Department"
              value={
                formData.patRegisters.deptID === 0
                  ? ""
                  : String(formData.patRegisters.deptID)
              }
              options={departmentValues}
              onChange={handleDropdownChange(
                ["patRegisters", "deptID"],
                ["patRegisters", "deptName"],
                departmentValues
              )}
              isSubmitted={isSubmitted}
              isMandatory={isHospitalVisit}
              size="small"
            />
          </Grid>
        )}
        {isPhysicianVisit && (
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              name="AttendingPhysician"
              label="Attending Physician"
              value={
                formData.patRegisters.consultantID === 0
                  ? ""
                  : String(formData.patRegisters.consultantID)
              }
              options={attendingPhy}
              onChange={handleDropdownChange(
                ["patRegisters", "consultantID"],
                ["patRegisters", "consultantName"],
                attendingPhy
              )}
              isSubmitted={isSubmitted}
              isMandatory={isPhysicianVisit}
              size="small"
            />
          </Grid>
        )}
        {(isPhysicianVisit || isHospitalVisit) && (
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              name="PrimaryIntroducingSource"
              label="Primary Introducing Source"
              value={
                formData.patRegisters.sourceID === 0
                  ? ""
                  : String(formData.patRegisters.sourceID)
              }
              options={primaryIntroducingSource}
              onChange={handleDropdownChange(
                ["patRegisters", "sourceID"],
                ["patRegisters", "sourceName"],
                primaryIntroducingSource
              )}
              isSubmitted={isSubmitted}
              isMandatory={isPhysicianVisit || isHospitalVisit}
              size="small"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}></Grid>
      </Grid>
    </section>
  );
};

export default VisitDetails;
