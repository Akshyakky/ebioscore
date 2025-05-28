import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  AccountBalance as InsuranceIcon,
  People as NextOfKinIcon,
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import CustomGrid, { Column, GridDensity } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import PatientRegistrationForm from "../Form/PatientRegistrationForm";
import { usePatientRegistration, PatientListData } from "../hooks/usePatientRegistration";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import { formatDt } from "@/utils/Common/dateUtils";

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

  const { showAlert } = useAlert();
  const { patientList, isLoading, error, fetchPatientList, getPatientById, savePatient, deletePatient, searchPatients } = usePatientRegistration();

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
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Patients
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="success.main">
              {stats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="error.main">
              {stats.inactive}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inactive
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="info.main">
              {stats.hospitalVisits}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hospital Visits
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
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
            <Typography variant="h5" component="h1">
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
