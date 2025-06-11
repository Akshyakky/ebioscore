import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  CheckCircle as ActiveIcon,
  Add as AddIcon,
  Calculate as CalcIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Science as GenericIcon,
  Cancel as InactiveIcon,
  Business as ManufacturerIcon,
  LocalPharmacy as MedicationIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MedicationListForm from "../Form/MedicationListForm";
import { useMedicationList } from "../hooks/useMedicationList";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const calcQuantityOptions = [
  { value: "yes", label: "Calculate Quantity: Yes" },
  { value: "no", label: "Calculate Quantity: No" },
];

const MedicationListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedMedication, setSelectedMedication] = useState<MedicationListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);

  const { medicationList, isLoading, error, fetchMedicationList, deleteMedication } = useMedicationList();

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
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <MedicationIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalMedications}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Medications
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
                  {stats.activeMedications}
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
                  {stats.inactiveMedications}
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
                <CalcIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.calcQuantityEnabled}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Calc Quantity
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
                <ManufacturerIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.uniqueManufacturers}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Manufacturers
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
                <GenericIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {stats.uniqueGenerics}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Generics
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
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
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "primary"} label={value === "Y" ? "Yes" : "No"} />,
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Medication List
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
          <Grid size={{ xs: 12, md: 5 }}>
            <Tooltip title="Filter Medications">
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
                  label="Calculate Quantity"
                  name="calcQuantity"
                  value={filters.calcQuantity}
                  options={calcQuantityOptions}
                  onChange={(e) => handleFilterChange("calcQuantity", e.target.value)}
                  size="small"
                  defaultText="All"
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
              <SmartButton text="Add Medication" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredMedications} maxHeight="calc(100vh - 280px)" emptyStateMessage="No medications found" density="small" loading={isLoading} />
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
