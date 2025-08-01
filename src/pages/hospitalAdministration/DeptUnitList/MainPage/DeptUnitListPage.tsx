import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { DeptUnitListDto } from "@/interfaces/HospitalAdministration/DeptUnitListDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  CheckCircle as ActiveIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Business as DepartmentIcon,
  Edit as EditIcon,
  Cancel as InactiveIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  AccountTree as UnitIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DeptUnitListForm from "../Form/DeptUnitListForm";
import { useDeptUnitList } from "../hooks/useDeptUnitList";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const DeptUnitListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedDeptUnit, setSelectedDeptUnit] = useState<DeptUnitListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);
  const { showAlert } = useAlert();
  const { deptUnitList, isLoading, error, fetchDeptUnitList, deleteDeptUnit } = useDeptUnitList();

  const [filters, setFilters] = useState<{
    status: string;
  }>({
    status: "",
  });

  const handleRefresh = useCallback(() => {
    fetchDeptUnitList();
  }, [fetchDeptUnitList]);

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
    setSelectedDeptUnit(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((deptUnit: DeptUnitListDto) => {
    setSelectedDeptUnit(deptUnit);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((deptUnit: DeptUnitListDto) => {
    setSelectedDeptUnit(deptUnit);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((deptUnit: DeptUnitListDto) => {
    setSelectedDeptUnit(deptUnit);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedDeptUnit) return;

    try {
      const success = await deleteDeptUnit(selectedDeptUnit.dulID);

      if (success) {
        showAlert("Success", "Department unit deleted successfully", "success");
      } else {
        throw new Error("Failed to delete department unit");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete department unit", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedDeptUnit, deleteDeptUnit]);

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
    if (!deptUnitList.length) {
      return {
        totalUnits: 0,
        activeUnits: 0,
        inactiveUnits: 0,
        departmentCount: 0,
      };
    }

    const activeCount = deptUnitList.filter((u) => u.rActiveYN === "Y").length;
    const uniqueDepartments = new Set(deptUnitList.map((u) => u.deptID)).size;

    return {
      totalUnits: deptUnitList.length,
      activeUnits: activeCount,
      inactiveUnits: deptUnitList.length - activeCount,
      departmentCount: uniqueDepartments,
    };
  }, [deptUnitList]);

  // Apply filters to the list
  const filteredDeptUnits = useMemo(() => {
    if (!deptUnitList.length) return [];

    return deptUnitList.filter((deptUnit) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        deptUnit.unitDesc?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        deptUnit.deptName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        deptUnit.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && deptUnit.rActiveYN === "Y") || (filters.status === "inactive" && deptUnit.rActiveYN === "N");

      return matchesSearch && matchesStatus;
    });
  }, [deptUnitList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 3 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <UnitIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalUnits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Units
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}>
        <Card sx={{ borderLeft: "3px solid #4caf50" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#4caf50", width: 40, height: 40 }}>
                <ActiveIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {stats.activeUnits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active Units
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}>
        <Card sx={{ borderLeft: "3px solid #f44336" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#f44336", width: 40, height: 40 }}>
                <InactiveIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.inactiveUnits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inactive Units
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}>
        <Card sx={{ borderLeft: "3px solid #2196f3" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
                <DepartmentIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.departmentCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Departments
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const columns: Column<DeptUnitListDto>[] = [
    {
      key: "dulID",
      header: "ID",
      visible: true,
      sortable: true,
      filterable: true,
      width: 80,
    },
    {
      key: "deptName",
      header: "Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => value || "-",
    },
    {
      key: "unitDesc",
      header: "Unit Description",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
      formatter: (value: string) => value || "-",
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
          Error loading department units: {error}
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
          Department Unit List
        </Typography>
        <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
      </Box>

      {/* Statistics Dashboard */}
      {showStats && renderStatsDashboard()}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search by unit description, department, or notes"
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
          <Grid size={{ xs: 12, md: 3 }}>
            <Tooltip title="Filter Department Units">
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
                <Box display="flex" alignItems="center" gap={1}>
                  {filters.status && <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />}
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
              <SmartButton text="Add Unit" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredDeptUnits} maxHeight="calc(100vh - 280px)" emptyStateMessage="No department units found" loading={isLoading} />
      </Paper>

      {isFormOpen && <DeptUnitListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedDeptUnit} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the department unit "${selectedDeptUnit?.unitDesc}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default DeptUnitListPage;
