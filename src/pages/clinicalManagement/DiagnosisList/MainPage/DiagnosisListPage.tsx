import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip, Card, CardContent, Avatar } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  MedicalServices as DiagnosisIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Build as CustomIcon,
  Assignment as StandardIcon,
  Transform as TransferIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import DiagnosisListForm from "../Form/DiagnosisListForm";
import { useDiagnosisList } from "../hooks/useDiagnosisList";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import { IcdDetailDto } from "@/interfaces/ClinicalManagement/IcdDetailDto";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const typeOptions = [
  { value: "standard", label: "Standard" },
  { value: "custom", label: "Custom" },
];

const versionOptions = [
  { value: "icd10", label: "ICD-10" },
  { value: "icd11", label: "ICD-11" },
  { value: "custom", label: "Custom" },
];

const DiagnosisListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<IcdDetailDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);

  const { diagnosisList, isLoading, error, fetchDiagnosisList, deleteDiagnosis } = useDiagnosisList();

  const [filters, setFilters] = useState<{
    status: string;
    type: string;
    version: string;
  }>({
    status: "",
    type: "",
    version: "",
  });

  const handleRefresh = useCallback(() => {
    fetchDiagnosisList();
  }, [fetchDiagnosisList]);

  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleAddNew = useCallback(() => {
    setSelectedDiagnosis(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((diagnosis: IcdDetailDto) => {
    setSelectedDiagnosis(diagnosis);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((diagnosis: IcdDetailDto) => {
    setSelectedDiagnosis(diagnosis);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((diagnosis: IcdDetailDto) => {
    setSelectedDiagnosis(diagnosis);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedDiagnosis) return;

    try {
      const success = await deleteDiagnosis(selectedDiagnosis.icddId);

      if (success) {
        showAlert("Success", "Diagnosis deleted successfully", "success");
      } else {
        throw new Error("Failed to delete diagnosis");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete diagnosis", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedDiagnosis, deleteDiagnosis]);

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      if (refreshData) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "",
      type: "",
      version: "",
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!diagnosisList.length) {
      return {
        totalDiagnoses: 0,
        activeDiagnoses: 0,
        inactiveDiagnoses: 0,
        customDiagnoses: 0,
        standardDiagnoses: 0,
        transferEnabled: 0,
      };
    }

    const activeCount = diagnosisList.filter((d) => d.rActiveYN === "Y").length;
    const customCount = diagnosisList.filter((d) => d.icddCustYN === "Y").length;
    const transferCount = diagnosisList.filter((d) => d.transferYN === "Y").length;

    return {
      totalDiagnoses: diagnosisList.length,
      activeDiagnoses: activeCount,
      inactiveDiagnoses: diagnosisList.length - activeCount,
      customDiagnoses: customCount,
      standardDiagnoses: diagnosisList.length - customCount,
      transferEnabled: transferCount,
    };
  }, [diagnosisList]);

  // Apply filters to the list
  const filteredDiagnoses = useMemo(() => {
    if (!diagnosisList.length) return [];

    return diagnosisList.filter((diagnosis) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        diagnosis.icddName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        diagnosis.icddCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        diagnosis.icddNameGreek?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        diagnosis.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && diagnosis.rActiveYN === "Y") || (filters.status === "inactive" && diagnosis.rActiveYN === "N");

      const matchesType = filters.type === "" || (filters.type === "custom" && diagnosis.icddCustYN === "Y") || (filters.type === "standard" && diagnosis.icddCustYN === "N");

      const matchesVersion =
        filters.version === "" ||
        (filters.version === "icd10" && diagnosis.icddVer?.toLowerCase().includes("10")) ||
        (filters.version === "icd11" && diagnosis.icddVer?.toLowerCase().includes("11")) ||
        (filters.version === "custom" && diagnosis.icddCustYN === "Y");

      return matchesSearch && matchesStatus && matchesType && matchesVersion;
    });
  }, [diagnosisList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <DiagnosisIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalDiagnoses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Diagnoses
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #4caf50" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#4caf50", width: 40, height: 40 }}>
                <ActiveIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {stats.activeDiagnoses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #f44336" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#f44336", width: 40, height: 40 }}>
                <InactiveIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.inactiveDiagnoses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inactive
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #2196f3" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
                <CustomIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.customDiagnoses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Custom
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #ff9800" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                <StandardIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.standardDiagnoses}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Standard
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #9c27b0" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#9c27b0", width: 40, height: 40 }}>
                <TransferIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {stats.transferEnabled}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Transfer Enabled
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const columns: Column<IcdDetailDto>[] = [
    {
      key: "icddCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "icddName",
      header: "Diagnosis Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 300,
    },
    {
      key: "icddNameGreek",
      header: "Greek Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
      formatter: (value: string) => value || "-",
    },
    {
      key: "icddVer",
      header: "Version",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => value || "-",
    },
    {
      key: "icddCustYN",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "info" : "warning"} label={value === "Y" ? "Custom" : "Standard"} />,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 300,
      formatter: (value: any) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 170,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleView(item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={() => handleEdit(item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading diagnoses: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Diagnosis List
        </Typography>
        <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
      </Box>

      {/* Statistics Dashboard */}
      {showStats && renderStatsDashboard()}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name, or notes"
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
          <Grid size={{ xs: 12, md: 5 }}>
            <Tooltip title="Filter Diagnoses">
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
                  label="Type"
                  name="type"
                  value={filters.type}
                  options={typeOptions}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  size="small"
                  defaultText="All Types"
                />
                <DropdownSelect
                  label="Version"
                  name="version"
                  value={filters.version}
                  options={versionOptions}
                  onChange={(e) => handleFilterChange("version", e.target.value)}
                  size="small"
                  defaultText="All Versions"
                />
                <Box display="flex" alignItems="center" gap={1}>
                  {Object.values(filters).some(Boolean) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
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
              <SmartButton text="Add Diagnosis" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredDiagnoses} maxHeight="calc(100vh - 280px)" emptyStateMessage="No diagnosis found" density="small" loading={isLoading} />
      </Paper>

      {isFormOpen && <DiagnosisListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedDiagnosis} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the diagnosis "${selectedDiagnosis?.icddName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default DiagnosisListPage;
