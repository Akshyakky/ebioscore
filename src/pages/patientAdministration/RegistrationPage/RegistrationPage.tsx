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
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import CustomGrid from "../../../components/CustomGrid/CustomGrid";
import FixedButton from "../../../components/Button/Button";
import "./RegistrationPage.css";
import { RegistrationService } from "../../../services/RegistrationService/RegistrationService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/reducers";
import PersonalDetails from "./PersonalDetails";
import ContactDetails from "./ContactDetails";
import VisitDetails from "./VisitDetails";
import MembershipScheme from "./MembershipScheme";
import { RegsitrationFormData } from "../../../types/registrationFormData";

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

  const [formData, setFormData] = useState<RegsitrationFormData>({
    UHID: "",
    regDate: new Date().toISOString().split("T")[0],
    pic: { value: "", label: "" },
    mobileNo: "",
    title: { value: "", label: "" },
    firstName: "",
    lastName: "",
    idNo: "",
    gender: { value: "", label: "" },
    ageOrDob: "DOB",
    ageUnit: "years",
    age: 0,
    dob: "",
    passportID: "",
    nationality: { value: "0", label: "" },
    address: "",
    area: { value: "0", label: "" },
    city: { value: "0", label: "" },
    country: { value: "0", label: "" },
    postCode: "",
    email: "",
    company: { value: "0", label: "" },
    smsYN: "no",
    emailYN: "no",
    visitType: "H",
    department: { value: "0", label: "" },
    attendingPhy: { value: "0", label: "" },
    primaryIntroducingSource: { value: "0", label: "" },
    membershipScheme: { value: "0", label: "" },
    membershipExpiryDate: "",
    nextOfKin: [
      {
        NokRegisterYN: "",
        NoKName: "",
        NokRelationShipID: 0,
        NokRelationShip: "",
        NokDOB: "",
      },
    ],
    insuranceDetails: [{ InsuranceID: 0, InsuranceName: "" }],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };
  const handleDropdownChange =
    (
      name: keyof RegsitrationFormData,
      options: { value: string; label: string }[]
    ) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  const gridColumns = [
    { key: "name", header: "Name" },
    { key: "relationship", header: "Relationship" },
    { key: "dob", header: "DOB" },
    { key: "postCode", header: "Post Code" },
    { key: "address", header: "Address" },
    { key: "mobile", header: "Mobile" },
    { key: "city", header: "City" },
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
        setFormData((prevFormData) => ({
          ...prevFormData,
          UHID: latestUHID,
        }));
      } catch (error) {
        // Handle the error as needed, possibly updating the UI to inform the user
      }
    };

    if (token) {
      fetchLatestUHID();
    }
  }, [token, setFormData]); // If formData is a state variable, setFormData is stable and won't change, so it's safe to add here

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
          <PersonalDetails
            formData={formData}
            setFormData={setFormData}
            handleDropdownChange={handleDropdownChange}
          />
          {/* Contact Details */}
          <ContactDetails
            formData={formData}
            setFormData={setFormData}
            handleDropdownChange={handleDropdownChange}
          />
          <VisitDetails
            formData={formData}
            setFormData={setFormData}
            handleDropdownChange={handleDropdownChange}
          />
          <MembershipScheme
            formData={formData}
            setFormData={setFormData}
            handleDropdownChange={handleDropdownChange}
          />
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
