// src/pages/patientAdministration/RegistrationPage/MainPage/PatientRegistrationFormManager.tsx
import SmartButton from "@/components/Button/SmartButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useLoading } from "@/hooks/Common/useLoading";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { useAlert } from "@/providers/AlertProvider";
import {
  AccountBalance as InsuranceIcon,
  People as NextOfKinIcon,
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Divider, Grid, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useState } from "react";
import { PatientSearch } from "../../CommonPage/Patient/PatientSearch/PatientSearch";
import NextOfKinManagement from "../Components/NextOfKinManagement";
import PatientInsuranceManagement from "../Components/PatientInsuranceManagement";
import PatientRegistrationForm from "../Form/PatientRegistrationForm";
import { usePatientRegistration } from "../hooks/usePatientRegistration";

interface PatientRegistrationFormManagerProps {
  showSearchInSidebar?: boolean;
  enableQuickActions?: boolean;
  showPatientStats?: boolean;
}

const PatientRegistrationFormManager: React.FC<PatientRegistrationFormManagerProps> = ({ showSearchInSidebar = false, enableQuickActions = true, showPatientStats = true }) => {
  const [selectedPatient, setSelectedPatient] = useState<PatientRegistrationDto | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState<boolean>(false);
  const [searchClearTrigger, setSearchClearTrigger] = useState<number>(0);

  // Patient management dialogs
  const [isNextOfKinOpen, setIsNextOfKinOpen] = useState<boolean>(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState<boolean>(false);
  const [selectedPatientForNok, setSelectedPatientForNok] = useState<PatientSearchResult | null>(null);
  const [selectedPatientForInsurance, setSelectedPatientForInsurance] = useState<PatientSearchResult | null>(null);

  const { showAlert } = useAlert();
  const { isLoading } = useLoading();
  const { getPatientById, savePatient, fetchPatientList } = usePatientRegistration();

  // Ref to access the form's methods
  const patientFormRef = React.useRef<any>(null);

  // Handle patient search and selection
  const handlePatientSelect = useCallback(
    async (patient: PatientSearchResult | null) => {
      if (!patient) {
        setSelectedPatient(null);
        setFormMode("create");
        return;
      }

      try {
        const fullPatientData = await getPatientById(patient.pChartID);
        if (fullPatientData) {
          setSelectedPatient(fullPatientData);
          setFormMode("edit");
          setIsSearchDialogOpen(false);
          showAlert("Success", `Loaded patient: ${patient.fullName}`, "success");
        } else {
          showAlert("Error", "Failed to load patient details", "error");
        }
      } catch (error) {
        console.error("Error loading patient:", error);
        showAlert("Error", "Failed to load patient details", "error");
      }
    },
    [getPatientById, showAlert]
  );

  // Form submission handler
  const handleFormSave = useCallback(
    async (data: PatientRegistrationDto) => {
      try {
        const success = await savePatient(data);
        if (success) {
          if (formMode === "create") {
            // Reset form for new patient
            setSelectedPatient(null);
            setFormMode("create");
            // Trigger form reset
            setTimeout(() => {
              patientFormRef.current?.handleReset();
            }, 100);
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Save operation failed:", error);
        showAlert("Error", "Failed to save patient", "error");
        return false;
      }
    },
    [savePatient, formMode, showAlert]
  );

  // Reset form to create new patient
  const handleNewPatient = useCallback(() => {
    setSelectedPatient(null);
    setFormMode("create");
    setSearchClearTrigger((prev) => prev + 1);
    patientFormRef.current?.handleReset();
    showAlert("Info", "Form reset for new patient registration", "info");
  }, [showAlert]);

  // Open search dialog
  const handleOpenSearch = useCallback(() => {
    setIsSearchDialogOpen(true);
  }, []);

  // Close search dialog
  const handleCloseSearch = useCallback(() => {
    setIsSearchDialogOpen(false);
  }, []);

  // Quick action handlers
  const handleManageNextOfKin = useCallback(() => {
    if (selectedPatient) {
      setSelectedPatientForNok({
        pChartID: selectedPatient.patRegisters.pChartID,
        pChartCode: selectedPatient.patRegisters.pChartCode,
        fullName: `${selectedPatient.patRegisters.pFName} ${selectedPatient.patRegisters.pLName}`.trim(),
      });
      setIsNextOfKinOpen(true);
    }
  }, [selectedPatient]);

  const handleManageInsurance = useCallback(() => {
    if (selectedPatient) {
      setSelectedPatientForInsurance({
        pChartID: selectedPatient.patRegisters.pChartID,
        pChartCode: selectedPatient.patRegisters.pChartCode,
        fullName: `${selectedPatient.patRegisters.pFName} ${selectedPatient.patRegisters.pLName}`.trim(),
      });
      setIsInsuranceOpen(true);
    }
  }, [selectedPatient]);

  const handleViewDetails = useCallback(() => {
    if (selectedPatient) {
      setFormMode("view");
    }
  }, [selectedPatient]);

  // Patient info summary
  const renderPatientInfo = () => {
    if (!selectedPatient || formMode === "create") {
      return (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent sx={{ py: 1.5 }}>
            <Typography variant="subtitle1" color="text.secondary" align="center">
              Creating New Patient Registration
            </Typography>
          </CardContent>
        </Card>
      );
    }

    const patient = selectedPatient.patRegisters;
    const fullName = `${patient.pFName} ${patient.pMName || ""} ${patient.pLName}`.trim();

    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" component="div">
                {fullName}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Chip size="small" label={patient.pChartCode} color="primary" variant="outlined" />
                <Chip size="small" label={patient.pGender} color="secondary" variant="outlined" />
                <Chip size="small" label={patient.rActiveYN === "Y" ? "Active" : "Inactive"} color={patient.rActiveYN === "Y" ? "success" : "error"} />
                <Chip size="small" label={formMode === "edit" ? "Editing" : "Viewing"} color="info" />
              </Stack>
            </Box>
            {enableQuickActions && (
              <Stack direction="row" spacing={0.5}>
                {formMode === "edit" && (
                  <Tooltip title="View Mode">
                    <IconButton size="small" onClick={handleViewDetails}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Next of Kin">
                  <IconButton size="small" onClick={handleManageNextOfKin} color="secondary">
                    <NextOfKinIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Insurance">
                  <IconButton size="small" onClick={handleManageInsurance} color="warning">
                    <InsuranceIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Search component for sidebar
  const renderSearchSidebar = () => {
    if (!showSearchInSidebar) return null;

    return (
      <Paper sx={{ p: 2, height: "fit-content" }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Quick Patient Search
        </Typography>
        <PatientSearch onPatientSelect={handlePatientSelect} clearTrigger={searchClearTrigger} label="Find Patient" placeholder="Search by name or chart code" className="mb-2" />
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1}>
          <SmartButton text="New Patient" icon={PersonAddIcon} onClick={handleNewPatient} variant="outlined" color="primary" size="small" />
          <SmartButton text="Advanced Search" icon={SearchIcon} onClick={handleOpenSearch} variant="outlined" color="info" size="small" />
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 600, mb: 1 }} component="h1">
              Patient Registration Form
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formMode === "create" ? "Register a new patient" : formMode === "edit" ? "Edit patient information" : "View patient details"}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent="flex-end">
            <Stack direction="row" spacing={1}>
              <SmartButton text="Find Patient" icon={SearchIcon} onClick={handleOpenSearch} color="info" variant="outlined" size="small" />
              <SmartButton text="New Patient" icon={PersonAddIcon} onClick={handleNewPatient} color="success" variant="outlined" size="small" />
              <SmartButton
                text="Save"
                icon={SaveIcon}
                onClick={() => patientFormRef.current?.handleSubmit()}
                color="primary"
                variant="contained"
                size="small"
                asynchronous={true}
                showLoadingIndicator={true}
                disabled={isLoading}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Patient Information Card */}
      {renderPatientInfo()}

      {/* Main Content Area */}
      <Grid container spacing={2}>
        {/* Form Area */}
        <Grid size={{ xs: 12, md: showSearchInSidebar ? 9 : 12 }}>
          <Paper sx={{ p: 1 }}>
            <PatientRegistrationForm ref={patientFormRef} mode={formMode} initialData={selectedPatient} onSave={handleFormSave} />
          </Paper>
        </Grid>

        {/* Search Sidebar */}
        {showSearchInSidebar && <Grid size={{ xs: 12, md: 3 }}>{renderSearchSidebar()}</Grid>}
      </Grid>

      {/* Search Dialog */}
      <GenericDialog open={isSearchDialogOpen} onClose={handleCloseSearch} title="Search and Select Patient" fullWidth maxWidth="md" showCloseButton>
        <Box sx={{ p: 2 }}>
          <PatientSearch onPatientSelect={handlePatientSelect} clearTrigger={searchClearTrigger} label="Search Patient" placeholder="Enter name, chart code, or phone number" />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <SmartButton text="Close" onClick={handleCloseSearch} variant="outlined" color="inherit" />
          </Box>
        </Box>
      </GenericDialog>

      {/* Next of Kin Management Dialog */}
      {selectedPatientForNok && (
        <NextOfKinManagement
          open={isNextOfKinOpen}
          onClose={() => {
            setIsNextOfKinOpen(false);
            setSelectedPatientForNok(null);
          }}
          pChartID={selectedPatientForNok.pChartID}
          patientName={selectedPatientForNok.fullName}
        />
      )}

      {/* Insurance Management Dialog */}
      {selectedPatientForInsurance && (
        <PatientInsuranceManagement
          open={isInsuranceOpen}
          onClose={() => {
            setIsInsuranceOpen(false);
            setSelectedPatientForInsurance(null);
          }}
          pChartID={selectedPatientForInsurance.pChartID}
          patientName={selectedPatientForInsurance.fullName}
        />
      )}
    </Box>
  );
};

export default PatientRegistrationFormManager;
