import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { OPIPLifestyleDto } from "@/interfaces/ClinicalManagement/OPIPLifestyleDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Box, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import LifeStyleForm from "../Form/LifeStyleForm";
import { useLifestyle } from "../hook/useLifeStyle";

const dietTypeOptions = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "balanced", label: "Balanced" },
];

const smokingStatusOptions = [
  { value: "never", label: "Never" },
  { value: "former", label: "Former" },
  { value: "current", label: "Current" },
  { value: "occasional", label: "Occasional" },
];

const alcoholStatusOptions = [
  { value: "never", label: "Never" },
  { value: "occasional", label: "Occasional" },
  { value: "moderate", label: "Moderate" },
  { value: "heavy", label: "Heavy" },
];

const exerciseFrequencyOptions = [
  { value: "none", label: "None" },
  { value: "rare", label: "Rarely" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

const LifeStyle: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedLifestyle, setSelectedLifestyle] = useState<OPIPLifestyleDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { lifestyleList, isLoading, error, fetchLifestyleList, deleteLifestyle } = useLifestyle();

  const [filters, setFilters] = useState<{
    dietType: string;
    smokingStatus: string;
    alcoholStatus: string;
    exerciseFrequency: string;
  }>({
    dietType: "",
    smokingStatus: "",
    alcoholStatus: "",
    exerciseFrequency: "",
  });

  const handleRefresh = useCallback(() => {
    fetchLifestyleList();
  }, [fetchLifestyleList]);

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
    setSelectedLifestyle(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((lifestyle: OPIPLifestyleDto) => {
    setSelectedLifestyle(lifestyle);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((lifestyle: OPIPLifestyleDto) => {
    setSelectedLifestyle(lifestyle);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((lifestyle: OPIPLifestyleDto) => {
    setSelectedLifestyle(lifestyle);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedLifestyle) return;

    try {
      const success = await deleteLifestyle(selectedLifestyle.opipLSID);

      if (success) {
        showAlert("Success", "Lifestyle record deleted successfully", "success");
      } else {
        throw new Error("Failed to delete lifestyle record");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete lifestyle record", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedLifestyle, deleteLifestyle]);

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
      dietType: "",
      smokingStatus: "",
      alcoholStatus: "",
      exerciseFrequency: "",
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!lifestyleList.length) {
      return {
        totalRecords: 0,
        activeRecords: 0,
        inactiveRecords: 0,
        vegetarianCount: 0,
        nonSmokerCount: 0,
        regularExerciseCount: 0,
      };
    }

    const activeCount = lifestyleList.filter((l) => l.rActiveYN === "Y").length;
    const vegetarianCount = lifestyleList.filter((l) => l.dietType === "vegetarian" || l.dietType === "vegan").length;
    const nonSmokerCount = lifestyleList.filter((l) => l.smokingStatus === "never").length;
    const regularExerciseCount = lifestyleList.filter((l) => l.exerciseFrequency === "daily" || l.exerciseFrequency === "weekly").length;

    return {
      totalRecords: lifestyleList.length,
      activeRecords: activeCount,
      inactiveRecords: lifestyleList.length - activeCount,
      vegetarianCount,
      nonSmokerCount,
      regularExerciseCount,
    };
  }, [lifestyleList]);

  // Apply filters to the list
  const filteredLifestyles = useMemo(() => {
    if (!lifestyleList.length) return [];

    return lifestyleList.filter((lifestyle) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        lifestyle.pChartID?.toString().includes(debouncedSearchTerm) ||
        lifestyle.opipNo?.toString().includes(debouncedSearchTerm) ||
        lifestyle.dietType?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        lifestyle.smokingStatus?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesDietType = filters.dietType === "" || lifestyle.dietType === filters.dietType;
      const matchesSmokingStatus = filters.smokingStatus === "" || lifestyle.smokingStatus === filters.smokingStatus;
      const matchesAlcoholStatus = filters.alcoholStatus === "" || lifestyle.alcoholStatus === filters.alcoholStatus;
      const matchesExerciseFrequency = filters.exerciseFrequency === "" || lifestyle.exerciseFrequency === filters.exerciseFrequency;

      return matchesSearch && matchesDietType && matchesSmokingStatus && matchesAlcoholStatus && matchesExerciseFrequency;
    });
  }, [lifestyleList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Records</Typography>
          <Typography variant="h4">{stats.totalRecords}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeRecords}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveRecords}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Vegetarian</Typography>
          <Typography variant="h4" color="info.main">
            {stats.vegetarianCount}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Non-Smokers</Typography>
          <Typography variant="h4" color="success.main">
            {stats.nonSmokerCount}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Regular Exercise</Typography>
          <Typography variant="h4" color="primary.main">
            {stats.regularExerciseCount}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const getDietTypeColor = (dietType: string) => {
    switch (dietType) {
      case "vegetarian":
        return "success";
      case "vegan":
        return "info";
      case "non-vegetarian":
        return "warning";
      default:
        return "default";
    }
  };

  const getSmokingStatusColor = (status: string) => {
    switch (status) {
      case "never":
        return "success";
      case "former":
        return "info";
      case "current":
        return "error";
      default:
        return "warning";
    }
  };

  const getExerciseFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "success";
      case "weekly":
        return "info";
      case "rare":
        return "warning";
      default:
        return "error";
    }
  };

  const columns: Column<OPIPLifestyleDto>[] = [
    {
      key: "pChartID",
      header: "Chart ID",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
    },
    {
      key: "opipNo",
      header: "OP/IP No",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
    },
    {
      key: "patOpip",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 80,
      formatter: (value: string) => <Chip size="small" label={value === "O" ? "OP" : "IP"} color={value === "O" ? "primary" : "secondary"} />,
    },
    {
      key: "dietType",
      header: "Diet Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => <Chip size="small" label={value || "-"} color={getDietTypeColor(value)} />,
    },
    {
      key: "smokingStatus",
      header: "Smoking Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => <Chip size="small" label={value || "-"} color={getSmokingStatusColor(value)} />,
    },
    {
      key: "alcoholStatus",
      header: "Alcohol Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "exerciseFrequency",
      header: "Exercise Frequency",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
      formatter: (value: string) => <Chip size="small" label={value || "-"} color={getExerciseFrequencyColor(value)} />,
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
          Error loading lifestyle records: {error}
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
              Patient Lifestyle Records
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
              <SmartButton text="Add Lifestyle" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by Chart ID, OP/IP No, diet or smoking status"
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
            <Tooltip title="Filter Lifestyle Records">
              <Stack direction="row" spacing={2}>
                <DropdownSelect
                  label="Diet Type"
                  name="dietType"
                  value={filters.dietType}
                  options={dietTypeOptions}
                  onChange={(e) => handleFilterChange("dietType", e.target.value)}
                  size="small"
                  defaultText="All Diet Types"
                />

                <DropdownSelect
                  label="Smoking"
                  name="smokingStatus"
                  value={filters.smokingStatus}
                  options={smokingStatusOptions}
                  onChange={(e) => handleFilterChange("smokingStatus", e.target.value)}
                  size="small"
                  defaultText="All Smoking Status"
                />

                <DropdownSelect
                  label="Alcohol"
                  name="alcoholStatus"
                  value={filters.alcoholStatus}
                  options={alcoholStatusOptions}
                  onChange={(e) => handleFilterChange("alcoholStatus", e.target.value)}
                  size="small"
                  defaultText="All Alcohol Status"
                />

                <DropdownSelect
                  label="Exercise"
                  name="exerciseFrequency"
                  value={filters.exerciseFrequency}
                  options={exerciseFrequencyOptions}
                  onChange={(e) => handleFilterChange("exerciseFrequency", e.target.value)}
                  size="small"
                  defaultText="All Exercise Levels"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.dietType || filters.smokingStatus || filters.alcoholStatus || filters.exerciseFrequency) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredLifestyles} maxHeight="calc(100vh - 280px)" emptyStateMessage="No lifestyle records found" loading={isLoading} />
      </Paper>

      {isFormOpen && <LifeStyleForm open={isFormOpen} onClose={handleFormClose} initialData={selectedLifestyle} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete this lifestyle record?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default LifeStyle;
