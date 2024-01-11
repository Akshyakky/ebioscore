import React, { useState } from "react";
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
    window.scrollTo(0, 0);
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
  const handlePatientSelect = (selectedSuggestion: string) => {
    setLoading(true);
    try {
      const pChartID = extractPChartID(selectedSuggestion);
      if (pChartID) {
        // Fetch patient details and update form
        fetchPatientDetailsAndUpdateForm(pChartID);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const fetchPatientDetailsAndUpdateForm = async (pChartID: number) => {
    setLoading(true);
    try {
      const patientDetails = await RegistrationService.getPatientDetails(
        token,
        pChartID
      );
      if (patientDetails.success) {
        //Pass only the 'data' part to setFormData
        //setFormData(patientDetails.data);
        const transformedData = transformDataToMatchFormDataStructure(
          patientDetails.data
        );
        setFormData(transformedData);

        await fetchAdditionalPatientDetails(pChartID);
      } else {
        // Handle the case where fetching patient details is not successful
        console.error("Fetching patient details was not successful");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // Function to extract PChartID from PChartCode
  const extractPChartID = (pChartCode: string) => {
    const regex = /(\d+)/; // Regular expression to extract number
    const matches = pChartCode.match(regex);
    return matches ? parseInt(matches[0]) : null;
  };
  const fetchAdditionalPatientDetails = async (pChartID: number) => {
    setLoading(true);
    try {
      const nokDetails = await RegistrationService.getPatNokDetails(
        token,
        pChartID
      );
      if (nokDetails.success) {
        const transfermedData = transformDataToMatchNOKDataStructure(
          nokDetails.data
        );
        setGridKinData(transfermedData);
      }

      const insuranceDetails =
        await RegistrationService.getPatientInsuranceDetails(token, pChartID);
      if (insuranceDetails.success) {
        const transfermedData = transformDataToMatchInsuranceDataStructure(
          insuranceDetails.data
        );
        setGridPatientInsuranceData(transfermedData);
      }
    } catch (error) {
      console.error("Error fetching additional patient details:", error);
    } finally {
      setLoading(false);
    }
  };
  const transformDataToMatchInsuranceDataStructure = (
    data: any[]
  ): InsuranceFormState[] => {
    return data.map((ins) => ({
      OPIPInsID: ins.opipInsID,
      PChartID: ins.pChartID,
      InsurID: ins.insurID,
      InsurCode: ins.insurCode,
      InsurName: ins.insurName,
      PolicyNumber: ins.policyNumber,
      PolicyHolder: ins.policyHolder,
      GroupNumber: ins.groupNumber,
      PolicyStartDt: ins.policyStartDt.split("T")[0],
      PolicyEndDt: ins.policyEndDt.split("T")[0],
      Guarantor: ins.guarantor,
      RelationVal: ins.relationVal,
      Relation: ins.relation,
      Address1: ins.address1,
      Address2: ins.address2,
      Phone1: ins.phone1,
      Phone2: ins.phone2,
      RActiveYN: ins.rActiveYN,
      RCreatedID: ins.rCreatedID,
      RCreatedBy: ins.rCreatedBy,
      RCreatedOn: ins.rCreatedOn.split("T")[0],
      RModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
      RModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
      RModifiedOn: new Date().toISOString().split("T")[0],
      RNotes: ins.rNotes,
      CompID: userInfo.compID !== null ? userInfo.compID : 0,
      CompCode: userInfo.compCode !== null ? userInfo.compCode : "",
      CompName: userInfo.compName !== null ? userInfo.compName : "",
      InsurStatusCode: ins.insurStatusCode,
      InsurStatusName: ins.insurStatusName,
      PChartCode: ins.pChartCode,
      PChartCompID: ins.pChartCompID,
      ReferenceNo: ins.referenceNo,
      TransferYN: ins.transferYN,
      CoveredVal: ins.coveredVal,
      CoveredFor: ins.coveredFor,
    }));
  };
  const transformDataToMatchNOKDataStructure = (
    data: any[]
  ): NextOfKinKinFormState[] => {
    return data.map((nok) => ({
      PNokID: nok.pNokID,
      PChartID: nok.pChartID,
      PNokPChartID: nok.pNokPChartID,
      PNokRegStatusVal: nok.pNokRegStatusVal,
      PNokRegStatus: nok.pNokRegStatus,
      PNokPssnID: nok.pNokPssnID,
      PNokDob: nok.pNokDob.split("T")[0],
      PNokRelNameVal: nok.pNokRelNameVal,
      PNokRelName: nok.pNokRelName,
      PNokTitleVal: nok.pNokTitleVal,
      PNokTitle: nok.pNokTitle,
      PNokFName: nok.pNokFName,
      PNokMName: nok.pNokMName,
      PNokLName: nok.pNokLName,
      PNokActualCountryVal: nok.pNokActualCountryVal,
      PNokActualCountry: nok.pNokActualCountry,
      PNokAreaVal: nok.pNokAreaVal,
      PNokArea: nok.pNokArea,
      PNokCityVal: nok.pNokCityVal,
      PNokCity: nok.pNokCity,
      PNokCountryVal: nok.pNokCountryVal,
      PNokCountry: nok.pNokCountry,
      PNokDoorNo: nok.pNokDoorNo,
      PAddPhone1: nok.pAddPhone1,
      PAddPhone2: nok.pAddPhone2,
      PAddPhone3: nok.pAddPhone3,
      PNokPostcode: nok.pNokPostcode,
      PNokState: nok.pNokState,
      PNokStreet: nok.pNokStreet,
      RActiveYN: nok.rActiveYN,
      RCreatedID: nok.rCreatedID,
      RCreatedBy: nok.rCreatedBy,
      RCreatedOn: nok.rCreatedOn.split("T")[0],
      RModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
      RModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
      RModifiedOn: new Date().toISOString().split("T")[0],
    }));
  };
  const transformDataToMatchFormDataStructure = (data: any) => {
    // Transform the data from the backend to match the frontend form state structure.
    // Example:
    return {
      //...data, // This will take care of all matching field names
      PChartID: data.pChartID,
      PChartCode: data.pChartCode,
      PRegDate: data.pRegDate.split("T")[0],
      PTitleVal: data.pTitleVal,
      PTitle: data.pTitle,
      PFName: data.pfName,
      PMName: data.pmName,
      PLName: data.plName,
      PDobOrAgeVal: data.pDobOrAgeVal,
      PDobOrAge: data.pDobOrAge,
      PDob: data.pDob.split("T")[0],
      PAgeType: data.pAgeType,
      PApproxAge: data.pApproxAge,
      PGender: data.pGender,
      PGenderVal: data.pGenderVal,
      PssnID: data.pssnID,
      PBldGrp: data.pBldGrp,
      RCreatedID: data.rCreatedID,
      RCreatedBy: data.rCreatedBy,
      RCreatedOn: data.rCreatedOn,
      RModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
      RModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
      RModifiedOn: new Date().toISOString().split("T")[0],
      RActiveYN: data.rActiveYN,
      RNotes: data.rNotes,
      CompID: data.compID,
      CompCode: data.compCode,
      CompName: data.compName,
      PFhName: data.pFhName,
      PTypeID: data.pTypeID,
      PTypeCode: data.pTypeCode,
      PTypeName: data.pTypeName,
      FatherBldGrp: data.fatherBldGrp,
      SapID: data.sapID,
      PatMemID: data.patMemID,
      PatMemName: data.patMemName,
      PatMemDescription: data.patMemDescription,
      PatMemSchemeExpiryDate: data.patMemSchemeExpiryDate,
      PatSchemeExpiryDateYN: data.patSchemeExpiryDateYN,
      PatSchemeDescriptionYN: data.patSchemeDescriptionYN,
      CancelReason: data.cancelReason,
      CancelYN: data.cancelYN,
      ConsultantID: data.consultantID,
      ConsultantName: data.consultantName,
      DeptID: data.deptID,
      DeptName: data.deptName,
      FacultyID: data.facultyID,
      Faculty: data.faculty,
      LangType: data.langType,
      PChartCompID: data.pChartCompID,
      PExpiryDate: data.pExpiryDate,
      PhysicianRoom: data.physicianRoom,
      RegTypeVal: data.regTypeVal,
      RegType: data.regType,
      SourceID: data.sourceID,
      SourceName: data.sourceName,
      PPob: data.pPob,
      PatCompName: data.patCompName,
      PatCompNameVal: data.patCompNameVal,
      PatDataFormYN: data.patDataFormYN,
      IntIdPsprt: data.intIdPsprt,
      TransferYN: data.transferYN,
      PatOverview: data.PatOverview || {
        PatOverID: data.patOverID,
        PChartID: data.pChartID,
        PChartCode: data.pChartCode,
        PPhoto: data.pPhoto,
        PMaritalStatus: data.pMaritalStatus,
        PReligion: data.pReligion,
        PEducation: data.pEducation,
        POccupation: data.pOccupation,
        PEmployer: data.pEmployer,
        PAgeNumber: data.pAgeNumber,
        PageDescription: data.pageDescription,
        PageDescriptionVal: data.pageDescriptionVal,
        Ethnicity: data.ethnicity,
        PCountryOfOrigin: data.pCountryOfOrigin,
        CompID: data.compID,
        CompCode: data.compCode,
        CompName: data.compName,
        PChartCompID: data.pChartCompID,
        TransferYN: data.transferYN,
      },
      PatAddress: data.PatAddress || {
        PAddID: data.patAddress.pAddID,
        PChartID: data.patAddress.pChartID,
        PChartCode: data.patAddress.pChartCode,
        PAddType: data.patAddress.pAddType,
        PAddMailVal: data.patAddress.pAddMailVal,
        PAddMail: data.patAddress.pAddMail,
        PAddSMSVal: data.patAddress.pAddSMSVal,
        PAddSMS: data.patAddress.pAddSMS,
        PAddEmail: data.patAddress.pAddEmail,
        PAddStreet: data.patAddress.pAddStreet,
        PAddStreet1: data.patAddress.pAddStreet1,
        PAddCityVal: data.patAddress.pAddCityVal,
        PAddCity: data.patAddress.pAddCity,
        PAddState: data.patAddress.pAddState,
        PAddPostcode: data.patAddress.pAddPostcode,
        PAddCountry: data.patAddress.pAddCountry,
        PAddCountryVal: data.patAddress.pAddCountryVal,
        PAddPhone1: data.patAddress.pAddPhone1,
        PAddPhone2: data.patAddress.pAddPhone2,
        PAddPhone3: data.patAddress.pAddPhone3,
        PAddWorkPhone: data.patAddress.pAddWorkPhone,
        CompID: data.patAddress.compID,
        CompCode: data.patAddress.compCode,
        CompName: data.patAddress.compName,
        PAddActualCountryVal: data.patAddress.pAddActualCountryVal,
        PAddActualCountry: data.patAddress.pAddActualCountry,
        PatAreaVal: data.patAddress.patAreaVal,
        PatArea: data.patAddress.patArea,
        PatDoorNo: data.patAddress.patDoorNo,
        PChartCompID: data.patAddress.pChartCompID,
      },
      OPVisits: data.opVisits || { VisitTypeVal: "H", VisitType: "Hospital" },
    };
  };
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
            onPatientSelect={handlePatientSelect}
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
