import FormField from "@/components/FormField/FormField";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "@/hooks/useDropdownChange";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import React, { useCallback } from "react";

interface MembershipSchemeProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
}

const MembershipScheme: React.FC<MembershipSchemeProps> = ({ formData, setFormData }) => {
  const { handleDropdownChange } = useDropdownChange<PatientRegistrationDto>(setFormData);
  const { ...dropdownValues } = useDropdownValues(["membershipScheme"]);
  const serverDate = useServerDate();

  const handleDateChange = useCallback(
    (date: Date | null) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        patRegisters: {
          ...prevFormData.patRegisters,
          patMemSchemeExpiryDate: date ? date : serverDate,
        },
      }));
    },
    [setFormData]
  );

  return (
    <FormSectionWrapper title="Membership Scheme" spacing={1}>
      <FormField
        type="select"
        label="Membership Scheme"
        name="MembershipScheme"
        ControlID="MembershipScheme"
        value={formData.patRegisters.patMemID === 0 ? "" : String(formData.patRegisters.patMemID)}
        options={dropdownValues.membershipScheme || []}
        onChange={handleDropdownChange(["patRegisters", "patMemID"], ["patRegisters", "patMemName"], dropdownValues.membershipScheme || [])}
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />
      <FormField
        type="datepicker"
        label="Membership Expiry Date"
        name="MembeshipExpDate"
        ControlID="MembeshipExpDate"
        value={formData.patRegisters.patMemSchemeExpiryDate}
        onChange={handleDateChange}
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />
    </FormSectionWrapper>
  );
};

export default React.memo(MembershipScheme);
