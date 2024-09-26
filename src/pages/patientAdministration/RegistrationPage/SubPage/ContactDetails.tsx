import React, { useMemo, useCallback } from "react";
import FormField from "../../../../components/FormField/FormField";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import FormSectionWrapper from "../../../../components/FormField/FormSectionWrapper";

interface ContactDetailsProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  isSubmitted: boolean;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({
  formData,
  setFormData,
  isSubmitted,
}) => {
  const { handleDropdownChange } = useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } = useRadioButtonChange<PatientRegistrationDto>(setFormData);
  const { areaValues, cityValues, countryValues, companyValues } = useDropdownValues();

  const smsOptions = useMemo(() => [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ], []);

  const emailOptions = useMemo(() => [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ], []);

  const handleTextChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      patAddress: {
        ...prevFormData.patAddress,
        [field]: e.target.value,
      },
    }));
  }, [setFormData]);

  return (
    <FormSectionWrapper title="Contact Details" spacing={1}>
      <FormField
        type="text"
        label="Address"
        name="pAddStreet"
        ControlID="Address"
        value={formData.patAddress.pAddStreet || ""}
        onChange={handleTextChange("pAddStreet")}
        isSubmitted={isSubmitted}
      />
      <FormField
        type="select"
        label="Area"
        name="patAreaVal"
        ControlID="Area"
        value={formData.patAddress.patAreaVal || ""}
        options={areaValues}
        onChange={handleDropdownChange(
          ["patAddress", "patAreaVal"],
          ["patAddress", "patArea"],
          areaValues
        )}
        isSubmitted={isSubmitted}
      />
      <FormField
        type="select"
        label="City"
        name="pAddCityVal"
        ControlID="City"
        value={formData.patAddress.pAddCityVal || ""}
        options={cityValues}
        onChange={handleDropdownChange(
          ["patAddress", "pAddCityVal"],
          ["patAddress", "pAddCity"],
          cityValues
        )}
        isSubmitted={isSubmitted}
      />
      <FormField
        type="select"
        label="Country"
        name="pAddActualCountryVal"
        ControlID="Country"
        value={formData.patAddress.pAddActualCountryVal || ""}
        options={countryValues}
        onChange={handleDropdownChange(
          ["patAddress", "pAddActualCountryVal"],
          ["patAddress", "pAddActualCountry"],
          countryValues
        )}
        isSubmitted={isSubmitted}
      />
      <FormField
        type="text"
        label="Post Code"
        name="pAddPostcode"
        ControlID="PostCode"
        value={formData.patAddress.pAddPostcode || ""}
        onChange={handleTextChange("pAddPostcode")}
        isSubmitted={isSubmitted}
      />
      <FormField
        type="email"
        label="Email"
        name="pAddEmail"
        ControlID="Email"
        value={formData.patAddress.pAddEmail || ""}
        onChange={handleTextChange("pAddEmail")}
        isSubmitted={isSubmitted}
      />
      <FormField
        type="select"
        label="Company"
        name="patCompNameVal"
        ControlID="Company"
        value={formData.patRegisters.patCompNameVal || ""}
        options={companyValues}
        onChange={handleDropdownChange(
          ["patRegisters", "patCompNameVal"],
          ["patRegisters", "patCompName"],
          companyValues
        )}
        isSubmitted={isSubmitted}
      />
      <FormField
        type="radio"
        label="Receive SMS"
        name="pAddSMSVal"
        ControlID="receiveSMS"
        value={formData.patAddress.pAddSMSVal || ""}
        options={smsOptions}
        onChange={handleRadioButtonChange(
          ["patAddress", "pAddSMSVal"],
          ["patAddress", "pAddSMS"],
          smsOptions
        )}
        inline={true}
        isSubmitted={isSubmitted}
        gridProps={{ xs: 12, md: 1.5 }}
      />
      <FormField
        type="radio"
        label="Receive Email"
        name="pAddMailVal"
        ControlID="receiveEmail"
        value={formData.patAddress.pAddMailVal || ""}
        options={emailOptions}
        onChange={handleRadioButtonChange(
          ["patAddress", "pAddMailVal"],
          ["patAddress", "pAddMail"],
          emailOptions
        )}
        inline={true}
        isSubmitted={isSubmitted}
        gridProps={{ xs: 12, md: 1.5 }}
      />
    </FormSectionWrapper>
  );
};

export default React.memo(ContactDetails);