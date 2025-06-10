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
  Assignment as IndentIcon,
  CheckCircle as ApprovedIcon,
  PendingActions as PendingIcon,
  Cancel as CancelledIcon,
  LocalShipping as TransferIcon,
  Business as DepartmentIcon,
  Inventory as ProductIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { IndentMastDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import IndentProductForm from "../Form/IndentProductForm";
import { useIndentProduct } from "../hooks/useIndentProduct";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { formatDt } from "@/utils/Common/dateUtils";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "transferred", label: "Transferred" },
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

  const { indentList, loading, error, fetchIndentList, deleteIndent, refreshIndentList } = useIndentProduct();

  // Load dynamic dropdown values
  const { department, statusFilter } = useDropdownValues(["department", "statusFilter"]);

  const [filters, setFilters] = useState<{
    status: string;
    fromDepartment: string;
    toDepartment: string;
  }>({
    status: "",
    fromDepartment: "",
    toDepartment: "",
  });

  // Create department options
  const departmentOptions = useMemo(() => {
    const allOption = { value: "all", label: "All Departments" };
    const dynamicOptions = (department || []).map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));
    return [allOption, ...dynamicOptions];
  }, [department]);

  const handleRefresh = useCallback(() => {
    refreshIndentList();
  }, [refreshIndentList]);

  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);

  useEffect(() => {
    fetchIndentList();
    return () => {
      debouncedSearch.cancel();
    };
  }, [fetchIndentList, debouncedSearch]);

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
    setSelectedIndent(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

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
      } else {
        throw new Error("Failed to delete indent");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete indent", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedIndent, deleteIndent, showAlert]);

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
      fromDepartment: "",
      toDepartment: "",
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!indentList.length) {
      return {
        totalIndents: 0,
        pendingIndents: 0,
        approvedIndents: 0,
        transferredIndents: 0,
        cancelledIndents: 0,
        todayIndents: 0,
      };
    }

    const today = new Date().toDateString();
    const pendingCount = indentList.filter((i) => i.indStatusCode === "PENDING").length;
    const approvedCount = indentList.filter((i) => i.indStatusCode === "APPROVED").length;
    const transferredCount = indentList.filter((i) => i.transferYN === "Y").length;
    const cancelledCount = indentList.filter((i) => i.indStatusCode === "CANCELLED").length;
    const todayCount = indentList.filter((i) => i.indentDate && new Date(i.indentDate).toDateString() === today).length;

    return {
      totalIndents: indentList.length,
      pendingIndents: pendingCount,
      approvedIndents: approvedCount,
      transferredIndents: transferredCount,
      cancelledIndents: cancelledCount,
      todayIndents: todayCount,
    };
  }, [indentList]);

  // Apply filters to the list
  const filteredIndents = useMemo(() => {
    if (!indentList.length) return [];

    return indentList.filter((indent) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        indent.indentCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        indent.fromDeptName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        indent.toDeptName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        indent.indStatus?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || filters.status === "all" || indent.indStatusCode?.toLowerCase() === filters.status.toLowerCase();

      const matchesFromDept = filters.fromDepartment === "" || filters.fromDepartment === "all" || indent.fromDeptID?.toString() === filters.fromDepartment;

      const matchesToDept = filters.toDepartment === "" || filters.toDepartment === "all" || indent.toDeptID?.toString() === filters.toDepartment;

      return matchesSearch && matchesStatus && matchesFromDept && matchesToDept;
    });
  }, [indentList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <IndentIcon fontSize="small" />
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

      <Grid size={{ xs: 12, sm: 2 }}>
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

      <Grid size={{ xs: 12, sm: 2 }}>
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

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #2196f3" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
                <TransferIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.transferredIndents}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Transferred
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
                <CancelledIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.cancelledIndents}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cancelled
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
                <ProductIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {stats.todayIndents}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Today
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const columns: Column<IndentMastDto>[] = [
    {
      key: "indentCode",
      header: "Indent Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 130,
      formatter: (value: string) => value || "-",
    },
    {
      key: "indentDate",
      header: "Indent Date",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: Date) => (value ? formatDt(new Date(value)) : "-"),
    },
    {
      key: "fromDeptName",
      header: "From Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "toDeptName",
      header: "To Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "indentType",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => value || "-",
    },
    {
      key: "indStatus",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      render: (item) => {
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case "pending":
              return "warning";
            case "approved":
              return "success";
            case "cancelled":
              return "error";
            case "transferred":
              return "info";
            default:
              return "default";
          }
        };

        return <Chip size="small" color={getStatusColor(item.indStatus || "")} label={item.indStatus || "Unknown"} />;
      },
    },
    {
      key: "transferYN",
      header: "Transferred",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "success" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
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
          Error loading indents: {error}
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
          Indent Product Management
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
              placeholder="Search by code, department, or status"
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
            <Tooltip title="Filter Indents">
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
                  label="From Dept"
                  name="fromDepartment"
                  value={filters.fromDepartment}
                  options={departmentOptions}
                  onChange={(e) => handleFilterChange("fromDepartment", e.target.value)}
                  size="small"
                  defaultText="All Departments"
                />
                <DropdownSelect
                  label="To Dept"
                  name="toDepartment"
                  value={filters.toDepartment}
                  options={departmentOptions}
                  onChange={(e) => handleFilterChange("toDepartment", e.target.value)}
                  size="small"
                  defaultText="All Departments"
                />
                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.fromDepartment || filters.toDepartment) && (
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
                disabled={loading}
                loadingText="Refreshing..."
                asynchronous={true}
                showLoadingIndicator={true}
              />
              <SmartButton text="Create Indent" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredIndents} maxHeight="calc(100vh - 280px)" emptyStateMessage="No indents found" density="small" loading={loading} />
      </Paper>

      {isFormOpen && <IndentProductForm open={isFormOpen} onClose={handleFormClose} initialData={selectedIndent} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the indent "${selectedIndent?.indentCode}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default IndentProductPage;
