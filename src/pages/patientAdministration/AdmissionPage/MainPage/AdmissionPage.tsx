//src/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage.tsx
//src/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Box } from "@mui/material";
import { Search as SearchIcon, Print as PrintIcon, Delete as DeleteIcon, Save as SaveIcon, MeetingRoom as MeetingRoomIcon } from "@mui/icons-material";
import useAdmissionForm from "@/hooks/PatientAdminstration/useAdmissionForm";
import { useLoading } from "@/context/LoadingContext";
import useDropdownChange from "@/hooks/useDropdownChange";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { showAlert } from "@/utils/Common/showAlert";
import CustomAccordion from "@/components/Accordion/CustomAccordion";
import AdmissionDetails from "../SubPage/AdmissionDetails";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import ManageBedDetails from "../../ManageBed/SubPage/ManageBedDetails";
import InsurancePage from "../../RegistrationPage/SubPage/InsurancePage";
import DiagnosisSection from "../../../clinicalManagement/Common/Diagnosis";
import PatientHistory from "@/pages/clinicalManagement/PatientHistory/PatientHistory";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import AdmissionListSearch from "../SubPage/AdmissionListSearch";

export interface PatientHistory {
  [key: string]: any;
}

const AdmissionPage: React.FC = () => {
  const {
    formData,
    setFormData,
    primaryDiagnoses,
    setPrimaryDiagnoses,
    associatedDiagnoses,
    setAssociatedDiagnoses,
    handleChange,
    handleClear,
    handleSave,
    handlePatientSelect,
    handleBedSelect,
    shouldClearInsuranceData,
    setShouldClearInsuranceData,
    shouldClearPatientHistory,
    setShouldClearPatientHistory,
    insurancePageRef,
    updatePatientHistory,
    // patientHistory,
  } = useAdmissionForm();
  const { setLoading } = useLoading();
  const { handleDropdownChange } = useDropdownChange<AdmissionDto>(setFormData);

  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleOpenBedSelection = useCallback(() => setIsBedSelectionOpen(true), []);
  const handleCloseBedSelection = useCallback(() => setIsBedSelectionOpen(false), []);

  const handleAdvancedSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleAdmissionSelect = useCallback(
    (selectedAdmission: AdmissionDto) => {
      // Update form data with selected admission
      setFormData(selectedAdmission);
      // Update other related states as needed
      setPrimaryDiagnoses([]); // Reset or update as needed
      setAssociatedDiagnoses([]); // Reset or update as needed
      setShouldClearInsuranceData(false);
      setShouldClearPatientHistory(false);
    },
    [setFormData]
  );

  const actionButtons: ButtonProps[] = useMemo(
    () => [
      {
        variant: "contained",
        size: "medium",
        icon: SearchIcon,
        text: "Advanced Search",
        color: "primary", // Blue button
        onClick: handleAdvancedSearch,
      },
      {
        variant: "contained",
        icon: PrintIcon,
        text: "Print Admission Form",
        size: "medium",
        color: "info", // Different color if needed
        onClick: () => {
          /* Implement print logic */
        },
      },
      {
        variant: "outlined",
        icon: MeetingRoomIcon,
        text: "Advised Admissions",
        size: "medium",
        color: "warning", // Blue button
        onClick: () => {
          /* Implement admissions logic */
        },
      },
    ],
    [handleAdvancedSearch]
  );

  const handleClearAll = useCallback(() => {
    handleClear();
    setShouldClearInsuranceData(true);
    setShouldClearPatientHistory(true);
  }, [handleClear, setShouldClearInsuranceData, setShouldClearPatientHistory]);

  useEffect(() => {
    if (shouldClearPatientHistory) {
      setShouldClearPatientHistory(false);
    }
  }, [shouldClearPatientHistory, setShouldClearPatientHistory]);

  const handleHistoryChange = useCallback(
    (historyData: any) => {
      updatePatientHistory(historyData);
    },
    [updatePatientHistory]
  );

  const handleSaveAll = async () => {
    try {
      debugger;
      setLoading(true);
      const success = await handleSave();

      if (success) {
        showAlert("Success", "Admission and patient history saved successfully!", "success", {
          onConfirm: () => {
            handleClear();
          },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      showAlert("Error", `Failed to save admission: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} />
      </Box>
      <CustomAccordion title="Admission Details" defaultExpanded>
        <AdmissionDetails
          formData={formData}
          onChange={handleChange}
          onDropdownChange={handleDropdownChange}
          fetchPatientSuggestions={fetchPatientSuggestions}
          handlePatientSelect={handlePatientSelect}
        />
        <CustomButton variant="outlined" text="Select Bed from Ward View" onClick={handleOpenBedSelection} />
      </CustomAccordion>
      <GenericDialog open={isBedSelectionOpen} onClose={handleCloseBedSelection} title="Select a Bed" maxWidth="xl" fullWidth>
        <ManageBedDetails onBedSelect={handleBedSelect} isSelectionMode={true} />
      </GenericDialog>
      <CustomAccordion title="Payer Details">
        <InsurancePage ref={insurancePageRef} pChartID={formData.ipAdmissionDto.pChartID || 0} shouldClearData={shouldClearInsuranceData} />
      </CustomAccordion>
      <CustomAccordion title="Principal Diagnosis">
        <DiagnosisSection
          primaryDiagnoses={primaryDiagnoses}
          associatedDiagnoses={associatedDiagnoses}
          onPrimaryDiagnosesChange={setPrimaryDiagnoses}
          onAssociatedDiagnosesChange={setAssociatedDiagnoses}
        />
      </CustomAccordion>
      <CustomAccordion title="Patient History">
        <PatientHistory
          pChartID={formData.ipAdmissionDto.pChartID}
          opipNo={formData.ipAdmissionDto.opipNo}
          opipCaseNo={formData.ipAdmissionDto.oPIPCaseNo}
          shouldClear={shouldClearPatientHistory}
          onHistoryChange={updatePatientHistory}
        />
      </CustomAccordion>
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClearAll} onSave={handleSaveAll} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
      <AdmissionListSearch open={isSearchOpen} onClose={handleSearchClose} onSelect={handleAdmissionSelect} />
    </Container>
  );
};

export default AdmissionPage;
