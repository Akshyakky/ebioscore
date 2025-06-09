import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip, Card, CardContent, Avatar } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Business as DepartmentIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  LocalHospital as ClinicalIcon,
  Store as StoreIcon,
  AccountTree as UnitIcon,
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
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const storeOptions = [
  { value: "store", label: "Store" },
  { value: "non-store", label: "Non-Store" },
];

const unitOptions = [
  { value: "unit", label: "Unit" },
  { value: "non-unit", label: "Non-Unit" },
];

const DepartmentListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);

  const { departmentList, isLoading, error, fetchDepartmentList, deleteDepartment } = useDepartmentList();

  // Load dynamic dropdown values
  const { departmentTypes, isLoading: isLoadingDropdowns } = useDropdownValues(["departmentTypes"]);

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

  // Create dynamic department type options with "All Types" option
  const departmentTypeOptions = useMemo(() => {
    const allOption = { value: "all", label: "All Types" };
    const dynamicOptions = (departmentTypes || []).map((item) => ({
      value: item.value,
      label: item.label,
    }));
    return [allOption, ...dynamicOptions];
  }, [departmentTypes]);

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
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <DepartmentIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalDepartments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Departments
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
                  {stats.activeDepartments}
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
                  {stats.inactiveDepartments}
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
                <ClinicalIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.clinicalDepartments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Clinical
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
                <StoreIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.storeDepartments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Stores
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
                <UnitIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {stats.unitDepartments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Units
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const columns: Column<DepartmentDto>[] = [
    {
      key: "deptCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => value || "-",
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
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
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
          Error loading departments: {error}
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
          Department List
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
              placeholder="Search by code, name, or location"
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
            <Tooltip title="Filter Departments">
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
                  label="Type"
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
                  {(filters.status || filters.departmentType !== "all" || filters.isStore !== "all" || filters.isUnit !== "all") && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v && v !== "all").length})`} onDelete={handleClearFilters} size="small" color="primary" />
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
              <SmartButton text="Add Department" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredDepartments} maxHeight="calc(100vh - 280px)" emptyStateMessage="No departments found" density="small" loading={isLoading} />
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
