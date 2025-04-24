import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, IconButton, Tooltip } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import PatientSearch from "./PatientSearch";
import AlertForm from "./AlertForm";
import { useLoading } from "@/context/LoadingContext";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { notifyError, notifySuccess } from "@/utils/Common/toastManager";
import { alertService, baseAlertService } from "@/services/CommonServices/CommonModelServices";
import { showAlert } from "@/utils/Common/showAlert";
import AlertGrid from "./AlertGrid";

const AlertManager: React.FC = () => {
  const { setLoading } = useLoading();
  const [selectedPatient, setSelectedPatient] = useState<{ pChartID: number; pChartCode: string; fullName: string } | null>(null);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch alerts when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientAlerts(selectedPatient.pChartID);
    } else {
      setAlerts([]);
    }
  }, [selectedPatient]);

  const fetchPatientAlerts = async (pChartID: number) => {
    try {
      setLoading(true);
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

  const handleAddAlert = () => {
    if (!selectedPatient) {
      notifyWarning("Please select a patient first");
      return;
    }

    // Create empty alert with patient info
    const newAlert: Partial<AlertDto> = {
      pChartID: selectedPatient.pChartID,
      pChartCode: selectedPatient.pChartCode,
      rActiveYN: "Y",
      oPIPDate: new Date(),
    };

    setCurrentAlert(newAlert as AlertDto);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditAlert = (alert: AlertDto) => {
    setCurrentAlert(alert);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleDeleteAlert = async (alert: AlertDto) => {
    const confirmed = await showAlert("Delete Alert", "Are you sure you want to delete this alert?", "warning", true);

    if (confirmed) {
      try {
        setLoading(true);
        const isSuccess = await baseAlertService.updateActiveStatus(alert.oPIPAlertID, true); //felete pass false else true

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
    }
  };

  const handleFormSubmit = async (formData: AlertDto) => {
    try {
      setLoading(true);

      const result = isEditMode ? await baseAlertService.save(formData) : await baseAlertService.save(formData);

      if (result.success && result.data) {
        if (isEditMode) {
          setAlerts((prev) => prev.map((a) => (a.oPIPAlertID === formData.oPIPAlertID ? result.data : a)));
        } else {
          setAlerts((prev) => [...prev, result.data]);
        }

        notifySuccess(`Alert ${isEditMode ? "updated" : "created"} successfully`);
        setIsFormOpen(false);
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

  const notifyWarning = (message: string) => {
    showAlert("Warning", message, "warning");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Alert Manager
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Patient Search
        </Typography>
        <PatientSearch onPatientSelect={setSelectedPatient} />
      </Paper>

      {selectedPatient && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">
              Alerts for {selectedPatient.fullName} ({selectedPatient.pChartCode})
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddAlert}>
              Add Alert
            </Button>
          </Box>

          <AlertGrid alerts={alerts} onEditAlert={handleEditAlert} onDeleteAlert={handleDeleteAlert} />
        </Paper>
      )}

      {isFormOpen && currentAlert && (
        <AlertForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          alert={currentAlert}
          isEditMode={isEditMode}
          onSubmit={handleFormSubmit}
          patientName={selectedPatient?.fullName || ""}
        />
      )}
    </Box>
  );
};

export default AlertManager;
