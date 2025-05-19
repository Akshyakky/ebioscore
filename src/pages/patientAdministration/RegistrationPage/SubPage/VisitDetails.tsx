import React from "react";
import { Grid } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import ZodFormField from "@/components/ZodFormField/ZodFormField";

interface VisitDetailsProps {
  isEditMode: boolean;
}

const VisitDetails: React.FC<VisitDetailsProps> = ({ isEditMode = false }) => {
  // Access form context
  const { control, formState, setValue } = useFormContext<PatientRegistrationDto>();
  const { errors } = formState;

  // Watch for visit type to conditionally render fields
  const visitTypeVal = useWatch({ control, name: "opvisits.visitTypeVal" });

  // Load dropdown values
  const { ...dropdownValues } = useDropdownValues(["department", "attendingPhy", "primaryIntroducingSource"]);

  // Visit type options
  const visitOptions = [
    { value: "H", label: "Hospital" },
    { value: "P", label: "Physician" },
    { value: "N", label: "None" },
  ];

  // Determine which fields to show based on visit type
  const isHospitalVisit = visitTypeVal === "H";
  const isPhysicianVisit = visitTypeVal === "P";

  // If in edit mode, don't render the component
  if (isEditMode) {
    return null;
  }

  return (
    <FormSectionWrapper title="Visit Details" spacing={1}>
      <Grid container spacing={2}>
        <ZodFormField
          name="opvisits.visitTypeVal"
          control={control}
          type="radio"
          label="Visit To"
          options={visitOptions}
          inline={true}
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
          onChange={(val) => {
            const selectedOption = visitOptions.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("opvisits.visitType", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        {isHospitalVisit && (
          <ZodFormField
            name="patRegisters.deptID"
            control={control}
            type="select"
            label="Department"
            options={dropdownValues.department || []}
            isMandatory={isHospitalVisit}
            errors={errors}
            gridProps={{ xs: 12, sm: 6, md: 3 }}
            onChange={(val) => {
              const selectedOption = dropdownValues.department?.find((opt) => opt.value === val);
              if (selectedOption) {
                setValue("patRegisters.deptName", selectedOption.label, { shouldValidate: true });
              }
            }}
          />
        )}

        {isPhysicianVisit && (
          <ZodFormField
            name="patRegisters.attendingPhysicianId"
            control={control}
            type="select"
            label="Attending Physician"
            options={dropdownValues.attendingPhy || []}
            isMandatory={isPhysicianVisit}
            errors={errors}
            gridProps={{ xs: 12, sm: 6, md: 3 }}
            onChange={(val) => {
              const selectedOption = dropdownValues.attendingPhy?.find((opt) => opt.value === val);
              if (selectedOption) {
                setValue("patRegisters.attendingPhysicianName", selectedOption.label, { shouldValidate: true });
              }
            }}
          />
        )}

        {(isPhysicianVisit || isHospitalVisit) && (
          <ZodFormField
            name="patRegisters.primaryReferralSourceId"
            control={control}
            type="select"
            label="Primary Introducing Source"
            options={dropdownValues.primaryIntroducingSource || []}
            isMandatory={isPhysicianVisit || isHospitalVisit}
            errors={errors}
            gridProps={{ xs: 12, sm: 6, md: 3 }}
            onChange={(val) => {
              const selectedOption = dropdownValues.primaryIntroducingSource?.find((opt) => opt.value === val);
              if (selectedOption) {
                setValue("patRegisters.primaryReferralSourceName", selectedOption.label, { shouldValidate: true });
              }
            }}
          />
        )}
      </Grid>
    </FormSectionWrapper>
  );
};

export default React.memo(VisitDetails);
