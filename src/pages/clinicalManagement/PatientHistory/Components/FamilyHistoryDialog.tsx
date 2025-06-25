// src/pages/patientAdministration/AdmissionPage/Components/FamilyHistoryDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { OPIPHistFHDto } from "@/interfaces/ClinicalManagement/OPIPHistFHDto";
import { useAlert } from "@/providers/AlertProvider";
import { fhService } from "@/services/ClinicalManagementServices/clinicalManagementService";
import { formatDt } from "@/utils/Common/dateUtils";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FamilyRestroom as FamilyIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as PastMedicalIcon,
  Refresh as RefreshIcon,
  Psychology as ReviewIcon,
  Assignment as SocialIcon,
  Healing as SurgicalIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { Alert, Avatar, Box, Chip, IconButton, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import FamilyHistoryForm from "../Forms/FamilyHistoryForm";

interface FamilyHistoryDialogProps {
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

const FamilyHistoryDialog: React.FC<FamilyHistoryDialogProps> = ({ open, onClose, admission }) => {
  const [familyHistoryList, setFamilyHistoryList] = useState<OPIPHistFHDto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<OPIPHistFHDto | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<OPIPHistFHDto | null>(null);
  const { isLoading, setLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { showAlert } = useAlert();

  // Fetch family history list
  const fetchFamilyHistoryList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fhService.getAll();
      if (result.success && result.data) {
        setFamilyHistoryList(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch family history");
      }
    } catch (err) {
      console.error("Error fetching family history:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Filter family histories for current patient
  const patientFamilyHistories = useMemo(() => {
    if (!admission) return [];

    return familyHistoryList
      .filter((history) => history.pChartID === admission.ipAdmissionDto.pChartID && history.rActiveYN === "Y")
      .sort((a, b) => new Date(b.opipFHDate).getTime() - new Date(a.opipFHDate).getTime());
  }, [familyHistoryList, admission]);

  // Load family history when dialog opens - Fixed to prevent continuous calls
  useEffect(() => {
    if (open && admission && !hasInitialized) {
      fetchFamilyHistoryList();
      setHasInitialized(true);
    } else if (!open) {
      // Reset initialization flag when dialog closes
      setHasInitialized(false);
      setTabValue(0); // Reset to first tab
    }
  }, [open, admission, hasInitialized, fetchFamilyHistoryList]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle add new family history
  const handleAddNew = useCallback(() => {
    setSelectedHistory(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  // Handle edit family history
  const handleEdit = useCallback((history: OPIPHistFHDto) => {
    setSelectedHistory(history);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  // Handle view family history
  const handleView = useCallback((history: OPIPHistFHDto) => {
    setSelectedHistory(history);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  // Handle delete click
  const handleDeleteClick = useCallback((history: OPIPHistFHDto) => {
    setHistoryToDelete(history);
    setIsDeleteConfirmOpen(true);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (!historyToDelete) return;

    try {
      const result = await fhService.delete(historyToDelete.opipFHID);
      if (result.success) {
        showAlert("Success", "Family history deleted successfully", "success");
        fetchFamilyHistoryList();
      } else {
        throw new Error(result.errorMessage || "Failed to delete family history");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete family history", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
      setHistoryToDelete(null);
    }
  }, [historyToDelete, showAlert, fetchFamilyHistoryList]);

  // Handle form submit
  const handleFormSubmit = useCallback(
    async (data: OPIPHistFHDto) => {
      try {
        const result = await fhService.save(data);
        if (result.success) {
          showAlert("Success", data.opipFHID ? "Family history updated successfully" : "Family history added successfully", "success");
          setIsFormOpen(false);
          fetchFamilyHistoryList();
        } else {
          throw new Error(result.errorMessage || "Failed to save family history");
        }
      } catch (error) {
        console.error("Error saving family history:", error);
        throw error;
      }
    },
    [showAlert, fetchFamilyHistoryList]
  );

  // Handle form close
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedHistory(null);
    setIsViewMode(false);
  }, []);

  // Grid columns
  const columns: Column<OPIPHistFHDto>[] = [
    {
      key: "opipFHDate",
      header: "Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (history) => <Typography variant="body2">{formatDt(history.opipFHDate)}</Typography>,
    },
    {
      key: "opipFHDesc",
      header: "Family History Description",
      visible: true,
      sortable: true,
      width: 400,
      render: (history) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {history.opipFHDesc}
          </Typography>
        </Box>
      ),
    },
    {
      key: "opipFHNotes",
      header: "Notes",
      visible: true,
      sortable: false,
      width: 200,
      render: (history) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {history.opipFHNotes || "-"}
        </Typography>
      ),
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      render: (history) => (
        <Chip label={history.rActiveYN === "Y" ? "Active" : "Inactive"} size="small" color={history.rActiveYN === "Y" ? "success" : "default"} variant="filled" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 150,
      render: (history) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary" onClick={() => handleView(history)} title="View">
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info" onClick={() => handleEdit(history)} title="Edit">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDeleteClick(history)} title="Delete">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const patientName = admission
    ? `${admission.ipAdmissionDto.pTitle} ${admission.ipAdmissionDto.pfName} ${admission.ipAdmissionDto.pmName || ""} ${admission.ipAdmissionDto.plName}`.trim()
    : "Patient";

  // Render family history content
  const renderFamilyHistoryContent = () => (
    <>
      {/* Action buttons specific to Family History */}
      <Box display="flex" justifyContent="flex-end" gap={1} mb={2}>
        <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={fetchFamilyHistoryList} asynchronous size="small" />
        <CustomButton variant="contained" icon={AddIcon} text="Add Family History" onClick={handleAddNew} color="success" size="small" />
      </Box>

      {/* Family History List */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {patientFamilyHistories.length === 0 && !isLoading ? (
        <Alert severity="info">No family history records found for this patient. Click "Add Family History" to create one.</Alert>
      ) : (
        <CustomGrid
          columns={columns}
          data={patientFamilyHistories}
          loading={isLoading}
          maxHeight="400px"
          emptyStateMessage="No family history records found"
          rowKeyField="opipFHID"
          showDensityControls={false}
        />
      )}
    </>
  );

  // Placeholder for other history tabs
  const renderComingSoon = (historyType: string) => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
      <Alert severity="info">
        <Typography variant="body1">{historyType} will be available soon.</Typography>
      </Alert>
    </Box>
  );

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
        <Box sx={{ p: 2 }}>
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

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            {renderFamilyHistoryContent()}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {renderComingSoon("Social History")}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {renderComingSoon("Past Medical History")}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {renderComingSoon("Past Surgical History")}
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            {renderComingSoon("Review of Systems")}
          </TabPanel>
        </Box>
      </GenericDialog>

      {/* Family History Form Dialog */}
      {isFormOpen && (
        <FamilyHistoryForm open={isFormOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} admission={admission} existingHistory={selectedHistory} viewOnly={isViewMode} />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Family History"
        message="Are you sure you want to delete this family history record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
      />
    </>
  );
};

export default FamilyHistoryDialog;
