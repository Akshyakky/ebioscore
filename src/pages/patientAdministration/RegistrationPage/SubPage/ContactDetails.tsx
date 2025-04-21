import React, { useMemo, useCallback, useState } from "react";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import useDropdownChange from "@/hooks/useDropdownChange";
import useRadioButtonChange from "@/hooks/useRadioButtonChange";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import useFieldsList from "@/components/FieldsList/UseFieldsList";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import FormField from "@/components/FormField/FormField";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
interface ContactDetailsProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  isSubmitted: boolean;
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ formData, setFormData, isSubmitted }) => {
  const { handleDropdownChange } = useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } = useRadioButtonChange<PatientRegistrationDto>(setFormData);
  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues(["area", "city", "country", "company"]);
  const { fieldsList, defaultFields } = useFieldsList(["area", "city", "country", "company"]);

  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");

  const [, setFormDataDialog] = useState<AppModifyFieldDto>({
    amlID: 0,
    amlName: "",
    amlCode: "",
    amlField: "",
    defaultYN: "N",
    modifyYN: "N",
    rNotes: "",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "Y",
  });

  const smsOptions = useMemo(
    () => [
      { value: "Y", label: "Yes" },
      { value: "N", label: "No" },
    ],
    []
  );

  const emailOptions = useMemo(
    () => [
      { value: "Y", label: "Yes" },
      { value: "N", label: "No" },
    ],
    []
  );

  const handleAddField = (category: string) => {
    setDialogCategory(category);
    setFormDataDialog({
      amlID: 0,
      amlName: "",
      amlCode: "",
      amlField: category,
      defaultYN: "N",
      modifyYN: "N",
      rNotes: "",
      rActiveYN: "Y",
      compID: 0,
      compCode: "",
      compName: "",
      transferYN: "Y",
    });
    setIsFieldDialogOpen(true);
  };

  const handleFieldDialogClose = () => {
    setIsFieldDialogOpen(false);
  };

  const handleTextChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        patAddress: {
          ...prevFormData.patAddress,
          [field]: e.target.value,
        },
      }));
    },
    [setFormData]
  );

  const onFieldAddedOrUpdated = () => {
    if (dialogCategory) {
      const dropdownMap: Record<string, DropdownType> = {
        CITY: "city",
        AREA: "area",
        COUNTRY: "country",
        COMPANY: "company",
      };
      const dropdownType = dropdownMap[dialogCategory];
      if (dropdownType) {
        refreshDropdownValues(dropdownType);
      }
    }
  };

  return (
    <>
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
          value={formData.patAddress.patAreaVal || dropdownValues.area || ""}
          options={dropdownValues.area}
          onChange={handleDropdownChange(["patAddress", "patAreaVal"], ["patAddress", "patArea"], dropdownValues.area || [])}
          isSubmitted={isSubmitted}
          showAddButton={true}
          onAddClick={() => handleAddField("AREA")}
        />

        <FormField
          type="select"
          label="City "
          name="City"
          ControlID="City"
          value={formData.patAddress.pAddCityVal || dropdownValues.city || ""}
          options={dropdownValues.city}
          onChange={handleDropdownChange(["patAddress", "pAddCityVal"], ["patAddress", "pAddCity"], dropdownValues.city || [])}
          isSubmitted={isSubmitted}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
          onAddClick={() => handleAddField("CITY")}
          showAddButton={true}
        />

        <FormField
          type="select"
          label="Country"
          name="pAddActualCountryVal"
          ControlID="Country"
          value={formData.patAddress.pAddActualCountryVal || dropdownValues.country || ""}
          options={dropdownValues.country}
          onChange={handleDropdownChange(["patAddress", "pAddActualCountryVal"], ["patAddress", "pAddActualCountry"], dropdownValues.country || [])}
          isSubmitted={isSubmitted}
          showAddButton={true}
          onAddClick={() => handleAddField("COUNTRY")}
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
          value={formData.patRegisters.patCompNameVal || dropdownValues.company || ""}
          options={dropdownValues.company}
          onChange={handleDropdownChange(["patRegisters", "patCompNameVal"], ["patRegisters", "patCompName"], dropdownValues.company)}
          isSubmitted={isSubmitted}
          showAddButton={true}
          onAddClick={() => handleAddField("COMPANY")}
        />

        <FormField
          type="radio"
          label="Receive SMS"
          name="pAddSMSVal"
          ControlID="receiveSMS"
          value={formData.patAddress.pAddSMSVal || ""}
          options={smsOptions}
          onChange={handleRadioButtonChange(["patAddress", "pAddSMSVal"], ["patAddress", "pAddSMS"], smsOptions)}
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
          onChange={handleRadioButtonChange(["patAddress", "pAddMailVal"], ["patAddress", "pAddMail"], emailOptions)}
          inline={true}
          isSubmitted={isSubmitted}
          gridProps={{ xs: 12, md: 1.5 }}
        />
      </FormSectionWrapper>

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleFieldDialogClose}
        selectedCategoryCode={dialogCategory}
        isFieldCodeDisabled={true}
        onFieldAddedOrUpdated={onFieldAddedOrUpdated}
      />
    </>
  );
};

export default React.memo(ContactDetails);
