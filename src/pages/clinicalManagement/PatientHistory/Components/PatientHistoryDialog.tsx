// src/pages/clinicalManagement/PatientHistory/Components/PatientHistoryDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import {
  LocalPharmacy as AllergyIcon,
  FamilyRestroom as FamilyIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon,
  LocalHospital as PastMedicalIcon,
  Psychology as ReviewIcon,
  Assignment as SocialIcon,
  Healing as SurgicalIcon,
} from "@mui/icons-material";
import { Avatar, Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { PastMedicalHistoryForm } from "../Forms/PastMedicalHistoryForm";
import { PastMedicationForm } from "../Forms/PastMedicationForm";
import { PastSurgicalHistoryForm } from "../Forms/PastSurgicalHistoryForm";
import { ReviewOfSystemForm } from "../Forms/ReviewOfSystemForm";
import { SocialHistoryForm } from "../Forms/SocialHistoryForm";
import { useAllergy, useFamilyHistory, usePastMedication, usePMHHistory, usePSHHistory, useROSHistory, useSocialHistory } from "../hook/usePatientHistory";
import { AllergyForm } from "./../Forms/AllergyForm";
import { FamilyHistoryForm } from "./../Forms/FamilyHistoryForm";
import { AllergyHistory } from "./AllergyHistory";
import { FamilyHistory } from "./FamilyHistory";
import PastMedicalHistory from "./PastMedicalHistory";
import { PastMedicationHistory } from "./PastMedicationHistory";
import PastSurgicalHistory from "./PastSurgicalHistory";
import ReviewOfSystem from "./ReviewOfSystem";
import { SocialHistory } from "./SocialHistory";

interface PatientHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  admission: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`patient-history-tabpanel-${index}`} aria-labelledby={`patient-history-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 1.5 }}>{children}</Box>}
    </div>
  );
};

const PatientHistoryDialog: React.FC<PatientHistoryDialogProps> = ({ open, onClose, admission }) => {
  const { familyHistoryList, fetchFamilyHistoryList, saveFamilyHistory, deleteFamilyHistory } = useFamilyHistory();
  const { socialHistoryList, fetchSocialHistoryList, saveSocialHistory, deleteSocialHistory } = useSocialHistory();
  const { rosHistoryList, fetchRosHistoryList, saveRosHistory, deleteRosHistory } = useROSHistory();
  const { pmhHistoryList, fetchPMHHistoryList, savePMHHistory, deletePMHHistory } = usePMHHistory();
  const { pshHistoryList, fetchPSHHistoryList, savePSHHistory, deletePSHHistory } = usePSHHistory();
  const { allergyList, fetchAllergyList, saveAllergy, deleteAllergy } = useAllergy();
  const { pastMedicationList, fetchPastMedicationList, savePastMedication, getPastMedicationById, deletePastMedication } = usePastMedication();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<any>(null);
  const [currentHistoryType, setCurrentHistoryType] = useState<"family" | "social" | "pmh" | "psh" | "ros" | "allergy" | "pastMedication">("family");
  const { setLoading } = useLoading();
  const [tabValue, setTabValue] = useState(0);

  const { showAlert } = useAlert();

  useEffect(() => {
    if (!open || !admission) return;

    if (tabValue === 0) {
      fetchFamilyHistoryList();
    } else if (tabValue === 1) {
      fetchSocialHistoryList();
    } else if (tabValue === 2) {
      fetchPMHHistoryList();
    } else if (tabValue === 3) {
      fetchPSHHistoryList();
    } else if (tabValue === 4) {
      fetchRosHistoryList();
    } else if (tabValue === 5) {
      fetchAllergyList();
    } else if (tabValue === 6) {
      fetchPastMedicationList();
    }
  }, [open, admission, tabValue]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    switch (newValue) {
      case 0:
        setCurrentHistoryType("family");
        break;
      case 1:
        setCurrentHistoryType("social");
        break;
      case 2:
        setCurrentHistoryType("pmh");
        break;
      case 3:
        setCurrentHistoryType("psh");
        break;
      case 4:
        setCurrentHistoryType("ros");
        break;
      case 5:
        setCurrentHistoryType("allergy");
        break;
      case 6:
        setCurrentHistoryType("pastMedication");
        break;
      default:
        setCurrentHistoryType("family");
    }
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!historyToDelete) return;

    try {
      let result: any = null;

      switch (currentHistoryType) {
        case "family":
          result = await deleteFamilyHistory(historyToDelete.opipFHID);
          break;
        case "social":
          result = await deleteSocialHistory(historyToDelete.opipSHID);
          break;
        case "pmh":
          result = await deletePMHHistory(historyToDelete.opippmhId);
          break;
        case "psh":
          result = await deletePSHHistory(historyToDelete.opipPshId);
          break;
        case "ros":
          result = await deleteRosHistory(historyToDelete.opipRosID);
          break;
        case "allergy":
          result = await deleteAllergy(historyToDelete.opIPHistAllergyMastDto.opipAlgId);
          break;
        case "pastMedication":
          result = await deletePastMedication(historyToDelete.opipPastMedID);
          break;
      }

      if (result) {
        showAlert(
          "Success",
          `${currentHistoryType === "allergy" ? "Allergy" : currentHistoryType === "pastMedication" ? "Past medication" : currentHistoryType} history deleted successfully`,
          "success"
        );

        // Refresh the list after deletion
        switch (currentHistoryType) {
          case "family":
            await fetchFamilyHistoryList();
            break;
          case "social":
            await fetchSocialHistoryList();
            break;
          case "pmh":
            await fetchPMHHistoryList();
            break;
          case "psh":
            await fetchPSHHistoryList();
            break;
          case "ros":
            await fetchRosHistoryList();
            break;
          case "allergy":
            await fetchAllergyList();
            break;
          case "pastMedication":
            await fetchPastMedicationList();
            break;
        }
      } else {
        throw new Error(`Failed to delete ${currentHistoryType} history`);
      }
    } catch (error) {
      showAlert("Error", `Failed to delete ${currentHistoryType} history`, "error");
    } finally {
      setIsDeleteConfirmOpen(false);
      setHistoryToDelete(null);
    }
  }, [
    historyToDelete,
    currentHistoryType,
    deleteFamilyHistory,
    deleteSocialHistory,
    deletePMHHistory,
    deletePSHHistory,
    deleteRosHistory,
    deleteAllergy,
    deletePastMedication,
    showAlert,
  ]);

  const handleFormSubmit = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        let result: any = null;

        switch (currentHistoryType) {
          case "family":
            result = await saveFamilyHistory(data);
            break;
          case "social":
            result = await saveSocialHistory(data);
            break;
          case "pmh":
            result = await savePMHHistory(data);
            break;
          case "psh":
            result = await savePSHHistory(data);
            break;
          case "ros":
            result = await saveRosHistory(data);
            break;
          case "allergy":
            result = await saveAllergy(data);
            break;
          case "pastMedication":
            result = await savePastMedication(data);
            break;
        }

        if (result && (result.success !== undefined ? result.success : true)) {
          showAlert(
            "Success",
            `${currentHistoryType === "allergy" ? "Allergy" : currentHistoryType === "pastMedication" ? "Past medication" : "History"} saved successfully`,
            "success"
          );
          setIsFormOpen(false);

          switch (currentHistoryType) {
            case "family":
              await fetchFamilyHistoryList();
              break;
            case "social":
              await fetchSocialHistoryList();
              break;
            case "pmh":
              await fetchPMHHistoryList();
              break;
            case "psh":
              await fetchPSHHistoryList();
              break;
            case "ros":
              await fetchRosHistoryList();
              break;
            case "allergy":
              await fetchAllergyList();
              break;
            case "pastMedication":
              await fetchPastMedicationList();
              break;
          }
        } else {
          throw new Error(`Failed to save ${currentHistoryType} history`);
        }
      } catch (error) {
        console.error(`Error saving ${currentHistoryType} history:`, error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentHistoryType, saveFamilyHistory, saveSocialHistory, savePMHHistory, savePSHHistory, saveRosHistory, saveAllergy, savePastMedication, showAlert, setLoading]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedHistory(null);
    setIsViewMode(false);
  }, []);

  const patientName = admission
    ? `${admission.ipAdmissionDto.pTitle} ${admission.ipAdmissionDto.pfName} ${admission.ipAdmissionDto.pmName || ""} ${admission.ipAdmissionDto.plName}`.trim()
    : "Patient";

  const fetchPastMedicationById = async (id: number) => {
    return await getPastMedicationById(id);
  };
  const handleAddNew = useCallback(() => {
    setSelectedHistory(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback(async (history: any) => {
    if (tabValue === 0) {
      const selectedPastMedication = await fetchPastMedicationById(history.opipPastMedID);
      setSelectedHistory(selectedPastMedication);
    } else {
      setSelectedHistory(history);
    }
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback(async (history: any) => {
    if (tabValue === 0) {
      const selectedPastMedication = await fetchPastMedicationById(history.opipPastMedID);
      setSelectedHistory(selectedPastMedication);
    } else {
      setSelectedHistory(history);
    }
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((history: any) => {
    setHistoryToDelete(history);
    setIsDeleteConfirmOpen(true);
  }, []);

  return (
    <>
      <GenericDialog
        open={open}
        onClose={onClose}
        title={`Patient History - ${patientName}`}
        maxWidth="lg"
        fullWidth
        showCloseButton
        actions={
          <Box display="flex" justifyContent="flex-end" width="100%" gap={1}>
            <CustomButton variant="contained" text="Close" onClick={onClose} color="primary" size="small" />
          </Box>
        }
      >
        <Box sx={{ p: 2, minHeight: 600 }}>
          {/* Patient Info Header */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "primary.50",
              border: "1px solid",
              borderColor: "primary.200",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                <MedicalIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  {patientName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  UHID: {admission?.ipAdmissionDto.pChartCode} | Admission: {admission?.ipAdmissionDto.admitCode}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Tabs for different history types */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient history tabs" variant="scrollable" scrollButtons="auto">
              <Tab
                label="Family History"
                icon={<FamilyIcon fontSize="small" />}
                iconPosition="start"
                id="patient-history-tab-0"
                aria-controls="patient-history-tabpanel-0"
                sx={{ minHeight: 48, textTransform: "none" }}
              />
              <Tab
                label="Social History"
                icon={<SocialIcon fontSize="small" />}
                iconPosition="start"
                id="patient-history-tab-1"
                aria-controls="patient-history-tabpanel-1"
                sx={{ minHeight: 48, textTransform: "none" }}
              />
              <Tab
                label="Past Medical History"
                icon={<PastMedicalIcon fontSize="small" />}
                iconPosition="start"
                id="patient-history-tab-2"
                aria-controls="patient-history-tabpanel-2"
                sx={{ minHeight: 48, textTransform: "none" }}
              />
              <Tab
                label="Past Surgical History"
                icon={<SurgicalIcon fontSize="small" />}
                iconPosition="start"
                id="patient-history-tab-3"
                aria-controls="patient-history-tabpanel-3"
                sx={{ minHeight: 48, textTransform: "none" }}
              />
              <Tab
                label="Review of Systems"
                icon={<ReviewIcon fontSize="small" />}
                iconPosition="start"
                id="patient-history-tab-4"
                aria-controls="patient-history-tabpanel-4"
                sx={{ minHeight: 48, textTransform: "none" }}
              />
              <Tab
                label="Allergies"
                icon={<AllergyIcon fontSize="small" />}
                iconPosition="start"
                id="patient-history-tab-5"
                aria-controls="patient-history-tabpanel-5"
                sx={{ minHeight: 48, textTransform: "none" }}
              />
              <Tab
                label="Past Medications"
                icon={<MedicationIcon fontSize="small" />}
                iconPosition="start"
                id="patient-history-tab-6"
                aria-controls="patient-history-tabpanel-6"
                sx={{ minHeight: 48, textTransform: "none" }}
              />
            </Tabs>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabPanel value={tabValue} index={0}>
              <FamilyHistory
                admission={admission}
                historyList={familyHistoryList}
                fetchHistoryList={fetchFamilyHistoryList}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteClick}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <SocialHistory
                admission={admission}
                historyList={socialHistoryList}
                fetchHistoryList={fetchSocialHistoryList}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteClick}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <PastMedicalHistory
                admission={admission}
                historyList={pmhHistoryList}
                fetchHistoryList={fetchPMHHistoryList}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteClick}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <PastSurgicalHistory
                admission={admission}
                historyList={pshHistoryList}
                fetchHistoryList={fetchPSHHistoryList}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteClick}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <ReviewOfSystem
                admission={admission}
                historyList={rosHistoryList}
                fetchHistoryList={fetchRosHistoryList}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteClick}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <AllergyHistory
                admission={admission}
                historyList={allergyList}
                fetchHistoryList={fetchAllergyList}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteClick}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={6}>
              <PastMedicationHistory
                admission={admission}
                historyList={pastMedicationList}
                fetchHistoryList={fetchPastMedicationList}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteClick}
              />
            </TabPanel>
          </Box>
        </Box>
      </GenericDialog>

      {/* Family History Form */}
      {isFormOpen && currentHistoryType === "family" && (
        <FamilyHistoryForm open={isFormOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} admission={admission} existingHistory={selectedHistory} viewOnly={isViewMode} />
      )}

      {/* Social History Form */}
      {isFormOpen && currentHistoryType === "social" && (
        <SocialHistoryForm open={isFormOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} admission={admission} existingHistory={selectedHistory} viewOnly={isViewMode} />
      )}

      {/* Past Medical History Form */}
      {isFormOpen && currentHistoryType === "pmh" && (
        <PastMedicalHistoryForm
          open={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          admission={admission}
          existingHistory={selectedHistory}
          viewOnly={isViewMode}
        />
      )}

      {/* Past Surgical History Form */}
      {isFormOpen && currentHistoryType === "psh" && (
        <PastSurgicalHistoryForm
          open={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          admission={admission}
          existingHistory={selectedHistory}
          viewOnly={isViewMode}
        />
      )}

      {/* Review of system History Form */}
      {isFormOpen && currentHistoryType === "ros" && (
        <ReviewOfSystemForm open={isFormOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} admission={admission} existingHistory={selectedHistory} viewOnly={isViewMode} />
      )}

      {/* Allergy Form */}
      {isFormOpen && currentHistoryType === "allergy" && (
        <AllergyForm open={isFormOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} admission={admission} existingAllergy={selectedHistory} viewOnly={isViewMode} />
      )}

      {/* Past Medication Form */}
      {isFormOpen && currentHistoryType === "pastMedication" && (
        <PastMedicationForm
          open={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          admission={admission}
          existingMedication={selectedHistory}
          viewOnly={isViewMode}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${currentHistoryType === "allergy" ? "Allergy" : currentHistoryType === "pastMedication" ? "Past Medication" : currentHistoryType} History`}
        message={`Are you sure you want to delete this ${
          currentHistoryType === "allergy" ? "allergy" : currentHistoryType === "pastMedication" ? "past medication" : currentHistoryType + " history"
        } record? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
      />
    </>
  );
};

export default PatientHistoryDialog;
