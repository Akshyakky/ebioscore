import React, { useContext, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { RegistrationService } from "../../../../services/RegistrationService/RegistrationService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import PersonalDetails from "../SubPage/PersonalDetails";
import ContactDetails from "../SubPage/ContactDetails";
import VisitDetails from "../SubPage/VisitDetails";
import MembershipScheme from "../SubPage/MembershipScheme";
import {
  RegistrationFormErrors,
  RegsitrationFormData,
} from "../../../../interfaces/PatientAdministration/registrationFormData";
import { ApiError } from "../../../../interfaces/Common/ApiError";
import { useLoading } from "../../../../context/LoadingContext";
import NextOfKinPopup from "../SubPage/NextOfKin";
import { NextOfKinKinFormState } from "../../../../interfaces/PatientAdministration/NextOfKinData";
import useRegistrationUtils from "../../../../utils/PatientAdministration/RegistrationUtils";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import PatientSearch from "../../CommonPage/AdvanceSearch/PatientSearch";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import CustomButton from "../../../../components/Button/CustomButton";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import InsurancePage from "../SubPage/InsurancePage";

const RegistrationPage: React.FC = () => {
  const [showKinPopup, setShowKinPopup] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<RegistrationFormErrors>({});
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const [gridNextOfKinData, setGridKinData] = useState<NextOfKinKinFormState[]>(
    []
  );
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPChartID, setSelectedPChartID] = useState<number | 0>(0);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] =
    useState(false);

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
  const { fetchLatestUHID } = useRegistrationUtils(token);

  const handleOpenKinPopup = () => {
    setShowKinPopup(true);
    setEditingKinData(undefined);
  };
  const handleCloseKinPopup = () => {
    setShowKinPopup(false);
    setEditingKinData(undefined);
  };

  const handleSaveKinDetails = (kinDetails: NextOfKinKinFormState) => {
    setGridKinData((prevGridData) => {
      if (!kinDetails.PNokID && !kinDetails.ID) {
        return [
          ...prevGridData,
          { ...kinDetails, ID: generateNewId(prevGridData) },
        ];
      }
      if (!kinDetails.PNokID) {
        return prevGridData.map((item) =>
          item.ID === kinDetails.ID ? kinDetails : item
        );
      }
      return prevGridData.map((item) =>
        item.PNokID === kinDetails.PNokID ? kinDetails : item
      );
    });
    handleCloseKinPopup();
  };

  const generateNewId = <T extends { ID: number }>(data: T[]): number => {
    const maxId = data.reduce(
      (max, item) => (item.ID > max ? item.ID : max),
      0
    );
    return maxId + 1;
  };

  const gridKinColumns = [
    {
      key: "Nokedit",
      header: "Edit",
      visible: true,
      render: (row: NextOfKinKinFormState) => (
        <CustomButton
          size="small"
          onClick={() => handleEditKin(row)}
          icon={EditIcon}
          color="primary"
        />
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
        <CustomButton
          size="small"
          onClick={() => handleDeleteKin(row.PNokID)}
          icon={DeleteIcon}
          color="error"
        />
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

  const handleDeleteKin = (id: number) => {
    const updatedGridData = gridNextOfKinData.filter(
      (kin) => kin.PNokID !== id
    );
    setGridKinData(updatedGridData);
  };
  const handleClear = () => {
    setIsSubmitted(false);
    setFormErrors({});

    setFormData(regFormInitialState);
    setGridKinData([]);

    setShouldClearInsuranceData(true);

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
  // Reset shouldClearInsuranceData after it's been set to true
  useEffect(() => {
    if (shouldClearInsuranceData) {
      // Reset the flag after the effect in InsurancePage has been triggered
      setShouldClearInsuranceData(false);
    }
  }, [shouldClearInsuranceData]);
  const validateFormData = () => {
    const errors: RegistrationFormErrors = {};
    if (!formData.PChartCode.trim()) {
      errors.pChartCode = "UHID is required.";
    } else if (!formData.PRegDate.trim()) {
      errors.registrationDate = "Registration Date is required";
    } else if (!formData.PFName.trim()) {
      errors.firstName = "First Name is required.";
    } else if (!formData.PLName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.PTypeID === 0 || !formData.PTypeName.trim()) {
      errors.paymentSource = "Payment Source is required";
    } else if (!formData.PatAddress.PAddPhone1.trim()) {
      errors.mobileNumber = "Mobile No is required";
    } else if (!formData.PTitleVal.trim() || !formData.PTitle.trim()) {
      errors.title = "Title is required";
    } else if (!formData.PssnID.trim()) {
      errors.indetityNo = "Indentity Number is required";
    } else if (
      (formData.PDobOrAge === "DOB" && !formData.PDob.trim()) ||
      (formData.PDobOrAge === "Age" &&
        formData.PatOverview.PAgeNumber === 0 &&
        !formData.PatOverview.PageDescriptionVal.trim())
    ) {
      errors.dateOfBirth = "Date of birth or Age is required";
    } else if (
      formData.OPVisits.VisitTypeVal === "H" &&
      (formData.DeptID === 0 || !formData.DeptName.trim())
    ) {
      errors.department = "Department is required";
    } else if (
      formData.OPVisits.VisitTypeVal === "P" &&
      (formData.ConsultantID === 0 || !formData.ConsultantName.trim())
    ) {
      errors.attendingPhysician = "Attending Physician is required";
    } else if (
      (formData.OPVisits.VisitTypeVal === "H" ||
        formData.OPVisits.VisitTypeVal === "P") &&
      (formData.SourceID === 0 || !formData.SourceName.trim())
    ) {
      errors.primaryIntroducingSource =
        "Primary Introducing Source is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSave = async () => {
    setIsSubmitted(true);
    setLoading(true);
    try {
      const isFormValid = validateFormData();
      if (!isFormValid) {
        console.log("Validation failed. Please fill all mandatory fields.");
        return;
      }
      const registrationResponse = await RegistrationService.saveRegistration(
        token,
        formData
      );
      alert("Registration saved successfully!");
      const pChartID = registrationResponse.pChartID;
      if (pChartID) {
        await handleFinalSaveNokDetails(pChartID);
        onInsuranceSave();
      }
      handleClear();
    } catch (error) {
      if (isApiError(error)) {
        console.error("Validation errors:", error.errors);
        setFormErrors(error.errors);
      } else {
        console.error(
          "An error occurred while saving the registration:",
          error
        );
        alert("An error occurred while saving the registration.");
      }
    } finally {
      setLoading(false);
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
    }
  };

  function isApiError(error: unknown): error is ApiError {
    return typeof error === "object" && error !== null && "errors" in error;
  }
  const handlePatientSelect = (selectedSuggestion: string) => {
    setLoading(true);
    try {
      const numbersArray = extractNumbers(selectedSuggestion);
      const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
      if (pChartID) {
        fetchPatientDetailsAndUpdateForm(pChartID);
        setSelectedPChartID(pChartID);
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
        const transformedData = transformDataToMatchFormDataStructure(
          patientDetails.data
        );
        setFormData(transformedData);
        await fetchAdditionalPatientDetails(pChartID);
      } else {
        console.error("Fetching patient details was not successful");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setLoading(false);
    }
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
    } catch (error) {
      console.error("Error fetching additional patient details:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformDataToMatchNOKDataStructure = (
    data: any[]
  ): NextOfKinKinFormState[] => {
    return data.map((nok) => ({
      ID: 0,
      PNokID: nok.pNokID,
      PChartID: nok.pChartID,
      PNokPChartID: nok.pNokPChartID,
      PNokPChartCode: nok.pNokPChartCode,
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
    return {
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
      PatMemSchemeExpiryDate: data.patMemSchemeExpiryDate.split("T")[0],
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
      PExpiryDate: data.pExpiryDate.split("T")[0],
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
  const { performSearch } = useContext(PatientSearchContext);
  const handleAdvancedSearch = async () => {
    setShowPatientSearch(true);
    await performSearch("");
  };
  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
    {
      variant: "contained",
      icon: PrintIcon,
      text: "Print Form",
      size: "medium",
    },
  ];
  const onInsuranceSave = async () => {
    // Handle actions after insurance details are saved
    console.log("Insurance details have been saved.");
    // Additional logic if needed
  };
  return (
    <MainLayout>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        {/* Patient Search Modal */}
        <PatientSearch
          show={showPatientSearch}
          handleClose={() => setShowPatientSearch(false)}
          onEditPatient={handlePatientSelect}
        />
        <Paper variant="outlined" sx={{ padding: 2 }}>
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
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography variant="h6" id="NOK-header">
                  Next Of Kin
                </Typography>
              </Grid>
              <Grid item>
                <CustomButton
                  text="Add Next Of Kin"
                  onClick={handleOpenKinPopup}
                  icon={AddIcon}
                  color="primary"
                  variant="text"
                />
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between">
              <Grid item xs={12}>
                <CustomGrid columns={gridKinColumns} data={gridNextOfKinData} />
              </Grid>
            </Grid>
          </section>

          <InsurancePage
            pChartID={selectedPChartID}
            token={token}
            onSaveInsurance={onInsuranceSave}
            shouldClearData={shouldClearInsuranceData}
          />
        </Paper>
      </Container>
      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
    </MainLayout>
  );
};
export default RegistrationPage;
