import { Row, Col } from "react-bootstrap";
import TextBox from "../../../components/TextBox/TextBox ";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../components/RadioGroup/RadioGroup";
import { RegsitrationFormData } from "../../../types/registrationFormData";

interface PersonalDetailsProps {
  formData: RegsitrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegsitrationFormData>>;
  handleDropdownChange: (
    name: keyof RegsitrationFormData,
    options: { value: string; label: string }[]
  ) => (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  formData,
  setFormData,
}) => {
  const handleDropdownChange =
    (
      name: keyof RegsitrationFormData,
      options: { value: string; label: string }[]
    ) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      // Find the option that matches the event target value
      const selectedOption = options.find(
        (option) => option.value === e.target.value
      );

      if (selectedOption) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: {
            value: selectedOption.value,
            label: selectedOption.label,
          },
        }));
      }
    };
  const handleRadioButtonChange =
    (name: keyof RegsitrationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: e.target.value,
      }));
    };

  const picValues = [
    { value: "1", label: "PIC 1" },
    { value: "2", label: "PIC 2" },
    { value: "3", label: "PIC 3" },
  ];
  const titleValues = [
    { value: "Mr", label: "Title 1" },
    { value: "Mrs", label: "Title 2" },
    { value: "Miss", label: "Title 3" },
  ];
  const genderValues = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER", label: "Other" },
  ];
  const radioOptions = [
    { value: "Age", label: "Age" },
    { value: "DOB", label: "DOB" },
  ];
  const ageUnitOptions = [
    { value: "years", label: "Years" },
    { value: "months", label: "Months" },
    { value: "days", label: "Days" },
  ];
  const nationalityValues = [
    { value: "1", label: "India" },
    { value: "2", label: "America" },
    { value: "3", label: "Australia" },
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
            value={formData.UHID}
            onChange={(e) => setFormData({ ...formData, UHID: e.target.value })}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
            ControlID="RegDate"
            title="Registration Date"
            type="date"
            size="sm"
            placeholder="Reg Date"
            value={formData.regDate}
            onChange={(e) =>
              setFormData({ ...formData, regDate: e.target.value })
            }
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Payment Source [PIC]"
            name="PIC"
            value={formData.pic.value}
            options={picValues}
            onChange={handleDropdownChange("pic", picValues)}
            size="sm"
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
            ControlID="MobileNo"
            title="Mobile No"
            type="text"
            size="sm"
            placeholder="Mobile No"
            value={formData.mobileNo}
            onChange={(e) =>
              setFormData({ ...formData, mobileNo: e.target.value })
            }
            maxLength={20}
          />
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Title"
            name="Title"
            value={formData.title.value}
            options={titleValues}
            onChange={handleDropdownChange("title", titleValues)}
            size="sm"
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
              setFormData({ ...formData, firstName: e.target.value })
            }
            value={formData.firstName}
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
              setFormData({ ...formData, lastName: e.target.value })
            }
            value={formData.lastName}
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <TextBox
            ControlID="AadhaarNo"
            title="Aadhaar No"
            type="text"
            size="sm"
            placeholder="Aadhaar No"
            onChange={(e) => setFormData({ ...formData, idNo: e.target.value })}
            value={formData.idNo}
          />
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Gender"
            name="Gender"
            value={formData.gender.value}
            options={genderValues}
            onChange={handleDropdownChange("gender", genderValues)}
            size="sm"
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
                selectedValue={formData.ageOrDob}
                onChange={handleRadioButtonChange("ageOrDob")}
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
              {formData.ageOrDob === "Age" ? (
                <>
                  <TextBox
                    ControlID="Age"
                    title="Age"
                    type="number"
                    size="sm"
                    placeholder="Enter age"
                    value={formData.age.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        age: parseInt(e.target.value),
                      })
                    }
                  />
                  <DropdownSelect
                    label="Age Unit"
                    name="AgeUnit"
                    value={formData.ageUnit}
                    options={ageUnitOptions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ageUnit: e.target.value,
                      })
                    }
                    size="sm"
                  />
                </>
              ) : (
                <TextBox
                  ControlID="DOB"
                  title="Date of Birth"
                  type="date"
                  size="sm"
                  value={formData.dob}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
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
            value={formData.passportID}
            onChange={(e) =>
              setFormData({ ...formData, passportID: e.target.value })
            }
          />
        </Col>
        <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
          <DropdownSelect
            label="Nationality"
            name="Nationality"
            value={formData.nationality.value}
            options={nationalityValues}
            onChange={handleDropdownChange("nationality", nationalityValues)}
            size="sm"
          />
        </Col>
      </Row>
    </section>
  );
};

export default PersonalDetails;
