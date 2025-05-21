// src/pages/common/AlertManagerPage/MainPage/AlertManager.tsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon, Clear as ClearIcon } from "@mui/icons-material";
import { useLoading } from "@/hooks/Common/useLoading";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { notifyError, notifySuccess } from "@/utils/Common/toastManager";
import { alertService, baseAlertService } from "@/services/CommonServices/CommonModelServices";
import AlertGrid from "../SubPage/AlertGrid";
import AlertForm from "../SubPage/AlertForm";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import CustomButton from "@/components/Button/CustomButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientDemographicsForm } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographicsForm/PatientDemographicsForm";
import { PatientDemoGraph } from "@/interfaces/PatientAdministration/patientDemoGraph";

const AlertManager: React.FC = () => {
  const { setLoading } = useLoading();
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);
  const [isDemoFormOpen, setIsDemoFormOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshDemographics, setRefreshDemographics] = useState(0);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(0);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogProps, setConfirmDialogProps] = useState({
    title: "",
    message: "",
    type: "warning" as "warning" | "error" | "info" | "success",
    onConfirm: () => {},
  });

  // Fetch patient alerts when selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientAlerts(selectedPatient.pChartID);
    } else {
      setAlerts([]);
    }
  }, [selectedPatient, refreshDemographics]);

  const fetchPatientAlerts = async (pChartID: number) => {
    try {
      setLoading(true);
      // Use alertService only for GetAlertBypChartID
      const result: OperationResult<AlertDto[]> = await alertService.GetAlertBypChartID(pChartID);

      if (result.success) {
        setAlerts(result.data || []);
      } else {
        notifyError(result.errorMessage || "Failed to fetch alerts");
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      notifyError("An error occurred while fetching alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleClearPatient = () => {
    showConfirmDialog({
      title: "Clear Patient Selection",
      message: "Are you sure you want to clear the current patient selection?",
      type: "warning",
      onConfirm: () => {
        setSelectedPatient(null);
        setClearSearchTrigger((prev) => prev + 1);
        notifySuccess("Patient selection cleared");
      },
    });
  };

  const handleAddAlert = () => {
    if (!selectedPatient) {
      showConfirmDialog({
        title: "Patient Required",
        message: "Please select a patient before adding an alert.",
        type: "info",
        onConfirm: () => {},
      });
      return;
    }

    // Initialize with the correct data types matching the backend DTO
    const newAlert: Partial<AlertDto> = {
      pChartID: selectedPatient.pChartID,
      pChartCode: selectedPatient.pChartCode,
      rActiveYN: "Y",
      oPIPDate: new Date(),
      patOPIPYN: "O",
      oPIPNo: 0,
      oPVID: 0,
      oPIPCaseNo: 0,
      oldPChartID: 0,
      transferYN: "N",
    };

    setCurrentAlert(newAlert as AlertDto);
    setIsEditMode(false);
    setIsAlertFormOpen(true);
  };

  const handleEditAlert = (alert: AlertDto) => {
    // Ensure the date is properly converted to a Date object
    const alertWithDateObject = {
      ...alert,
    };

    setCurrentAlert(alertWithDateObject);
    setIsEditMode(true);
    setIsAlertFormOpen(true);
  };

  const handleDeleteAlert = (alert: AlertDto) => {
    showConfirmDialog({
      title: "Delete Alert",
      message: "Are you sure you want to delete this alert? This action cannot be undone.",
      type: "error",
      onConfirm: () => confirmDeleteAlert(alert),
    });
  };

  const confirmDeleteAlert = async (alert: AlertDto) => {
    try {
      setLoading(true);
      // Use baseAlertService for updateActiveStatus
      const isSuccess = await baseAlertService.updateActiveStatus(alert.oPIPAlertID, false);

      if (isSuccess) {
        setAlerts((prev) => prev.filter((a) => a.oPIPAlertID !== alert.oPIPAlertID));
        notifySuccess("Alert deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      notifyError("Failed to delete alert");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: AlertDto) => {
    try {
      setLoading(true);

      // Ensure the date is in the correct format before sending to the backend
      const formattedData = {
        ...formData,
      };

      // Use baseAlertService for both create and update operations
      const result = await baseAlertService.save(formattedData);

      if (result.success && result.data) {
        // Ensure the returned date is a Date object
        const newAlert = {
          ...result.data,
        };

        if (isEditMode) {
          setAlerts((prev) => prev.map((a) => (a.oPIPAlertID === formData.oPIPAlertID ? newAlert : a)));
        } else {
          setAlerts((prev) => [...prev, newAlert]);
        }

        notifySuccess(`Alert ${isEditMode ? "updated" : "created"} successfully`);
        setIsAlertFormOpen(false);
      } else {
        notifyError(result.errorMessage || `Failed to ${isEditMode ? "update" : "create"} alert`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} alert:`, error);
      notifyError(`Failed to ${isEditMode ? "update" : "create"} alert`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDemographics = () => {
    if (!selectedPatient) {
      showConfirmDialog({
        title: "Patient Required",
        message: "Please select a patient first.",
        type: "info",
        onConfirm: () => {},
      });
      return;
    }

    setIsDemoFormOpen(true);
  };

  const handleRefreshData = () => {
    if (selectedPatient) {
      fetchPatientAlerts(selectedPatient.pChartID);
      setRefreshDemographics((prev) => prev + 1);
      notifySuccess("Data refreshed successfully");
    }
  };

  const handleDemographicsSaved = (data: PatientDemoGraph) => {
    setRefreshDemographics((prev) => prev + 1);
    notifySuccess("Patient demographics updated successfully");
  };

  const showConfirmDialog = ({ title, message, type, onConfirm }: { title: string; message: string; type: "warning" | "error" | "info" | "success"; onConfirm: () => void }) => {
    setConfirmDialogProps({
      title,
      message,
      type,
      onConfirm,
    });
    setConfirmDialogOpen(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Page Header with Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Alert Manager</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {selectedPatient && <CustomButton variant="outlined" color="error" text="Clear Patient" icon={ClearIcon} onClick={handleClearPatient} />}
          <CustomButton variant="outlined" color="primary" text="Refresh Data" icon={RefreshIcon} onClick={handleRefreshData} disabled={!selectedPatient} />
        </Box>
      </Box>

      {/* Patient Search & Demographics - Combined Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Left side - Patient Search */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <Box sx={{ flexGrow: 1 }}>
                {/* Use the reusable PatientSearch component */}
                <PatientSearch onPatientSelect={setSelectedPatient} clearTrigger={clearSearchTrigger} placeholder="Enter name, UHID or phone number" />
              </Box>
            </Box>
          </Grid>

          {/* Right side - Patient Demographics */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Use the reusable PatientDemographics component */}
            <PatientDemographics
              pChartID={selectedPatient?.pChartID}
              showEditButton={!!selectedPatient}
              showRefreshButton={!!selectedPatient}
              onEditClick={handleEditDemographics}
              variant="detailed"
              emptyStateMessage={selectedPatient ? "No demographics information available for this patient." : "Please select a patient to view demographics"}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts Section */}
      {selectedPatient && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">
              Alerts for {selectedPatient.fullName} ({selectedPatient.pChartCode})
            </Typography>

            <ActionButtonGroup
              buttons={[
                {
                  text: "Add Alert",
                  icon: AddIcon,
                  color: "primary",
                  variant: "contained",
                  onClick: handleAddAlert,
                },
              ]}
            />
          </Box>

          <AlertGrid alerts={alerts} onEditAlert={handleEditAlert} onDeleteAlert={handleDeleteAlert} />
        </Paper>
      )}

      {/* Alert Form Dialog */}
      {isAlertFormOpen && currentAlert && (
        <AlertForm
          open={isAlertFormOpen}
          onClose={() => setIsAlertFormOpen(false)}
          alert={currentAlert}
          isEditMode={isEditMode}
          onSubmit={handleFormSubmit}
          patientName={selectedPatient?.fullName || ""}
          pChartCode={selectedPatient?.pChartCode || ""}
        />
      )}

      {/* Patient Demographics Form Dialog - Using the reusable component */}
      {isDemoFormOpen && selectedPatient && (
        <PatientDemographicsForm
          open={isDemoFormOpen}
          onClose={() => setIsDemoFormOpen(false)}
          pChartID={selectedPatient.pChartID}
          onSaved={handleDemographicsSaved}
          title="Edit Patient Demographics"
          confirmUnsavedChanges={true}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmDialogProps.onConfirm}
        title={confirmDialogProps.title}
        message={confirmDialogProps.message}
        type={confirmDialogProps.type}
      />
    </Box>
  );
};

export default AlertManager;
