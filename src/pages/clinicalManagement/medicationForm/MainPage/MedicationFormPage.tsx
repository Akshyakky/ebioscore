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
import CustomGrid, { Column, GridDensity } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { MedicationFormDto } from "@/interfaces/ClinicalManagement/MedicationFormDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import MedicationFormForm from "../Form/MedicationForm";
import { useMedicationForm } from "../hooks/useMedicationForm";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const MedicationFormPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedForm, setSelectedForm] = useState<MedicationFormDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const [gridDensity, setGridDensity] = useState<GridDensity>("medium");

  const { medicationFormList, isLoading, error, fetchMedicationFormList, deleteMedicationForm } = useMedicationForm();

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

  const handleRefresh = useCallback(() => {
    fetchMedicationFormList();
  }, [fetchMedicationFormList]);

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
    setSelectedForm(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((form: MedicationFormDto) => {
    setSelectedForm(form);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((form: MedicationFormDto) => {
    setSelectedForm(form);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((form: MedicationFormDto) => {
    setSelectedForm(form);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedForm) return;

    try {
      const success = await deleteMedicationForm(selectedForm.mFID);

      if (success) {
        showAlert("Success", "Medication form deleted successfully", "success");
      } else {
        throw new Error("Failed to delete medication form");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete medication form", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedForm, deleteMedicationForm]);

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
    if (!medicationFormList.length) {
      return {
        totalForms: 0,
        activeForms: 0,
        inactiveForms: 0,
        defaultForms: 0,
        modifiableForms: 0,
        transferableForms: 0,
      };
    }

    const activeCount = medicationFormList.filter((f) => f.rActiveYN === "Y").length;
    const defaultCount = medicationFormList.filter((f) => f.defaultYN === "Y").length;
    const modifyCount = medicationFormList.filter((f) => f.modifyYN === "Y").length;
    const transferCount = medicationFormList.filter((f) => f.transferYN === "Y").length;

    return {
      totalForms: medicationFormList.length,
      activeForms: activeCount,
      inactiveForms: medicationFormList.length - activeCount,
      defaultForms: defaultCount,
      modifiableForms: modifyCount,
      transferableForms: transferCount,
    };
  }, [medicationFormList]);

  const filteredForms = useMemo(() => {
    if (!medicationFormList.length) return [];
    return medicationFormList.filter((form) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        form.mFName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        form.mFCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        form.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        form.mFSnomedCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && form.rActiveYN === "Y") || (filters.status === "inactive" && form.rActiveYN === "N");

      return matchesSearch && matchesStatus;
    });
  }, [medicationFormList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Forms</Typography>
          <Typography variant="h4">{stats.totalForms}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeForms}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveForms}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Default</Typography>
          <Typography variant="h4" color="info.main">
            {stats.defaultForms}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Modifiable</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.modifiableForms}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Transferable</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.transferableForms}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<MedicationFormDto>[] = [
    {
      key: "mFCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "mFName",
      header: "Form Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "mFSnomedCode",
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
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "primary"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "warning" : "primary"} label={value === "Y" ? "Yes" : "No"} />,
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
          Error loading medication forms: {error}
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
            <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
              Medication Form List
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
              <SmartButton text="Add Form" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
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
            <Tooltip title="Filter Medication Forms">
              <Stack direction="row" spacing={2}>
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
        <CustomGrid columns={columns} data={filteredForms} maxHeight="calc(100vh - 280px)" emptyStateMessage="No medication forms found" loading={isLoading} />
      </Paper>

      {isFormOpen && <MedicationFormForm open={isFormOpen} onClose={handleFormClose} initialData={selectedForm} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the medication form "${selectedForm?.mFName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default MedicationFormPage;
