import React, { useState, useEffect, useRef } from "react";
import { Grid, Typography, Box } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import AutocompleteTextBox from "../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
import { BillingService } from "../../../../services/BillingServices/BillingService";
import { ConstantValues } from "../../../../services/CommonServices/ConstantValuesService";
import { AppModifyListService } from "../../../../services/CommonServices/AppModifyListService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { useLoading } from "../../../../context/LoadingContext";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import useRegistrationUtils from "../../../../utils/PatientAdministration/RegistrationUtils";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import {
  format,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns";

interface PersonalDetailsProps {
  formData: PatientRegistrationDto;
  setFormData: React.Dispatch<React.SetStateAction<PatientRegistrationDto>>;
  isSubmitted: boolean;
  formErrors: any;
  onPatientSelect: (selectedSuggestion: string) => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  formData,
  setFormData,
  isSubmitted,
  formErrors,
  onPatientSelect,
}) => {
  const [picValues, setPicValues] = useState<DropdownOption[]>([]);
  const [titleValues, setTitleValues] = useState<DropdownOption[]>([]);
  const [genderValues, setGenderValues] = useState<DropdownOption[]>([]);
  const [ageUnitOptions, setAgeValues] = useState<DropdownOption[]>([]);
  const [nationalityValues, setNationalityValues] = useState<DropdownOption[]>(
    []
  );
  const { handleDropdownChange } =
    useDropdownChange<PatientRegistrationDto>(setFormData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<PatientRegistrationDto>(setFormData);
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const { fetchLatestUHID } = useRegistrationUtils();
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const uhidRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uhidRef.current) {
      uhidRef.current.focus();
    }
  }, []);

  const endpointPIC = "GetPICDropDownValues";
  const endpointConstantValues = "GetConstantValues";
  const endPointAppModifyList = "GetActiveAppModifyFieldsAsync";

  useEffect(() => {
    const loadDropdownValues = async () => {
      try {
        setLoading(true);
        const responsePIC = await BillingService.fetchPicValues(
          token,
          endpointPIC
        );
        const transformedData: DropdownOption[] = responsePIC.map((item) => ({
          value: item.value,
          label: item.label,
        }));
        setPicValues(transformedData);

        const responseTitle = await ConstantValues.fetchConstantValues(
          endpointConstantValues,
          "PTIT"
        );
        const transformedTitleData: DropdownOption[] = responseTitle.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setTitleValues(transformedTitleData);

        const responseGender = await ConstantValues.fetchConstantValues(
          endpointConstantValues,
          "PSEX"
        );
        const transformedGenderData: DropdownOption[] = responseGender.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setGenderValues(transformedGenderData);

        const responseAge = await ConstantValues.fetchConstantValues(
          endpointConstantValues,
          "PAT"
        );
        const transformedAgeData: DropdownOption[] = responseAge.map(
          (item) => ({
            value: item.value,
            label: item.label,
          })
        );
        setAgeValues(transformedAgeData);

        const responseNationality =
          await AppModifyListService.fetchAppModifyList(
            endPointAppModifyList,
            "NATIONALITY"
          );
        const transformedNationalityData: DropdownOption[] =
          responseNationality.map((item) => ({
            value: item.value,
            label: item.label,
          }));
        setNationalityValues(transformedNationalityData);
      } catch (error) {
        console.error("Error fetching dropdown values:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDropdownValues();
  }, [token]);
  useEffect(() => {
    calculateAge(new Date());
  });
  const calculateAge = (dob: string | number | Date) => {
    const birthday = new Date(dob);
    const today = new Date();
    const ageInYears = differenceInYears(today, birthday);
    const ageInMonths = differenceInMonths(today, birthday);
    const ageInDays = differenceInDays(today, birthday);

    if (ageInYears === 0) {
      if (ageInMonths === 0) {
        return { age: ageInDays, ageType: "Days", ageUnit: "LBN2" };
      } else {
        return { age: ageInMonths, ageType: "Months", ageUnit: "LBN3" };
      }
    } else {
      return { age: ageInYears, ageType: "Years", ageUnit: "LBN4" };
    }
  };

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDOB = e.target.value;
    if (newDOB) {
      const { age, ageType, ageUnit } = calculateAge(newDOB);
      setFormData((prevFormData) => ({
        ...prevFormData,
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
  };

  const radioOptions = [
    { value: "N", label: "Age" },
    { value: "Y", label: "DOB" },
  ];

  useEffect(() => {
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
  }, [token]);

  const handleUHIDBlur = () => {
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
  };

  const getTodayDate = () => {
    return format(new Date(), "yyyy-MM-dd");
  };

  const handleNameChange = (
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
  };

  return (
    <section aria-labelledby="personal-details-header">
      <Box>
        <Typography variant="h6" sx={{ borderBottom: "1px solid #000" }}>
          Personal Details
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <AutocompleteTextBox
            ref={uhidRef}
            ControlID="UHID"
            title="UHID"
            type="text"
            size="small"
            placeholder="Search through UHID, Name, DOB, Phone No...."
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
            inputValue={formData.patRegisters.pChartCode}
            isSubmitted={isSubmitted}
            isMandatory={true}
            onSelectSuggestion={onPatientSelect}
            maxLength={20}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <FloatingLabelTextBox
            ControlID="RegDate"
            title="Registration Date"
            type="date"
            size="small"
            placeholder="Reg Date"
            value={formData.patRegisters.pRegDate}
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                patRegisters: {
                  ...prevFormData.patRegisters,
                  pRegDate: e.target.value,
                },
              }))
            }
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <DropdownSelect
            label="Payment Source [PIC]"
            name="PIC"
            value={
              formData.patRegisters.pTypeID !== undefined &&
                formData.patRegisters.pTypeID !== 0
                ? formData.patRegisters.pTypeID.toString()
                : ""
            }
            options={picValues}
            onChange={handleDropdownChange(
              ["patRegisters", "pTypeID"],
              ["patRegisters", "pTypeName"],
              picValues
            )}
            size="small"
            isMandatory={true}
            isSubmitted={isSubmitted}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <FloatingLabelTextBox
            ControlID="MobileNo"
            title="Mobile No"
            type="text"
            size="small"
            placeholder="Mobile No"
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
            inputPattern={/^\d*$/} // Only allow numbers
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <DropdownSelect
            label="Title"
            name="Title"
            value={formData.patRegisters.pTitleVal || ""}
            options={titleValues}
            onChange={handleDropdownChange(
              ["patRegisters", "pTitleVal"],
              ["patRegisters", "pTitle"],
              titleValues
            )}
            size="small"
            isMandatory={true}
            isSubmitted={isSubmitted}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <FloatingLabelTextBox
            ControlID="FirstName"
            title="First Name"
            type="text"
            size="small"
            placeholder="First Name"
            onChange={(e) => handleNameChange(e, "pFName")}
            value={formData.patRegisters.pFName || ""}
            isSubmitted={isSubmitted}
            isMandatory={true}
            maxLength={100}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <FloatingLabelTextBox
            ControlID="LastName"
            title="Last Name"
            type="text"
            size="small"
            placeholder="Last Name"
            onChange={(e) => handleNameChange(e, "pLName")}
            value={formData.patRegisters.pLName || ""}
            isSubmitted={isSubmitted}
            isMandatory={true}
            maxLength={100}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <FloatingLabelTextBox
            ControlID="AadhaarNo"
            title="Aadhaar No"
            type="text"
            size="small"
            placeholder="Aadhaar No"
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                patRegisters: {
                  ...prevFormData.patRegisters,
                  pssnID: e.target.value,
                },
              }))
            }
            value={formData.patRegisters.pssnID || ""}
            isSubmitted={isSubmitted}
            isMandatory={true}
            inputPattern={/^\d*$/} // Only allow numbers
            maxLength={30}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <DropdownSelect
            label="Gender"
            name="Gender"
            value={formData.patRegisters.pGenderVal || ""}
            options={genderValues}
            onChange={handleDropdownChange(
              ["patRegisters", "pGenderVal"],
              ["patRegisters", "pGender"],
              genderValues
            )}
            size="small"
            isMandatory={true}
            isSubmitted={isSubmitted}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} md={2} lg={2}>
              <RadioGroup
                name="ageOrDob"
                options={radioOptions}
                selectedValue={formData.patRegisters.pDobOrAgeVal}
                onChange={handleRadioButtonChange(
                  ["patRegisters", "pDobOrAgeVal"],
                  ["patRegisters", "pDobOrAge"],
                  radioOptions
                )}
                inline={true}
              />
            </Grid>

            {formData.patRegisters.pDobOrAgeVal === "N" ? (
              <>
                <Grid item xs={6} sm={6} md={6} lg={6}>
                  <FloatingLabelTextBox
                    ControlID="Age"
                    title="Age"
                    type="number"
                    size="small"
                    placeholder="Enter age"
                    value={formData.patOverview.pAgeNumber.toString()}
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
                    maxLength={1}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={4} lg={4}>
                  <DropdownSelect
                    label="Age Unit"
                    name="AgeUnit"
                    value={formData.patOverview.pAgeDescriptionVal || ""}
                    options={ageUnitOptions}
                    onChange={handleDropdownChange(
                      ["patOverview", "pAgeDescriptionVal"],
                      ["patOverview", "pAgeDescription"],
                      ageUnitOptions
                    )}
                    size="small"
                    isSubmitted={isSubmitted}
                    isMandatory={true}
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12} sm={10} md={10} lg={10}>
                <FloatingLabelTextBox
                  ControlID="DOB"
                  title="Date of Birth"
                  type="date"
                  size="small"
                  value={formData.patRegisters.pDob}
                  onChange={(e) => {
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      patRegisters: {
                        ...prevFormData.patRegisters,
                        pDob: e.target.value,
                      },
                    }));
                    handleDOBChange(e);
                  }}
                  max={getTodayDate()}
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                  maxLength={1}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <FloatingLabelTextBox
            ControlID="PssnID"
            title="Int. ID/Passport ID"
            type="text"
            size="small"
            placeholder="Int. ID/Passport ID"
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
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <DropdownSelect
            label="Nationality"
            name="Nationality"
            value={formData.patAddress.pAddCountryVal || ""}
            options={nationalityValues}
            onChange={handleDropdownChange(
              ["patAddress", "pAddCountryVal"],
              ["patAddress", "pAddCountry"],
              nationalityValues
            )}
            size="small"
          />
        </Grid>
      </Grid>
    </section>
  );
};

export default PersonalDetails;


