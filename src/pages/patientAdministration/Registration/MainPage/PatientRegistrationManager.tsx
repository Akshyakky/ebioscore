import React, { useState, useCallback } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import PatientRegistrationForm from "../Form/PatientRegistrationForm";
import { usePatientRegistration } from "../hooks/usePatientRegistration";

interface PatientData {
  pChartID: number;
  pChartCode: string;
  fullName: string;
  pGender: string;
  pAddPhone1: string;
  pAddEmail: string;
  visitType: string;
  rActiveYN: string;
  pRegDate: Date;
}

const PatientRegistrationManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");

  const { patientList, isLoading, error, fetchPatientList, savePatient, deletePatient, getPatientById } = usePatientRegistration();

  const handleAddNew = useCallback(() => {
    setSelectedPatient(null);
    setFormMode("create");
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback(
    async (patient: PatientData) => {
      const fullPatientData = await getPatientById(patient.pChartID);
      setSelectedPatient(fullPatientData);
      setFormMode("edit");
      setIsFormOpen(true);
    },
    [getPatientById]
  );

  const handleView = useCallback(
    async (patient: PatientData) => {
      const fullPatientData = await getPatientById(patient.pChartID);
      setSelectedPatient(fullPatientData);
      setFormMode("view");
      setIsFormOpen(true);
    },
    [getPatientById]
  );

  const handleDeleteClick = useCallback((patient: PatientData) => {
    setSelectedPatient(patient);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPatient) return;

    try {
      const success = await deletePatient(selectedPatient.pChartID);
      if (success) {
        fetchPatientList();
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedPatient, deletePatient, fetchPatientList]);

  const handleFormSave = useCallback(
    async (data: any) => {
      try {
        const success = await savePatient(data);
        if (success) {
          setIsFormOpen(false);
          fetchPatientList();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Save operation failed:", error);
        return false;
      }
    },
    [savePatient, fetchPatientList]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedPatient(null);
  }, []);

  const columns: Column<PatientData>[] = [
    {
      key: "pChartCode",
      header: "Chart Code",
      visible: true,
      sortable: true,
      width: 120,
    },
    {
      key: "fullName",
      header: "Patient Name",
      visible: true,
      sortable: true,
      width: 200,
    },
    {
      key: "pGender",
      header: "Gender",
      visible: true,
      sortable: true,
      width: 80,
    },
    {
      key: "pAddPhone1",
      header: "Phone",
      visible: true,
      sortable: true,
      width: 120,
    },
    {
      key: "pAddEmail",
      header: "Email",
      visible: true,
      sortable: true,
      width: 180,
    },
    {
      key: "visitType",
      header: "Visit Type",
      visible: true,
      sortable: true,
      width: 100,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 150,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" color="primary" onClick={() => handleView(item)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info" onClick={() => handleEdit(item)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDeleteClick(item)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredPatients = patientList.filter(
    (patient) =>
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.pChartCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.pAddPhone1.includes(searchTerm)
  );

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Patient Registration Management
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent="flex-end">
            <Stack direction="row" spacing={1}>
              <SmartButton text="Refresh" icon={RefreshIcon} onClick={fetchPatientList} color="info" variant="outlined" size="small" disabled={isLoading} />
              <SmartButton text="Add Patient" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by name, chart code, or phone"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredPatients} maxHeight="calc(100vh - 280px)" emptyStateMessage="No patients found" loading={isLoading} />
      </Paper>

      {/* Patient Registration Form Dialog */}
      <GenericDialog
        open={isFormOpen}
        onClose={handleFormClose}
        title={formMode === "create" ? "New Patient Registration" : formMode === "edit" ? "Edit Patient Details" : "View Patient Details"}
        maxWidth="xl"
        fullWidth
        showCloseButton
      >
        <PatientRegistrationForm mode={formMode} initialData={selectedPatient} onSave={handleFormSave} onClose={handleFormClose} />
      </GenericDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the patient "${selectedPatient?.fullName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default PatientRegistrationManager;
