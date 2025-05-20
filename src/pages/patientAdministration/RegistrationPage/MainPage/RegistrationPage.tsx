import React, { useContext, useState, useCallback, useMemo } from "react";
import { Container, Box } from "@mui/material";
import { Search as SearchIcon, Print as PrintIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { RegistrationFormErrors } from "@/interfaces/PatientAdministration/registrationFormData";
import { useLoading } from "@/context/LoadingContext";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useRegistrationUtils from "@/utils/PatientAdministration/RegistrationUtils";
import { PatientSearchContext } from "@/context/PatientSearchContext";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { notifyError, notifySuccess, notifyWarning } from "@/utils/Common/toastManager";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import { showAlert } from "@/utils/Common/showAlert";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import PatientSearch from "../../CommonPage/AdvanceSearch/PatientSearch";
import CustomAccordion from "@/components/Accordion/CustomAccordion";
import PersonalDetails from "../SubPage/PersonalDetails";
import ContactDetails from "../SubPage/ContactDetails";
import VisitDetails from "../SubPage/VisitDetails";
import MembershipScheme from "../SubPage/MembershipScheme";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import NextOfKinPage from "../SubPage/NextOfKinPage";

const RegistrationPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<RegistrationFormErrors>({});
  const { setLoading } = useLoading();
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const serverDate = useServerDate();
  const { fetchLatestUHID } = useRegistrationUtils();
  const { performSearch } = useContext(PatientSearchContext);

  const initializeFormData = useCallback(
    (): PatientRegistrationDto => ({
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
        pDobOrAge: "",
        pDob: serverDate,
        pGender: "",
        pGenderVal: "",
        pBldGrp: "",
        rActiveYN: "Y",
        rNotes: "",
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
    [serverDate]
  );

  const [formData, setFormData] = useState<PatientRegistrationDto>(() => initializeFormData());

  const handleClear = useCallback(() => {
    setIsSubmitted(false);
    setFormErrors({});
    setFormData(initializeFormData());
    setIsEditMode(false);
    fetchLatestUHID().then((latestUHID) => {
      if (latestUHID) {
        setFormData((prev) => ({
          ...prev,
          patRegisters: {
            ...prev.patRegisters,
            pChartCode: latestUHID,
          },
        }));
      }
    });
    window.scrollTo(0, 0);
  }, [fetchLatestUHID]);

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
    } else if (formData.patRegisters.pTypeID === 0 || !formData.patRegisters.pTypeName) {
      errors.paymentSource = "Payment Source is required";
    } else if (!formData.patAddress.pAddPhone1) {
      errors.mobileNumber = "Mobile No is required";
    } else if (!formData.patRegisters.pTitleVal || !formData.patRegisters.pTitle) {
      errors.title = "Title is required";
    } else if (!formData.patRegisters.indentityValue) {
      errors.indetityNo = "Indentity Number is required";
    } else if (formData.opvisits?.visitTypeVal === "H" && (formData.patRegisters.deptID === 0 || !formData.patRegisters.deptName)) {
      errors.department = "Department is required";
    } else if (formData.opvisits?.visitTypeVal === "P" && (formData.patRegisters.attendingPhysicianId === 0 || !formData.patRegisters.attendingPhysicianName)) {
      errors.attendingPhysician = "Attending Physician is required";
    } else if (
      (formData.opvisits?.visitTypeVal === "H" || formData.opvisits?.visitTypeVal === "P") &&
      (formData.patRegisters.primaryReferralSourceId === 0 || !formData.patRegisters.primaryReferralSourceName)
    ) {
      errors.primaryIntroducingSource = "Primary Introducing Source is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    if (!validateFormData()) {
      notifyWarning("Please fill all mandatory fields.");
      return;
    }

    // 🚫 Prevent future DOB save
    if (formData.patRegisters.pDobOrAge === "DOB" && formData.patRegisters.pDob) {
      const today = new Date();
      const dob = new Date(formData.patRegisters.pDob);
      if (dob > today) {
        notifyWarning("Date of Birth cannot be a future date.");
        return;
      }
    }

    if (formData.patRegisters.pDobOrAge === "Age") {
      const { pAgeNumber, pAgeDescriptionVal } = formData.patOverview;
      const today = new Date();
      const dob = new Date(today);

      if (pAgeDescriptionVal === "Years") {
        dob.setFullYear(today.getFullYear() - pAgeNumber);
      } else if (pAgeDescriptionVal === "Months") {
        dob.setMonth(today.getMonth() - pAgeNumber);
      } else if (pAgeDescriptionVal === "Days") {
        dob.setDate(today.getDate() - pAgeNumber);
      }

      formData.patRegisters.pDob = dob;
      formData.patRegisters.pDobOrAgeVal = "Y";
      formData.patRegisters.pDobOrAge = "DOB";
    }

    setLoading(true);
    try {
      const response = await PatientService.savePatient(formData);
      if (response.success && response.data) {
        const pChartID = response.data;
        let hasErrors = false;
        const actionText = isEditMode ? "updated" : "saved";

        if (hasErrors) {
          showAlert("Warning", `Patient registration ${actionText}, but there were issues saving additional details. Please check and try saving them again.`, "warning", {
            onConfirm: handleClear,
          });
        } else {
          showAlert("Success", `Registration ${actionText} successfully!`, "success", {
            onConfirm: handleClear,
          });
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
  }, [formData, isEditMode, validateFormData, handleClear]);

  const handlePatientSelect = useCallback(async (selectedSuggestion: string) => {
    setLoading(true);
    try {
      const numbersArray = extractNumbers(selectedSuggestion);
      const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
      if (pChartID) {
        await fetchPatientDetailsAndUpdateForm(pChartID);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatientDetailsAndUpdateForm = useCallback(async (pChartID: number) => {
    setLoading(true);
    try {
      const patientDetails = await PatientService.getPatientDetails(pChartID);
      if (patientDetails.success && patientDetails.data) {
        setIsEditMode(true);
        setFormData(patientDetails.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdvancedSearch = useCallback(async () => {
    setShowPatientSearch(true);
    await performSearch("");
  }, [performSearch]);

  const actionButtons: ButtonProps[] = useMemo(
    () => [
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
    ],
    [handleAdvancedSearch]
  );

  return (
    <>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
        </Box>
        <PatientSearch show={showPatientSearch} handleClose={() => setShowPatientSearch(false)} onEditPatient={handlePatientSelect} />
        <CustomAccordion title="Personal Details" defaultExpanded>
          <PersonalDetails formData={formData} setFormData={setFormData} isSubmitted={isSubmitted} onPatientSelect={handlePatientSelect} isEditMode={isEditMode} />
        </CustomAccordion>
        <CustomAccordion title="Contact Details" defaultExpanded>
          <ContactDetails formData={formData} setFormData={setFormData} isSubmitted={isSubmitted} />
        </CustomAccordion>
        {!isEditMode && formData.opvisits && (
          <CustomAccordion title="Visit Details" defaultExpanded>
            <VisitDetails formData={formData} setFormData={setFormData} isSubmitted={isSubmitted} isEditMode={isEditMode} />
          </CustomAccordion>
        )}
        <CustomAccordion title="Membership Scheme" defaultExpanded>
          <MembershipScheme formData={formData} setFormData={setFormData} />
        </CustomAccordion>
        <CustomAccordion title="Next of Kin" defaultExpanded>
          <NextOfKinPage pChartID={formData.patRegisters.pChartID} pChartCode={formData.patRegisters.pChartCode} />
        </CustomAccordion>
        {/* 
        <CustomAccordion title="Insurance Details" defaultExpanded>
         Need insurance details here          
        </CustomAccordion>
         */}
      </Container>
      <FormSaveClearButton clearText="Clear" saveText={isEditMode ? "Update" : "Save"} onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </>
  );
};

export default React.memo(RegistrationPage);
