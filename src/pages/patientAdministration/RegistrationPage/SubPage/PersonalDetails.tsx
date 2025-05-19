import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { AppModifyFieldDto } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import useDropdownValues, { DropdownType } from "@/hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "@/hooks/useDropdownChange";
import useRadioButtonChange from "@/hooks/useRadioButtonChange";
import useRegistrationUtils from "@/utils/PatientAdministration/RegistrationUtils";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDayjs from "@/hooks/Common/useDateTime";
import FormSectionWrapper from "@/components/FormField/FormSectionWrapper";
import FormField from "@/components/FormField/FormField";
import ModifiedFieldDialog from "@/components/ModifiedFieldDailog/ModifiedFieldDailog";
import { notifyWarning } from "@/utils/Common/toastManager";

interface PersonalDetailsProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  isSubmitted: boolean;
  onPatientSelect: (selectedSuggestion: string) => void;
  isEditMode?: boolean;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ formData, setFormData, isSubmitted, onPatientSelect, isEditMode = false }) => {
  const { refreshDropdownValues, isLoading, hasError, ...dropdownValues } = useDropdownValues(["pic", "title", "gender", "ageUnit", "nationality"]);
  const { handleDropdownChange } = useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } = useRadioButtonChange<PatientRegistrationDto>(setFormData);
  const { fetchLatestUHID } = useRegistrationUtils();
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const uhidRef = useRef<HTMLInputElement>(null);
  const serverDate = useServerDate();
  const { diff, date: currentDate, formatDateYMD } = useDayjs();
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [dialogCategory, setDialogCategory] = useState<string>("");

  const handleTitleChange = (selectedTitleValue: string) => {
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
    setFormData((prevFormData) => ({
      ...prevFormData,
      patRegisters: {
        ...prevFormData.patRegisters,
        pTitleVal: selectedTitleValue,
        pTitle: selectedTitleValue,
        pGenderVal: genderOption?.value || "",
        pGender: genderOption?.label || "",
      },
    }));
  };

  useEffect(() => {
    uhidRef.current?.focus();
    fetchLatestUHID().then((latestUHID) => {
      if (latestUHID) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          patRegisters: {
            ...prevFormData.patRegisters,
            pChartCode: latestUHID,
          },
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const { pDobOrAgeVal } = formData.patRegisters;
      if (pDobOrAgeVal === "N") {
        const age = formData.patOverview.pAgeNumber;
        const ageUnit = formData.patOverview.pAgeDescriptionVal;
        if (age && ageUnit) {
          setFormData((prev) => ({
            ...prev,
            patRegisters: {
              ...prev.patRegisters,
              pDobOrAgeVal: "N",
              pDobOrAge: "Age",
            },
            patOverview: {
              ...prev.patOverview,
              pAgeNumber: age,
              pAgeDescriptionVal: ageUnit,
            },
          }));
        }
      } else if (pDobOrAgeVal === "Y") {
        setFormData((prev) => ({
          ...prev,
          patRegisters: {
            ...prev.patRegisters,
            pDobOrAgeVal: "Y",
            pDobOrAge: "DOB",
          },
        }));
      }
    }
  }, [isEditMode, formData.patRegisters.pDobOrAgeVal, formData.patOverview.pAgeNumber, formData.patOverview.pAgeDescriptionVal]);

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

  const handleDOBChange = useCallback(
    (newDate: Date | null) => {
      if (newDate) {
        const today = new Date();
        if (newDate > today) {
          notifyWarning("Date of Birth cannot be a future date.");
          return;
        }

        const { age, ageType, ageUnit } = calculateAge(newDate);
        setFormData((prevFormData) => ({
          ...prevFormData,
          patRegisters: {
            ...prevFormData.patRegisters,
            pDob: newDate,
          },
          PApproxAge: age,
          PAgeType: ageType,
          patOverview: {
            ...prevFormData.patOverview,
            pAgeDescription: ageType,
            pAgeDescriptionVal: ageUnit,
            pAgeNumber: age,
          },
        }));
      }
    },
    [calculateAge, setFormData]
  );

  const handleUHIDBlur = useCallback(() => {
    if (!formData.patRegisters.pChartCode) {
      fetchLatestUHID().then((latestUHID) => {
        if (latestUHID) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            patRegisters: {
              ...prevFormData.patRegisters,
              pChartCode: latestUHID,
            },
          }));
        }
      });
    }
  }, [formData.patRegisters.pChartCode, fetchLatestUHID, setFormData]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      const value = e.target.value;
      const validatedValue = value.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
      setFormData((prevFormData) => ({
        ...prevFormData,
        patRegisters: {
          ...prevFormData.patRegisters,
          [field]: validatedValue,
        },
      }));
    },
    [setFormData]
  );

  const radioOptions = useMemo(
    () => [
      { value: "N", label: "Age" },
      { value: "Y", label: "DOB" },
    ],
    []
  );
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

  return (
    <FormSectionWrapper title="Personal Details" spacing={1}>
      <FormField
        type="autocomplete"
        label="UHID"
        name="pChartCode"
        ControlID="UHID"
        value={formData.patRegisters.pChartCode}
        onChange={(e) =>
          setFormData((prevFormData) => ({
            ...prevFormData,
            patRegisters: {
              ...prevFormData.patRegisters,
              pChartCode: e.target.value,
            },
          }))
        }
        onBlur={handleUHIDBlur}
        fetchSuggestions={fetchPatientSuggestions}
        onSelectSuggestion={onPatientSelect}
        isSubmitted={isSubmitted}
        isMandatory={true}
        placeholder="Search through UHID, Name, DOB, Phone No...."
        maxLength={20}
        disabled={isEditMode}
      />
      <FormField
        type="datepicker"
        label="Registration Date"
        name="pRegDate"
        ControlID="RegDate"
        value={formData.patRegisters.pRegDate ? new Date(formData.patRegisters.pRegDate) : null}
        onChange={(date: Date | null) =>
          setFormData((prevFormData) => ({
            ...prevFormData,
            patRegisters: {
              ...prevFormData.patRegisters,
              pRegDate: date ? date : serverDate,
            },
          }))
        }
        isSubmitted={isSubmitted}
        isMandatory={true}
        maxDate={new Date()}
        disabled={true}
      />
      <FormField
        type="select"
        label="Payment Source [PIC]"
        name="PIC"
        ControlID="PIC"
        value={formData.patRegisters.pTypeID !== undefined && formData.patRegisters.pTypeID !== 0 ? formData.patRegisters.pTypeID.toString() : ""}
        options={dropdownValues.pic || []}
        onChange={handleDropdownChange(["patRegisters", "pTypeID"], ["patRegisters", "pTypeName"], dropdownValues.pic || [])}
        isMandatory={true}
        isSubmitted={isSubmitted}
      />
      <FormField
        type="text"
        label="Mobile No"
        name="pAddPhone1"
        ControlID="MobileNo"
        value={formData.patAddress.pAddPhone1}
        onChange={(e) =>
          setFormData((prevFormData) => ({
            ...prevFormData,
            patAddress: {
              ...prevFormData.patAddress,
              pAddPhone1: e.target.value,
            },
          }))
        }
        maxLength={20}
        isSubmitted={isSubmitted}
        isMandatory={true}
      />

      <FormField
        type="select"
        label="Title"
        name="pTitleVal"
        ControlID="Title"
        value={formData.patRegisters.pTitleVal || ""}
        options={dropdownValues.title || []}
        onChange={(e) => handleTitleChange(e.target.value)}
        isMandatory={true}
        isSubmitted={isSubmitted}
      />

      <FormField
        type="text"
        label="First Name"
        name="pFName"
        ControlID="FirstName"
        value={formData.patRegisters.pFName || ""}
        onChange={(e) => handleNameChange(e, "pFName")}
        isSubmitted={isSubmitted}
        isMandatory={true}
        maxLength={100}
      />
      <FormField
        type="text"
        label="Last Name"
        name="pLName"
        ControlID="LastName"
        value={formData.patRegisters.pLName || ""}
        onChange={(e) => handleNameChange(e, "pLName")}
        isSubmitted={isSubmitted}
        isMandatory={true}
        maxLength={100}
      />
      <FormField
        type="text"
        label="Aadhaar No"
        name="indentityValue"
        ControlID="AadhaarNo"
        value={formData.patRegisters.indentityValue || ""}
        onChange={(e) =>
          setFormData((prevFormData) => ({
            ...prevFormData,
            patRegisters: {
              ...prevFormData.patRegisters,
              indentityValue: e.target.value,
            },
          }))
        }
        isSubmitted={isSubmitted}
        isMandatory={true}
        maxLength={30}
      />
      <FormField
        type="select"
        label="Gender"
        name="pGenderVal"
        ControlID="Gender"
        value={formData.patRegisters.pGenderVal || ""}
        options={dropdownValues.gender || []}
        onChange={handleDropdownChange(["patRegisters", "pGenderVal"], ["patRegisters", "pGender"], dropdownValues.gender || [])}
        isMandatory={true}
        isSubmitted={isSubmitted}
      />

      <FormField
        type="radio"
        label=""
        name="ageOrDob"
        ControlID="ageOrDob"
        value={formData.patRegisters.pDobOrAgeVal}
        options={radioOptions}
        onChange={handleRadioButtonChange(["patRegisters", "pDobOrAgeVal"], ["patRegisters", "pDobOrAge"], radioOptions)}
        inline={true}
        gridProps={{ xs: 12, md: 1 }}
      />
      {formData.patRegisters.pDobOrAgeVal === "N" ? (
        <>
          <FormField
            type="number"
            label="Age"
            name="pAgeNumber"
            ControlID="Age"
            value={formData.patOverview.pAgeNumber}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,3}$/.test(value)) {
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  patOverview: {
                    ...prevFormData.patOverview,
                    pAgeNumber: value === "" ? 0 : parseInt(value),
                  },
                }));
              }
            }}
            maxLength={3}
            gridProps={{ xs: 12, md: 1 }}
          />
          <FormField
            type="select"
            label="Age Unit"
            name="pAgeDescriptionVal"
            ControlID="AgeUnit"
            value={formData.patOverview.pAgeDescriptionVal}
            options={dropdownValues.ageUnit || []}
            onChange={handleDropdownChange(["patOverview", "pAgeDescriptionVal"], ["patOverview", "pAgeDescription"], dropdownValues.ageUnit || [])}
            gridProps={{ xs: 12, md: 1 }}
          />
        </>
      ) : (
        <FormField
          type="datepicker"
          label="Date of Birth"
          name="pDob"
          ControlID="DOB"
          value={formData.patRegisters.pDob}
          onChange={handleDOBChange}
          maxDate={new Date()}
          gridProps={{ xs: 12, md: 2 }}
        />
      )}
      <FormField
        type="text"
        label="Int. ID/Passport ID"
        name="intIdPsprt"
        ControlID="PssnID"
        value={formData.patRegisters.intIdPsprt || ""}
        onChange={(e) =>
          setFormData((prevFormData) => ({
            ...prevFormData,
            patRegisters: {
              ...prevFormData.patRegisters,
              intIdPsprt: e.target.value,
            },
          }))
        }
        maxLength={30}
      />

      <FormField
        type="select"
        label="Nationality"
        name="pAddCountryVal"
        ControlID="Nationality"
        value={formData.patAddress.pAddCountryVal || dropdownValues.nationality}
        options={dropdownValues.nationality || []}
        onChange={handleDropdownChange(["patAddress", "pAddCountryVal"], ["patAddress", "pAddCountry"], dropdownValues.nationality || [])}
        isSubmitted={isSubmitted}
        disabled={isLoading("nationality")}
        helperText={hasError("nationality") ? "Failed to load options" : undefined}
        gridProps={{ xs: 12, sm: 6, md: 3 }}
        showAddButton={true}
        onAddClick={() => handleAddField("NATIONALITY")}
      />

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
