import React, { useState, useCallback, useRef, useEffect } from "react";
import { Container, Box } from "@mui/material";
import { Search as SearchIcon, Print as PrintIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { useForm, FormProvider } from "react-hook-form";
import { useAppSelector } from "@/store/hooks";
import { useLoading } from "@/context/LoadingContext";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useRegistrationUtils from "@/utils/PatientAdministration/RegistrationUtils";
import { PatientSearchContext } from "@/context/PatientSearchContext";
import { notifyError, notifySuccess, notifyWarning } from "@/utils/Common/toastManager";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import { showAlert } from "@/utils/Common/showAlert";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import PatientSearch from "../../CommonPage/AdvanceSearch/PatientSearch";
import CustomAccordion from "@/components/Accordion/CustomAccordion";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

import NextOfKinPage from "../SubPage/NextOfKinPage";
import InsurancePage from "../SubPage/InsurancePage";
import { useZodForm } from "@/hooks/Common/useZodForm";
import { patientRegistrationSchema } from "./PatientRegistrationScheme";
import ContactDetails from "../SubPage/ContactDetails";
import PersonalDetails from "../SubPage/PersonalDetails";
import MembershipScheme from "../SubPage/MembershipScheme";
import VisitDetails from "../SubPage/VisitDetails";

const RegistrationPage: React.FC = () => {
  const serverDate = useServerDate();
  const userInfo = useAppSelector((state) => state.auth);
  const { setLoading } = useLoading();
  const { fetchLatestUHID } = useRegistrationUtils();
  const { performSearch } = React.useContext(PatientSearchContext);

  // State management
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPChartID, setSelectedPChartID] = useState<number>(0);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);
  const [shouldClearKinData, setShouldClearKinData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Refs for nested components
  const nextOfKinPageRef = useRef<any>(null);
  const insurancePageRef = useRef<any>(null);

  // Initialize the default form values
  const initializeFormData = useCallback(
    () => ({
      patRegisters: {
        pChartID: 0,
        pChartCode: "",
        pRegDate: serverDate,
        pTitleVal: "",
        pTitle: "",
        pFName: "",
        pMName: "",
        pLName: "",
        pDobOrAgeVal: "Y",
        pDobOrAge: "DOB",
        pDob: serverDate,
        pGender: "",
        pGenderVal: "",
        pBldGrp: "",
        rActiveYN: "Y",
        rNotes: "",
        compID: userInfo.compID ?? 0,
        compCode: userInfo.compCode ?? "",
        compName: userInfo.compName ?? "",
        pFhName: "",
        pTypeID: 0,
        pTypeCode: "",
        pTypeName: "",
        fatherBldGrp: "",
        patMemID: 0,
        patMemName: "",
        patMemDescription: "",
        patMemSchemeExpiryDate: serverDate,
        patSchemeExpiryDateYN: "N",
        patSchemeDescriptionYN: "N",
        cancelReason: "",
        cancelYN: "N",
        attendingPhysicianId: 0,
        attendingPhysicianName: "",
        deptID: 0,
        deptName: "",
        facultyID: 0,
        faculty: "",
        langType: "",
        pChartCompID: 0,
        pExpiryDate: serverDate,
        physicianRoom: "",
        regTypeVal: "GEN",
        regType: "",
        primaryReferralSourceId: 0,
        primaryReferralSourceName: "",
        pPob: "",
        patCompName: "",
        patCompNameVal: "",
        patDataFormYN: "N",
        intIdPsprt: "",
        transferYN: "N",
        indentityType: "",
        indentityValue: "",
        patientType: "",
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
        pAddActualCountryVal: "",
        pAddActualCountry: "",
        patAreaVal: "",
        patArea: "",
        patDoorNo: "",
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
        ethnicity: "",
        pCountryOfOrigin: "",
        pAgeNumber: 0,
        pAgeDescriptionVal: "Years",
      },
      opvisits: {
        visitTypeVal: "H",
        visitType: "Hospital",
      },
    }),
    [serverDate, userInfo]
  );

  // Set up the form with Zod validation
  const methods = useZodForm(patientRegistrationSchema, {
    defaultValues: initializeFormData(),
    mode: "onBlur",
  });

  // Monitor form state for debugging
  const { handleSubmit, reset, formState } = methods;
  const { isSubmitting, errors } = formState;

  // Clear form data and reset state
  const handleClear = useCallback(() => {
    reset(initializeFormData());
    setShouldClearInsuranceData(true);
    setShouldClearKinData(true);
    setIsEditMode(false);
    setSelectedPChartID(0);

    // Get latest UHID
    fetchLatestUHID().then((latestUHID) => {
      if (latestUHID) {
        methods.setValue("patRegisters.pChartCode", latestUHID, { shouldValidate: true });
      }
    });

    window.scrollTo(0, 0);
  }, [reset, initializeFormData, fetchLatestUHID, methods]);

  // Reset flags after clearing data
  useEffect(() => {
    if (shouldClearInsuranceData) {
      setShouldClearInsuranceData(false);
    }
    if (shouldClearKinData) {
      setShouldClearKinData(false);
    }
  }, [shouldClearInsuranceData, shouldClearKinData]);

  // Handle form submission
  const onSubmit = useCallback(
    async (data) => {
      setLoading(true);

      try {
        // Prepare DOB if age is selected
        if (data.patRegisters.pDobOrAge === "Age") {
          const { pAgeNumber, pAgeDescriptionVal } = data.patOverview;
          const today = new Date();
          const dob = new Date(today);

          if (pAgeDescriptionVal === "Years") {
            dob.setFullYear(today.getFullYear() - pAgeNumber);
          } else if (pAgeDescriptionVal === "Months") {
            dob.setMonth(today.getMonth() - pAgeNumber);
          } else if (pAgeDescriptionVal === "Days") {
            dob.setDate(today.getDate() - pAgeNumber);
          }

          data.patRegisters.pDob = dob;
          data.patRegisters.pDobOrAgeVal = "Y";
          data.patRegisters.pDobOrAge = "DOB";
        }

        // Save patient data
        const response = await PatientService.savePatient(data);

        if (response.success && response.data) {
          const pChartID = response.data;
          let hasErrors = false;
          const actionText = isEditMode ? "updated" : "saved";

          // Save Next of Kin details
          if (nextOfKinPageRef.current) {
            try {
              await nextOfKinPageRef.current.saveKinDetails(pChartID);
            } catch (error) {
              hasErrors = true;
            }
          }

          // Save Insurance details
          if (insurancePageRef.current) {
            try {
              await insurancePageRef.current.saveInsuranceDetails(pChartID);
            } catch (error) {
              hasErrors = true;
            }
          }

          // Show appropriate alerts based on outcome
          if (hasErrors) {
            showAlert("Warning", `Patient registration ${actionText}, but there were issues saving additional details. Please check and try saving them again.`, "warning", {
              onConfirm: handleClear,
            });
          } else {
            showAlert("Success", `Registration ${actionText} successfully!`, "success", { onConfirm: handleClear });
            notifySuccess(`Patient registration ${actionText} successfully!`);
          }
        } else {
          throw new Error(response.errorMessage || "Failed to save registration.");
        }
      } catch (error) {
        notifyError(error instanceof Error ? error.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [isEditMode, handleClear, setLoading]
  );

  // Handle patient selection from search
  const handlePatientSelect = useCallback(
    async (selectedSuggestion: string) => {
      setLoading(true);
      try {
        const numbersArray = extractNumbers(selectedSuggestion);
        const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;

        if (pChartID) {
          const patientDetails = await PatientService.getPatientDetails(pChartID);

          if (patientDetails.success && patientDetails.data) {
            setIsEditMode(true);
            reset(patientDetails.data);
            setSelectedPChartID(pChartID);
          }
        }
      } catch (error) {
        notifyError("Failed to load patient details");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, reset]
  );

  // Handle advanced search
  const handleAdvancedSearch = useCallback(async () => {
    setShowPatientSearch(true);
    await performSearch("");
  }, [performSearch]);

  // Action buttons
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
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container maxWidth={false}>
          <Box sx={{ marginBottom: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>

          <PatientSearch show={showPatientSearch} handleClose={() => setShowPatientSearch(false)} onEditPatient={handlePatientSelect} />

          <CustomAccordion title="Personal Details" defaultExpanded>
            <PersonalDetails isEditMode={isEditMode} onPatientSelect={handlePatientSelect} />
          </CustomAccordion>

          <CustomAccordion title="Contact Details" defaultExpanded>
            <ContactDetails />
          </CustomAccordion>

          {!isEditMode && (
            <CustomAccordion title="Visit Details" defaultExpanded>
              <VisitDetails isEditMode={isEditMode} />
            </CustomAccordion>
          )}

          <CustomAccordion title="Membership Scheme" defaultExpanded>
            <MembershipScheme />
          </CustomAccordion>

          <CustomAccordion title="Next of Kin" defaultExpanded>
            <NextOfKinPage ref={nextOfKinPageRef} pChartID={selectedPChartID} shouldClearData={shouldClearKinData} />
          </CustomAccordion>

          <CustomAccordion title="Insurance Details" defaultExpanded>
            <InsurancePage ref={insurancePageRef} pChartID={selectedPChartID} shouldClearData={shouldClearInsuranceData} />
          </CustomAccordion>
        </Container>

        <FormSaveClearButton
          clearText="Clear"
          saveText={isEditMode ? "Update" : "Save"}
          onClear={handleClear}
          onSave={handleSubmit(onSubmit)}
          clearIcon={DeleteIcon}
          saveIcon={SaveIcon}
        />
      </form>
    </FormProvider>
  );
};

export default React.memo(RegistrationPage);
