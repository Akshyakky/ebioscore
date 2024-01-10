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
import { NextOfKinKinFormState } from "../../../../interfaces/PatientAdministration/NextOfKinData";
import PatientInsurancePopup from "../SubPage/PatientInsurance";
import { InsuranceFormState } from "../../../../interfaces/PatientAdministration/InsuranceDetails";
import useRegistrationUtils from "../../../../utils/PatientAdministration/RegistrationUtils";

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
  const [gridNextOfKinData, setGridKinData] = useState<NextOfKinKinFormState[]>(
    []
  );
  const [gridPatientInsuranceData, setGridPatientInsuranceData] = useState<
    InsuranceFormState[]
  >([]);
  const regFormInitialState: RegsitrationFormData = {
    PChartID: 0,
    PChartCode: "",
    PRegDate: new Date().toISOString().split("T")[0],
    PTitleVal: "",
    PTitle: "",
    PFName: "",
    PMName: "",
    PLName: "",
    PDobOrAgeVal: "Y",
    PDobOrAge: "",
    PDob: new Date().toISOString().split("T")[0],
    PAgeType: "",
    PApproxAge: "",
    PGender: "",
    PGenderVal: "",
    PssnID: "",
    PBldGrp: "",
    RCreatedID: userInfo.userID !== null ? userInfo.userID : 0,
    RCreatedBy: userInfo.userName !== null ? userInfo.userName : "",
    RCreatedOn: new Date().toISOString().split("T")[0],
    RModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
    RModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
    RModifiedOn: new Date().toISOString().split("T")[0],
    RActiveYN: "Y",
    RNotes: "",
    CompID: userInfo.compID !== null ? userInfo.compID : 0,
    CompCode: userInfo.compCode !== null ? userInfo.compCode : "",
    CompName: userInfo.compName !== null ? userInfo.compName : "",
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
    RegTypeVal: "GEN",
    RegType: "",
    SourceID: 0,
    SourceName: "",
    PPob: "",
    PatCompName: "",
    PatCompNameVal: "",
    PatDataFormYN: "N",
    IntIdPsprt: "",
    TransferYN: "N",
    OPVisits: {
      VisitTypeVal: "H",
      VisitType: "Hospital",
    },
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
      PageDescriptionVal: "",
      Ethnicity: "",
      PCountryOfOrigin: "",
      CompID: userInfo.compID !== null ? userInfo.compID : 0,
      CompCode: userInfo.compCode !== null ? userInfo.compCode : "",
      CompName: userInfo.compName !== null ? userInfo.compName : "",
      PChartCompID: 0,
      TransferYN: "N",
    },
    PatAddress: {
      PAddID: 0,
      PChartID: 0,
      PChartCode: "",
      PAddType: "",
      PAddMailVal: "N",
      PAddMail: "",
      PAddSMSVal: "N",
      PAddSMS: "",
      PAddEmail: "",
      PAddStreet: "",
      PAddStreet1: "",
      PAddCityVal: "",
      PAddCity: "",
      PAddState: "",
      PAddPostcode: "",
      PAddCountry: "",
      PAddCountryVal: "",
      PAddPhone1: "",
      PAddPhone2: "",
      PAddPhone3: "",
      PAddWorkPhone: "",
      CompID: userInfo.compID !== null ? userInfo.compID : 0,
      CompCode: userInfo.compCode !== null ? userInfo.compCode : "",
      CompName: userInfo.compName !== null ? userInfo.compName : "",
      PAddActualCountryVal: "",
      PAddActualCountry: "",
      PatAreaVal: "",
      PatArea: "",
      PatDoorNo: "",
      PChartCompID: 0,
    },
  };

  const [formData, setFormData] =
    useState<RegsitrationFormData>(regFormInitialState);
  const { fetchLatestUHID, loading } = useRegistrationUtils(token);

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
  const handleSaveKinDetails = (kinDetails: NextOfKinKinFormState) => {
    setGridKinData((prevGridData) => {
      // Check if the kinDetails is new or existing
      const existingIndex = prevGridData.findIndex(
        (kin) => kin.PNokID === kinDetails.PNokID
      );

      if (existingIndex >= 0) {
        // Update the existing entry
        return prevGridData.map((item, index) =>
          index === existingIndex ? kinDetails : item
        );
      } else {
        return [...prevGridData, kinDetails];
      }
    });
    handleCloseKinPopup();
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
      visible: true,
      render: (row: NextOfKinKinFormState) => (
        <Button size="sm" onClick={() => handleEditKin(row)}>
          <FontAwesomeIcon icon={faEdit} />
        </Button>
      ),
    },
    { key: "PNokRegStatus", header: "NOK Type", visible: true },
    {
      key: "PNokFName",
      header: "Name",
      visible: true,
      render: (row: NextOfKinKinFormState) =>
        `${row.PNokFName} ${row.PNokLName}`,
    },
    { key: "PNokRelName", header: "Relationship", visible: true },
    { key: "PNokDob", header: "DOB", visible: true },
    { key: "NokPostCode", header: "Post Code", visible: true },
    {
      key: "Address",
      header: "Address",
      visible: true,
      render: (row: NextOfKinKinFormState) =>
        `${row.PNokStreet} Area : ${row.PNokArea} City :  ${row.PNokCity} Country : ${row.PNokActualCountry} Nationality : ${row.PNokCountryVal}`,
    },
    { key: "PAddPhone1", header: "Mobile", visible: true },
    {
      key: "PNokPssnID",
      header: "Passport Id/No",
      visible: true,
    },
    {
      key: "Nokdelete",
      header: "Delete",
      visible: true,
      render: (row: NextOfKinKinFormState) => (
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDeleteKin(row.PNokID)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      ),
    },
  ];
  const [editingKinData, setEditingKinData] = useState<
    NextOfKinKinFormState | undefined
  >(undefined);
  const handleEditKin = (kin: NextOfKinKinFormState) => {
    setEditingKinData(kin);
    setShowKinPopup(true);
  };
  const gridPatientInsuranceColumns = [
    {
      key: "PInsuredit",
      header: "Edit",
      visible: true,
      render: (row: InsuranceFormState) => (
        <Button size="sm" onClick={() => handleEditPatientInsurance(row)}>
          <FontAwesomeIcon icon={faEdit} />
        </Button>
      ),
    },
    { key: "InsurName", header: "Insurance Name", visible: true },
    { key: "PolicyNumber", header: "Policy Number", visible: true },
    { key: "CoveredFor", header: "Covered For", visible: true },
    { key: "PolicyHolder", header: "Policy Holder", visible: true },
    { key: "GroupNumber", header: "Group Number", visible: true },
    { key: "PolicyStartDt", header: "Start Date", visible: true },
    { key: "PolicyEndDt", header: "End Date", visible: true },
    { key: "Guarantor", header: "Guarantor", visible: true },
    { key: "Relation", header: "Relation", visible: true },
    {
      key: "PInsurdelete",
      header: "Delete",
      visible: true,
      render: (row: InsuranceFormState) => (
        <Button
          size="sm"
          variant="danger"
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
    const updatedGridData = gridNextOfKinData.filter(
      (kin) => kin.PNokID !== id
    );
    setGridKinData(updatedGridData);
  };

  const handleClear = () => {
    setIsSubmitted(false); // Reset the submission state
    setFormErrors({}); // Clear any form errors

    setFormData(regFormInitialState);
    setGridKinData([]);
    setGridPatientInsuranceData([]);

    fetchLatestUHID().then((latestUHID) => {
      if (latestUHID) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          PChartCode: latestUHID,
        }));
      }
    });
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
      const registrationResponse = await RegistrationService.saveRegistration(
        token,
        formData
      );
      alert("Registration saved successfully!");
      // Assuming registrationResponse contains the PChartID
      const pChartID = registrationResponse.pChartID;
      if (pChartID) {
        await handleFinalSaveNokDetails(pChartID);
        await handleFinalSavePatientInsuranceDetails(
          pChartID,
          registrationResponse.PChartCode
        );
      }
      handleClear();
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

  const handleFinalSavePatientInsuranceDetails = async (
    pChartID: number,
    pChartCode: string
  ) => {
    try {
      for (const pInsurance of gridPatientInsuranceData) {
        const pInsuranceData = {
          ...pInsurance,
          PChartID: pChartID,
          PChartCode: pChartCode,
        };
        const pInsuranceResponse =
          await RegistrationService.savePatientInsuranceDetails(
            token,
            pInsuranceData
          );
        console.log(
          "Patient Insurance details saved successfully:",
          pInsuranceResponse
        );
      }
    } catch (error) {
      console.error(
        "An error occurred while saving Patient Insurance details:",
        error
      );
      alert("An error occurred while saving Patient Insurance details.");
    }
  };

  const handleFinalSaveNokDetails = async (pChartID: number) => {
    try {
      for (const nok of gridNextOfKinData) {
        const nokDataWithPChartID = {
          ...nok,
          PChartID: pChartID,
        };

        const nokResponse = await RegistrationService.saveNokDetails(
          token,
          nokDataWithPChartID
        );
        console.log("NOK details saved successfully:", nokResponse);
      }
    } catch (error) {
      console.error("An error occurred while saving NOK details:", error);
      alert("An error occurred while saving NOK details.");
      // Handle the error, maybe set form errors if they come back from the API
    }
  };

  function isApiError(error: unknown): error is ApiError {
    return typeof error === "object" && error !== null && "errors" in error;
  }

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
                <CustomGrid columns={gridKinColumns} data={gridNextOfKinData} />
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
