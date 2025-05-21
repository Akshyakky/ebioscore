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
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";
import MedicationGenericForm from "../Form/MedicationGenericForm";
import { useMedicationGeneric } from "../hooks/useMedicationGeneric";
import { showAlert } from "@/utils/Common/showAlert";
import { debounce } from "@/utils/Common/debounceUtils";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const MedicationGenericPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedGeneric, setSelectedGeneric] = useState<MedicationGenericDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { medicationGenericList, isLoading, error, fetchMedicationGenericList, deleteMedicationGeneric } = useMedicationGeneric();

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
    document.title = "Generic Medication Management";
  }, []);

  const handleRefresh = useCallback(() => {
    fetchMedicationGenericList();
  }, [fetchMedicationGenericList]);

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
    setSelectedGeneric(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((generic: MedicationGenericDto) => {
    setSelectedGeneric(generic);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((generic: MedicationGenericDto) => {
    setSelectedGeneric(generic);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((generic: MedicationGenericDto) => {
    setSelectedGeneric(generic);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedGeneric) return;

    try {
      const success = await deleteMedicationGeneric(selectedGeneric.mGenID);

      if (success) {
        showAlert("Success", "Generic medication deleted successfully", "success");
      } else {
        throw new Error("Failed to delete generic medication");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete generic medication", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedGeneric, deleteMedicationGeneric]);

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

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!medicationGenericList.length) {
      return {
        totalGenerics: 0,
        activeGenerics: 0,
        inactiveGenerics: 0,
        defaultGenerics: 0,
        modifiableGenerics: 0,
        transferableGenerics: 0,
      };
    }

    const activeCount = medicationGenericList.filter((g) => g.rActiveYN === "Y").length;
    const defaultCount = medicationGenericList.filter((g) => g.defaultYN === "Y").length;
    const modifyCount = medicationGenericList.filter((g) => g.modifyYN === "Y").length;
    const transferCount = medicationGenericList.filter((g) => g.transferYN === "Y").length;

    return {
      totalGenerics: medicationGenericList.length,
      activeGenerics: activeCount,
      inactiveGenerics: medicationGenericList.length - activeCount,
      defaultGenerics: defaultCount,
      modifiableGenerics: modifyCount,
      transferableGenerics: transferCount,
    };
  }, [medicationGenericList]);

  // Apply filters to the list
  const filteredGenerics = useMemo(() => {
    if (!medicationGenericList.length) return [];

    return medicationGenericList.filter((generic) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        generic.mGenName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        generic.mGenCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        generic.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        generic.mSnomedCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && generic.rActiveYN === "Y") || (filters.status === "inactive" && generic.rActiveYN === "N");

      return matchesSearch && matchesStatus;
    });
  }, [medicationGenericList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Generics</Typography>
          <Typography variant="h4">{stats.totalGenerics}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeGenerics}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveGenerics}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Default</Typography>
          <Typography variant="h4" color="info.main">
            {stats.defaultGenerics}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Modifiable</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.modifiableGenerics}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Transferable</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.transferableGenerics}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<MedicationGenericDto>[] = [
    {
      key: "mGenCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "mGenName",
      header: "Generic Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "mSnomedCode",
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
          Error loading generic medications: {error}
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
              Generic Medication List
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
              <SmartButton text="Add Generic" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
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
            <Tooltip title="Filter Generic Medications">
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
        <CustomGrid columns={columns} data={filteredGenerics} maxHeight="calc(100vh - 280px)" emptyStateMessage="No generic medications found" loading={isLoading} />
      </Paper>

      {isFormOpen && <MedicationGenericForm open={isFormOpen} onClose={handleFormClose} initialData={selectedGeneric} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the generic medication "${selectedGeneric?.mGenName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default MedicationGenericPage;
