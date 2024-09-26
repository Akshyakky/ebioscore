import React, { useCallback } from "react";
import FormField from "../../../../components/FormField/FormField";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import useDayjs from "../../../../hooks/Common/useDateTime";
import FormSectionWrapper from "../../../../components/FormField/FormSectionWrapper";

interface MembershipSchemeProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
}

const MembershipScheme: React.FC<MembershipSchemeProps> = ({
  formData,
  setFormData,
}) => {
  const { handleDropdownChange } = useDropdownChange<PatientRegistrationDto>(setFormData);
  const { membershipSchemeValues } = useDropdownValues();
  const { format, formatDateYMD } = useDayjs();

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      patRegisters: {
        ...prevFormData.patRegisters,
        patMemSchemeExpiryDate: newDate,
      },
    }));
  }, [setFormData]);

  return (

    <FormSectionWrapper title="Membership Scheme" spacing={1}>
      <FormField
        type="select"
        label="Membership Scheme"
        name="MembershipScheme"
        ControlID="MembershipScheme"
        value={formData.patRegisters.patMemID === 0 ? "" : String(formData.patRegisters.patMemID)}
        options={membershipSchemeValues}
        onChange={handleDropdownChange(
          ["patRegisters", "patMemID"],
          ["patRegisters", "patMemName"],
          membershipSchemeValues
        )}
        gridProps={{ xs: 12, sm: 6, md: 3 }}
      />
      <FormField
        type="date"
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