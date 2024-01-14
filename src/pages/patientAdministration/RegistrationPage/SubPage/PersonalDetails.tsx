import { Row, Col } from "react-bootstrap";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../../components/RadioGroup/RadioGroup";
import { RegsitrationFormData } from "../../../../interfaces/PatientAdministration/registrationFormData";
import { BillingService } from "../../../../services/BillingService/BillingService";
import { ConstantValues } from "../../../../services/CommonService/ConstantValuesService";
import { AppModifyListService } from "../../../../services/CommonService/AppModifyListService";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { useLoading } from "../../../../context/LoadingContext";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useRadioButtonChange from "../../../../hooks/useRadioButtonChange";
import AutocompleteTextBox from "../../../../components/TextBox/AutocompleteTextBox/AutocompleteTextBox";
import { RegistrationService } from "../../../../services/RegistrationService/RegistrationService";
import { formatDate } from "../../../../utils/Common/dateUtils";
import useRegistrationUtils from "../../../../utils/PatientAdministration/RegistrationUtils";

interface PersonalDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  isSubmitted: boolean;
  formErrors: any;
  onPatientSelect: (selectedSuggestion: string) => void;
}

interface PicValue {
  pTypeID: string;
  pTypeName: string;
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
  const endpointPIC = "GetPICDropDownValues";
  const endpointConstantValues = "GetConstantValues";
  const endPointAppModifyList = "GetActiveAppModifyFieldsAsync";
  useEffect(() => {
    const loadDropdownValues = async () => {
      try {
        setLoading(true);
        const response = await BillingService.fetchPicValues(
          token,
          endpointPIC
        );
        let data: PicValue[];
        if (typeof response === "string") {
          data = JSON.parse(response) as PicValue[];
        } else {
          data = response as PicValue[];
        }

        const transformedData: DropdownOption[] = data.map(
          (item: PicValue) => ({
            value: item.pTypeID,
            label: item.pTypeName,
          })
        );
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
        // Error handling
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    loadDropdownValues();
  }, [token]);

  const calculateAge = (dob: string | number | Date) => {
    const birthday = new Date(dob);
    const today = new Date();

    // Calculate the difference in years
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
      // Handle future date of birth
      return { age: 0, ageType: "Years", ageUnit: "LBN4" };
    } else {
      return { age: age, ageType: "Years", ageUnit: "LBN4" };
    }
  };

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDOB = e.target.value;
    if (newDOB) {
      const { age, ageType, ageUnit } = calculateAge(newDOB);
      setFormData((prevFormData) => {
        return {
          ...prevFormData,
          PApproxAge: age.toString(),
          PAgeType: ageType,
          PatOverview: {
            ...prevFormData.PatOverview,
            PageDescription: ageType,
            PageDescriptionVal: ageUnit, // Set the value based on age unit
            PAgeNumber: age,
          },
        };
      });
    }
  };

  const radioOptions = [
    { value: "N", label: "Age" },
    { value: "Y", label: "DOB" },
  ];
  const endpointUHIDAutocomplete = "PatientAutocompleteSearch";
  const fetchPatientSuggestions = async (input: string) => {
    try {
      const results = await RegistrationService.searchPatients(
        token,
        endpointUHIDAutocomplete,
        input
      );
      const suggestions = results.data.map(
        (result) =>
          `${result.pChartCode} | ${result.pfName} ${
            result.plName
          } | ${formatDate(result.pDob)} | ${result.pAddPhone1}`
      );
      return suggestions;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  };
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
    const month = `0${today.getMonth() + 1}`.slice(-2); //
    const day = `0${today.getDate()}`.slice(-2);
    return `${today.getFullYear()}-${month}-${day}`;
  };

  return (
    <section aria-labelledby="personal-details-header">
      <Row>
        <Col>
          <h1 id="personal-details-header" className="section-header">
            <Button
              variant="dark border"
              size="sm"
              style={{ marginRight: "8px" }}
            >
              <FontAwesomeIcon icon={faStar} />
            </Button>
            PERSONAL DETAILS
          </h1>
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <AutocompleteTextBox
            ControlID="UHID"
            title="UHID"
            type="text"
            size="sm"
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
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="RegDate"
            title="Registration Date"
            type="date"
            size="sm"
            placeholder="Reg Date"
            value={formData.PRegDate}
            onChange={(e) =>
              setFormData({ ...formData, PRegDate: e.target.value })
            }
            isSubmitted={isSubmitted}
            isMandatory={true}
            errorMessage={formErrors.registrationDate}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Payment Source [PIC]"
            name="PIC"
            value={String(formData.PTypeID)}
            options={picValues}
            onChange={handleDropdownChange(
              ["PTypeID"],
              ["PTypeName"],
              picValues
            )}
            size="sm"
            isMandatory={true}
            isSubmitted={isSubmitted}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="MobileNo"
            title="Mobile No"
            type="text"
            size="sm"
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
          />
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
            size="sm"
            isMandatory={true}
            isSubmitted={isSubmitted}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="FirstName"
            title="First Name"
            type="text"
            size="sm"
            placeholder="First Name"
            onChange={(e) =>
              setFormData({ ...formData, PFName: e.target.value })
            }
            value={formData.PFName}
            isSubmitted={isSubmitted}
            isMandatory={true}
            errorMessage={formErrors.firstName}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="LastName"
            title="Last Name"
            type="text"
            size="sm"
            placeholder="Last Name"
            onChange={(e) =>
              setFormData({ ...formData, PLName: e.target.value })
            }
            value={formData.PLName}
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="AadhaarNo"
            title="Aadhaar No"
            type="text"
            size="sm"
            placeholder="Aadhaar No"
            onChange={(e) =>
              setFormData({ ...formData, PssnID: e.target.value })
            }
            value={formData.PssnID}
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
            size="sm"
            isMandatory={true}
            isSubmitted={isSubmitted}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <Row>
            <Col
              xs={3}
              md={3}
              lg={3}
              xl={3}
              xxl={3}
              className="d-flex justify-content-center"
            >
              {/* Second element here */}
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
            </Col>
            <Col
              xs={9}
              md={9}
              lg={9}
              xl={9}
              xxl={9}
              className="d-flex justify-content-start"
            >
              {formData.PDobOrAgeVal === "N" ? (
                <>
                  <FloatingLabelTextBox
                    ControlID="Age"
                    title="Age"
                    type="number"
                    size="sm"
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
                    size="sm"
                    isSubmitted={isSubmitted}
                    isMandatory={true}
                  />
                </>
              ) : (
                <FloatingLabelTextBox
                  ControlID="DOB"
                  title="Date of Birth"
                  type="date"
                  size="sm"
                  value={formData.PDob}
                  onChange={(e) => {
                    setFormData({ ...formData, PDob: e.target.value });
                    handleDOBChange(e);
                  }}
                  max={getTodayDate()}
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                />
              )}
            </Col>
          </Row>
        </Col>

        {/* Placeholder for additional columns */}
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <FloatingLabelTextBox
            ControlID="PssnID"
            title="Int. ID/Passport ID"
            type="text"
            size="sm"
            placeholder="Int. ID/Passport ID"
            value={formData.IntIdPsprt}
            onChange={(e) =>
              setFormData({ ...formData, IntIdPsprt: e.target.value })
            }
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
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
            size="sm"
          />
        </Col>
      </Row>
    </section>
  );
};

export default PersonalDetails;
