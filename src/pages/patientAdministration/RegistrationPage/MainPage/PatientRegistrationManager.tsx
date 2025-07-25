// src/pages/patientAdministration/RegistrationPage/MainPage/PatientRegistrationManager.tsx
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column, GridDensity } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { useAlert } from "@/providers/AlertProvider";
import { formatDt } from "@/utils/Common/dateUtils";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  Cancel as CancelIcon,
  CheckCircle,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccountBalance as InsuranceIcon,
  FitnessCenter as LifestyleIcon,
  LocalHospital,
  MedicalServices,
  People as NextOfKinIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

import LifestyleManagement from "@/pages/clinicalManagement/LifeStyle/MainPage/LifestyleManagement";
import { Avatar, Box, Card, CardContent, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import NextOfKinManagement from "../Components/NextOfKinManagement";
import PatientInsuranceManagement from "../Components/PatientInsuranceManagement";
import PatientRegistrationForm from "../Form/PatientRegistrationForm";
import { PatientListData, usePatientRegistration } from "../hooks/usePatientRegistration";

// Filter options for the patient list
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All Status" },
];

const visitTypeOptions = [
  { value: "H", label: "Hospital" },
  { value: "P", label: "Physician" },
  { value: "N", label: "None" },
];

interface PatientRegistrationManagerProps {
  defaultMode?: "grid" | "form";
  showStats?: boolean;
  enableBulkOperations?: boolean;
}

const PatientRegistrationManager: React.FC<PatientRegistrationManagerProps> = ({ defaultMode = "grid", showStats = true, enableBulkOperations = false }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<PatientRegistrationDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedPatientForAction, setSelectedPatientForAction] = useState<PatientListData | null>(null);
  const [gridDensity, setGridDensity] = useState<GridDensity>("medium");

  // New state for Next of Kin and Insurance management
  const [isNextOfKinOpen, setIsNextOfKinOpen] = useState<boolean>(false);
  const [isInsuranceOpen, setIsInsuranceOpen] = useState<boolean>(false);
  const [selectedPatientForNok, setSelectedPatientForNok] = useState<PatientListData | null>(null);
  const [selectedPatientForInsurance, setSelectedPatientForInsurance] = useState<PatientListData | null>(null);

  const { showAlert } = useAlert();
  const { patientList, isLoading, error, fetchPatientList, getPatientById, savePatient, deletePatient, searchPatients } = usePatientRegistration();
  // Lifestyle management state
  const [isLifestyleOpen, setIsLifestyleOpen] = useState<boolean>(false);
  const [selectedPatientForLifestyle, setSelectedPatientForLifestyle] = useState<PatientListData | null>(null);

  // Lifestyle management handlers
  const handleManageLifestyle = useCallback((patient: PatientListData) => {
    setSelectedPatientForLifestyle(patient);
    setIsLifestyleOpen(true);
  }, []);

  const handleCloseLifestyle = useCallback(() => {
    setIsLifestyleOpen(false);
    setSelectedPatientForLifestyle(null);
  }, []);
  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    visitType: "",
  });

  // Ref to access the form's submission and reset functions
  const patientFormRef = React.useRef<any>(null);

  // Create debounced search function
  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);

  // Effect for search functionality
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Effect to perform search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      searchPatients(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchPatients]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    debouncedSearch.cancel();
    searchPatients("");
  }, [debouncedSearch, searchPatients]);

  // Handle grid density change
  const handleDensityChange = useCallback((density: GridDensity) => {
    setGridDensity(density);
  }, []);

  // Filter patients based on current filters
  const filteredPatients = useMemo(() => {
    return patientList.filter((patient) => {
      const matchesStatus =
        filters.status === "" ||
        filters.status === "all" ||
        (filters.status === "active" && patient.rActiveYN === "Y") ||
        (filters.status === "inactive" && patient.rActiveYN === "N");

      const matchesVisitType = filters.visitType === "" || filters.visitType === "all" || patient.visitType === filters.visitType;

      return matchesStatus && matchesVisitType;
    });
  }, [patientList, filters]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = patientList.length;
    const active = patientList.filter((p) => p.rActiveYN === "Y").length;
    const inactive = total - active;
    const hospitalVisits = patientList.filter((p) => p.visitType === "H").length;
    const physicianVisits = patientList.filter((p) => p.visitType === "P").length;

    return {
      total,
      active,
      inactive,
      hospitalVisits,
      physicianVisits,
    };
  }, [patientList]);

  // Action handlers
  const handleAddNew = useCallback(() => {
    setSelectedPatient(null);
    setFormMode("create");
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback(
    async (patient: PatientListData) => {
      try {
        const fullPatientData = await getPatientById(patient.pChartID);
        if (fullPatientData) {
          setSelectedPatient(fullPatientData);
          setFormMode("edit");
          setIsFormOpen(true);
        } else {
          showAlert("Error", "Failed to load patient details for editing", "error");
        }
      } catch (error) {
        console.error("Error loading patient for edit:", error);
        showAlert("Error", "Failed to load patient details", "error");
      }
    },
    [getPatientById, showAlert]
  );

  const handleView = useCallback(
    async (patient: PatientListData) => {
      try {
        const fullPatientData = await getPatientById(patient.pChartID);
        if (fullPatientData) {
          setSelectedPatient(fullPatientData);
          setFormMode("view");
          setIsFormOpen(true);
        } else {
          showAlert("Error", "Failed to load patient details for viewing", "error");
        }
      } catch (error) {
        console.error("Error loading patient for view:", error);
        showAlert("Error", "Failed to load patient details", "error");
      }
    },
    [getPatientById, showAlert]
  );

  const handleDeleteClick = useCallback((patient: PatientListData) => {
    setSelectedPatientForAction(patient);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPatientForAction) return;

    try {
      const success = await deletePatient(selectedPatientForAction.pChartID);
      if (success) {
        showAlert("Success", "Patient deactivated successfully", "success");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to deactivate patient", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
      setSelectedPatientForAction(null);
    }
  }, [selectedPatientForAction, deletePatient, showAlert]);

  // Next of Kin management handlers
  const handleManageNextOfKin = useCallback((patient: PatientListData) => {
    setSelectedPatientForNok(patient);
    setIsNextOfKinOpen(true);
  }, []);

  const handleCloseNextOfKin = useCallback(() => {
    setIsNextOfKinOpen(false);
    setSelectedPatientForNok(null);
  }, []);

  // Insurance management handlers
  const handleManageInsurance = useCallback((patient: PatientListData) => {
    setSelectedPatientForInsurance(patient);
    setIsInsuranceOpen(true);
  }, []);

  const handleCloseInsurance = useCallback(() => {
    setIsInsuranceOpen(false);
    setSelectedPatientForInsurance(null);
  }, []);

  // Form save handler
  const handleFormSave = useCallback(
    async (data: PatientRegistrationDto) => {
      try {
        const success = await savePatient(data);
        if (success) {
          setIsFormOpen(false);
          setSelectedPatient(null);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Save operation failed:", error);
        showAlert("Error", "Failed to save patient", "error");
        return false;
      }
    },
    [savePatient, showAlert]
  );

  // Form close handler
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedPatient(null);
  }, []);

  // Filter handlers
  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ status: "", visitType: "" });
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchPatientList(debouncedSearchTerm);
  }, [fetchPatientList, debouncedSearchTerm]);

  // Enhanced grid columns definition with better responsive design
  const columns: Column<PatientListData>[] = [
    {
      key: "pChartCode",
      header: "Chart Code",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 150 : gridDensity === "medium" ? 120 : 100,
      formatter: (value: string) => value || "-",
    },
    {
      key: "fullName",
      header: "Patient Name",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 280 : gridDensity === "medium" ? 200 : 160,
      render: (item) => (
        <Box>
          <Typography
            variant="body2"
            fontWeight="medium"
            sx={{
              fontSize: gridDensity === "large" ? "0.875rem" : gridDensity === "medium" ? "0.875rem" : "0.75rem",
              lineHeight: gridDensity === "large" ? 1.6 : gridDensity === "medium" ? 1.4 : 1.2,
              wordBreak: "break-word",
              maxWidth: "100%",
            }}
          >
            {item.fullName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: gridDensity === "large" ? "0.75rem" : gridDensity === "medium" ? "0.75rem" : "0.6875rem",
              display: "block",
              lineHeight: 1.2,
            }}
          >
            {item.pTitle} {item.pGender ? `• ${item.pGender}` : ""}
          </Typography>
        </Box>
      ),
    },
    {
      key: "pAddPhone1",
      header: "Phone",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 140 : gridDensity === "medium" ? 120 : 100,
      formatter: (value: string) => value || "-",
    },
    {
      key: "pAddEmail",
      header: "Email",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 220 : gridDensity === "medium" ? 180 : 140,
      render: (item) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: gridDensity === "large" ? "0.875rem" : gridDensity === "medium" ? "0.875rem" : "0.75rem",
            wordBreak: "break-all",
            maxWidth: "100%",
          }}
        >
          {item.pAddEmail || "-"}
        </Typography>
      ),
    },
    {
      key: "pRegDate",
      header: "Registration Date",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 150 : gridDensity === "medium" ? 130 : 110,
      render: (item) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: gridDensity === "large" ? "0.875rem" : gridDensity === "medium" ? "0.875rem" : "0.75rem",
          }}
        >
          {item.pRegDate ? formatDt(item.pRegDate) : "-"}
        </Typography>
      ),
    },
    {
      key: "visitType",
      header: "Visit Type",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 120 : gridDensity === "medium" ? 100 : 80,
      formatter: (value: string) => {
        const typeMap: Record<string, string> = {
          H: "Hospital",
          P: "Physician",
          N: "None",
        };
        return typeMap[value] || value || "-";
      },
    },
    {
      key: "pTypeName",
      header: "Payment Source",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 160 : gridDensity === "medium" ? 140 : 120,
      render: (item) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: gridDensity === "large" ? "0.875rem" : gridDensity === "medium" ? "0.875rem" : "0.75rem",
            wordBreak: "break-word",
          }}
        >
          {item.pTypeName || "-"}
        </Typography>
      ),
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 120 : gridDensity === "medium" ? 100 : 80,
      formatter: (value: string) => (
        <Chip size={gridDensity === "large" ? "medium" : "small"} color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: gridDensity === "large" ? 240 : gridDensity === "medium" ? 200 : 160,
      render: (item) => (
        <Stack direction="row" spacing={gridDensity === "large" ? 0.8 : 0.5} flexWrap="wrap">
          <Tooltip title="View Details">
            <IconButton
              size={gridDensity === "large" ? "medium" : "small"}
              color="primary"
              onClick={() => handleView(item)}
              sx={{ bgcolor: "rgba(25, 118, 210, 0.08)", "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" } }}
            >
              <VisibilityIcon fontSize={gridDensity === "large" ? "medium" : "small"} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Patient">
            <IconButton
              size={gridDensity === "large" ? "medium" : "small"}
              color="info"
              onClick={() => handleEdit(item)}
              sx={{ bgcolor: "rgba(25, 118, 210, 0.08)", "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" } }}
            >
              <EditIcon fontSize={gridDensity === "large" ? "medium" : "small"} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Next of Kin">
            <IconButton
              size={gridDensity === "large" ? "medium" : "small"}
              color="secondary"
              onClick={() => handleManageNextOfKin(item)}
              sx={{ bgcolor: "rgba(156, 39, 176, 0.08)", "&:hover": { bgcolor: "rgba(156, 39, 176, 0.15)" } }}
            >
              <NextOfKinIcon fontSize={gridDensity === "large" ? "medium" : "small"} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Insurance">
            <IconButton
              size={gridDensity === "large" ? "medium" : "small"}
              color="warning"
              onClick={() => handleManageInsurance(item)}
              sx={{ bgcolor: "rgba(237, 108, 2, 0.08)", "&:hover": { bgcolor: "rgba(237, 108, 2, 0.15)" } }}
            >
              <InsuranceIcon fontSize={gridDensity === "large" ? "medium" : "small"} />
            </IconButton>
          </Tooltip>

          {/* Add Lifestyle button */}
          <Tooltip title="Lifestyle">
            <IconButton
              size={gridDensity === "large" ? "medium" : "small"}
              color="success"
              onClick={() => handleManageLifestyle(item)}
              sx={{ bgcolor: "rgba(46, 125, 50, 0.08)", "&:hover": { bgcolor: "rgba(46, 125, 50, 0.15)" } }}
            >
              <LifestyleIcon fontSize={gridDensity === "large" ? "medium" : "small"} />
            </IconButton>
          </Tooltip>
          {item.rActiveYN === "Y" && (
            <Tooltip title="Deactivate Patient">
              <IconButton
                size={gridDensity === "large" ? "medium" : "small"}
                color="error"
                onClick={() => handleDeleteClick(item)}
                sx={{ bgcolor: "rgba(211, 47, 47, 0.08)", "&:hover": { bgcolor: "rgba(211, 47, 47, 0.15)" } }}
              >
                <DeleteIcon fontSize={gridDensity === "large" ? "medium" : "small"} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  // Statistics dashboard
  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <PersonAddIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Patients
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #4caf50" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#4caf50", width: 40, height: 40 }}>
                <CheckCircle fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {stats.active}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #f44336" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#f44336", width: 40, height: 40 }}>
                <CancelIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.inactive}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inactive
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #2196f3" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
                <LocalHospital fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.hospitalVisits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hospital Visits
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #ff9800" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                <MedicalServices fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.physicianVisits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Physician Visits
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading patient data: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Statistics Dashboard */}
      {showStats && renderStatsDashboard()}

      {/* Header and Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
              Patient Registration Management
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} display="flex" justifyContent="flex-end">
            <Stack direction="row" spacing={1}>
              <SmartButton
                text="Refresh"
                icon={RefreshIcon}
                onClick={handleRefresh}
                color="info"
                variant="outlined"
                size="small"
                disabled={isLoading}
                loadingText="Refreshing..."
                asynchronous={true}
                showLoadingIndicator={true}
              />
              <SmartButton text="Add Patient" icon={PersonAddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          {/* Search Bar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by name, chart code, phone, or email"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Filters */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <DropdownSelect
                label="Status"
                name="status"
                value={filters.status}
                options={statusOptions}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                size="small"
                defaultText="All Status"
              />

              <DropdownSelect
                label="Visit Type"
                name="visitType"
                value={filters.visitType}
                options={visitTypeOptions}
                onChange={(e) => handleFilterChange("visitType", e.target.value)}
                size="small"
                defaultText="All Types"
              />

              {(filters.status || filters.visitType) && (
                <Chip label={`Filters (${Object.values(filters).filter(Boolean).length})`} onDelete={handleClearFilters} size="small" color="primary" />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Patient Grid with Enhanced Density Controls */}
      <Paper sx={{ p: 2 }}>
        <CustomGrid
          columns={columns}
          data={filteredPatients}
          maxHeight="calc(100vh - 400px)"
          emptyStateMessage="No patients found"
          loading={isLoading}
          pagination={filteredPatients.length > 10}
          pageSize={10}
          showExportCSV={true}
          showExportPDF={true}
          rowKeyField="pChartID"
          density={gridDensity}
          onDensityChange={handleDensityChange}
          showDensityControls={false}
          searchTerm={searchTerm}
        />
      </Paper>

      {/* Patient Registration Form Dialog */}
      <GenericDialog
        open={isFormOpen}
        onClose={handleFormClose}
        title={formMode === "create" ? "New Patient Registration" : formMode === "edit" ? "Edit Patient Details" : "View Patient Details"}
        fullWidth
        showCloseButton
        disableBackdropClick={formMode !== "view"}
        disableEscapeKeyDown={formMode !== "view"}
        fullScreen={true}
        actions={
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <SmartButton text="Close" onClick={handleFormClose} variant="outlined" color="inherit" />
            {formMode !== "view" && (
              <>
                <SmartButton text="Reset" onClick={() => patientFormRef.current?.handleReset()} variant="outlined" color="error" icon={CancelIcon} disabled={isLoading} />
                <SmartButton
                  text={formMode === "create" ? "Register Patient" : "Update Patient"}
                  onClick={() => patientFormRef.current?.handleSubmit()}
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  asynchronous={true}
                  showLoadingIndicator={true}
                  loadingText={formMode === "create" ? "Registering..." : "Updating..."}
                  successText={formMode === "create" ? "Registered!" : "Updated!"}
                  disabled={isLoading}
                />
              </>
            )}
          </Box>
        }
      >
        <PatientRegistrationForm ref={patientFormRef} mode={formMode} initialData={selectedPatient} onSave={handleFormSave} onClose={handleFormClose} />
      </GenericDialog>

      {/* Next of Kin Management Dialog */}
      {selectedPatientForNok && (
        <NextOfKinManagement open={isNextOfKinOpen} onClose={handleCloseNextOfKin} pChartID={selectedPatientForNok.pChartID} patientName={selectedPatientForNok.fullName} />
      )}

      {/* Insurance Management Dialog */}
      {selectedPatientForInsurance && (
        <PatientInsuranceManagement
          open={isInsuranceOpen}
          onClose={handleCloseInsurance}
          pChartID={selectedPatientForInsurance.pChartID}
          patientName={selectedPatientForInsurance.fullName}
        />
      )}

      {/* Lifestyle Management Dialog */}
      {selectedPatientForLifestyle && (
        <LifestyleManagement
          open={isLifestyleOpen}
          onClose={handleCloseLifestyle}
          pChartID={selectedPatientForLifestyle.pChartID}
          patientName={selectedPatientForLifestyle.fullName}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deactivation"
        message={`Are you sure you want to deactivate the patient "${selectedPatientForAction?.fullName}"? This action will set the patient status to inactive.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />
    </Box>
  );
};

export default PatientRegistrationManager;
