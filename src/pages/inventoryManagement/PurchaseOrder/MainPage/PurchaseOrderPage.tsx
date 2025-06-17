// src/pages/inventoryManagement/PurchaseOrder/MainPage/PurchaseOrderPage.tsx

import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import { DateFilterType } from "@/interfaces/Common/FilterDto";
import { PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  Add as AddIcon,
  CheckCircle as ApprovedIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  Cancel as RejectedIcon,
  Schedule as ScheduledIcon,
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TotalIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import PurchaseOrderForm from "../Form/PurchaseOrderForm";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "partial", label: "Partially Received" },
  { value: "completed", label: "Completed" },
];

const poTypeOptions = [
  { value: "regular", label: "Regular" },
  { value: "urgent", label: "Urgent" },
  { value: "emergency", label: "Emergency" },
];

const dateFilterOptions = [
  { value: DateFilterType.Today, label: "Today" },
  { value: DateFilterType.Yesterday, label: "Yesterday" },
  { value: DateFilterType.ThisWeek, label: "This Week" },
  { value: DateFilterType.ThisMonth, label: "This Month" },
  { value: DateFilterType.ThisYear, label: "This Year" },
  { value: DateFilterType.DateRange, label: "Custom Range" },
];

const PurchaseOrderPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderMastDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilterType>(DateFilterType.ThisMonth);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { purchaseOrderList, isLoading, error, fetchPurchaseOrderList, deletePurchaseOrder, getPurchaseOrdersByDepartment, getPurchaseOrderStatistics } = usePurchaseOrder();

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});

  const [filters, setFilters] = useState<{
    status: string;
    poType: string;
  }>({
    status: "",
    poType: "",
  });

  // Ensure department selection on mount
  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, [isDepartmentSelected, isDialogOpen, openDialog]);

  // Fetch purchase orders when department is selected
  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      handleRefresh();
    }
  }, [isDepartmentSelected, deptId, dateFilter, startDate, endDate]);

  const handleRefresh = useCallback(async () => {
    if (isDepartmentSelected && deptId) {
      try {
        await getPurchaseOrdersByDepartment(deptId, {
          dateFilter,
          startDate,
          endDate,
          pageIndex: 1,
          pageSize: 100,
          statusFilter: filters.status || undefined,
        });
      } catch (error) {
        showAlert("Error", "Failed to fetch purchase orders", "error");
      }
    }
  }, [isDepartmentSelected, deptId, dateFilter, startDate, endDate, filters.status, getPurchaseOrdersByDepartment, showAlert]);

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
    setSelectedPO(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, [isDepartmentSelected, showAlert]);

  const handleEdit = useCallback((po: PurchaseOrderMastDto) => {
    setSelectedPO(po);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((po: PurchaseOrderMastDto) => {
    setSelectedPO(po);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((po: PurchaseOrderMastDto) => {
    setSelectedPO(po);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPO) return;

    try {
      const success = await deletePurchaseOrder(selectedPO.pOID);
      if (success) {
        showAlert("Success", "Purchase order deleted successfully", "success");
        handleRefresh();
      } else {
        throw new Error("Failed to delete purchase order");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete purchase order", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedPO, deletePurchaseOrder, handleRefresh, showAlert]);

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
      poType: "",
    });
  }, []);

  // Calculate statistics
  const stats: any = useMemo(() => {
    return getPurchaseOrderStatistics(deptId);
  }, [purchaseOrderList, deptId, getPurchaseOrderStatistics]);

  // Filter purchase orders based on search and filters
  const filteredPOs = useMemo(() => {
    if (!purchaseOrderList.length) return [];

    return purchaseOrderList.filter((po) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        po.pOCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        po.supplierName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        po.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "" ||
        (filters.status === "pending" && po.pOStatusCode === "PENDING") ||
        (filters.status === "approved" && po.pOApprovedYN === "Y") ||
        (filters.status === "rejected" && po.pOStatusCode === "REJECTED") ||
        (filters.status === "completed" && po.pOStatusCode === "COMPLETED") ||
        (filters.status === "partial" && po.pOStatusCode === "PARTIAL");

      const matchesType = filters.poType === "" || po.pOTypeValue?.toLowerCase() === filters.poType.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [purchaseOrderList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <TotalIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalOrders}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Orders
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
                  {stats.pendingOrders}
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
                  {stats.approvedOrders}
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
                <ScheduledIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.completedOrders}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
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
                <RejectedIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.rejectedOrders}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rejected
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
                <MoneyIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  ₹{(stats.totalAmount / 100000).toFixed(1)}L
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Value
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const getStatusChip = (po: PurchaseOrderMastDto) => {
    if (po.pOStatusCode === "COMPLETED") {
      return <Chip size="small" color="success" label="Completed" />;
    }
    if (po.pOApprovedYN === "Y") {
      return <Chip size="small" color="info" label="Approved" />;
    }
    if (po.pOStatusCode === "REJECTED") {
      return <Chip size="small" color="error" label="Rejected" />;
    }
    if (po.pOStatusCode === "PARTIAL") {
      return <Chip size="small" color="warning" variant="outlined" label="Partial" />;
    }
    return <Chip size="small" color="warning" label="Pending" />;
  };

  const getTypeChip = (po: PurchaseOrderMastDto) => {
    const type = po.pOTypeValue?.toUpperCase() || "REGULAR";
    const typeConfig = {
      URGENT: { color: "warning" as const, icon: <ShippingIcon fontSize="small" /> },
      EMERGENCY: { color: "error" as const, icon: <ShippingIcon fontSize="small" /> },
      REGULAR: { color: "default" as const, icon: null },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.REGULAR;

    return <Chip size="small" color={config.color} label={po.pOType || type} icon={config.icon} />;
  };

  const columns: Column<PurchaseOrderMastDto>[] = [
    {
      key: "pOCode",
      header: "PO Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "pODate",
      header: "Date",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
    {
      key: "supplierName",
      header: "Supplier",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      key: "pOType",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      render: (item: PurchaseOrderMastDto) => getTypeChip(item),
    },
    {
      key: "totalAmt",
      header: "Total Amount",
      visible: true,
      sortable: true,
      width: 150,
      formatter: (value: number) => `₹${value?.toFixed(2) || "0.00"}`,
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 120,
      render: (item: PurchaseOrderMastDto) => getStatusChip(item),
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
          <Tooltip title="Edit Order">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleEdit(item)}
              disabled={item.pOApprovedYN === "Y" || item.pOStatusCode === "COMPLETED"}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Order">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(item)}
              disabled={item.pOApprovedYN === "Y" || item.pOStatusCode === "COMPLETED"}
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
          Error loading purchase orders: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {isDepartmentSelected && (
        <>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
              <ShoppingCartIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Purchase Orders - {deptName}
            </Typography>
            <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
          </Box>

          {/* Statistics Dashboard */}
          {showStats && renderStatsDashboard()}

          {/* Filters and Actions */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Department Selection */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SmartButton text={`Change Dept: ${deptName}`} onClick={handleDepartmentChange} variant="outlined" size="small" color="warning" />
                </Stack>
              </Grid>

              {/* Date Filter */}
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

              {/* Action Buttons */}
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
                  <SmartButton text="Create PO" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
                </Stack>
              </Grid>

              {/* Search Field */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search by PO code, supplier, or notes"
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

              {/* Filters */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Tooltip title="Filter Purchase Orders">
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

                    <DropdownSelect
                      label="Type"
                      name="poType"
                      value={filters.poType}
                      options={poTypeOptions}
                      onChange={(e) => handleFilterChange("poType", e.target.value)}
                      size="small"
                      defaultText="All Types"
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

          {/* Purchase Orders Grid */}
          <Paper sx={{ p: 2 }}>
            <CustomGrid
              columns={columns}
              data={filteredPOs}
              maxHeight="calc(100vh - 320px)"
              emptyStateMessage="No purchase orders found for this department"
              density="small"
              loading={isLoading}
              showExportCSV
              showExportPDF
              exportFileName="purchase-order-list"
            />
          </Paper>
        </>
      )}

      {/* Department Selection Dialog */}
      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} initialDeptId={deptId} requireSelection={true} />

      {/* Purchase Order Form Dialog */}
      {isFormOpen && isDepartmentSelected && (
        <PurchaseOrderForm
          open={isFormOpen}
          onClose={handleFormClose}
          initialData={selectedPO}
          viewOnly={isViewMode}
          selectedDepartment={{ deptID: deptId, department: deptName }}
          onChangeDepartment={handleDepartmentChange}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete purchase order "${selectedPO?.pOCode}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="sm"
      />
    </Box>
  );
};

export default PurchaseOrderPage;
