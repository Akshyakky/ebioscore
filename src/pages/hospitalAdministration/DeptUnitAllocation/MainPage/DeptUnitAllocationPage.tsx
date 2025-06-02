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
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Room as RoomIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { DeptUnitAllocationDto } from "@/interfaces/HospitalAdministration/DeptUnitAllocationDto";
import DeptUnitAllocationForm from "../Form/DeptUnitAllocationForm";
import { useDeptUnitAllocation } from "../hooks/useDeptUnitAllocation";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const dayOptions = [
  { value: "weekday", label: "Weekdays Only" },
  { value: "weekend", label: "Weekends Only" },
  { value: "all", label: "All Days" },
];

const DeptUnitAllocationPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedAllocation, setSelectedAllocation] = useState<DeptUnitAllocationDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { allocationList, isLoading, error, fetchAllocationList, deleteAllocation } = useDeptUnitAllocation();

  const [filters, setFilters] = useState<{
    status: string;
    department: string;
    dayType: string;
  }>({
    status: "",
    department: "",
    dayType: "",
  });

  const handleRefresh = useCallback(() => {
    fetchAllocationList();
  }, [fetchAllocationList]);

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
    setSelectedAllocation(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((allocation: DeptUnitAllocationDto) => {
    setSelectedAllocation(allocation);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((allocation: DeptUnitAllocationDto) => {
    setSelectedAllocation(allocation);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((allocation: DeptUnitAllocationDto) => {
    setSelectedAllocation(allocation);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedAllocation) return;

    try {
      const success = await deleteAllocation(selectedAllocation.dUAID);

      if (success) {
        showAlert("Success", "Department Unit Allocation deleted successfully", "success");
      } else {
        throw new Error("Failed to delete allocation");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete allocation", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedAllocation, deleteAllocation]);

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
      department: "",
      dayType: "",
    });
  }, []);

  // Get unique departments for filter
  const departmentOptions = useMemo(() => {
    const uniqueDepts = [...new Set(allocationList.map((a) => a.deptName).filter(Boolean))];
    return uniqueDepts.map((dept) => ({ value: dept!, label: dept! }));
  }, [allocationList]);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!allocationList.length) {
      return {
        totalAllocations: 0,
        activeAllocations: 0,
        uniqueDepartments: 0,
        uniqueFaculty: 0,
        allDayAllocations: 0,
        unitHeads: 0,
      };
    }

    const activeCount = allocationList.filter((a) => a.rActiveYN === "Y").length;
    const uniqueDepts = new Set(allocationList.map((a) => a.deptID)).size;
    const uniqueFaculty = new Set(allocationList.map((a) => a.facultyID)).size;
    const allDayCount = allocationList.filter((a) => a.allDaysYN === "Y").length;
    const unitHeadCount = allocationList.filter((a) => a.unitHeadYN === "Y").length;

    return {
      totalAllocations: allocationList.length,
      activeAllocations: activeCount,
      uniqueDepartments: uniqueDepts,
      uniqueFaculty: uniqueFaculty,
      allDayAllocations: allDayCount,
      unitHeads: unitHeadCount,
    };
  }, [allocationList]);

  // Apply filters to the list
  const filteredAllocations = useMemo(() => {
    if (!allocationList.length) return [];

    return allocationList.filter((allocation) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        allocation.deptName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        allocation.unitDesc?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        allocation.facultyName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        allocation.roomName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "" || (filters.status === "active" && allocation.rActiveYN === "Y") || (filters.status === "inactive" && allocation.rActiveYN === "N");

      const matchesDepartment = filters.department === "" || allocation.deptName === filters.department;

      const matchesDayType =
        filters.dayType === "" ||
        (filters.dayType === "weekday" && allocation.monYN === "Y" && allocation.friYN === "Y" && allocation.satYN === "N" && allocation.sunYN === "N") ||
        (filters.dayType === "weekend" && allocation.satYN === "Y" && allocation.sunYN === "Y") ||
        (filters.dayType === "all" && allocation.allDaysYN === "Y");

      return matchesSearch && matchesStatus && matchesDepartment && matchesDayType;
    });
  }, [allocationList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Allocations</Typography>
          <Typography variant="h4">{stats.totalAllocations}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeAllocations}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Departments</Typography>
          <Typography variant="h4" color="info.main">
            {stats.uniqueDepartments}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Faculty</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.uniqueFaculty}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">All Day</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.allDayAllocations}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Unit Heads</Typography>
          <Typography variant="h4" color="primary.main">
            {stats.unitHeads}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const formatWeekDays = (allocation: DeptUnitAllocationDto): string => {
    if (allocation.allDaysYN === "Y") return "All Days";

    const days = [];
    if (allocation.sunYN === "Y") days.push("Sun");
    if (allocation.monYN === "Y") days.push("Mon");
    if (allocation.tueYN === "Y") days.push("Tue");
    if (allocation.wedYN === "Y") days.push("Wed");
    if (allocation.thuYN === "Y") days.push("Thu");
    if (allocation.friYN === "Y") days.push("Fri");
    if (allocation.satYN === "Y") days.push("Sat");

    return days.join(", ") || "-";
  };

  const formatOccurrences = (allocation: DeptUnitAllocationDto): string => {
    if (allocation.occuranceAllYN === "Y") return "All";

    const occurrences = [];
    if (allocation.occurance1YN === "Y") occurrences.push("1st");
    if (allocation.occurance2YN === "Y") occurrences.push("2nd");
    if (allocation.occurance3YN === "Y") occurrences.push("3rd");
    if (allocation.occurance4YN === "Y") occurrences.push("4th");
    if (allocation.occurance5YN === "Y") occurrences.push("5th");

    return occurrences.join(", ") || "-";
  };

  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeString;
    }
  };

  const columns: Column<DeptUnitAllocationDto>[] = [
    {
      key: "deptName",
      header: "Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "unitDesc",
      header: "Unit",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "facultyName",
      header: "Faculty",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <PersonIcon fontSize="small" />
          {value || "-"}
        </Box>
      ),
    },
    {
      key: "uASTIME",
      header: "Schedule",
      visible: true,
      sortable: true,
      width: 150,
      render: (item) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <AccessTimeIcon fontSize="small" />
          {formatTime(item.uASTIME)} - {formatTime(item.uAETIME)}
        </Box>
      ),
    },
    {
      key: "weekDays",
      header: "Week Days",
      visible: true,
      sortable: false,
      width: 150,
      render: (item) => <Chip size="small" label={formatWeekDays(item)} variant="outlined" />,
    },
    {
      key: "occurrences",
      header: "Occurrences",
      visible: true,
      sortable: false,
      width: 120,
      render: (item) => formatOccurrences(item),
    },
    {
      key: "roomName",
      header: "Room",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) =>
        value ? (
          <Box display="flex" alignItems="center" gap={0.5}>
            <RoomIcon fontSize="small" />
            {value}
          </Box>
        ) : (
          "-"
        ),
    },
    {
      key: "unitHeadYN",
      header: "Unit Head",
      visible: true,
      sortable: true,
      width: 100,
      formatter: (value: any) => (value === "Y" ? <Chip size="small" color="primary" label="Yes" /> : "-"),
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
          Error loading allocations: {error}
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
              Department Unit Allocation
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
              <SmartButton text="Add Allocation" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by department, unit, faculty or room"
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
            <Tooltip title="Filter Allocations">
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
                  label="Department"
                  name="department"
                  value={filters.department}
                  options={departmentOptions}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  size="small"
                  defaultText="All Departments"
                />

                <DropdownSelect
                  label="Day Type"
                  name="dayType"
                  value={filters.dayType}
                  options={dayOptions}
                  onChange={(e) => handleFilterChange("dayType", e.target.value)}
                  size="small"
                  defaultText="All Day Types"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.department || filters.dayType) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredAllocations} maxHeight="calc(100vh - 280px)" emptyStateMessage="No allocations found" loading={isLoading} />
      </Paper>

      {isFormOpen && <DeptUnitAllocationForm open={isFormOpen} onClose={handleFormClose} initialData={selectedAllocation} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete this allocation for "${selectedAllocation?.unitDesc}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default DeptUnitAllocationPage;
