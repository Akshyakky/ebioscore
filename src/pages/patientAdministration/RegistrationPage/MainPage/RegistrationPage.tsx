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
import { faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";
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
  const [gridKinData, setGridKinData] = useState<Kin[]>([]);
  const [gridPatientInsuranceData, setGridPatientInsuranceData] = useState<
    InsuranceFormState[]
  >([]);

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
    PatCompNameValue: "",
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
      PAddCityValue: "",
      PAddCity: "",
      PAddState: "",
      PAddPostcode: "",
      PAddCountry: "",
      PAddCountryValue: "",
      PAddPhone1: "",
      PAddPhone2: "",
      PAddPhone3: "",
      PAddWorkPhone: "",
      CompCode: "",
      CompID: 0,
      CompName: "",
      PAddActualCountryValue: "",
      PAddActualCountry: "",
      PatAreaValue: "",
      PatArea: "",
      PatDoorNo: "",
      PChartCompID: 0,
    },
  });

  const handleOpenKinPopup = () => {
    setShowKinPopup(true);
    setEditingKinData(undefined);
  };
  const handleCloseKinPopup = () => {
    setShowKinPopup(false);
    setEditingKinData(undefined);
  };
  const handleOpenPInsurancePopup = () => {
    setInsurancePopup(true);
  };
  const handleClosePInsurancePopup = () => {
    setInsurancePopup(false);
  };

  const handleSaveKinDetails = (kinDetails: Kin) => {
    setGridKinData((prevGridData) => {
      const updatedGridData = [...prevGridData];
      const index = updatedGridData.findIndex(
        (kin) => kin.PNokID === kinDetails.PNokID
      );

      if (index !== -1) {
        updatedGridData[index] = kinDetails; // Edit existing
      } else {
        const newId = updatedGridData.length + 1;
        updatedGridData.push({ ...kinDetails, PNokID: newId }); // Add new
      }
      return updatedGridData;
    });
    handleCloseKinPopup(); // Should be inside the state update callback if using functional update form
  };

  const handleSaveInsurance = (insuranceData: InsuranceFormState) => {
    setGridPatientInsuranceData((prevData) => {
      // Check if the insuranceData is new or existing
      const existingIndex = prevData.findIndex(
        (ins) => ins.OPIPInsID === insuranceData.OPIPInsID
      );
      if (existingIndex >= 0) {
        // Replace the existing data
        return prevData.map((ins, index) =>
          index === existingIndex ? insuranceData : ins
        );
      } else {
        // Add new insurance data
        return [...prevData, insuranceData];
      }
    });
    handleClosePInsurancePopup();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    console.log(formData);
  };

  const gridKinColumns = [
    {
      key: "Nokedit",
      header: "Edit",
      render: (row: Kin) => (
        <Button size="sm" onClick={() => handleEditKin(row)}>
          <FontAwesomeIcon icon={faEdit} />
        </Button>
      ),
    },
    { key: "PNokRegYN", header: "NOK Type" },
    {
      key: "PNokFName",
      header: "Name",
      render: (row: Kin) => `${row.PNokFName} ${row.PNokLName}`,
    },
    { key: "PNokRelName", header: "Relationship" },
    { key: "PNokDob", header: "DOB" },
    { key: "NokPostCode", header: "Post Code" },
    {
      key: "Address",
      header: "Address",
      render: (row: Kin) =>
        `${row.NokAddress} Area : ${row.PNokArea} City :  ${row.PNokCity} Country : ${row.PNokActualCountry} Nationality : ${row.PNokCountryValue}`,
    },
    { key: "PAddPhone1", header: "Mobile" },
    { key: "PNokPssnID", header: "Passport Id/No" },
    {
      key: "Nokdelete",
      header: "Delete",
      render: (row: Kin) => (
        <Button size="sm" onClick={() => handleDeleteKin(row.PNokID)}>
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      ),
    },
  ];
  const [editingKinData, setEditingKinData] = useState<Kin | undefined>(
    undefined
  );
  const handleEditKin = (kin: Kin) => {
    setEditingKinData(kin);
    setShowKinPopup(true);
  };
  const gridPatientInsuranceColumns = [
    {
      key: "PInsuredit",
      header: "Edit",
      render: (row: InsuranceFormState) => (
        <Button size="sm" onClick={() => handleEditPatientInsurance(row)}>
          <FontAwesomeIcon icon={faEdit} />
        </Button>
      ),
    },
    { key: "InsurName", header: "Insurance Name" },
    { key: "PolicyNumber", header: "Policy Number" },
    { key: "CoveredFor", header: "Covered For" },
    { key: "PolicyHolder", header: "Policy Holder" },
    { key: "GroupNumber", header: "Group Number" },
    { key: "PolicyStartDate", header: "Start Date" },
    { key: "PolicyEndDate", header: "End Date" },
    { key: "Guarantor", header: "Guarantor" },
    { key: "Relation", header: "Relation" },    {
      key: "PInsurdelete",
      header: "Delete",
      render: (row: InsuranceFormState) => (
        <Button
          size="sm"
          onClick={() => handleDeletePatientInsurance(row.OPIPInsID)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      ),
    },
  ];
  const [editingPatientInsuranceData, setEditingPatientInsuranceData] =
    useState<InsuranceFormState | undefined>(undefined);
  const handleEditPatientInsurance = (PatientInsurance: InsuranceFormState) => {
    setEditingPatientInsuranceData(PatientInsurance);
    setInsurancePopup(true);
  };

  const handleDeletePatientInsurance = (id: number) => {
    const updatedGridData = gridPatientInsuranceData.filter(
      (Insurance) => Insurance.OPIPInsID !== id
    );
    setGridPatientInsuranceData(updatedGridData);
  };

  const handleDeleteKin = (id: number) => {
    const updatedGridData = gridKinData.filter((kin) => kin.PNokID !== id);
    setGridKinData(updatedGridData);
  };

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
            editData={editingKinData}
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
                <CustomGrid columns={gridKinColumns} data={gridKinData} />
              </Col>
            </Row>
          </section>

          <PatientInsurancePopup
            show={showInsurancePopup}
            handleClose={handleClosePInsurancePopup}
            handleSave={handleSaveInsurance}
            editData={editingPatientInsuranceData}
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
                <CustomGrid
                  columns={gridPatientInsuranceColumns}
                  data={gridPatientInsuranceData}
                />
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
