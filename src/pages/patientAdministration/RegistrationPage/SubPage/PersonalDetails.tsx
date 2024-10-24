import React, { useEffect, useRef, useMemo, useCallback } from "react";
import FormField from "../../../../components/FormField/FormField";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import useRegistrationUtils from "../../../../utils/PatientAdministration/RegistrationUtils";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import FormSectionWrapper from "../../../../components/FormField/FormSectionWrapper";
import { addDays, addMonths, addYears, differenceInDays, differenceInMonths, differenceInYears } from "date-fns";
// Age calculation utilities
const calculateAgeFromDOB = (dob: Date) => {
  const today = new Date();
  const years = differenceInYears(today, dob);
  const months = differenceInMonths(today, dob);
  const days = differenceInDays(today, dob);

  if (years > 0) {
    return { age: years, unit: "LBN4", description: "Years" };
  } else if (months > 0) {
    return { age: months, unit: "LBN3", description: "Months" };
  } else {
    return { age: days, unit: "LBN2", description: "Days" };
  }
};

const calculateDOBFromAge = (age: number, unit: string): Date => {
  const today = new Date();

  switch (unit) {
    case "LBN4": // Years
      return addYears(today, -age);
    case "LBN3": // Months
      return addMonths(today, -age);
    case "LBN2": // Days
      return addDays(today, -age);
    default:
      return today;
  }
};

interface PersonalDetailsProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  isSubmitted: boolean;
  onPatientSelect: (selectedSuggestion: string) => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ formData, setFormData, isSubmitted, onPatientSelect }) => {
  const dropdownValues = useDropdownValues(["pic", "title", "gender", "ageUnit", "nationality"]);
  const { handleDropdownChange } = useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } = useRadioButtonChange<PatientRegistrationDto>(setFormData);
  const { fetchLatestUHID } = useRegistrationUtils();
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const uhidRef = useRef<HTMLInputElement>(null);
  const serverDate = useServerDate();

  const updateFormWithAgeData = useCallback((age: number, unit: string, description: string) => {
    setFormData((prev) => ({
      ...prev,
      patOverview: {
        ...prev.patOverview,
        pAgeNumber: age,
        pAgeDescriptionVal: unit,
        pAgeDescription: description,
      },
    }));
  }, []);

  const updateFormWithDOBData = useCallback((dob: Date) => {
    setFormData((prev) => ({
      ...prev,
      patRegisters: {
        ...prev.patRegisters,
        pDob: dob,
      },
    }));
  }, []);

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

  const handleDOBChange = useCallback(
    (newDate: Date | null) => {
      if (newDate) {
        const { age, unit, description } = calculateAgeFromDOB(newDate);
        updateFormWithDOBData(newDate);
        updateFormWithAgeData(age, unit, description);
      }
    },
    [updateFormWithAgeData, updateFormWithDOBData]
  );

  const handleAgeChange = useCallback(
    (age: number, unit: string) => {
      if (age && unit) {
        const calculatedDOB = calculateDOBFromAge(age, unit);
        const unitDescription = dropdownValues.ageUnit.find((x) => x.value === unit)?.label || "";

        updateFormWithDOBData(calculatedDOB);
        updateFormWithAgeData(age, unit, unitDescription);
      }
    },
    [dropdownValues.ageUnit, updateFormWithAgeData, updateFormWithDOBData]
  );

  useEffect(() => {
    if (formData.patRegisters.pDob) {
      const { age, unit, description } = calculateAgeFromDOB(new Date(formData.patRegisters.pDob));
      updateFormWithAgeData(age, unit, description);
    }
  }, [formData.patRegisters.pDob, updateFormWithAgeData]);

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
      const validatedValue = value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
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
      />
      <FormField
        type="select"
        label="Payment Source [PIC]"
        name="PIC"
        ControlID="PIC"
        value={formData.patRegisters.pTypeID !== undefined && formData.patRegisters.pTypeID !== 0 ? formData.patRegisters.pTypeID.toString() : ""}
        options={dropdownValues.pic}
        onChange={handleDropdownChange(["patRegisters", "pTypeID"], ["patRegisters", "pTypeName"], dropdownValues.pic)}
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
        options={dropdownValues.title}
        onChange={handleDropdownChange(["patRegisters", "pTitleVal"], ["patRegisters", "pTitle"], dropdownValues.title)}
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
        options={dropdownValues.gender}
        onChange={handleDropdownChange(["patRegisters", "pGenderVal"], ["patRegisters", "pGender"], dropdownValues.gender)}
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
              const newAge = parseInt(e.target.value);
              handleAgeChange(newAge, formData.patOverview.pAgeDescriptionVal);
            }}
            isSubmitted={isSubmitted}
            isMandatory={true}
            maxLength={3}
            gridProps={{ xs: 12, md: 1 }}
          />
          <FormField
            type="select"
            label="Age Unit"
            name="pAgeDescriptionVal"
            ControlID="AgeUnit"
            value={formData.patOverview.pAgeDescriptionVal}
            options={dropdownValues.ageUnit}
            onChange={(e) => {
              const newUnit = e.target.value;
              handleAgeChange(formData.patOverview.pAgeNumber, newUnit);
              handleDropdownChange(["patOverview", "pAgeDescriptionVal"], ["patOverview", "pAgeDescription"], dropdownValues.ageUnit)(e);
            }}
            isSubmitted={isSubmitted}
            isMandatory={true}
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
          isSubmitted={isSubmitted}
          isMandatory={true}
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
        value={formData.patAddress.pAddCountryVal || defaultFields.nationality || ""}
        options={fieldsList.nationality}
        onChange={handleDropdownChange(["patAddress", "pAddCountryVal"], ["patAddress", "pAddCountry"], fieldsList.nationality)}
        isMandatory={true}
      />
    </FormSectionWrapper>
  );
};

export default PersonalDetails;
