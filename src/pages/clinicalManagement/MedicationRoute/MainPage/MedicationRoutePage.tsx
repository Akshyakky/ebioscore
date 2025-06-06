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
import { MedicationRouteDto } from "@/interfaces/ClinicalManagement/MedicationRouteDto";
import MedicationRouteForm from "../Form/MedicationRouteForm";
import { useMedicationRoute } from "../hooks/useMedicationRoute";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const MedicationRoutePage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<MedicationRouteDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { medicationRouteList, isLoading, error, fetchMedicationRouteList, deleteMedicationRoute } = useMedicationRoute();

  const [filters, setFilters] = useState<{
    status: string;
  }>({
    status: "",
  });

  const handleRefresh = useCallback(() => {
    fetchMedicationRouteList();
  }, [fetchMedicationRouteList]);

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
    setSelectedRoute(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((route: MedicationRouteDto) => {
    setSelectedRoute(route);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((route: MedicationRouteDto) => {
    setSelectedRoute(route);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((route: MedicationRouteDto) => {
    setSelectedRoute(route);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRoute) return;

    try {
      const success = await deleteMedicationRoute(selectedRoute.mRouteID);

      if (success) {
        showAlert("Success", "Medication route deleted successfully", "success");
      } else {
        throw new Error("Failed to delete medication route");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete medication route", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedRoute, deleteMedicationRoute]);

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
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!medicationRouteList.length) {
      return {
        totalRoutes: 0,
        activeRoutes: 0,
        inactiveRoutes: 0,
        defaultRoutes: 0,
        modifiableRoutes: 0,
      };
    }

    const activeCount = medicationRouteList.filter((r) => (r as any).rActiveYN === "Y").length;
    const defaultCount = medicationRouteList.filter((r) => r.defaultYN === "Y").length;
    const modifiableCount = medicationRouteList.filter((r) => r.modifyYN === "Y").length;

    return {
      totalRoutes: medicationRouteList.length,
      activeRoutes: activeCount,
      inactiveRoutes: medicationRouteList.length - activeCount,
      defaultRoutes: defaultCount,
      modifiableRoutes: modifiableCount,
    };
  }, [medicationRouteList]);

  const filteredRoutes = useMemo(() => {
    if (!medicationRouteList.length) return [];

    return medicationRouteList.filter((route) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        route.mRouteName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        route.mRouteCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        route.mRouteSnomedCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (route as any).rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "" || (filters.status === "active" && (route as any).rActiveYN === "Y") || (filters.status === "inactive" && (route as any).rActiveYN === "N");

      return matchesSearch && matchesStatus;
    });
  }, [medicationRouteList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Total Routes</Typography>
          <Typography variant="h4">{stats.totalRoutes}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeRoutes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveRoutes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Default</Typography>
          <Typography variant="h4" color="info.main">
            {stats.defaultRoutes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Modifiable</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.modifiableRoutes}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<MedicationRouteDto>[] = [
    {
      key: "mRouteCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => value || "-",
    },
    {
      key: "mRouteName",
      header: "Route Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "mRSnomedCode",
      header: "SNOMED CT Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
      formatter: (value: string) => value || "-",
    },
    {
      key: "defaultYN",
      header: "Default",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
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
          Error loading medication routes: {error}
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
              Medication Route List
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
              <SmartButton text="Add Route" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code or name"
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
            <Tooltip title="Filter Routes">
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
                  {filters.status && <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredRoutes} maxHeight="calc(100vh - 280px)" emptyStateMessage="No medication routes found" loading={isLoading} />
      </Paper>

      {isFormOpen && <MedicationRouteForm open={isFormOpen} onClose={handleFormClose} initialData={selectedRoute} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the medication route "${selectedRoute?.mRouteName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default MedicationRoutePage;
