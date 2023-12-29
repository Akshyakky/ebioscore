import { Row, Col } from "react-bootstrap";
import TextBox from "../../../../components/TextBox/TextBox ";
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

interface PersonalDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  isSubmitted: boolean;
  formErrors: any;
}

interface PicValue {
  pTypeID: string;
  pTypeName: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  formData,
  setFormData,
  isSubmitted,
  formErrors,
}) => {
  const [picValues, setPicValues] = useState<DropdownOption[]>([]);
  const [titleValues, setTitleValues] = useState<DropdownOption[]>([]);
  const [genderValues, setGenderValues] = useState<DropdownOption[]>([]);
  const [ageUnitOptions, setAgeValues] = useState<DropdownOption[]>([]);
  const [nationalityValues, setNationalityValues] = useState<DropdownOption[]>(
    []
  );
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;

  const handleDropdownChange =
    (
      valuePath: (string | number)[],
      textPath: (string | number)[],
      options: DropdownOption[]
    ) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      const selectedOption = options.find(
        (option) => option.value === selectedValue
      );

      setFormData((prevFormData) => {
        // Recursive function to update the state
        function updateState(
          obj: any,
          path: (string | number)[],
          newValue: any
        ): any {
          const [first, ...rest] = path;

          if (rest.length === 0) {
            // If newValue is empty and path is not empty, skip updating this path
            if (newValue === '' && path.length > 0) {
              return obj;
            }
            return { ...obj, [first]: newValue };
          } else {
            return { ...obj, [first]: updateState(obj[first], rest, newValue) };
          }
        }

        let newData = updateState(prevFormData, valuePath, selectedValue);
        // Update text path only if selectedOption is found
        if (selectedOption) {
          newData = updateState(newData, textPath, selectedOption.label);
        }
        return newData;
      });
    };


  const handleRadioButtonChange =
    (name: keyof RegsitrationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: e.target.value,
      }));
    };
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
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }

    if (age === 0) {
      // Calculate age in months
      const ageInMonths = today.getMonth() - birthday.getMonth();
      return { age: ageInMonths, ageType: "Months" };
    } else if (age < 0) {
      // Handle future date of birth
      return { age: 0, ageType: "Years" };
    } else {
      return { age: age, ageType: "Years" };
    }
  };

  useEffect(() => {
    if (formData.PDob) {
      const { age, ageType } = calculateAge(formData.PDob);
      setFormData((prevFormData) => ({
        ...prevFormData,
        PApproxAge: age.toString(),
        PAgeType: ageType,
      }));
    }
  }, [formData.PDob]);

  const radioOptions = [
    { value: "N", label: "Age" },
    { value: "Y", label: "DOB" },
  ];

  return (
    <section aria-labelledby="personal-details-header">
      <Row>
        <Col>
          <h1 id="personal-details-header" className="section-header">
            Personal Details
          </h1>
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
            ControlID="UHID"
            title="UHID"
            type="text"
            size="sm"
            placeholder="Search through UHID, Name, DOB, Phone No...."
            value={formData.PChartCode}
            onChange={(e) =>
              setFormData({ ...formData, PChartCode: e.target.value })
            }
            isSubmitted={isSubmitted}
            isMandatory={true}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
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
          <TextBox
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
            value={formData.PTitleValue}
            options={titleValues}
            onChange={handleDropdownChange(
              ["PTitleValue"],
              ["PTitle"],
              titleValues
            )}
            size="sm"
            isMandatory={true}
            isSubmitted={isSubmitted}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
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
          <TextBox
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
          <TextBox
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
            value={formData.PGenderValue}
            options={genderValues}
            onChange={handleDropdownChange(
              ["PGenderValue"],
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
                selectedValue={formData.DobYN}
                onChange={handleRadioButtonChange("DobYN")}
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
              {formData.DobYN === "N" ? (
                <>
                  <TextBox
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
                    value={formData.PatOverview.PageDescription}
                    options={ageUnitOptions}
                    onChange={handleDropdownChange(
                      ["PatOverview", "PageDescriptionValue"],
                      ["PatOverview", "PageDescription"],
                      ageUnitOptions
                    )}
                    size="sm"
                    isMandatory={true}
                    isSubmitted={isSubmitted}
                  />
                </>
              ) : (
                <TextBox
                  ControlID="DOB"
                  title="Date of Birth"
                  type="date"
                  size="sm"
                  value={formData.PDob}
                  onChange={(e) =>
                    setFormData({ ...formData, PDob: e.target.value })
                  }
                  isSubmitted={isSubmitted}
                  isMandatory={true}
                />
              )}
            </Col>
          </Row>
        </Col>

        {/* Placeholder for additional columns */}
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
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
            value={formData.PatAddress.PAddCountry}
            options={nationalityValues}
            onChange={handleDropdownChange(
              ["PatAddress", "PAddCountry"],
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
