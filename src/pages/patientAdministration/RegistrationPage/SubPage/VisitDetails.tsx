import React, { useMemo } from "react";
import { Grid, Typography, Box } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";

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
  const { handleDropdownChange } = useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } = useRadioButtonChange<PatientRegistrationDto>(setFormData);
  const { departmentValues, attendingPhyValues, primaryIntroducingSourceValues } = useDropdownValues();

  const visitOptions = useMemo(() => [
    { value: "H", label: "Hospital" },
    { value: "P", label: "Physician" },
    { value: "N", label: "None" },
  ], []);

  const isHospitalVisit = formData.opvisits.visitTypeVal === "H";
  const isPhysicianVisit = formData.opvisits.visitTypeVal === "P";

  if (isEditMode) {
    return null;
  }

  return (
    <section aria-labelledby="visit-details-header">
      <Box>
        <Typography variant="h6" sx={{ borderBottom: "1px solid #000", marginBottom: 2 }}>
          Visit Details
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <FormField
          type="radio"
          label="Visit To"
          name="visitDetails"
          ControlID="visitDetails"
          value={formData.opvisits.visitTypeVal}
          options={visitOptions}
          onChange={handleRadioButtonChange(
            ["opvisits", "visitTypeVal"],
            ["opvisits", "visitType"],
            visitOptions
          )}
          inline={true}
          isSubmitted={isSubmitted}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
        {isHospitalVisit && (
          <FormField
            type="select"
            label="Department"
            name="Department"
            ControlID="Department"
            value={formData.patRegisters.deptID === 0 ? "" : String(formData.patRegisters.deptID)}
            options={departmentValues}
            onChange={handleDropdownChange(
              ["patRegisters", "deptID"],
              ["patRegisters", "deptName"],
              departmentValues
            )}
            isSubmitted={isSubmitted}
            isMandatory={isHospitalVisit}
            gridProps={{ xs: 12, sm: 6, md: 3 }}
          />
        )}
        {isPhysicianVisit && (
          <FormField
            type="select"
            label="Attending Physician"
            name="AttendingPhysician"
            ControlID="AttendingPhysician"
            value={formData.patRegisters.consultantID === 0 ? "" : String(formData.patRegisters.consultantID)}
            options={attendingPhyValues}
            onChange={handleDropdownChange(
              ["patRegisters", "consultantID"],
              ["patRegisters", "consultantName"],
              attendingPhyValues
            )}
            isSubmitted={isSubmitted}
            isMandatory={isPhysicianVisit}
            gridProps={{ xs: 12, sm: 6, md: 3 }}
          />
        )}
        {(isPhysicianVisit || isHospitalVisit) && (
          <FormField
            type="select"
            label="Primary Introducing Source"
            name="PrimaryIntroducingSource"
            ControlID="PrimaryIntroducingSource"
            value={formData.patRegisters.sourceID === 0 ? "" : String(formData.patRegisters.sourceID)}
            options={primaryIntroducingSourceValues}
            onChange={handleDropdownChange(
              ["patRegisters", "sourceID"],
              ["patRegisters", "sourceName"],
              primaryIntroducingSourceValues
            )}
            isSubmitted={isSubmitted}
            isMandatory={isPhysicianVisit || isHospitalVisit}
            gridProps={{ xs: 12, sm: 6, md: 3 }}
          />
        )}
      </Grid>
    </section>
  );
};

export default React.memo(VisitDetails);