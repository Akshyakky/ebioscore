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
import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";
import DepartmentListForm from "../Form/DepartmentListForm";
import { useDepartmentList } from "../hooks/useDepartmentList";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const departmentTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "CLINICAL", label: "Clinical" },
  { value: "NON_CLINICAL", label: "Non-Clinical" },
  { value: "ADMIN", label: "Administrative" },
  { value: "SUPPORT", label: "Support" },
];

const storeOptions = [
  { value: "all", label: "All" },
  { value: "store", label: "Store" },
  { value: "non-store", label: "Non-Store" },
];

const unitOptions = [
  { value: "all", label: "All" },
  { value: "unit", label: "Unit" },
  { value: "non-unit", label: "Non-Unit" },
];

const DepartmentListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const { showAlert } = useAlert();

  const { departmentList, isLoading, error, fetchDepartmentList, deleteDepartment } = useDepartmentList();

  const [filters, setFilters] = useState<{
    status: string;
    departmentType: string;
    isStore: string;
    isUnit: string;
  }>({
    status: "",
    departmentType: "",
    isStore: "",
    isUnit: "",
  });

  const handleRefresh = useCallback(() => {
    fetchDepartmentList();
  }, [fetchDepartmentList]);

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
    setSelectedDepartment(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((department: DepartmentDto) => {
    setSelectedDepartment(department);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((department: DepartmentDto) => {
    setSelectedDepartment(department);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((department: DepartmentDto) => {
    setSelectedDepartment(department);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedDepartment) return;

    try {
      const success = await deleteDepartment(selectedDepartment.deptID);

      if (success) {
        showAlert("Success", "Department deleted successfully", "success");
      } else {
        throw new Error("Failed to delete department");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete department", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedDepartment, deleteDepartment]);

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
      departmentType: "",
      isStore: "",
      isUnit: "",
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!departmentList.length) {
      return {
        totalDepartments: 0,
        activeDepartments: 0,
        inactiveDepartments: 0,
        clinicalDepartments: 0,
        storeDepartments: 0,
        unitDepartments: 0,
      };
    }

    const activeCount = departmentList.filter((d) => d.rActiveYN === "Y").length;
    const clinicalCount = departmentList.filter((d) => d.deptType === "CLINICAL").length;
    const storeCount = departmentList.filter((d) => d.isStoreYN === "Y").length;
    const unitCount = departmentList.filter((d) => d.isUnitYN === "Y").length;

    return {
      totalDepartments: departmentList.length,
      activeDepartments: activeCount,
      inactiveDepartments: departmentList.length - activeCount,
      clinicalDepartments: clinicalCount,
      storeDepartments: storeCount,
      unitDepartments: unitCount,
    };
  }, [departmentList]);

  // Apply filters to the list
  const filteredDepartments = useMemo(() => {
    if (!departmentList.length) return [];

    return departmentList.filter((department) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        department.deptName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        department.deptCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        department.deptLocation?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        department.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "" || (filters.status === "active" && department.rActiveYN === "Y") || (filters.status === "inactive" && department.rActiveYN === "N");

      const matchesDepartmentType = filters.departmentType === "" || filters.departmentType === "all" || department.deptType === filters.departmentType;

      const matchesStore =
        filters.isStore === "" ||
        filters.isStore === "all" ||
        (filters.isStore === "store" && department.isStoreYN === "Y") ||
        (filters.isStore === "non-store" && department.isStoreYN === "N");

      const matchesUnit =
        filters.isUnit === "" ||
        filters.isUnit === "all" ||
        (filters.isUnit === "unit" && department.isUnitYN === "Y") ||
        (filters.isUnit === "non-unit" && department.isUnitYN === "N");

      return matchesSearch && matchesStatus && matchesDepartmentType && matchesStore && matchesUnit;
    });
  }, [departmentList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Departments</Typography>
          <Typography variant="h4">{stats.totalDepartments}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeDepartments}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveDepartments}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Clinical</Typography>
          <Typography variant="h4" color="info.main">
            {stats.clinicalDepartments}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Stores</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.storeDepartments}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Units</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.unitDepartments}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<DepartmentDto>[] = [
    {
      key: "deptCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "deptName",
      header: "Department Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      key: "deptType",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => value || "-",
    },
    {
      key: "deptLocation",
      header: "Location",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "isUnitYN",
      header: "Unit",
      visible: true,
      sortable: true,
      filterable: true,
      width: 80,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "isStoreYN",
      header: "Store",
      visible: true,
      sortable: true,
      filterable: true,
      width: 80,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "warning" : "default"} label={value === "Y" ? "Yes" : "No"} />,
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
          Error loading departments: {error}
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
              Department List
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
              <SmartButton text="Add Department" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name or location"
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
            <Tooltip title="Filter Departments">
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

                <DropdownSelect
                  label="Department Type"
                  name="departmentType"
                  value={filters.departmentType}
                  options={departmentTypeOptions}
                  onChange={(e) => handleFilterChange("departmentType", e.target.value)}
                  size="small"
                  defaultText="All Types"
                />

                <DropdownSelect
                  label="Store"
                  name="isStore"
                  value={filters.isStore}
                  options={storeOptions}
                  onChange={(e) => handleFilterChange("isStore", e.target.value)}
                  size="small"
                  defaultText="All"
                />

                <DropdownSelect
                  label="Unit"
                  name="isUnit"
                  value={filters.isUnit}
                  options={unitOptions}
                  onChange={(e) => handleFilterChange("isUnit", e.target.value)}
                  size="small"
                  defaultText="All"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.departmentType || filters.isStore || filters.isUnit) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredDepartments} maxHeight="calc(100vh - 280px)" emptyStateMessage="No departments found" loading={isLoading} />
      </Paper>

      {isFormOpen && <DepartmentListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedDepartment} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the department "${selectedDepartment?.deptName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default DepartmentListPage;
