import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip } from "@mui/material";
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
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { MedicationFrequencyDto } from "@/interfaces/ClinicalManagement/MedicationFrequencyDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import MedicationFrequencyForm from "../Form/MedicationFreequencyForm";
import { useMedicationFrequency } from "../hooks/useMedicationFreequencyForm";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const MedicationFrequencyPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedFrequency, setSelectedFrequency] = useState<MedicationFrequencyDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { medicationFrequencyList, isLoading, error, fetchMedicationFrequencyList, deleteMedicationFrequency } = useMedicationFrequency();

  const [filters, setFilters] = useState<{
    status: string;
    default: string;
    modify: string;
    transfer: string;
  }>({
    status: "",
    default: "",
    modify: "",
    transfer: "",
  });

  useEffect(() => {
    document.title = "Medication Frequency Management";
  }, []);

  const handleRefresh = useCallback(() => {
    fetchMedicationFrequencyList();
  }, [fetchMedicationFrequencyList]);

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
    setSelectedFrequency(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((frequency: MedicationFrequencyDto) => {
    setSelectedFrequency(frequency);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((frequency: MedicationFrequencyDto) => {
    setSelectedFrequency(frequency);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((frequency: MedicationFrequencyDto) => {
    setSelectedFrequency(frequency);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedFrequency) return;

    try {
      const success = await deleteMedicationFrequency(selectedFrequency.mFrqId);

      if (success) {
        showAlert("Success", "Medication frequency deleted successfully", "success");
      } else {
        throw new Error("Failed to delete medication frequency");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete medication frequency", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedFrequency, deleteMedicationFrequency]);

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
      default: "",
      modify: "",
      transfer: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!medicationFrequencyList.length) {
      return {
        totalFrequencies: 0,
        activeFrequencies: 0,
        inactiveFrequencies: 0,
        defaultFrequencies: 0,
        modifiableFrequencies: 0,
        transferableFrequencies: 0,
      };
    }

    const activeCount = medicationFrequencyList.filter((f) => f.rActiveYN === "Y").length;
    const defaultCount = medicationFrequencyList.filter((f) => f.defaultYN === "Y").length;
    const modifyCount = medicationFrequencyList.filter((f) => f.modifyYN === "Y").length;
    const transferCount = medicationFrequencyList.filter((f) => f.transferYN === "Y").length;

    return {
      totalFrequencies: medicationFrequencyList.length,
      activeFrequencies: activeCount,
      inactiveFrequencies: medicationFrequencyList.length - activeCount,
      defaultFrequencies: defaultCount,
      modifiableFrequencies: modifyCount,
      transferableFrequencies: transferCount,
    };
  }, [medicationFrequencyList]);

  const filteredFrequencies = useMemo(() => {
    if (!medicationFrequencyList.length) return [];
    return medicationFrequencyList.filter((frequency) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        frequency.mFrqName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        frequency.mFrqCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        frequency.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        frequency.mFrqSnomedCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && frequency.rActiveYN === "Y") || (filters.status === "inactive" && frequency.rActiveYN === "N");

      return matchesSearch && matchesStatus;
    });
  }, [medicationFrequencyList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Frequencies</Typography>
          <Typography variant="h4">{stats.totalFrequencies}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeFrequencies}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveFrequencies}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Default</Typography>
          <Typography variant="h4" color="info.main">
            {stats.defaultFrequencies}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Modifiable</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.modifiableFrequencies}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Transferable</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.transferableFrequencies}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<MedicationFrequencyDto>[] = [
    {
      key: "mFrqCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "mFrqName",
      header: "Frequency Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "mFrqSnomedCode",
      header: "SNOMED Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "defaultYN",
      header: "Default",
      visible: true,
      sortable: true,
      filterable: true,
      width: 110,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "warning" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "transferYN",
      header: "Transferable",
      visible: true,
      sortable: true,
      filterable: true,
      width: 130,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "secondary" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 300,
      formatter: (value: string) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
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
          Error loading medication frequencies: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
      </Box>

      {showStats && renderStatsDashboard()}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Medication Frequency List
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent="flex-end">
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
              <SmartButton text="Add Frequency" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name or SNOMED code"
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
          <Grid size={{ xs: 12, md: 8 }}>
            <Tooltip title="Filter Medication Frequencies">
              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                <DropdownSelect
                  label="Status"
                  name="status"
                  value={filters.status}
                  options={statusOptions}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  size="small"
                  defaultText="All Status"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {Object.values(filters).some(Boolean) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredFrequencies} maxHeight="calc(100vh - 280px)" emptyStateMessage="No medication frequencies found" loading={isLoading} />
      </Paper>

      {isFormOpen && <MedicationFrequencyForm open={isFormOpen} onClose={handleFormClose} initialData={selectedFrequency} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the medication frequency "${selectedFrequency?.mFrqName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default MedicationFrequencyPage;
