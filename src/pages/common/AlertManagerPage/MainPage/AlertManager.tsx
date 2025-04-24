// src/pages/common/AlertManagerPage/MainPage/AlertManager.tsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Grid, Card, Divider } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import PatientSearch from "../SubPage/PatientSearch";
import AlertForm from "../SubPage/AlertForm";
import { useLoading } from "@/context/LoadingContext";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { notifyError, notifySuccess } from "@/utils/Common/toastManager";
import { alertService, baseAlertService } from "@/services/CommonServices/CommonModelServices";
import { showAlert } from "@/utils/Common/showAlert";
import AlertGrid from "../SubPage/AlertGrid";
import { RegistrationService } from "@/services/PatientAdministrationServices/RegistrationService/RegistrationService";
import PatientDemographicsForm from "../SubPage/PatientDemographicsForm";

// Improved compact version of AlertManager
const AlertManager: React.FC = () => {
  const { setLoading } = useLoading();
  const [selectedPatient, setSelectedPatient] = useState<{ pChartID: number; pChartCode: string; fullName: string } | null>(null);
  const [patientDemographics, setPatientDemographics] = useState<any>(null);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);
  const [isDemoFormOpen, setIsDemoFormOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refreshDemographics, setRefreshDemographics] = useState(0);

  // Fetch alerts when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientAlerts(selectedPatient.pChartID);
      fetchPatientDemographics(selectedPatient.pChartID);
    } else {
      setAlerts([]);
      setPatientDemographics(null);
    }
  }, [selectedPatient, refreshDemographics]);

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

  const fetchPatientDemographics = async (pChartID: number) => {
    try {
      setLoading(true);
      const result = await RegistrationService.PatientDemoGraph(pChartID);

      if (result.success && result.data) {
        setPatientDemographics(result.data);
      } else {
        notifyError(result.errorMessage || "Failed to fetch patient demographics");
      }
    } catch (error) {
      console.error("Error fetching patient demographics:", error);
      notifyError("An error occurred while fetching patient demographics");
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
    setIsAlertFormOpen(true);
  };

  const handleEditAlert = (alert: AlertDto) => {
    setCurrentAlert(alert);
    setIsEditMode(true);
    setIsAlertFormOpen(true);
  };

  const handleDeleteAlert = async (alert: AlertDto) => {
    const confirmed = await showAlert("Delete Alert", "Are you sure you want to delete this alert?", "warning", true);

    if (confirmed) {
      try {
        setLoading(true);
        const isSuccess = await baseAlertService.updateActiveStatus(alert.oPIPAlertID, true);

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
      notifyWarning("Please select a patient first");
      return;
    }

    setIsDemoFormOpen(true);
  };

  const handleDemographicsSaved = () => {
    setRefreshDemographics((prev) => prev + 1);
  };

  const notifyWarning = (message: string) => {
    showAlert("Warning", message, "warning");
  };

  // Render demographics information
  const renderDemographics = () => {
    if (!patientDemographics) return null;

    const demographics = patientDemographics;

    return (
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Patient Name
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.patientName || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            UHID
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.pChartCode || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Gender
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.gender || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            DOB
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.dateOfBirthOrAge || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Blood Group
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.pBldGrp || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Mobile
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.mobileNumber || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Patient Type
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.patientType || "N/A"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Payment Source
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {demographics.patientPaymentSource || "N/A"}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Page Header */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Alert Manager
      </Typography>

      {/* Patient Search & Demographics - Combined Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Left side - Patient Search */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              Patient Search
            </Typography>
            <PatientSearch onPatientSelect={setSelectedPatient} />
          </Grid>

          {/* Right side - Patient Demographics */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">Patient Demographics</Typography>
              {patientDemographics && (
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={handleEditDemographics}>
                  Edit
                </Button>
              )}
            </Box>
            {selectedPatient ? (
              renderDemographics()
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                Please select a patient to view demographics
              </Typography>
            )}
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
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddAlert} size="medium">
              Add Alert
            </Button>
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
        />
      )}

      {/* Patient Demographics Form Dialog */}
      {isDemoFormOpen && selectedPatient && patientDemographics && (
        <PatientDemographicsForm open={isDemoFormOpen} onClose={() => setIsDemoFormOpen(false)} pChartID={selectedPatient.pChartID} onSaved={handleDemographicsSaved} />
      )}
    </Box>
  );
};

export default AlertManager;
