import React, { useState, useEffect, useRef } from "react";
import { Grid, Typography, Box } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import AutocompleteTextBox from "../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox";
import { RegsitrationFormData } from "../../../../interfaces/PatientAdministration/registrationFormData";
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

interface PersonalDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
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
    useDropdownChange<RegsitrationFormData>(setFormData);
  const { handleRadioButtonChange } =
    useRadioButtonChange<RegsitrationFormData>(setFormData);
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const { fetchLatestUHID } = useRegistrationUtils(token);
  const { fetchPatientSuggestions } = usePatientAutocomplete(token);
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
          token,
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
          token,
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
          token,
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
            token,
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
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthday.getDate())
    ) {
      age--;
    }
    if (age === 0) {
      const ageInMonths =
        monthDiff + (today.getDate() < birthday.getDate() ? -1 : 0);
      if (ageInMonths <= 0) {
        const ageInDays = Math.floor(
          (today.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24)
        );
        return { age: ageInDays, ageType: "Days", ageUnit: "LBN2" };
      } else {
        return { age: ageInMonths, ageType: "Months", ageUnit: "LBN3" };
      }
    } else if (age < 0) {
      return { age: 0, ageType: "Years", ageUnit: "LBN4" };
    } else {
      return { age: age, ageType: "Years", ageUnit: "LBN4" };
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
        PatOverview: {
          ...prevFormData.PatOverview,
          PageDescription: ageType,
          PageDescriptionVal: ageUnit,
          PAgeNumber: age,
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
          PChartCode: latestUHID,
        }));
      }
    });
  }, [token]);

  const handleUHIDBlur = () => {
    if (!formData.PChartCode) {
      fetchLatestUHID().then((latestUHID) => {
        if (latestUHID) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            PChartCode: latestUHID,
          }));
        }
      });
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const month = `0${today.getMonth() + 1}`.slice(-2);
    const day = `0${today.getDate()}`.slice(-2);
    return `${today.getFullYear()}-${month}-${day}`;
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;
    const validatedValue = value.replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: validatedValue,
    }));
  };

  return (
    <section aria-labelledby="personal-details-header">
      <Box>
        <Typography variant="h6" id="personal-details-header">
          PERSONAL DETAILS
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
            value={formData.PChartCode}
            onChange={(e) =>
              setFormData({ ...formData, PChartCode: e.target.value })
            }
            onBlur={handleUHIDBlur}
            fetchSuggestions={fetchPatientSuggestions}
            inputValue={formData.PChartCode}
            isSubmitted={isSubmitted}
            isMandatory={true}
            onSelectSuggestion={onPatientSelect}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <FloatingLabelTextBox
            ControlID="RegDate"
            title="Registration Date"
            type="date"
            size="small"
            placeholder="Reg Date"
            value={formData.PRegDate}
            onChange={(e) =>
              setFormData({ ...formData, PRegDate: e.target.value })
            }
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <DropdownSelect
            label="Payment Source [PIC]"
            name="PIC"
            value={formData.PTypeID === 0 ? "" : formData.PTypeID.toString()}
            options={picValues}
            onChange={handleDropdownChange(
              ["PTypeID"],
              ["PTypeName"],
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
            value={formData.PatAddress.PAddPhone1}
            onChange={(e) =>
              setFormData((prevFormData) => ({
                ...prevFormData,
                PatAddress: {
                  ...prevFormData.PatAddress,
                  PAddPhone1: e.target.value,
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
            value={formData.PTitleVal}
            options={titleValues}
            onChange={handleDropdownChange(
              ["PTitleVal"],
              ["PTitle"],
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
            onChange={(e) => handleNameChange(e, "PFName")}
            value={formData.PFName}
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <FloatingLabelTextBox
            ControlID="LastName"
            title="Last Name"
            type="text"
            size="small"
            placeholder="Last Name"
            onChange={(e) => handleNameChange(e, "PLName")}
            value={formData.PLName}
            isSubmitted={isSubmitted}
            isMandatory={true}
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
              setFormData({ ...formData, PssnID: e.target.value })
            }
            value={formData.PssnID}
            isSubmitted={isSubmitted}
            isMandatory={true}
            inputPattern={/^\d*$/} // Only allow numbers
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <DropdownSelect
            label="Gender"
            name="Gender"
            value={formData.PGenderVal}
            options={genderValues}
            onChange={handleDropdownChange(
              ["PGenderVal"],
              ["PGender"],
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
                selectedValue={formData.PDobOrAgeVal}
                onChange={handleRadioButtonChange(
                  ["PDobOrAgeVal"],
                  ["PDobOrAge"],
                  radioOptions
                )}
                inline={true}
              />
            </Grid>

            {formData.PDobOrAgeVal === "N" ? (
              <>
                <Grid item xs={6} sm={6} md={6} lg={6}>
                  <FloatingLabelTextBox
                    ControlID="Age"
                    title="Age"
                    type="number"
                    size="small"
                    placeholder="Enter age"
                    value={formData.PatOverview.PAgeNumber.toString()}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        PatOverview: {
                          ...prevFormData.PatOverview,
                          PAgeNumber: parseInt(e.target.value),
                        },
                      }))
                    }
                    isSubmitted={isSubmitted}
                    isMandatory={true}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={4} lg={4}>
                  <DropdownSelect
                    label="Age Unit"
                    name="AgeUnit"
                    value={formData.PatOverview.PageDescriptionVal}
                    options={ageUnitOptions}
                    onChange={handleDropdownChange(
                      ["PatOverview", "PageDescriptionVal"],
                      ["PatOverview", "PageDescription"],
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
                  value={formData.PDob}
                  onChange={(e) => {
                    setFormData({ ...formData, PDob: e.target.value });
                    handleDOBChange(e);
                  }}
                  max={getTodayDate()}
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                />
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Placeholder for additional columns */}
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <FloatingLabelTextBox
            ControlID="PssnID"
            title="Int. ID/Passport ID"
            type="text"
            size="small"
            placeholder="Int. ID/Passport ID"
            value={formData.IntIdPsprt}
            onChange={(e) =>
              setFormData({ ...formData, IntIdPsprt: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
          <DropdownSelect
            label="Nationality"
            name="Nationality"
            value={formData.PatAddress.PAddCountryVal}
            options={nationalityValues}
            onChange={handleDropdownChange(
              ["PatAddress", "PAddCountryVal"],
              ["PatAddress", "PAddCountry"],
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
