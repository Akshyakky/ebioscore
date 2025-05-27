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
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import ResourceListForm from "../Form/ResourceListForm";
import { useResourceList } from "../hooks/useResourceList";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const resourceTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "ot", label: "OT" },
  { value: "non-ot", label: "Non-OT" },
];

const validationOptions = [
  { value: "all", label: "All" },
  { value: "validated", label: "Validated" },
  { value: "not-validated", label: "Not Validated" },
];

const ResourceListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedResource, setSelectedResource] = useState<ResourceListData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { resourceList, isLoading, error, fetchResourceList, deleteResource } = useResourceList();

  const [filters, setFilters] = useState<{
    status: string;
    resourceType: string;
    validation: string;
  }>({
    status: "",
    resourceType: "",
    validation: "",
  });

  useEffect(() => {
    document.title = "Resource List Management";
  }, []);

  const handleRefresh = useCallback(() => {
    fetchResourceList();
  }, [fetchResourceList]);

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
    setSelectedResource(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((resource: ResourceListData) => {
    setSelectedResource(resource);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((resource: ResourceListData) => {
    setSelectedResource(resource);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((resource: ResourceListData) => {
    setSelectedResource(resource);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedResource) return;

    try {
      const success = await deleteResource(selectedResource.rLID);

      if (success) {
        showAlert("Success", "Resource deleted successfully", "success");
      } else {
        throw new Error("Failed to delete resource");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete resource", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedResource, deleteResource]);

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
      resourceType: "",
      validation: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!resourceList.length) {
      return {
        totalResources: 0,
        activeResources: 0,
        inactiveResources: 0,
        otResources: 0,
        validatedResources: 0,
      };
    }

    const activeCount = resourceList.filter((r) => r.rActiveYN === "Y").length;
    const otCount = resourceList.filter((r) => r.rLOtYN === "Y").length;
    const validatedCount = resourceList.filter((r) => r.rLValidateYN === "Y").length;

    return {
      totalResources: resourceList.length,
      activeResources: activeCount,
      inactiveResources: resourceList.length - activeCount,
      otResources: otCount,
      validatedResources: validatedCount,
    };
  }, [resourceList]);

  const filteredResources = useMemo(() => {
    if (!resourceList.length) return [];

    return resourceList.filter((resource) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        resource.rLName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        resource.rLCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        resource.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && resource.rActiveYN === "Y") || (filters.status === "inactive" && resource.rActiveYN === "N");

      const matchesType =
        filters.resourceType === "" ||
        filters.resourceType === "all" ||
        (filters.resourceType === "ot" && resource.rLOtYN === "Y") ||
        (filters.resourceType === "non-ot" && resource.rLOtYN === "N");

      const matchesValidation =
        filters.validation === "" ||
        filters.validation === "all" ||
        (filters.validation === "validated" && resource.rLValidateYN === "Y") ||
        (filters.validation === "not-validated" && resource.rLValidateYN === "N");

      return matchesSearch && matchesStatus && matchesType && matchesValidation;
    });
  }, [resourceList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Total Resources</Typography>
          <Typography variant="h4">{stats.totalResources}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeResources}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveResources}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">OT Resources</Typography>
          <Typography variant="h4" color="info.main">
            {stats.otResources}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Validated</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.validatedResources}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<ResourceListData>[] = [
    {
      key: "rLCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "rLName",
      header: "Resource Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "rLValidateYN",
      header: "Validated",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "success" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "rLOtYN",
      header: "OT",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
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
          Error loading resources: {error}
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
              Resource List
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
              <SmartButton text="Add Resource" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
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
          <Grid size={{ xs: 12, md: 4 }}>
            <Tooltip title="Filter Resources">
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
                  label="Resource Type"
                  name="resourceType"
                  value={filters.resourceType}
                  options={resourceTypeOptions}
                  onChange={(e) => handleFilterChange("resourceType", e.target.value)}
                  size="small"
                  defaultText="All Types"
                />

                <DropdownSelect
                  label="Validation"
                  name="validation"
                  value={filters.validation}
                  options={validationOptions}
                  onChange={(e) => handleFilterChange("validation", e.target.value)}
                  size="small"
                  defaultText="All"
                />
                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.resourceType || filters.validation) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredResources} maxHeight="calc(100vh - 280px)" emptyStateMessage="No resources found" loading={isLoading} />
      </Paper>

      {isFormOpen && <ResourceListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedResource} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the resource "${selectedResource?.rLName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default ResourceListPage;
