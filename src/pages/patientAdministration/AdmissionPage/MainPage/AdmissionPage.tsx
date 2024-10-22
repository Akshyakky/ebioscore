//src/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Box } from "@mui/material";
import InsurancePage from "../../RegistrationPage/SubPage/InsurancePage";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import { Search as SearchIcon, Print as PrintIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import AdmissionDetails from "../SubPage/AdmissionDetails";
import CustomAccordion from "../../../../components/Accordion/CustomAccordion";
import CustomButton from "../../../../components/Button/CustomButton";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import ManageBedDetails from "../../ManageBed/SubPage/ManageBedDetails";
import DiagnosisSection from "../../../clinicalManagement/Common/Diagnosis";
import useAdmissionForm from "../../../../hooks/PatientAdminstration/useAdmissionForm";
import PatientHistorySection from "../../../clinicalManagement/PatientHistory/PatientHistorySection";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { AdmissionDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import { showAlert } from "../../../../utils/Common/showAlert";

interface PatientHistory {
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
  } = useAdmissionForm();

  const [patientHistory, setPatientHistory] = useState<PatientHistory>({});
  const { handleDropdownChange } = useDropdownChange<AdmissionDto>(setFormData);

  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);

  const handleOpenBedSelection = useCallback(() => setIsBedSelectionOpen(true), []);
  const handleCloseBedSelection = useCallback(() => setIsBedSelectionOpen(false), []);

  const handleAdvancedSearch = useCallback(async () => {
    // Implement advanced search logic
  }, []);

  const actionButtons: ButtonProps[] = useMemo(() => [
    {
      variant: 'contained',
      size: 'medium',
      icon: SearchIcon,
      text: 'Advanced Search',
      onClick: handleAdvancedSearch,
    },
    {
      variant: 'contained',
      icon: PrintIcon,
      text: 'Print Admission Form',
      size: 'medium',
      onClick: () => {/* Implement print logic */ },
    },
  ], [handleAdvancedSearch]);

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

  const handleHistoryChange = useCallback((historyData: any) => {
    setPatientHistory((prevHistory: PatientHistory) => ({
      ...prevHistory,
      [historyData.type]: historyData
    }));
  }, []);

  // Modify the handleSave function to include saving patient history
  const handleSaveAll = async () => {
    try {
      // Save admission data
      await handleSave();

      // Save patient history data
      for (const historyType in patientHistory) {
        const historyData = patientHistory[historyType];
        // Call the appropriate service to save each type of history
        // For example:
        // if (historyType === 'allergies') {
        //   await allergyService.createOrUpdateAllergy(historyData);
        // }
        // Add similar logic for other history types
      }

      showAlert("Success", "Admission and patient history saved successfully!", "success");
    } catch (error) {
      console.error("Error saving admission and history:", error);
      showAlert("Error", "Failed to save admission and history.", "error");
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
        <CustomButton
          variant="outlined"
          text="Select Bed from Ward View"
          onClick={handleOpenBedSelection}
        />
      </CustomAccordion>
      <GenericDialog
        open={isBedSelectionOpen}
        onClose={handleCloseBedSelection}
        title="Select a Bed"
        maxWidth="xl"
        fullWidth
      >
        <ManageBedDetails
          onBedSelect={handleBedSelect}
          isSelectionMode={true}
        />
      </GenericDialog>
      <CustomAccordion title="Payer Details">
        <InsurancePage
          ref={insurancePageRef}
          pChartID={formData.IPAdmissionDto.pChartID || 0}
          shouldClearData={shouldClearInsuranceData}
        />
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
        <PatientHistorySection
          pChartID={formData.IPAdmissionDto.pChartID || 0}
          opipNo={formData.IPAdmissionDto.pChartID || 0}
          opipCaseNo={formData.IPAdmissionDto.oPIPCaseNo || 0}
          shouldClear={shouldClearPatientHistory}
          onHistoryChange={handleHistoryChange}
          showImmediateSave={false}
        />
      </CustomAccordion>
      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClearAll}
        onSave={handleSaveAll}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
    </Container>
  );
};

export default AdmissionPage;