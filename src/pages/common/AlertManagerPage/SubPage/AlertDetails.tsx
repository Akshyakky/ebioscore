// src/pages/common/AlertManagerPage/SubPage/AlertDetails.tsx
import React, { useState, useCallback, useEffect } from "react";
import { Grid, Paper, Typography, Box, Divider } from "@mui/material";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { showAlert } from "@/utils/Common/showAlert";
import PatientSelector from "./PatientSelector";
import AlertForm from "./AlertForm";
import AlertList from "./AlertList";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "@/context/LoadingContext";
import { useAlertManager } from "@/context/Common/AlertManagerContext";

interface AlertDetailsProps {
  editData?: AlertDto;
  alerts?: AlertDto[];
}

const AlertDetails: React.FC<AlertDetailsProps> = ({ editData, alerts: initialAlerts }) => {
  const [editingAlert, setEditingAlert] = useState<AlertDto | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { setLoading } = useLoading();

  const { alerts, selectedPChartID, setSelectedPChartID, fetchAlertsByPChartID, addAlert, updateAlert, deleteAlert, saveAllAlerts, clearAlerts, createNewAlertDto } =
    useAlertManager();

  // Initialize with any provided alert data
  useEffect(() => {
    if (editData?.pChartID && editData.pChartID > 0) {
      setSelectedPChartID(editData.pChartID);
    }
  }, [editData, setSelectedPChartID]);

  // Load alerts when a patient is selected
  useEffect(() => {
    if (initialAlerts && initialAlerts.length > 0) {
      // If alerts were passed in directly, use those
    } else if (selectedPChartID > 0) {
      fetchAlertsByPChartID(selectedPChartID);
    }
  }, [selectedPChartID, fetchAlertsByPChartID, initialAlerts]);

  const handlePatientSelect = useCallback(
    async (pChartID: number, pChartCode: string) => {
      setLoading(true);
      try {
        setSelectedPChartID(pChartID);
        await fetchAlertsByPChartID(pChartID);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSelectedPChartID, fetchAlertsByPChartID]
  );

  const handleAddAlert = useCallback(
    (description: string) => {
      if (!selectedPChartID) {
        showAlert("Error", "Please select a patient first", "error");
        return;
      }

      if (!description.trim()) {
        showAlert("Error", "Alert description cannot be empty", "error");
        return;
      }

      const newAlert = createNewAlertDto(description, selectedPChartID, editData?.pChartCode || "");

      addAlert(newAlert);
      showAlert("Success", "Alert added to the list", "success");
    },
    [selectedPChartID, editData?.pChartCode, createNewAlertDto, addAlert]
  );

  const handleEditAlert = useCallback((alert: AlertDto, index: number) => {
    setEditingAlert(alert);
    setEditingIndex(index);
  }, []);

  const handleUpdateAlert = useCallback(
    (description: string) => {
      if (editingAlert && editingIndex !== null) {
        const updatedAlert = {
          ...editingAlert,
          alertDescription: description,
        };

        updateAlert(updatedAlert, editingIndex);
        setEditingAlert(null);
        setEditingIndex(null);

        showAlert("Success", "Alert updated successfully", "success");
      }
    },
    [editingAlert, editingIndex, updateAlert]
  );

  const handleDeleteAlert = useCallback(
    async (alertId: number) => {
      setLoading(true);
      try {
        const success = await deleteAlert(alertId);
        if (success) {
          showAlert("Success", "Alert deleted successfully", "success");
        } else {
          showAlert("Error", "Failed to delete alert", "error");
        }
      } finally {
        setLoading(false);
      }
    },
    [deleteAlert, setLoading]
  );

  const handleSave = useCallback(async () => {
    if (!selectedPChartID) {
      showAlert("Error", "Please select a patient first", "error");
      return;
    }

    if (alerts.length === 0) {
      showAlert("Error", "No alerts to save. Please add at least one alert.", "error");
      return;
    }

    setLoading(true);
    try {
      const success = await saveAllAlerts();
      if (success) {
        showAlert("Success", "All alerts saved successfully!", "success", {
          onConfirm: () => {
            clearAlerts();
          },
        });
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPChartID, alerts, saveAllAlerts, clearAlerts, setLoading]);

  const handleClear = useCallback(() => {
    showAlert("Confirm Clear", "Are you sure you want to clear all alerts? This will not delete saved alerts.", "warning", {
      showCancelButton: true,
      confirmButtonText: "Yes, clear all",
      cancelButtonText: "Cancel",
      onConfirm: () => {
        clearAlerts();
        setEditingAlert(null);
        setEditingIndex(null);
        setSelectedPChartID(0);
      },
    });
  }, [clearAlerts, setSelectedPChartID]);

  return (
    <Box>
      <PatientSelector pChartID={selectedPChartID} onPatientSelect={handlePatientSelect} disabled={Boolean(editingAlert)} />

      {selectedPChartID > 0 && (
        <>
          <AlertForm
            onAddAlert={handleAddAlert}
            editMode={Boolean(editingAlert)}
            editingAlert={editingAlert}
            onUpdateAlert={handleUpdateAlert}
            onCancelEdit={() => {
              setEditingAlert(null);
              setEditingIndex(null);
            }}
            pChartID={selectedPChartID}
          />

          <AlertList alerts={alerts} onEditAlert={handleEditAlert} onDeleteAlert={handleDeleteAlert} />

          <FormSaveClearButton
            clearText="Clear All"
            saveText="Save All Alerts"
            onClear={handleClear}
            onSave={handleSave}
            clearIcon={DeleteIcon}
            saveIcon={SaveIcon}
            clearColor="error"
            saveColor="success"
          />
        </>
      )}
    </Box>
  );
};

export default AlertDetails;
