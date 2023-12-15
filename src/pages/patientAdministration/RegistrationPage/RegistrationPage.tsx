import React, { useState, useEffect } from "react";
import {
  faPrint,
  faFileExcel,
  faSearch,
  faRedo,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  ButtonGroup,
} from "react-bootstrap";
import TextBox from "../../../components/TextBox/TextBox ";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import RadioGroup from "../../../components/RadioGroup/RadioGroup";
import CustomGrid from "../../../components/CustomGrid/CustomGrid";
import FixedButton from "../../../components/Button/Button";
import "./RegistrationPage.css";
import { RegistrationService } from "../../../services/RegistrationService/RegistrationService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/reducers";

interface Kin {
  id: number;
  name: string;
  relationship: string;
  dob: string;
  postCode: string;
  address: string;
  mobile: string;
  city: string;
}

const RegistrationPage: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState("");
  const [ageOrDob, setAgeOrDob] = useState("DOB");
  const [ageUnit, setAgeUnit] = useState("years");
  const [receiveSMS, setReceiveSMS] = useState("no");
  const [receiveEmail, setReceiveEmail] = useState("no");
  const [visitTypes, setVisitTypes] = useState("H");
  const [UHID, setUHID] = useState<string>("");
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const [gridData, setGridData] = useState<Kin[]>([
    {
      id: 1,
      name: "Jane Doe",
      relationship: "Sister",
      dob: "03-06-1997",
      postCode: "12345",
      address: "123 Main St",
      mobile: "555-1234",
      city: "Anytown",
    },
    // ... more kin objects
  ]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    ageOrDob: "",
    age: 0,
    dob: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgeOrDob(e.target.value);
  };
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
  };
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    // Add more options as needed
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

  const smsOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const emailOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const visitOptions = [
    { value: "H", label: "Hospital" },
    { value: "P", label: "Physician" },
    { value: "N", label: "None" },
  ];

  const gridColumns = [
    { key: "name", header: "Name" },
    { key: "relationship", header: "Relationship" },
    { key: "dob", header: "DOB" },
    { key: "postCode", header: "Post Code" },
    { key: "address", header: "Address" },
    { key: "mobile", header: "Mobile" },
    { key: "city", header: "City" },
    // ... other column definitions as needed
  ];
  const handleClear = () => {
    // Clear form logic
  };

  const handleSave = () => {
    // Save form logic
  };

  useEffect(() => {
    const fetchLatestUHID = async () => {
      try {
        const latestUHID = await RegistrationService.getLatestUHID(
          token,
          "GetLatestUHID"
        );
        setUHID(latestUHID);
      } catch (error) {
        // Handle the error as needed, possibly updating the UI to inform the user
      }
    };

    if (token) {
      fetchLatestUHID();
    }
  }, [token]); // Run the effect when the token changes

  return (
    <MainLayout>
      <Container fluid>
        <Row className="mb-1">
          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <ButtonGroup>
              <Button variant="dark" size="sm" className="">
                <FontAwesomeIcon icon={faSearch} /> Advanced Search
              </Button>
              <Button variant="dark" size="sm" className="">
                <FontAwesomeIcon icon={faRedo} /> Reprint
              </Button>
              <Button variant="dark" size="sm" className="">
                <FontAwesomeIcon icon={faFileExcel} /> Export to Excel
              </Button>
              <Button variant="dark" size="sm" className="">
                <FontAwesomeIcon icon={faPrint} /> Print Form
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
        <Form onSubmit={handleSubmit}>
          {/* Personal Details */}
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
                  onChange={(e) => setUHID(e.target.value)}
                  value={UHID}
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <TextBox
                  ControlID="RegDate"
                  title="Registration Date"
                  type="date"
                  size="sm"
                  placeholder="Reg Date"
                  value=""
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <DropdownSelect
                  label="Payment Source [PIC]"
                  name="PIC"
                  value={selectedValue}
                  options={options}
                  onChange={handleDropdownChange}
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
                  value=""
                />
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <DropdownSelect
                  label="Title"
                  name="Title"
                  value={selectedValue}
                  options={options}
                  onChange={handleDropdownChange}
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
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <TextBox
                  ControlID="LastName"
                  title="Last Name"
                  type="text"
                  size="sm"
                  placeholder="Last Name"
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <TextBox
                  ControlID="AadhaarNo"
                  title="Aadhaar No"
                  type="text"
                  size="sm"
                  placeholder="Aadhaar No"
                />
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <DropdownSelect
                  label="Gender"
                  name="Gender"
                  value={selectedValue}
                  options={options}
                  onChange={handleDropdownChange}
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
                      selectedValue={ageOrDob}
                      onChange={handleRadioChange}
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
                    {ageOrDob === "Age" ? (
                      <>
                        <TextBox
                          ControlID="Age"
                          title="Age"
                          type="number"
                          size="sm"
                          placeholder="Enter age"
                          value={formData.age.toString()} // Assuming 'age' is part of your formData state
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
                          value={ageUnit}
                          options={ageUnitOptions}
                          onChange={(e) => setAgeUnit(e.target.value)}
                          size="sm"
                        />
                      </>
                    ) : (
                      <TextBox
                        ControlID="DOB"
                        title="Date of Birth"
                        type="date"
                        size="sm"
                        value={formData.dob} // Assuming 'dob' is part of your formData state
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
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <DropdownSelect
                  label="Nationality"
                  name="myDropdown"
                  value={selectedValue}
                  options={options}
                  onChange={handleDropdownChange}
                  size="sm"
                />
              </Col>
            </Row>
          </section>
          {/* Contact Details */}
          <section aria-labelledby="contact-details-header">
            <Row>
              <Col>
                <h1 id="contact-details-header" className="section-header">
                  Contact Details
                </h1>
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <TextBox
                  ControlID="Address"
                  title="Address"
                  type="text"
                  size="sm"
                  placeholder="Address"
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <DropdownSelect
                  label="Area"
                  name="Area"
                  value={selectedValue}
                  options={options}
                  onChange={handleDropdownChange}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <DropdownSelect
                  label="City"
                  name="City"
                  value={selectedValue}
                  options={options}
                  onChange={handleDropdownChange}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <DropdownSelect
                  label="Country"
                  name="Country"
                  value={selectedValue}
                  options={options}
                  onChange={handleDropdownChange}
                  size="sm"
                />
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <TextBox
                  ControlID="PostCode"
                  title="Post Code"
                  type="text"
                  size="sm"
                  placeholder="Post Code"
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <TextBox
                  ControlID="Email"
                  title="Email"
                  type="email"
                  size="sm"
                  placeholder="Email"
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <DropdownSelect
                  label="Company"
                  name="Company"
                  value={selectedValue}
                  options={options}
                  onChange={handleDropdownChange}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <Row>
                  <Col xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                    <RadioGroup
                      name="receiveSMS"
                      label="Receive SMS"
                      options={smsOptions}
                      selectedValue={receiveSMS}
                      onChange={(e) => setReceiveSMS(e.target.value)}
                      inline={true}
                    />
                  </Col>
                  <Col xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                    <RadioGroup
                      name="receiveEmail"
                      label="Receive Email"
                      options={emailOptions}
                      selectedValue={receiveEmail}
                      onChange={(e) => setReceiveEmail(e.target.value)}
                      inline={true}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </section>
          <section aria-labelledby="visit-details-header">
            <Row>
              <Col>
                <h1 id="visit-details-header" className="section-header">
                  Visit Details
                </h1>
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <RadioGroup
                  name="visitDetails"
                  label="Visit To"
                  options={visitOptions}
                  selectedValue={visitTypes}
                  onChange={(e) => setVisitTypes(e.target.value)}
                  inline={true}
                />
              </Col>
              {visitTypes === "H" && (
                <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                  <DropdownSelect
                    label="Department"
                    name="Department"
                    value={selectedValue}
                    options={options}
                    onChange={handleDropdownChange}
                    size="sm"
                  />
                </Col>
              )}
              {visitTypes === "P" && (
                <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                  <DropdownSelect
                    name="AttendingPhysician"
                    label="Attending Physician"
                    value={selectedValue}
                    options={options}
                    onChange={handleDropdownChange}
                    size="sm"
                  />
                </Col>
              )}
              {(visitTypes === "P" || visitTypes === "H") && (
                <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                  <DropdownSelect
                    name="PrimaryIntroducingSource"
                    label="Primary Introducing Source"
                    value={selectedValue}
                    options={options}
                    onChange={handleDropdownChange}
                    size="sm"
                  />
                </Col>
              )}
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}></Col>
            </Row>
          </section>
          <section aria-labelledby="membership-scheme-header">
            <Row>
              <Col>
                <h1 id="membership-scheme-header" className="section-header">
                  Membership Scheme
                </h1>
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <DropdownSelect
                  name="MembershipScheme"
                  label="Membership Scheme"
                  value={selectedValue}
                  options={options}
                  onChange={handleDropdownChange}
                  size="sm"
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}>
                <TextBox
                  ControlID="MembeshipExpDate"
                  title="Membership Expiry Date"
                  type="date"
                  size="sm"
                  placeholder="Membership Expiry Date"
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}></Col>
              <Col xs={12} sm={6} md={6} lg={3} xl={3} xxl={3}></Col>
            </Row>
          </section>
          <section aria-labelledby="NOK-header">
            <Row>
              <Col>
                <h1 id="NOK-header" className="section-header">
                  Next Of Kin
                </h1>
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <CustomGrid columns={gridColumns} data={gridData} />
              </Col>
            </Row>
          </section>
          <section aria-labelledby="NOK-header">
            <Row>
              <Col>
                <h1 id="insurance-details-header" className="section-header">
                  Insurance Details
                </h1>
              </Col>
            </Row>
            <Row className="justify-content-between">
              <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <CustomGrid columns={gridColumns} data={gridData} />
              </Col>
            </Row>
          </section>
        </Form>
      </Container>
      <FixedButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={faTrash}
        saveIcon={faSave}
      />
    </MainLayout>
  );
};
export default RegistrationPage;
