import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import { DateFilterType } from "@/interfaces/Common/FilterDto";
import { IndentMastDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  Add as AddIcon,
  CheckCircle as ApprovedIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  Assignment as IndentIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  Cancel as RejectedIcon,
  Schedule as ScheduledIcon,
  Search as SearchIcon,
  TrendingUp as TotalIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import IndentProductForm from "../Form/IndentProductForm";
import { useIndentProduct } from "../hooks/useIndentProduct";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "partial", label: "Partial" },
  { value: "completed", label: "Completed" },
];

const dateFilterOptions = [
  { value: DateFilterType.Today, label: "Today" },
  { value: DateFilterType.Yesterday, label: "Yesterday" },
  { value: DateFilterType.ThisWeek, label: "This Week" },
  { value: DateFilterType.ThisMonth, label: "This Month" },
  { value: DateFilterType.ThisYear, label: "This Year" },
  { value: DateFilterType.DateRange, label: "Custom Range" },
];

const IndentProductPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedIndent, setSelectedIndent] = useState<IndentMastDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilterType>(DateFilterType.ThisMonth);
  const [startDate] = useState<Date | null>(null);
  const [endDate] = useState<Date | null>(null);
  const { indentList, isLoading, error, deleteIndent, getIndentsByDepartment } = useIndentProduct();
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});

  const [filters, setFilters] = useState<{
    status: string;
    indentType: string;
  }>({
    status: "",
    indentType: "",
  });

  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, [isDepartmentSelected, isDialogOpen, openDialog]);

  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      handleRefresh();
    }
  }, [isDepartmentSelected, deptId, dateFilter, startDate, endDate]);

  const handleRefresh = useCallback(async () => {
    if (isDepartmentSelected && deptId) {
      try {
        await getIndentsByDepartment(deptId, {
          dateFilter,
          startDate,
          endDate,
          pageIndex: 1,
          pageSize: 100,
          statusFilter: filters.status || undefined,
        });
      } catch (error) {
        showAlert("Error", "Failed to fetch indents", "error");
      }
    }
  }, [isDepartmentSelected, deptId, dateFilter, startDate, endDate, filters.status, getIndentsByDepartment]);

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
    if (!isDepartmentSelected) {
      showAlert("Warning", "Please select a department first", "warning");
      return;
    }
    setSelectedIndent(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, [isDepartmentSelected]);

  const handleEdit = useCallback((indent: IndentMastDto) => {
    setSelectedIndent(indent);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((indent: IndentMastDto) => {
    setSelectedIndent(indent);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((indent: IndentMastDto) => {
    setSelectedIndent(indent);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedIndent) return;

    try {
      const success = await deleteIndent(selectedIndent.indentID);
      if (success) {
        showAlert("Success", "Indent deleted successfully", "success");
        handleRefresh();
      } else {
        throw new Error("Failed to delete indent");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete indent", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedIndent, deleteIndent, handleRefresh]);

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      if (refreshData) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  const handleDepartmentChange = useCallback(() => {
    openDialog();
  }, [openDialog]);

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "",
      indentType: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!indentList.length) {
      return {
        totalIndents: 0,
        pendingIndents: 0,
        approvedIndents: 0,
        completedIndents: 0,
        rejectedIndents: 0,
      };
    }

    const pendingCount = indentList.filter((i) => i.indStatusCode === "PENDING").length;
    const approvedCount = indentList.filter((i) => i.indentApprovedYN === "Y").length;
    const completedCount = indentList.filter((i) => i.indStatusCode === "COMPLETED").length;
    const rejectedCount = indentList.filter((i) => i.indStatusCode === "REJECTED").length;

    return {
      totalIndents: indentList.length,
      pendingIndents: pendingCount,
      approvedIndents: approvedCount,
      completedIndents: completedCount,
      rejectedIndents: rejectedCount,
    };
  }, [indentList]);

  const filteredIndents = useMemo(() => {
    if (!indentList.length) return [];
    return indentList.filter((indent) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        indent.indentCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        indent.toDeptName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        indent.pChartCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        indent.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        filters.status === "" ||
        (filters.status === "pending" && indent.indStatusCode === "PENDING") ||
        (filters.status === "approved" && indent.indentApprovedYN === "Y") ||
        (filters.status === "rejected" && indent.indStatusCode === "REJECTED") ||
        (filters.status === "completed" && indent.indStatusCode === "COMPLETED");

      const matchesType = filters.indentType === "" || indent.indentTypeValue?.toLowerCase() === filters.indentType.toLowerCase();
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [indentList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <TotalIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalIndents}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Indents
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #ff9800" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                <PendingIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.pendingIndents}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #4caf50" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#4caf50", width: 40, height: 40 }}>
                <ApprovedIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {stats.approvedIndents}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Approved
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #2196f3" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
                <ScheduledIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.completedIndents}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #f44336" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#f44336", width: 40, height: 40 }}>
                <RejectedIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.rejectedIndents}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rejected
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const getStatusChip = (indent: IndentMastDto) => {
    if (indent.indStatusCode === "COMPLETED") {
      return <Chip size="small" color="success" label="Completed" />;
    }
    if (indent.indentApprovedYN === "Y") {
      return <Chip size="small" color="info" label="Approved" />;
    }
    if (indent.indStatusCode === "REJECTED") {
      return <Chip size="small" color="error" label="Rejected" />;
    }
    return <Chip size="small" color="warning" label="Pending" />;
  };

  const columns: Column<IndentMastDto>[] = [
    {
      key: "indentCode",
      header: "Indent Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "indentDate",
      header: "Date",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: Date) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
    {
      key: "toDeptName",
      header: "To Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      key: "indentTypeValue",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "pChartCode",
      header: "Patient Chart",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 120,
      render: (item: IndentMastDto) => getStatusChip(item),
    },
    {
      key: "autoIndentYN",
      header: "Auto Indent",
      visible: true,
      sortable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "success" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "rActiveYN",
      header: "Active",
      visible: true,
      sortable: true,
      width: 80,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Yes" : "No"} />,
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
          <Tooltip title="View Details">
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
          </Tooltip>
          <Tooltip title="Edit Indent">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleEdit(item)}
              disabled={item.indentApprovedYN === "Y" || item.indStatusCode === "COMPLETED"}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Indent">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(item)}
              disabled={item.indentApprovedYN === "Y" || item.indStatusCode === "COMPLETED"}
              sx={{
                bgcolor: "rgba(244, 67, 54, 0.08)",
                "&:hover": { bgcolor: "rgba(244, 67, 54, 0.15)" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading indents: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {isDepartmentSelected && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
              <IndentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Product Indents - {deptName}
            </Typography>
            <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
          </Box>
          {showStats && renderStatsDashboard()}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SmartButton text={`Change Dept: ${deptName}`} onClick={handleDepartmentChange} variant="outlined" size="small" color="warning" />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <DropdownSelect
                  label="Date Filter"
                  name="dateFilter"
                  value={dateFilter.toString()}
                  options={dateFilterOptions.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  onChange={(e) => setDateFilter(Number(e.target.value) as DateFilterType)}
                  size="small"
                  defaultText="Select Date Range"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
                  <SmartButton text="Create Indent" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search by code, department, patient, or notes"
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
                <Tooltip title="Filter Indents">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FilterIcon color="action" />
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
            <CustomGrid
              columns={columns}
              data={filteredIndents}
              maxHeight="calc(100vh - 320px)"
              emptyStateMessage="No indents found for this department"
              density="small"
              loading={isLoading}
              showExportCSV
              showExportPDF
              exportFileName="indent-list"
            />
          </Paper>
        </>
      )}

      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} initialDeptId={deptId} requireSelection={true} />

      {isFormOpen && isDepartmentSelected && (
        <IndentProductForm
          open={isFormOpen}
          onClose={handleFormClose}
          initialData={selectedIndent}
          viewOnly={isViewMode}
          selectedDepartment={{ deptID: deptId, department: deptName }}
          onChangeDepartment={handleDepartmentChange}
        />
      )}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete indent "${selectedIndent?.indentCode}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="sm"
      />
    </Box>
  );
};

export default IndentProductPage;
