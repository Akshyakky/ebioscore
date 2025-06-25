import CustomButton from "@/components/Button/CustomButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import {
  FamilyRestroom as FamilyIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as PastMedicalIcon,
  Psychology as ReviewIcon,
  Assignment as SocialIcon,
  Healing as SurgicalIcon,
} from "@mui/icons-material";
import { Avatar, Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { SocialHistoryForm } from "../Forms/SocialHistoryForm";
import { useFamilyHistory, useSocialHistory } from "../hook/usePatientHistory";
import { FamilyHistoryForm } from "./../Forms/FamilyHistoryForm";
import { FamilyHistory } from "./FamilyHistory";
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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<any>(null);
  const [currentHistoryType, setCurrentHistoryType] = useState<"family" | "social">("family");
  const { setLoading } = useLoading();
  const [tabValue, setTabValue] = useState(0);

  const { showAlert } = useAlert();

  useEffect(() => {
    if (!open || !admission) return;

    if (tabValue === 0) {
      fetchFamilyHistoryList();
    } else if (tabValue === 1) {
      fetchSocialHistoryList();
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
      default:
        setCurrentHistoryType("family");
    }
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!historyToDelete) return;

    try {
      const result: any = currentHistoryType === "family" ? await deleteFamilyHistory(historyToDelete) : await deleteSocialHistory(historyToDelete);

      if (result.success) {
        showAlert("Success", `${currentHistoryType === "family" ? "Family" : "Social"} history deleted successfully`, "success");
      } else {
        throw new Error(result.errorMessage || `Failed to delete ${currentHistoryType} history`);
      }
    } catch (error) {
      showAlert("Error", `Failed to delete ${currentHistoryType} history`, "error");
    } finally {
      setIsDeleteConfirmOpen(false);
      setHistoryToDelete(null);
    }
  }, [historyToDelete, currentHistoryType, deleteFamilyHistory, deleteSocialHistory, showAlert]);

  const handleFormSubmit = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        const result = currentHistoryType === "family" ? await saveFamilyHistory(data) : await saveSocialHistory(data);

        if (result.success) {
          showAlert(
            "Success",
            data[currentHistoryType === "family" ? "opipFHID" : "opipSHID"]
              ? `${currentHistoryType === "family" ? "Family" : "Social"} history updated successfully`
              : `${currentHistoryType === "family" ? "Family" : "Social"} history added successfully`,
            "success"
          );
          setIsFormOpen(false);
        } else {
          throw new Error(result.errorMessage || `Failed to save ${currentHistoryType} history`);
        }
      } catch (error) {
        console.error(`Error saving ${currentHistoryType} history:`, error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentHistoryType, saveFamilyHistory, saveSocialHistory, showAlert, setLoading]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedHistory(null);
    setIsViewMode(false);
  }, []);

  const patientName = admission
    ? `${admission.ipAdmissionDto.pTitle} ${admission.ipAdmissionDto.pfName} ${admission.ipAdmissionDto.pmName || ""} ${admission.ipAdmissionDto.plName}`.trim()
    : "Patient";

  const handleAddNew = useCallback(() => {
    setSelectedHistory(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((history: any) => {
    setSelectedHistory(history);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((history: any) => {
    setSelectedHistory(history);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((history: any) => {
    setHistoryToDelete(history);
    setIsDeleteConfirmOpen(true);
  }, []);

  console.log(currentHistoryType, "currentHistoryType");
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
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${currentHistoryType === "family" ? "Family" : "Social"} History`}
        message={`Are you sure you want to delete this ${currentHistoryType} history record? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
      />
    </>
  );
};

export default PatientHistoryDialog;
