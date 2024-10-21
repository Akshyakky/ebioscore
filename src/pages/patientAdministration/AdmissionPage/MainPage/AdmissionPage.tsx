//src/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage.tsx
import React, { useMemo, useRef, useState } from "react";
import { Container, Box, Paper, Tabs, Tab, useTheme } from "@mui/material";
import InsurancePage from "../../RegistrationPage/SubPage/InsurancePage";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import { Search as SearchIcon, Print as PrintIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import AdmissionDetails from "../SubPage/AdmissionDetails";
import { AdmissionDto, IPAdmissionDto, IPAdmissionDetailsDto, WrBedDetailsDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import { extendedAdmissionService } from "../../../../services/PatientAdministrationServices/patientAdministrationService";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import CustomAccordion from "../../../../components/Accordion/CustomAccordion";
import { WrBedDto } from "../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import CustomButton from "../../../../components/Button/CustomButton";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import ManageBedDetails from "../../ManageBed/SubPage/ManageBedDetails";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";
import { IcdDetailDto } from "../../../../interfaces/ClinicalManagement/IcdDetailDto";
import DiagnosisSection from "../../../clinicalManagement/Common/Diagnosis";
import AddAllergiesHistory from "../../../clinicalManagement/PatientHistory/Allergies/AddAllergiesPage";
import AddPastMedicalHistory from "../../../clinicalManagement/PatientHistory/PastMedicalHistory/AddPastMedicalHistory";
import AddPastSurgicalHistory from "../../../clinicalManagement/PatientHistory/PastSurgicalHistory/AddPastSurgicalHistory";
import AddPastReviewOfSystem from "../../../clinicalManagement/PatientHistory/PastReviewOfSystem/AddPastReviewOfSystem";
import AddSocialHistory from "../../../clinicalManagement/PatientHistory/PastSocialHistory/AddSocialHistory";
import AddFamilyHistory from "../../../clinicalManagement/PatientHistory/FamilyHistory/AddFamilyHistory";
import AddPastMedicationHistory from "../../../clinicalManagement/PatientHistory/PastMedicationHistory/AddPastMedicationHistory";

const AdmissionPage: React.FC = () => {
  const [formData, setFormData] = useState<AdmissionDto>({
    IPAdmissionDto: {} as IPAdmissionDto,
    IPAdmissionDetailsDto: {} as IPAdmissionDetailsDto,
    WrBedDetailsDto: {} as WrBedDetailsDto
  });
  const [primaryDiagnoses, setPrimaryDiagnoses] = useState<IcdDetailDto[]>([]);
  const [associatedDiagnoses, setAssociatedDiagnoses] = useState<IcdDetailDto[]>([]);
  const insurancePageRef = useRef<any>(null);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);
  const { handleDropdownChange } = useDropdownChange<AdmissionDto>(setFormData);
  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState(0);

  const theme = useTheme();

  const handleHistoryTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveHistoryTab(newValue);
  };

  const handleOpenBedSelection = () => {
    setIsBedSelectionOpen(true);
  };

  const handleCloseBedSelection = () => {
    setIsBedSelectionOpen(false);
  };

  const handleChange = (field: keyof AdmissionDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData({
      IPAdmissionDto: {} as IPAdmissionDto,
      IPAdmissionDetailsDto: {} as IPAdmissionDetailsDto,
      WrBedDetailsDto: {} as WrBedDetailsDto
    });
    setPrimaryDiagnoses([]);
    setAssociatedDiagnoses([]);
    setShouldClearInsuranceData(true);
  };

  const handleSave = async () => {
    try {
      const admissionData = {
        ...formData,
        PrimaryDiagnoses: primaryDiagnoses,
        AssociatedDiagnoses: associatedDiagnoses,
      };
      const result = await extendedAdmissionService.admitPatient(admissionData);
      console.log("Admission saved:", result);
    } catch (error) {
      console.error("Error saving admission:", error);
    }
  };

  const handleAdvancedSearch = async () => {
    // Implement advanced search logic
  };

  const { fetchPatientSuggestions } = usePatientAutocomplete();

  const handlePatientSelect = (pChartID: number | null) => {
    if (pChartID) {

    }
  };

  const handleBedSelect = (bed: WrBedDto) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        WrBedDetailsDto: {
          ...prev.WrBedDetailsDto,
          bedID: bed.bedID,
          bedName: bed.bedName,
          rGrpID: bed.roomList?.roomGroup?.rGrpID || 0,
          rGrpName: bed.roomList?.roomGroup?.rGrpName || ""
        },
        IPAdmissionDetailsDto: {
          ...prev.IPAdmissionDetailsDto,
          rlID: bed.rlID,
          rName: bed.roomList?.rName || "",
          wCatID: bed.wbCatID || 0,
          wCatName: bed.wbCatName || ""
        },
      };
      return newFormData;
    });
    handleCloseBedSelection();
  };

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
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary
          }}
        >
          <Tabs
            value={activeHistoryTab}
            onChange={handleHistoryTabChange}
            aria-label="patient history tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Allergies" />
            <Tab label="Past Medical History" />
            <Tab label="Past Surgical History" />
            <Tab label="Past Medication History" />
            <Tab label="Review of System" />
            <Tab label="Social History" />
            <Tab label="Family History" />
          </Tabs>
          <Box sx={{ mt: 2 }}>
            {activeHistoryTab === 0 && (
              <AddAllergiesHistory
                pChartId={formData.IPAdmissionDto.pChartID || 0}
                opipNo={formData.IPAdmissionDto.pChartID || 0}
                opipCaseNo={formData.IPAdmissionDto.pChartID || 0}
              />
            )}
            {activeHistoryTab === 1 && (
              <AddPastMedicalHistory
                pchartId={formData.IPAdmissionDto.pChartID || 0}
                opipNo={formData.IPAdmissionDto.pChartID || 0}
                opipCaseNo={formData.IPAdmissionDto.pChartID || 0}
              />
            )}
            {activeHistoryTab === 2 && (
              <AddPastSurgicalHistory
                pchartId={formData.IPAdmissionDto.pChartID || 0}
                opipNo={formData.IPAdmissionDto.pChartID || 0}
                opipCaseNo={formData.IPAdmissionDto.pChartID || 0}
              />
            )}
            {activeHistoryTab === 3 && (
              <AddPastMedicationHistory
                pchartId={formData.IPAdmissionDto.pChartID || 0}
                opipNo={formData.IPAdmissionDto.pChartID || 0}
                opipCaseNo={formData.IPAdmissionDto.pChartID || 0}
              />
            )}
            {activeHistoryTab === 4 && (
              <AddPastReviewOfSystem
                pchartId={formData.IPAdmissionDto.pChartID || 0}
                opipNo={formData.IPAdmissionDto.pChartID || 0}
                opipCaseNo={formData.IPAdmissionDto.pChartID || 0}
              />
            )}
            {activeHistoryTab === 5 && (
              <AddSocialHistory
                pchartId={formData.IPAdmissionDto.pChartID || 0}
                opipNo={formData.IPAdmissionDto.pChartID || 0}
                opipCaseNo={formData.IPAdmissionDto.pChartID || 0}
              />
            )}
            {activeHistoryTab === 6 && (
              <AddFamilyHistory
                pchartId={formData.IPAdmissionDto.pChartID || 0}
                opipNo={formData.IPAdmissionDto.pChartID || 0}
                opipCaseNo={formData.IPAdmissionDto.pChartID || 0}
              />
            )}
          </Box>
        </Paper>
      </CustomAccordion>
      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
    </Container>
  );
};

export default AdmissionPage;