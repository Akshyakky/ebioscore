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
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import MedicationListForm from "../Form/MedicationListForm";
import { useMedicationList } from "../hooks/useMedicationList";
import { showAlert } from "@/utils/Common/showAlert";
import { debounce } from "@/utils/Common/debounceUtils";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const calcQuantityOptions = [
  { value: "yes", label: "Calculate Quantity: Yes" },
  { value: "no", label: "Calculate Quantity: No" },
];

const MedicationListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedMedication, setSelectedMedication] = useState<MedicationListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { medicationList, isLoading, error, fetchMedicationList, deleteMedication } = useMedicationList();
  // const { medicationGroupList, manufacturerList } = useDropdownValues(["medicationGeneric", "manufacturerList"]);

  const medicationGroupList = [];
  const manufacturerList = [];

  const [filters, setFilters] = useState<{
    status: string;
    calcQuantity: string;
    group: string;
    manufacturer: string;
  }>({
    status: "",
    calcQuantity: "",
    group: "",
    manufacturer: "",
  });

  useEffect(() => {
    document.title = "Medication List Management";
  }, []);

  const handleRefresh = useCallback(() => {
    fetchMedicationList();
  }, [fetchMedicationList]);

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
    setSelectedMedication(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((medication: MedicationListDto) => {
    setSelectedMedication(medication);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((medication: MedicationListDto) => {
    setSelectedMedication(medication);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((medication: MedicationListDto) => {
    setSelectedMedication(medication);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMedication) return;

    try {
      const success = await deleteMedication(selectedMedication.mlID);

      if (success) {
        showAlert("Success", "Medication deleted successfully", "success");
      } else {
        throw new Error("Failed to delete medication");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete medication", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedMedication, deleteMedication]);

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
      calcQuantity: "",
      group: "",
      manufacturer: "",
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!medicationList.length) {
      return {
        totalMedications: 0,
        activeMedications: 0,
        inactiveMedications: 0,
        calcQuantityEnabled: 0,
        uniqueManufacturers: 0,
        uniqueGenerics: 0,
      };
    }

    const activeCount = medicationList.filter((m) => m.rActiveYN === "Y").length;
    const calcQuantityCount = medicationList.filter((m) => m.calcQtyYN === "Y").length;
    const uniqueManufacturers = new Set(medicationList.map((m) => m.mfID)).size;
    const uniqueGenerics = new Set(medicationList.map((m) => m.mGenID)).size;

    return {
      totalMedications: medicationList.length,
      activeMedications: activeCount,
      inactiveMedications: medicationList.length - activeCount,
      calcQuantityEnabled: calcQuantityCount,
      uniqueManufacturers,
      uniqueGenerics,
    };
  }, [medicationList]);

  // Apply filters to the list
  const filteredMedications = useMemo(() => {
    if (!medicationList.length) return [];

    return medicationList.filter((medication) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        medication.medText?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        medication.mlCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        medication.mfName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        medication.mGenName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (medication.medText1 && medication.medText1.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

      const matchesStatus =
        filters.status === "" || (filters.status === "active" && medication.rActiveYN === "Y") || (filters.status === "inactive" && medication.rActiveYN === "N");

      const matchesCalcQuantity =
        filters.calcQuantity === "" || (filters.calcQuantity === "yes" && medication.calcQtyYN === "Y") || (filters.calcQuantity === "no" && medication.calcQtyYN === "N");

      const matchesGroup = filters.group === "" || medication.mGrpID.toString() === filters.group;
      const matchesManufacturer = filters.manufacturer === "" || medication.mfID.toString() === filters.manufacturer;

      return matchesSearch && matchesStatus && matchesCalcQuantity && matchesGroup && matchesManufacturer;
    });
  }, [medicationList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Medications</Typography>
          <Typography variant="h4">{stats.totalMedications}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeMedications}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveMedications}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Calc Quantity</Typography>
          <Typography variant="h4" color="info.main">
            {stats.calcQuantityEnabled}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Manufacturers</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.uniqueManufacturers}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Generics</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.uniqueGenerics}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<MedicationListDto>[] = [
    {
      key: "mlCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "medText",
      header: "Medication Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "mfName",
      header: "Manufacturer",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
    },
    {
      key: "mGenName",
      header: "Generic Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
    },
    {
      key: "medText1",
      header: "Alternative Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
      formatter: (value: string | null) => value || "-",
    },
    {
      key: "calcQtyYN",
      header: "Calc Quantity",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
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
          Error loading medications: {error}
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
              Medication List
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
              <SmartButton text="Add Medication" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name, manufacturer or generic"
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
            <Tooltip title="Filter Medications">
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

                <DropdownSelect
                  label="Calculate Quantity"
                  name="calcQuantity"
                  value={filters.calcQuantity}
                  options={calcQuantityOptions}
                  onChange={(e) => handleFilterChange("calcQuantity", e.target.value)}
                  size="small"
                  defaultText="All"
                />

                <DropdownSelect
                  label="Medication Group"
                  name="group"
                  value={filters.group}
                  options={medicationGroupList || []}
                  onChange={(e) => handleFilterChange("group", e.target.value)}
                  size="small"
                  defaultText="All Groups"
                />

                <DropdownSelect
                  label="Manufacturer"
                  name="manufacturer"
                  value={filters.manufacturer}
                  options={manufacturerList || []}
                  onChange={(e) => handleFilterChange("manufacturer", e.target.value)}
                  size="small"
                  defaultText="All Manufacturers"
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
        <CustomGrid columns={columns} data={filteredMedications} maxHeight="calc(100vh - 280px)" emptyStateMessage="No medications found" loading={isLoading} />
      </Paper>

      {isFormOpen && <MedicationListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedMedication} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the medication "${selectedMedication?.medText}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default MedicationListPage;
