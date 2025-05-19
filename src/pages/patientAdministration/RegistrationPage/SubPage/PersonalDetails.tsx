import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { Grid } from "@mui/material";
import { Path, useFormContext, useWatch } from "react-hook-form";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import useRegistrationUtils from "@/utils/PatientAdministration/RegistrationUtils";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDayjs from "@/hooks/Common/useDateTime";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import { notifyWarning } from "@/utils/Common/toastManager";
import ZodFormField from "@/components/ZodFormField/ZodFormField";

interface PersonalDetailsProps {
  isEditMode?: boolean;
  onPatientSelect: (selectedSuggestion: string) => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ isEditMode = false, onPatientSelect }) => {
  // Access form context provided by the parent form
  const { control, formState, setValue, getValues, trigger } = useFormContext<PatientRegistrationDto>();
  const { errors } = formState;

  // Watch for changes in specific fields
  const titleValue = useWatch({ control, name: "patRegisters.pTitleVal" });
  const dobOrAgeVal = useWatch({ control, name: "patRegisters.pDobOrAgeVal" });
  const pChartCode = useWatch({ control, name: "patRegisters.pChartCode" });

  // Hooks and utilities
  const { refreshDropdownValues, isLoading, hasError, ...dropdownValues } = useDropdownValues(["pic", "title", "gender", "ageUnit", "nationality"]);
  const { fetchLatestUHID } = useRegistrationUtils();
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const uhidRef = useRef<HTMLInputElement>(null);
  const serverDate = useServerDate();
  const { diff, formatDateYMD } = useDayjs();
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");

  // Title to gender mapping logic
  const handleTitleChange = useCallback(
    (selectedTitleValue: string) => {
      const selectedTitleOption = dropdownValues.title?.find((t) => t.value === selectedTitleValue);
      const selectedTitleLabel = selectedTitleOption?.label?.trim().toUpperCase() || "";

      const titleToGenderMap: { [key: string]: string } = {
        MR: "M",
        MRS: "F",
        MISS: "F",
        MAST: "M",
        BABY: "F",
        "B/O": "M",
        DR: "",
        "M/S": "",
        SRI: "M",
        SMT: "F",
      };

      const genderCode = titleToGenderMap[selectedTitleLabel] || "";
      const genderOption = dropdownValues.gender?.find((g) =>
        genderCode === "M" ? g.label?.toLowerCase() === "male" : genderCode === "F" ? g.label?.toLowerCase() === "female" : false
      );

      if (genderOption) {
        setValue("patRegisters.pGenderVal", genderOption.value, { shouldValidate: true });
        setValue("patRegisters.pGender", genderOption.label, { shouldValidate: true });
      }

      setValue("patRegisters.pTitle", selectedTitleValue, { shouldValidate: true });
    },
    [dropdownValues.title, dropdownValues.gender, setValue]
  );

  // Fetch latest UHID on component mount
  useEffect(() => {
    if (!isEditMode) {
      uhidRef.current?.focus();
      fetchLatestUHID().then((latestUHID) => {
        if (latestUHID) {
          setValue("patRegisters.pChartCode", latestUHID, { shouldValidate: true });
        }
      });
    }
  }, [isEditMode, setValue]);

  // Age/DOB calculation logic
  const calculateAge = useCallback(
    (dob: string | number | Date) => {
      const ageInYears = diff(dob, "year");
      const ageInMonths = diff(dob, "month");
      const ageInDays = diff(dob, "day");

      if (ageInYears === 0) {
        if (ageInMonths === 0) {
          return { age: ageInDays, ageType: "Days", ageUnit: "LBN2" };
        } else {
          return { age: ageInMonths, ageType: "Months", ageUnit: "LBN3" };
        }
      } else {
        return { age: ageInYears, ageType: "Years", ageUnit: "LBN4" };
      }
    },
    [diff]
  );

  // Handle DOB change
  const handleDOBChange = useCallback(
    (newDate: Date | null) => {
      if (newDate) {
        const today = new Date();
        if (newDate > today) {
          notifyWarning("Date of Birth cannot be a future date.");
          return;
        }

        const { age, ageType, ageUnit } = calculateAge(newDate);
        setValue("patRegisters.pDob", newDate, { shouldValidate: true });
        //setValue("patOverview.pAgeDescription", ageType, { shouldValidate: true });
        setValue("patOverview.pAgeDescriptionVal", ageUnit, { shouldValidate: true });
        setValue("patOverview.pAgeNumber", age, { shouldValidate: true });
      }
    },
    [calculateAge, setValue]
  );

  // Handle UHID field blur
  const handleUHIDBlur = useCallback(() => {
    if (!pChartCode) {
      fetchLatestUHID().then((latestUHID) => {
        if (latestUHID) {
          setValue("patRegisters.pChartCode", latestUHID, { shouldValidate: true });
        }
      });
    }
  }, [pChartCode, fetchLatestUHID, setValue]);

  // Name validation logic
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, field: Path<PatientRegistrationDto>) => {
      const value = e.target.value;
      const validatedValue = value.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
      setValue(field, validatedValue, { shouldValidate: true });
    },
    [setValue]
  );

  // Radio options for Age/DOB selection
  const radioOptions = useMemo(
    () => [
      { value: "N", label: "Age" },
      { value: "Y", label: "DOB" },
    ],
    []
  );

  // Field dialog handling
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
        NATIONALITY: "nationality",
      };
      const dropdownType = dropdownMap[dialogCategory];
      if (dropdownType) {
        refreshDropdownValues(dropdownType);
      }
    }
  };

  return (
    <FormSectionWrapper title="Personal Details" spacing={1}>
      <Grid container spacing={2}>
        <ZodFormField
          name="patRegisters.pChartCode"
          control={control}
          type="autocomplete"
          label="UHID"
          placeholder="Search through UHID, Name, DOB, Phone No...."
          maxLength={20}
          disabled={isEditMode}
          isMandatory
          errors={errors}
          onBlur={handleUHIDBlur}
          fetchSuggestions={fetchPatientSuggestions}
          onSelectSuggestion={onPatientSelect}
          inputRef={uhidRef}
        />

        <ZodFormField name="patRegisters.pRegDate" control={control} type="datepicker" label="Registration Date" isMandatory errors={errors} maxDate={new Date()} disabled={true} />

        <ZodFormField
          name="patRegisters.pTypeID"
          control={control}
          type="select"
          label="Payment Source [PIC]"
          options={dropdownValues.pic || []}
          isMandatory
          errors={errors}
          onChange={(val) => {
            const selectedOption = dropdownValues.pic?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patRegisters.pTypeName", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField name="patAddress.pAddPhone1" control={control} type="text" label="Mobile No" maxLength={20} isMandatory errors={errors} />

        <ZodFormField
          name="patRegisters.pTitleVal"
          control={control}
          type="select"
          label="Title"
          options={dropdownValues.title || []}
          isMandatory
          errors={errors}
          onChange={(val) => handleTitleChange(val)}
        />

        <ZodFormField
          name="patRegisters.pFName"
          control={control}
          type="text"
          label="First Name"
          maxLength={100}
          isMandatory
          errors={errors}
          onChange={(e) => handleNameChange(e, "patRegisters.pFName")}
        />

        <ZodFormField
          name="patRegisters.pLName"
          control={control}
          type="text"
          label="Last Name"
          maxLength={100}
          isMandatory
          errors={errors}
          onChange={(e) => handleNameChange(e, "patRegisters.pLName")}
        />

        <ZodFormField name="patRegisters.indentityValue" control={control} type="text" label="Aadhaar No" maxLength={30} isMandatory errors={errors} />

        <ZodFormField
          name="patRegisters.pGenderVal"
          control={control}
          type="select"
          label="Gender"
          options={dropdownValues.gender || []}
          isMandatory
          errors={errors}
          onChange={(val) => {
            const selectedOption = dropdownValues.gender?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patRegisters.pGender", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        <ZodFormField
          name="patRegisters.pDobOrAgeVal"
          control={control}
          type="radio"
          label=""
          options={radioOptions}
          gridProps={{ xs: 12, md: 1 }}
          errors={errors}
          onChange={(val) => {
            const selectedOption = radioOptions.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patRegisters.pDobOrAge", selectedOption.label, { shouldValidate: true });
            }
          }}
        />

        {dobOrAgeVal === "N" ? (
          <>
            <ZodFormField
              name="patOverview.pAgeNumber"
              control={control}
              type="number"
              label="Age"
              gridProps={{ xs: 12, md: 1 }}
              errors={errors}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,3}$/.test(value)) {
                  setValue("patOverview.pAgeNumber", value === "" ? 0 : parseInt(value), { shouldValidate: true });
                }
              }}
            />

            <ZodFormField
              name="patOverview.pAgeDescriptionVal"
              control={control}
              type="select"
              label="Age Unit"
              options={dropdownValues.ageUnit || []}
              gridProps={{ xs: 12, md: 1 }}
              errors={errors}
            />
          </>
        ) : (
          <ZodFormField
            name="patRegisters.pDob"
            control={control}
            type="datepicker"
            label="Date of Birth"
            maxDate={new Date()}
            gridProps={{ xs: 12, md: 2 }}
            errors={errors}
            onChange={handleDOBChange}
          />
        )}

        <ZodFormField name="patRegisters.intIdPsprt" control={control} type="text" label="Int. ID/Passport ID" maxLength={30} errors={errors} />

        <ZodFormField
          name="patAddress.pAddCountryVal"
          control={control}
          type="select"
          label="Nationality"
          options={dropdownValues.nationality || []}
          disabled={isLoading("nationality")}
          helperText={hasError("nationality") ? "Failed to load options" : undefined}
          gridProps={{ xs: 12, sm: 6, md: 3 }}
          errors={errors}
          showAddButton={true}
          onAddClick={() => handleAddField("NATIONALITY")}
          onChange={(val) => {
            const selectedOption = dropdownValues.nationality?.find((opt) => opt.value === val);
            if (selectedOption) {
              setValue("patAddress.pAddCountry", selectedOption.label, { shouldValidate: true });
            }
          }}
        />
      </Grid>

      {/* Modified Field Dialog */}
      <ModifiedFieldDialog
        open={isFieldDialogOpen}
        onClose={handleFieldDialogClose}
        selectedCategoryCode={dialogCategory}
        onFieldAddedOrUpdated={onFieldAddedOrUpdated}
        isFieldCodeDisabled={true}
      />
    </FormSectionWrapper>
  );
};

export default PersonalDetails;
