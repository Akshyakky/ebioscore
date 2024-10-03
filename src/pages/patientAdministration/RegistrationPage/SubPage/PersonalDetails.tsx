import React, { useEffect, useRef, useMemo, useCallback } from "react";
import FormField from "../../../../components/FormField/FormField";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import useRegistrationUtils from "../../../../utils/PatientAdministration/RegistrationUtils";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import useDayjs from "../../../../hooks/Common/useDateTime";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import FormSectionWrapper from "../../../../components/FormField/FormSectionWrapper";

interface PersonalDetailsProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  isSubmitted: boolean;
  onPatientSelect: (selectedSuggestion: string) => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  formData,
  setFormData,
  isSubmitted,
  onPatientSelect,
}) => {
  const { picValues, titleValues, genderValues, ageUnitOptions, nationalityValues } = useDropdownValues();
  const { handleDropdownChange } = useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } = useRadioButtonChange<PatientRegistrationDto>(setFormData);
  const { fetchLatestUHID } = useRegistrationUtils();
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const uhidRef = useRef<HTMLInputElement>(null);
  const serverDate = useServerDate();
  const { diff, formatDate, date: currentDate, format, parse, formatDateYMD } = useDayjs();

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

  const calculateAge = useCallback((dob: string | number | Date) => {
    const ageInYears = diff(dob, 'year');
    const ageInMonths = diff(dob, 'month');
    const ageInDays = diff(dob, 'day');

    if (ageInYears === 0) {
      if (ageInMonths === 0) {
        return { age: ageInDays, ageType: "Days", ageUnit: "LBN2" };
      } else {
        return { age: ageInMonths, ageType: "Months", ageUnit: "LBN3" };
      }
    } else {
      return { age: ageInYears, ageType: "Years", ageUnit: "LBN4" };
    }
  }, [diff]);

  const handleDOBChange = useCallback((newDate: Date | null) => {
    if (newDate) {
      const { age, ageType, ageUnit } = calculateAge(newDate);
      setFormData((prevFormData) => ({
        ...prevFormData,
        patRegisters: {
          ...prevFormData.patRegisters,
          pDob: newDate ? newDate : serverDate,
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
  }, [calculateAge, formatDateYMD, setFormData]);

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

  const handleNameChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;
    const validatedValue = value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    setFormData((prevFormData) => ({
      ...prevFormData,
      patRegisters: {
        ...prevFormData.patRegisters,
        [field]: validatedValue,
      },
    }));
  }, [setFormData]);

  const radioOptions = useMemo(() => [
    { value: "N", label: "Age" },
    { value: "Y", label: "DOB" },
  ], []);

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
        maxDate={new Date()} // Set to current date
      />
      <FormField
        type="select"
        label="Payment Source [PIC]"
        name="PIC"
        ControlID="PIC"
        value={formData.patRegisters.pTypeID !== undefined && formData.patRegisters.pTypeID !== 0
          ? formData.patRegisters.pTypeID.toString()
          : ""}
        options={picValues}
        onChange={handleDropdownChange(
          ["patRegisters", "pTypeID"],
          ["patRegisters", "pTypeName"],
          picValues
        )}
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
        options={titleValues}
        onChange={handleDropdownChange(
          ["patRegisters", "pTitleVal"],
          ["patRegisters", "pTitle"],
          titleValues
        )}
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
        name="pssnID"
        ControlID="AadhaarNo"
        value={formData.patRegisters.indentityValue || ""}
        onChange={(e) =>
          setFormData((prevFormData) => ({
            ...prevFormData,
            patRegisters: {
              ...prevFormData.patRegisters,
              pssnID: e.target.value,
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
        options={genderValues}
        onChange={handleDropdownChange(
          ["patRegisters", "pGenderVal"],
          ["patRegisters", "pGender"],
          genderValues
        )}
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
        onChange={handleRadioButtonChange(
          ["patRegisters", "pDobOrAgeVal"],
          ["patRegisters", "pDobOrAge"],
          radioOptions
        )}
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
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                patOverview: {
                  ...prevFormData.patOverview,
                  pAgeNumber: parseInt(e.target.value),
                },
              }))
            }
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
            options={ageUnitOptions}
            onChange={handleDropdownChange(
              ["patOverview", "pAgeDescriptionVal"],
              ["patOverview", "pAgeDescription"],
              ageUnitOptions
            )}
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
          value={formData.patRegisters.pDob ? new Date(formData.patRegisters.pDob) : null}
          onChange={handleDOBChange}
          maxDate={new Date()} // Set to current date
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
        value={formData.patAddress.pAddCountryVal || ""}
        options={nationalityValues}
        onChange={handleDropdownChange(
          ["patAddress", "pAddCountryVal"],
          ["patAddress", "pAddCountry"],
          nationalityValues
        )}
      />
    </FormSectionWrapper>
  );
};

export default PersonalDetails;