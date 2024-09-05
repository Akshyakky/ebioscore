import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Container, Paper, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import PersonalDetails from "../SubPage/PersonalDetails";
import ContactDetails from "../SubPage/ContactDetails";
import VisitDetails from "../SubPage/VisitDetails";
import MembershipScheme from "../SubPage/MembershipScheme";
import { PatientRegistrationDto } from "../../../../interfaces/PatientAdministration/PatientFormData";
import { ApiError } from "../../../../interfaces/Common/ApiError";
import { useLoading } from "../../../../context/LoadingContext";
import useRegistrationUtils from "../../../../utils/PatientAdministration/RegistrationUtils";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import PatientSearch from "../../CommonPage/AdvanceSearch/PatientSearch";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import extractNumbers from "../../../../utils/PatientAdministration/extractNumbers";
import InsurancePage from "../SubPage/InsurancePage";
import { RegistrationFormErrors } from "../../../../interfaces/PatientAdministration/registrationFormData";
import { PatientService } from "../../../../services/PatientAdministrationServices/RegistrationService/PatientService";
import NextOfKinPage from "../SubPage/NextOfKinPage";
import { format } from "date-fns";

const RegistrationPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<RegistrationFormErrors>({});
  const { setLoading } = useLoading();
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPChartID, setSelectedPChartID] = useState<number>(0);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] =
    useState(false);
  const [formData, setFormData] = useState<PatientRegistrationDto>(
    initializeFormData(userInfo)
  );
  const [shouldClearKinData, setShouldClearKinData] = useState(false);

  const { fetchLatestUHID } = useRegistrationUtils();
  const { performSearch } = useContext(PatientSearchContext);
  const [editMode, setEditMode] = useState(false);
  const nextOfKinPageRef = useRef<any>(null);
  const insurancePageRef = useRef<any>(null);

  useEffect(() => {
    if (shouldClearInsuranceData) {
      setShouldClearInsuranceData(false);
    }
    if (shouldClearKinData) {
      setShouldClearKinData(false);
    }
  }, [shouldClearInsuranceData, shouldClearKinData]);

  const handleClear = useCallback(() => {
    setIsSubmitted(false);
    setFormErrors({});
    setFormData(initializeFormData(userInfo));
    setShouldClearInsuranceData(true);
    setShouldClearKinData(true);
    fetchLatestUHID().then((latestUHID) => {
      if (latestUHID) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          patRegisters: {
            ...prevFormData.patRegisters,
            pChartCode: latestUHID,
          },
        }));
      }
    });
    setEditMode(false);
    setSelectedPChartID(0);
    window.scrollTo(0, 0);
  }, [fetchLatestUHID, userInfo]);

  const validateFormData = useCallback(() => {
    const errors: RegistrationFormErrors = {};
    if (!formData.patRegisters.pChartCode.trim()) {
      errors.pChartCode = "UHID is required.";
    } else if (!formData.patRegisters.pRegDate) {
      errors.registrationDate = "Registration Date is required";
    } else if (!formData.patRegisters.pFName) {
      errors.firstName = "First Name is required.";
    } else if (!formData.patRegisters.pLName) {
      errors.lastName = "Last name is required";
    } else if (
      formData.patRegisters.pTypeID === 0 ||
      !formData.patRegisters.pTypeName
    ) {
      errors.paymentSource = "Payment Source is required";
    } else if (!formData.patAddress.pAddPhone1) {
      errors.mobileNumber = "Mobile No is required";
    } else if (
      !formData.patRegisters.pTitleVal ||
      !formData.patRegisters.pTitle
    ) {
      errors.title = "Title is required";
    } else if (!formData.patRegisters.pssnID) {
      errors.indetityNo = "Indentity Number is required";
    } else if (
      (formData.patRegisters.pDobOrAge === "DOB" &&
        !formData.patRegisters.pDob) ||
      (formData.patRegisters.pDobOrAge === "Age" &&
        formData.patOverview.pAgeNumber === 0 &&
        !formData.patOverview.pAgeDescriptionVal)
    ) {
      errors.dateOfBirth = "Date of birth or Age is required";
    } else if (
      formData.opvisits?.visitTypeVal === "H" &&
      (formData.patRegisters.deptID === 0 || !formData.patRegisters.deptName)
    ) {
      errors.department = "Department is required";
    } else if (
      formData.opvisits?.visitTypeVal === "P" &&
      (formData.patRegisters.consultantID === 0 ||
        !formData.patRegisters.consultantName)
    ) {
      errors.attendingPhysician = "Attending Physician is required";
    } else if (
      (formData.opvisits?.visitTypeVal === "H" ||
        formData.opvisits?.visitTypeVal === "P") &&
      (formData.patRegisters.sourceID === 0 ||
        !formData.patRegisters.sourceName)
    ) {
      errors.primaryIntroducingSource =
        "Primary Introducing Source is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = async () => {
    setIsSubmitted(true);
    setLoading(true);
    try {
      const isFormValid = validateFormData();
      if (!isFormValid) {
        console.log("Validation failed. Please fill all mandatory fields.");
        setLoading(false);
        return;
      }
      const registrationResponse = await PatientService.savePatient(
        formData
      );
      if (registrationResponse.success && registrationResponse.data) {
        const pChartID = registrationResponse.data;

        // Save Next of Kin Details
        if (nextOfKinPageRef.current) {
          await nextOfKinPageRef.current.saveKinDetails(pChartID);
        }

        // Save Insurance Details
        if (insurancePageRef.current) {
          await insurancePageRef.current.saveInsuranceDetails(pChartID);
        }

        alert("Registration saved successfully!");
        handleClear();
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePatientSelect = async (selectedSuggestion: string) => {
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
  };

  const fetchPatientDetailsAndUpdateForm = async (pChartID: number) => {
    setLoading(true);
    try {
      const patientDetails = await PatientService.getPatientDetails(
        pChartID
      );
      if (patientDetails.success && patientDetails.data) {
        const formattedData = {
          ...patientDetails.data,
          patRegisters: {
            ...patientDetails.data.patRegisters,
            pRegDate: format(
              new Date(patientDetails.data.patRegisters.pRegDate),
              "yyyy-MM-dd"
            ),
            pDob: format(
              new Date(patientDetails.data.patRegisters.pDob),
              "yyyy-MM-dd"
            ),
            patMemSchemeExpiryDate: format(
              new Date(patientDetails.data.patRegisters.patMemSchemeExpiryDate),
              "yyyy-MM-dd"
            ),
          },
        };
        setEditMode(true);
        setFormData(formattedData);
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
  };

  const handleAdvancedSearch = async () => {
    setShowPatientSearch(true);
    await performSearch("");
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
    {
      variant: "contained",
      icon: PrintIcon,
      text: "Print Form",
    },
  ];

  return (
    <>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} groupVariant="contained" groupSize="medium" orientation="horizontal" color="primary" />
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
          {!editMode && formData.opvisits && (
            <VisitDetails
              formData={formData}
              setFormData={setFormData}
              isSubmitted={isSubmitted}
              isEditMode={editMode}
            />
          )}
          <MembershipScheme formData={formData} setFormData={setFormData} />
          <NextOfKinPage
            ref={nextOfKinPageRef}
            pChartID={selectedPChartID}
            shouldClearData={shouldClearKinData}
          />
          <InsurancePage
            ref={insurancePageRef}
            pChartID={selectedPChartID}
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
    </>
  );
};

const initializeFormData = (userInfo: any): PatientRegistrationDto => ({
  patRegisters: {
    pChartID: 0,
    pChartCode: "",
    pRegDate: format(new Date(), "yyyy-MM-dd"),
    pTitleVal: "",
    pTitle: "",
    pFName: "",
    pMName: "",
    pLName: "",
    pDobOrAgeVal: "Y",
    pDobOrAge: "",
    pDob: format(new Date(), "yyyy-MM-dd"),
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
    patMemSchemeExpiryDate: format(new Date(), "yyyy-MM-dd"),
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
  patAddress: {
    pAddID: 0,
    pChartID: 0,
    pChartCode: "",
    pAddType: "LOCAL",
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
  patOverview: {
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
  opvisits: {
    visitTypeVal: "H",
    visitType: "Hospital",
  },
});

export default RegistrationPage;
