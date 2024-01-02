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
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  ButtonGroup,
} from "react-bootstrap";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import FixedButton from "../../../../components/Button/Button";
import "./RegistrationPage.css";
import { RegistrationService } from "../../../../services/RegistrationService/RegistrationService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import PersonalDetails from "../SubPage/PersonalDetails";
import ContactDetails from "../SubPage/ContactDetails";
import VisitDetails from "../SubPage/VisitDetails";
import MembershipScheme from "../SubPage/MembershipScheme";
import { RegsitrationFormData } from "../../../../interfaces/PatientAdministration/registrationFormData";
import { ApiError } from "../../../../interfaces/Common/ApiError";
import { useLoading } from "../../../../context/LoadingContext";
import NextOfKinPopup from "../SubPage/NextOfKin";
import { Kin } from "../../../../interfaces/PatientAdministration/NextOfKinData";
import PatientInsurancePopup from "../SubPage/PatientInsurance";
import { InsuranceFormState } from "../../../../interfaces/PatientAdministration/InsuranceDetails";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  // ... other fields as needed
}

const RegistrationPage: React.FC = () => {
  const [showKinPopup, setShowKinPopup] = useState(false);
  const [showInsurancePopup, setInsurancePopup] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { setLoading } = useLoading();
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
      patientType: "Registered",
      NokFName: "",
      NokLName: "",
      NokBirthDate: "",
      NokAddress: "",
      NokArea: "",
      NokCity: "",
      NokCountry: "",
      PAddPhone1: "",
      NokPostCode: "",
      NokNationality: "",
      PNokPssnID: "",
      PAddPhone2: "",
      PAddPhone3: "",
    },
    // ... more kin objects
  ]);

  const [formData, setFormData] = useState<RegsitrationFormData>({
    PChartID: 0,
    PChartCode: "",
    PRegDate: new Date().toISOString().split("T")[0],
    PTitleValue: "",
    PTitle: "",
    PFName: "",
    PMName: "",
    PLName: "",
    PDob: new Date().toISOString().split("T")[0],
    DobYN: "Y",
    PAgeType: "",
    PApproxAge: "",
    PGender: "",
    PGenderValue: "",
    PssnID: "",
    PBldGrp: "",
    RCreatedID: 0,
    RCreatedBy: "",
    RCreatedOn: new Date().toISOString().split("T")[0],
    RModifiedID: 0,
    RModifiedBy: "",
    RModifiedOn: new Date().toISOString().split("T")[0],
    RActiveYN: "N",
    RNote: "H",
    CompID: 0,
    CompCode: "",
    CompName: "",
    PFhName: "",
    PTypeID: 0,
    PTypeCode: "",
    PTypeName: "",
    FatherBldGrp: "",
    SapID: "",
    PatMemID: 0,
    PatMemName: "",
    PatMemDescription: "",
    PatMemSchemeExpiryDate: new Date().toISOString().split("T")[0],
    PatSchemeExpiryDateYN: "N",
    PatSchemeDescriptionYN: "N",
    CancelReason: "",
    CancelYN: "N",
    ConsultantID: 0,
    ConsultantName: "",
    DeptID: 0,
    DeptName: "",
    FacultyID: 0,
    Faculty: "",
    LangType: "",
    PChartCompID: 0,
    PExpiryDate: new Date().toISOString().split("T")[0],
    PhysicianRoom: "",
    RegTypeValue: "",
    RegType: "",
    SourceID: 0,
    SourceName: "",
    PPob: "",
    PatCompName: "",
    PatDataFormYN: "N",
    IntIdPsprt: "",
    TransferYN: "N",
    PatOverview: {
      PatOverID: 0,
      PChartID: 0,
      PChartCode: "",
      PPhoto: "",
      PMaritalStatus: "",
      PReligion: "",
      PEducation: "",
      POccupation: "",
      PEmployer: "",
      PAgeNumber: 0,
      PageDescription: "",
      PageDescriptionValue: "",
      Ethnicity: "",
      PCountryOfOrigin: "",
      CompCode: "",
      CompID: 0,
      CompName: "",
      PChartCompID: 0,
      TransferYN: "N",
    },
    PatAddress: {
      PAddID: 0,
      PChartID: 0,
      PChartCode: "",
      PAddType: "",
      PAddMailYN: "N",
      PAddSMSYN: "N",
      PAddEmail: "",
      PAddStreet: "",
      PAddStreet1: "",
      PAddCity: "",
      PAddState: "",
      PAddPostcode: "",
      PAddCountry: "",
      PAddPhone1: "",
      PAddPhone2: "",
      PAddPhone3: "",
      PAddWorkPhone: "",
      CompCode: "",
      CompID: 0,
      CompName: "",
      PAddActualCountry: "",
      PatArea: "",
      PatDoorNo: "",
      PChartCompID: 0,
    },
  });

  const handleOpenKinPopup = () => {
    setShowKinPopup(true);
  };
  const handleCloseKinPopup = () => {
    setShowKinPopup(false);
  };
  const handleOpenPInsurancePopup = () => {
    setInsurancePopup(true);
  };
  const handleClosePInsurancePopup = () => {
    setInsurancePopup(false);
  };

  const handleSaveKinDetails = (kinDetails: Kin) => {
    // If id is undefined, assign a new id
    const newId = kinDetails.id ?? gridData.length + 1;

    const newKin: Kin = {
      ...kinDetails,
      id: newId,
    };

    setGridData([...gridData, newKin]);
  };

  const handleSaveInsurance = (insuranceData: InsuranceFormState) => {
    // Process the insurance data
    console.log(insuranceData);
    handleClosePInsurancePopup();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    console.log(formData);
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
    window.location.reload();
  };
  const validateFormData = () => {
    const errors: FormErrors = {};
    // Check each mandatory field
    if (!formData.PFName.trim()) {
      errors.firstName = "First Name is required.";
    }
    // ... add similar checks for other mandatory fields ...

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };
  const handleSave = async () => {
    setIsSubmitted(true);
    setLoading(true);
    try {
      const isFormValid = validateFormData();
      if (!isFormValid) {
        console.log("Validation failed. Please fill all mandatory fields.");
        return; // Stop the function if validation fails
      }
      // Call the saveRegistration method from the service
      const response = await RegistrationService.saveRegistration(
        token,
        formData
      );

      // Handle the response as needed
      console.log("Registration saved successfully:", response);
      alert("Registration saved successfully!");

      // Additional logic after successful save (e.g., clear form, navigate to another page)
    } catch (error) {
      if (isApiError(error)) {
        // Now TypeScript knows error is of type ApiError
        console.error("Validation errors:", error.errors);
        // Set the validation errors in your state, etc.
        setFormErrors(error.errors);
      } else {
        // General error handling
        console.error(
          "An error occurred while saving the registration:",
          error
        );
        alert("An error occurred while saving the registration.");
      }
    } finally {
      setLoading(false); // Stop loading regardless of the outcome
    }
  };

  function isApiError(error: unknown): error is ApiError {
    return typeof error === "object" && error !== null && "errors" in error;
  }

  useEffect(() => {
    const fetchLatestUHID = async () => {
      setLoading(true);
      try {
        const latestUHID = await RegistrationService.getLatestUHID(
          token,
          "GetLatestUHID"
        );
        setFormData((prevFormData) => ({
          ...prevFormData,
          PChartCode: latestUHID,
        }));
      } catch (error) {
        // Handle the error as needed, possibly updating the UI to inform the user
      } finally {
        setLoading(false); // Stop loading regardless of the outcome
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
            isSubmitted={isSubmitted}
            formErrors={formErrors}
          />
          {/* Contact Details */}
          <ContactDetails
            formData={formData}
            setFormData={setFormData}
            isSubmitted={isSubmitted}
          />
          <VisitDetails
            formData={formData}
            setFormData={setFormData}
            isSubmitted={isSubmitted}
          />
          <MembershipScheme formData={formData} setFormData={setFormData} />

          <NextOfKinPopup
            show={showKinPopup}
            handleClose={handleCloseKinPopup}
            handleSave={handleSaveKinDetails}
          />

          <section aria-labelledby="NOK-header">
            <Row>
              <Col>
                <h1 id="NOK-header" className="section-header">
                  <Button
                    variant="dark border"
                    size="sm"
                    onClick={handleOpenKinPopup}
                    title="Add Next Of Kin"
                    style={{ marginRight: "8px" }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
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

          <PatientInsurancePopup
            show={showInsurancePopup}
            handleClose={handleClosePInsurancePopup}
            handleSave={handleSaveInsurance}
          />

          <section aria-labelledby="NOK-header">
            <Row>
              <Col>
                <h1 id="insurance-details-header" className="section-header">
                  <Button
                    variant="dark border"
                    size="sm"
                    style={{ marginRight: "8px" }}
                    onClick={handleOpenPInsurancePopup}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
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
