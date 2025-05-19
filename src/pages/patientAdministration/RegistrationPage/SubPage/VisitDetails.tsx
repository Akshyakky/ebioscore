import FormField from "@/components/FormField/FormField";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "@/hooks/useDropdownChange";
import useRadioButtonChange from "@/hooks/useRadioButtonChange";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import React, { useMemo } from "react";

interface VisitDetailsProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  isSubmitted: boolean;
  isEditMode: boolean;
}

const VisitDetails: React.FC<VisitDetailsProps> = ({ formData, setFormData, isSubmitted, isEditMode = false }) => {
  const { handleDropdownChange } = useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } = useRadioButtonChange<PatientRegistrationDto>(setFormData);
  const { ...dropdownValues } = useDropdownValues(["department", "attendingPhy", "primaryIntroducingSource"]);

  const visitOptions = useMemo(
    () => [
      { value: "H", label: "Hospital" },
      { value: "P", label: "Physician" },
      { value: "N", label: "None" },
    ],
    []
  );

  const isHospitalVisit = formData.opvisits.visitTypeVal === "H";
  const isPhysicianVisit = formData.opvisits.visitTypeVal === "P";

  if (isEditMode) {
    return null;
  }

  return (
    <FormSectionWrapper title="Visit Details" spacing={1}>
      <FormField
        type="radio"
        label="Visit To"
        name="visitDetails"
        ControlID="visitDetails"
        value={formData.opvisits.visitTypeVal}
        options={visitOptions}
        onChange={handleRadioButtonChange(["opvisits", "visitTypeVal"], ["opvisits", "visitType"], visitOptions)}
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
          options={dropdownValues.department || []}
          onChange={handleDropdownChange(["patRegisters", "deptID"], ["patRegisters", "deptName"], dropdownValues.department || [])}
          isSubmitted={isSubmitted}
          isMandatory={isHospitalVisit}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
      )}
      {isPhysicianVisit && (
        <FormField
          type="select"
          label="Attending Physician"
          name="attendingPhysicianId"
          ControlID="AttendingPhysician"
          value={formData.patRegisters.attendingPhysicianId === 0 ? null : formData.patRegisters.attendingPhysicianId}
          options={dropdownValues.attendingPhy || []}
          onChange={handleDropdownChange(["patRegisters", "attendingPhysicianId"], ["patRegisters", "attendingPhysicianName"], dropdownValues.attendingPhy || [])}
          isSubmitted={isSubmitted}
          isMandatory={isPhysicianVisit}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
      )}
      {(isPhysicianVisit || isHospitalVisit) && (
        <FormField
          type="select"
          label="Primary Introducing Source"
          name="primaryReferralSourceId"
          ControlID="PrimaryIntroducingSource"
          value={formData.patRegisters.primaryReferralSourceId === 0 ? "" : String(formData.patRegisters.primaryReferralSourceId)}
          options={dropdownValues.primaryIntroducingSource || []}
          onChange={handleDropdownChange(["patRegisters", "primaryReferralSourceId"], ["patRegisters", "primaryReferralSourceName"], dropdownValues.primaryIntroducingSource || [])}
          isSubmitted={isSubmitted}
          isMandatory={isPhysicianVisit || isHospitalVisit}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
        />
      )}
    </FormSectionWrapper>
  );
};

export default React.memo(VisitDetails);
