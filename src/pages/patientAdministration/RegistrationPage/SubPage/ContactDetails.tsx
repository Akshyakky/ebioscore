import React, { useState, useCallback } from "react";
import { Grid } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import ZodFormField from "@/components/ZodFormField/ZodFormField";

const ContactDetails: React.FC = () => {
  // Access form context
  const { control, formState, setValue } = useFormContext<PatientRegistrationDto>();
  const { errors } = formState;

  // Dropdown values
  const { refreshDropdownValues, ...dropdownValues } = useDropdownValues(["area", "city", "country", "company"]);

  // State for modified field dialog
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

  // Options for radio selections
  const smsOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];

  const emailOptions = [
    { value: "Y", label: "Yes" },
    { value: "N", label: "No" },
  ];

  // Handlers
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
    <FormSectionWrapper title="Contact Details" spacing={1}>
      <Grid container spacing={2}>
        <ZodFormField name="patAddress.pAddStreet" control={control} type="text" label="Address" errors={errors} />

        <ZodFormField
          name="patAddress.patAreaVal"
          control={control}
          type="select"
          label="Area"
          options={dropdownValues.area || []}
          errors={errors}
          showAddButton={true}
          onAddClick={() => handleAddField("AREA")}
          onChange={(val) => {
            const selectedOption = dropdownValues.area?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patAddress.patArea", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField
          name="patAddress.pAddCityVal"
          control={control}
          type="select"
          label="City"
          options={dropdownValues.city || []}
          errors={errors}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
          showAddButton={true}
          onAddClick={() => handleAddField("CITY")}
          onChange={(val) => {
            const selectedOption = dropdownValues.city?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patAddress.pAddCity", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField
          name="patAddress.pAddActualCountryVal"
          control={control}
          type="select"
          label="Country"
          options={dropdownValues.country || []}
          errors={errors}
          showAddButton={true}
          onAddClick={() => handleAddField("COUNTRY")}
          onChange={(val) => {
            const selectedOption = dropdownValues.country?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patAddress.pAddActualCountry", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField name="patAddress.pAddPostcode" control={control} type="text" label="Post Code" errors={errors} />

        <ZodFormField name="patAddress.pAddEmail" control={control} type="email" label="Email" errors={errors} />

        <ZodFormField
          name="patRegisters.patCompNameVal"
          control={control}
          type="select"
          label="Company"
          options={dropdownValues.company || []}
          errors={errors}
          showAddButton={true}
          onAddClick={() => handleAddField("COMPANY")}
          onChange={(val) => {
            const selectedOption = dropdownValues.company?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patRegisters.patCompName", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField
          name="patAddress.pAddSMSVal"
          control={control}
          type="radio"
          label="Receive SMS"
          options={smsOptions}
          inline={true}
          errors={errors}
          gridProps={{ xs: 12, md: 1.5 }}
          onChange={(val) => {
            const selectedOption = smsOptions.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patAddress.pAddSMS", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField
          name="patAddress.pAddMailVal"
          control={control}
          type="radio"
          label="Receive Email"
          options={emailOptions}
          inline={true}
          errors={errors}
          gridProps={{ xs: 12, md: 1.5 }}
          onChange={(val) => {
            const selectedOption = emailOptions.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patAddress.pAddMail", selectedOption.label, { shouldValidate: true });
            }
          }}
        />
      </Grid>

      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleFieldDialogClose}
        selectedCategoryCode={dialogCategory}
        isFieldCodeDisabled={true}
        onFieldAddedOrUpdated={onFieldAddedOrUpdated}
      />
    </FormSectionWrapper>
  );
};

export default React.memo(ContactDetails);
