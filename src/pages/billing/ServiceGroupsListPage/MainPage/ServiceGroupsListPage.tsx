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
import { BServiceGrpDto } from "@/interfaces/Billing/BServiceGrpDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import { useServiceGroupsList } from "../hooks/useServiceGroupList";
import ServiceGroupsForm from "../Form/ServiceGroupListForm";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const serviceTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "lab", label: "Lab Service" },
  { value: "therapy", label: "Therapy Service" },
  { value: "regular", label: "Regular Service" },
];

const modificationOptions = [
  { value: "all", label: "All" },
  { value: "modifiable", label: "Modifiable" },
  { value: "non-modifiable", label: "Non-Modifiable" },
];

const ServiceGroupsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedServiceGroup, setSelectedServiceGroup] = useState<BServiceGrpDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const { showAlert } = useAlert();
  const [gridDensity, setGridDensity] = useState<GridDensity>("medium");
  const { serviceGroupsList, isLoading, error, fetchServiceGroupsList, deleteServiceGroup } = useServiceGroupsList();
  const [filters, setFilters] = useState<{
    status: string;
    serviceType: string;
    modification: string;
  }>({
    status: "",
    serviceType: "",
    modification: "",
  });

  const handleRefresh = useCallback(() => {
    fetchServiceGroupsList();
  }, [fetchServiceGroupsList]);

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
    setSelectedServiceGroup(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((serviceGroup: BServiceGrpDto) => {
    setSelectedServiceGroup(serviceGroup);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((serviceGroup: BServiceGrpDto) => {
    setSelectedServiceGroup(serviceGroup);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((serviceGroup: BServiceGrpDto) => {
    setSelectedServiceGroup(serviceGroup);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedServiceGroup) return;

    try {
      const success = await deleteServiceGroup(selectedServiceGroup.sGrpID);

      if (success) {
        showAlert("Success", "Service group deleted successfully", "success");
      } else {
        throw new Error("Failed to delete service group");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete service group", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedServiceGroup, deleteServiceGroup]);

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
      serviceType: "",
      modification: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!serviceGroupsList.length) {
      return {
        totalServiceGroups: 0,
        activeServiceGroups: 0,
        inactiveServiceGroups: 0,
        labServiceGroups: 0,
        therapyServiceGroups: 0,
        modifiableServiceGroups: 0,
      };
    }

    const activeCount = serviceGroupsList.filter((sg) => sg.rActiveYN === "Y").length;
    const labCount = serviceGroupsList.filter((sg) => sg.labServiceYN === "Y").length;
    const therapyCount = serviceGroupsList.filter((sg) => sg.isTherapyYN === "Y").length;
    const modifiableCount = serviceGroupsList.filter((sg) => sg.modifyYN === "Y").length;

    return {
      totalServiceGroups: serviceGroupsList.length,
      activeServiceGroups: activeCount,
      inactiveServiceGroups: serviceGroupsList.length - activeCount,
      labServiceGroups: labCount,
      therapyServiceGroups: therapyCount,
      modifiableServiceGroups: modifiableCount,
    };
  }, [serviceGroupsList]);

  const filteredServiceGroups = useMemo(() => {
    if (!serviceGroupsList.length) return [];
    return serviceGroupsList.filter((serviceGroup) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        serviceGroup.sGrpName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        serviceGroup.sGrpCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        serviceGroup.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "" || (filters.status === "active" && serviceGroup.rActiveYN === "Y") || (filters.status === "inactive" && serviceGroup.rActiveYN === "N");
      const matchesServiceType =
        filters.serviceType === "" ||
        filters.serviceType === "all" ||
        (filters.serviceType === "lab" && serviceGroup.labServiceYN === "Y") ||
        (filters.serviceType === "therapy" && serviceGroup.isTherapyYN === "Y") ||
        (filters.serviceType === "regular" && serviceGroup.labServiceYN === "N" && serviceGroup.isTherapyYN === "N");

      const matchesModification =
        filters.modification === "" ||
        filters.modification === "all" ||
        (filters.modification === "modifiable" && serviceGroup.modifyYN === "Y") ||
        (filters.modification === "non-modifiable" && serviceGroup.modifyYN === "N");

      return matchesSearch && matchesStatus && matchesServiceType && matchesModification;
    });
  }, [serviceGroupsList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Service Groups</Typography>
          <Typography variant="h4">{stats.totalServiceGroups}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeServiceGroups}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveServiceGroups}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Lab Services</Typography>
          <Typography variant="h4" color="info.main">
            {stats.labServiceGroups}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Therapy Services</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.therapyServiceGroups}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Modifiable</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.modifiableServiceGroups}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<BServiceGrpDto>[] = [
    {
      key: "sGrpCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "sGrpName",
      header: "Service Group Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      key: "prnSGrpOrder",
      header: "Order",
      visible: true,
      sortable: true,
      filterable: true,
      width: 80,
      formatter: (value: number) => value.toString(),
    },
    {
      key: "labServiceYN",
      header: "Lab Service",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "isTherapyYN",
      header: "Therapy",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "warning" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "secondary" : "default"} label={value === "Y" ? "Yes" : "No"} />,
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
          Error loading service groups: {error}
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
              Service Groups Management
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
              <SmartButton text="Add Service Group" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name or notes"
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
            <Tooltip title="Filter Service Groups">
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
                  label="Service Type"
                  name="serviceType"
                  value={filters.serviceType}
                  options={serviceTypeOptions}
                  onChange={(e) => handleFilterChange("serviceType", e.target.value)}
                  size="small"
                  defaultText="All Types"
                />

                <DropdownSelect
                  label="Modification"
                  name="modification"
                  value={filters.modification}
                  options={modificationOptions}
                  onChange={(e) => handleFilterChange("modification", e.target.value)}
                  size="small"
                  defaultText="All"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.serviceType || filters.modification) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredServiceGroups} maxHeight="calc(100vh - 280px)" emptyStateMessage="No service groups found" loading={isLoading} />
      </Paper>

      {isFormOpen && <ServiceGroupsForm open={isFormOpen} onClose={handleFormClose} initialData={selectedServiceGroup} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the service group "${selectedServiceGroup?.sGrpName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default ServiceGroupsListPage;
