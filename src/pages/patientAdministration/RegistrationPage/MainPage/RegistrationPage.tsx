import React, { useContext, useEffect, useState, useCallback } from "react";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { RegistrationService } from "../../../../services/PatientAdministrationServices/RegistrationService/RegistrationService";
import PersonalDetails from "../SubPage/PersonalDetails";
import ContactDetails from "../SubPage/ContactDetails";
import VisitDetails from "../SubPage/VisitDetails";
import MembershipScheme from "../SubPage/MembershipScheme";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
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
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import InsurancePage from "../SubPage/InsurancePage";
import { RegistrationFormErrors } from "../../../../interfaces/PatientAdministration/registrationFormData";
import { PatientService } from "../../../../services/PatientAdministrationServices/RegistrationService/PatientService";

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
  const [formData, setFormData] = useState<PatientRegistrationDto>(
    initializeFormData(userInfo)
  );
  const [triggerInsuranceSave, setTriggerInsuranceSave] = useState(false);
  const { fetchLatestUHID } = useRegistrationUtils(token);
  const [editingKinData, setEditingKinData] = useState<
    NextOfKinKinFormState | undefined
  >(undefined);
  const { performSearch } = useContext(PatientSearchContext);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (shouldClearInsuranceData) {
      setShouldClearInsuranceData(false);
    }
  }, [shouldClearInsuranceData]);

  const handleOpenKinPopup = useCallback(() => {
    setShowKinPopup(true);
    setEditingKinData(undefined);
  }, []);

  const handleCloseKinPopup = useCallback(() => {
    setShowKinPopup(false);
    setEditingKinData(undefined);
  }, []);

  const handleSaveKinDetails = useCallback(
    (kinDetails: NextOfKinKinFormState) => {
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
    },
    [handleCloseKinPopup]
  );

  const generateNewId = <T extends { ID: number }>(data: T[]): number => {
    const maxId = data.reduce(
      (max, item) => (item.ID > max ? item.ID : max),
      0
    );
    return maxId + 1;
  };

  const handleClear = useCallback(() => {
    setIsSubmitted(false);
    setFormErrors({});
    setFormData(initializeFormData(userInfo));
    setGridKinData([]);
    setShouldClearInsuranceData(true);
    fetchLatestUHID().then((latestUHID) => {
      if (latestUHID) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          PatRegisters: {
            ...prevFormData.PatRegisters,
            pChartCode: latestUHID,
          },
        }));
      }
    });
    setEditMode(false);
    window.scrollTo(0, 0);
  }, [fetchLatestUHID, userInfo]);

  const validateFormData = useCallback(() => {
    const errors: RegistrationFormErrors = {};
    if (!formData.PatRegisters.pChartCode.trim()) {
      errors.pChartCode = "UHID is required.";
    } else if (!formData.PatRegisters.pRegDate) {
      errors.registrationDate = "Registration Date is required";
    } else if (!formData.PatRegisters.pFName) {
      errors.firstName = "First Name is required.";
    } else if (!formData.PatRegisters.pLName) {
      errors.lastName = "Last name is required";
    } else if (
      formData.PatRegisters.pTypeID === 0 ||
      !formData.PatRegisters.pTypeName
    ) {
      errors.paymentSource = "Payment Source is required";
    } else if (!formData.PatAddress.pAddPhone1) {
      errors.mobileNumber = "Mobile No is required";
    } else if (
      !formData.PatRegisters.pTitleVal ||
      !formData.PatRegisters.pTitle
    ) {
      errors.title = "Title is required";
    } else if (!formData.PatRegisters.pssnID) {
      errors.indetityNo = "Indentity Number is required";
    } else if (
      (formData.PatRegisters.pDobOrAge === "DOB" &&
        !formData.PatRegisters.pDob) ||
      (formData.PatRegisters.pDobOrAge === "Age" &&
        formData.PatOverview.pAgeNumber === 0 &&
        !formData.PatOverview.pAgeDescriptionVal)
    ) {
      errors.dateOfBirth = "Date of birth or Age is required";
    } else if (
      formData.Opvisits.visitTypeVal === "H" &&
      (formData.PatRegisters.deptID === 0 || !formData.PatRegisters.deptName)
    ) {
      errors.department = "Department is required";
    } else if (
      formData.Opvisits.visitTypeVal === "P" &&
      (formData.PatRegisters.consultantID === 0 ||
        !formData.PatRegisters.consultantName)
    ) {
      errors.attendingPhysician = "Attending Physician is required";
    } else if (
      (formData.Opvisits.visitTypeVal === "H" ||
        formData.Opvisits.visitTypeVal === "P") &&
      (formData.PatRegisters.sourceID === 0 ||
        !formData.PatRegisters.sourceName)
    ) {
      errors.primaryIntroducingSource =
        "Primary Introducing Source is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    setLoading(true);
    try {
      const isFormValid = validateFormData();
      if (!isFormValid) {
        console.log("Validation failed. Please fill all mandatory fields.");
        return;
      }
      setTriggerInsuranceSave(true);
      const registrationResponse = await PatientService.savePatient(
        token,
        formData
      );
      alert("Registration saved successfully!");
      const pChartID = registrationResponse.data;
      if (pChartID) {
        await handleFinalSaveNokDetails(pChartID);
      }
      handleClear();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [validateFormData, token, formData, handleClear, setLoading]);

  const handleFinalSaveNokDetails = useCallback(
    async (pChartID: number) => {
      try {
        for (const nok of gridNextOfKinData) {
          const nokDataWithPChartID = { ...nok, PChartID: pChartID };
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
    },
    [gridNextOfKinData, token]
  );

  const handleApiError = (error: unknown) => {
    if (isApiError(error)) {
      console.error("Validation errors:", error.errors);
      setFormErrors(error.errors);
    } else {
      console.error("An error occurred while saving the registration:", error);
      alert("An error occurred while saving the registration.");
    }
  };

  const isApiError = (error: unknown): error is ApiError => {
    return typeof error === "object" && error !== null && "errors" in error;
  };

  const handlePatientSelect = useCallback(
    async (selectedSuggestion: string) => {
      setLoading(true);
      try {
        const numbersArray = extractNumbers(selectedSuggestion);
        const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
        if (pChartID) {
          await fetchPatientDetailsAndUpdateForm(pChartID);
          setSelectedPChartID(pChartID);
        }
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const fetchPatientDetailsAndUpdateForm = useCallback(
    async (pChartID: number) => {
      setLoading(true);
      try {
        const patientDetails = await PatientService.getPatientDetails(
          token,
          pChartID
        );
        if (patientDetails.success && patientDetails.data) {
          setEditMode(true);
          setFormData(patientDetails.data);
          await fetchAdditionalPatientDetails(pChartID);
        } else {
          console.error(
            "Fetching patient details was not successful or data is undefined"
          );
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading]
  );

  const fetchAdditionalPatientDetails = useCallback(
    async (pChartID: number) => {
      setLoading(true);
      try {
        const nokDetails = await RegistrationService.getPatNokDetails(
          token,
          pChartID
        );
        if (nokDetails.success) {
          const transfermedData = transformDataToMatchNOKDataStructure(
            nokDetails.data,
            userInfo
          );
          setGridKinData(transfermedData);
        }
      } catch (error) {
        console.error("Error fetching additional patient details:", error);
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, userInfo]
  );

  const transformDataToMatchNOKDataStructure = (
    data: any[],
    userInfo: any
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

  return (
    <MainLayout>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <PatientSearch
          show={showPatientSearch}
          handleClose={() => setShowPatientSearch(false)}
          onEditPatient={handlePatientSelect}
        />
        <Paper variant="outlined" sx={{ padding: 2 }}>
          <PersonalDetails
            formData={formData}
            setFormData={setFormData}
            isSubmitted={isSubmitted}
            formErrors={formErrors}
            onPatientSelect={handlePatientSelect}
          />
          <ContactDetails
            formData={formData}
            setFormData={setFormData}
            isSubmitted={isSubmitted}
          />
          <VisitDetails
            formData={formData}
            setFormData={setFormData}
            isSubmitted={isSubmitted}
            isEditMode={editMode} // Pass the isEditMode prop
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
            onSave={() => {}}
            shouldClearData={shouldClearInsuranceData}
            triggerSave={triggerInsuranceSave}
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

const initializeFormData = (userInfo: any): PatientRegistrationDto => ({
  PatRegisters: {
    pChartID: 0,
    pChartCode: "",
    pRegDate: new Date(),
    pTitleVal: "",
    pTitle: "",
    pFName: "",
    pMName: "",
    pLName: "",
    pDobOrAgeVal: "Y",
    pDobOrAge: "",
    pDob: new Date(),
    pAgeType: "",
    pApproxAge: 0,
    pGender: "",
    pGenderVal: "",
    pssnID: "",
    pBldGrp: "",
    rCreatedID: userInfo.userID !== null ? userInfo.userID : 0,
    rCreatedBy: userInfo.userName !== null ? userInfo.userName : "",
    rCreatedOn: new Date(),
    rModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
    rModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
    rModifiedOn: new Date(),
    rActiveYN: "Y",
    rNotes: "",
    compID: userInfo.compID !== null ? userInfo.compID : 0,
    compCode: userInfo.compCode !== null ? userInfo.compCode : "",
    compName: userInfo.compName !== null ? userInfo.compName : "",
    pFhName: "",
    pTypeID: 0,
    pTypeCode: "",
    pTypeName: "",
    fatherBldGrp: "",
    sapID: "",
    patMemID: 0,
    patMemName: "",
    patMemDescription: "",
    patMemSchemeExpiryDate: new Date(),
    patSchemeExpiryDateYN: "N",
    patSchemeDescriptionYN: "N",
    cancelReason: "",
    cancelYN: "N",
    consultantID: 0,
    consultantName: "",
    deptID: 0,
    deptName: "",
    facultyID: 0,
    faculty: "",
    langType: "",
    pChartCompID: 0,
    pExpiryDate: new Date(),
    physicianRoom: "",
    regTypeVal: "GEN",
    regType: "",
    sourceID: 0,
    sourceName: "",
    pPob: "",
    patCompName: "",
    patCompNameVal: "",
    patDataFormYN: "N",
    intIdPsprt: "",
    transferYN: "N",
  },
  PatAddress: {
    pAddID: 0,
    pChartID: 0,
    pChartCode: "",
    pAddType: "",
    pAddMailVal: "N",
    pAddMail: "",
    pAddSMSVal: "N",
    pAddSMS: "",
    pAddEmail: "",
    pAddStreet: "",
    pAddStreet1: "",
    pAddCityVal: "",
    pAddCity: "",
    pAddState: "",
    pAddPostcode: "",
    pAddCountry: "",
    pAddCountryVal: "",
    pAddPhone1: "",
    pAddPhone2: "",
    pAddPhone3: "",
    pAddWorkPhone: "",
    compID: userInfo.compID !== null ? userInfo.compID : 0,
    compCode: userInfo.compCode !== null ? userInfo.compCode : "",
    compName: userInfo.compName !== null ? userInfo.compName : "",
    pAddActualCountryVal: "",
    pAddActualCountry: "",
    patAreaVal: "",
    patArea: "",
    patDoorNo: "",
    pChartCompID: 0,
  },
  PatOverview: {
    patOverID: 0,
    pChartID: 0,
    pChartCode: "",
    pPhoto: "",
    pMaritalStatus: "",
    pReligion: "",
    pEducation: "",
    pOccupation: "",
    pEmployer: "",
    pAgeNumber: 0,
    pAgeDescription: "",
    pAgeDescriptionVal: "",
    ethnicity: "",
    pCountryOfOrigin: "",
    compID: userInfo.compID !== null ? userInfo.compID : 0,
    compCode: userInfo.compCode !== null ? userInfo.compCode : "",
    compName: userInfo.compName !== null ? userInfo.compName : "",
    pChartCompID: 0,
    transferYN: "N",
  },
  Opvisits: {
    visitTypeVal: "H",
    visitType: "Hospital",
  },
});

export default RegistrationPage;
