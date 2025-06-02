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
import { BPayTypeDto } from "@/interfaces/Billing/BPayTypeDto";
import PaymentTypesForm from "../Form/PaymentTypesForm";
import { usePaymentTypes } from "../hooks/usePaymentTypes";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const paymentModeOptions = [
  { value: "all", label: "All Modes" },
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "CHECK", label: "Check" },
  { value: "TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE", label: "Mobile Payment" },
  { value: "ONLINE", label: "Online Payment" },
  { value: "OTHER", label: "Other" },
];

const bankChargeOptions = [
  { value: "all", label: "All Charges" },
  { value: "free", label: "No Charge (0%)" },
  { value: "low", label: "Low (0.1% - 1%)" },
  { value: "medium", label: "Medium (1.1% - 3%)" },
  { value: "high", label: "High (>3%)" },
];

const PaymentTypesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<BPayTypeDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const { showAlert } = useAlert();

  const { paymentTypesList, isLoading, error, fetchPaymentTypesList, deletePaymentType } = usePaymentTypes();

  const [filters, setFilters] = useState<{
    status: string;
    paymentMode: string;
    bankCharge: string;
  }>({
    status: "",
    paymentMode: "",
    bankCharge: "",
  });

  const handleRefresh = useCallback(() => {
    fetchPaymentTypesList();
  }, [fetchPaymentTypesList]);

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
    setSelectedPaymentType(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((paymentType: BPayTypeDto) => {
    setSelectedPaymentType(paymentType);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((paymentType: BPayTypeDto) => {
    setSelectedPaymentType(paymentType);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((paymentType: BPayTypeDto) => {
    setSelectedPaymentType(paymentType);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPaymentType) return;

    try {
      const success = await deletePaymentType(selectedPaymentType.payID);

      if (success) {
        showAlert("Success", "Payment type deleted successfully", "success");
      } else {
        throw new Error("Failed to delete payment type");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete payment type", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedPaymentType, deletePaymentType]);

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
      paymentMode: "",
      bankCharge: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!paymentTypesList.length) {
      return {
        totalPaymentTypes: 0,
        activePaymentTypes: 0,
        inactivePaymentTypes: 0,
        cashPayments: 0,
        cardPayments: 0,
        otherPayments: 0,
      };
    }

    const activeCount = paymentTypesList.filter((p) => p.rActiveYN === "Y").length;
    const cashCount = paymentTypesList.filter((p) => p.payMode === "CASH").length;
    const cardCount = paymentTypesList.filter((p) => p.payMode === "CARD").length;
    const otherCount = paymentTypesList.length - cashCount - cardCount;

    return {
      totalPaymentTypes: paymentTypesList.length,
      activePaymentTypes: activeCount,
      inactivePaymentTypes: paymentTypesList.length - activeCount,
      cashPayments: cashCount,
      cardPayments: cardCount,
      otherPayments: otherCount,
    };
  }, [paymentTypesList]);

  const getBankChargeCategory = (charge: number): string => {
    if (charge === 0) return "free";
    if (charge > 0 && charge <= 1) return "low";
    if (charge > 1 && charge <= 3) return "medium";
    return "high";
  };

  const filteredPaymentTypes = useMemo(() => {
    if (!paymentTypesList.length) return [];

    return paymentTypesList.filter((paymentType) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        paymentType.payName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        paymentType.payCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        paymentType.payMode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        paymentType.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "" || (filters.status === "active" && paymentType.rActiveYN === "Y") || (filters.status === "inactive" && paymentType.rActiveYN === "N");

      const matchesPaymentMode = filters.paymentMode === "" || filters.paymentMode === "all" || paymentType.payMode === filters.paymentMode;

      const chargeCategory = getBankChargeCategory(paymentType.bankCharge);
      const matchesBankCharge = filters.bankCharge === "" || filters.bankCharge === "all" || chargeCategory === filters.bankCharge;

      return matchesSearch && matchesStatus && matchesPaymentMode && matchesBankCharge;
    });
  }, [paymentTypesList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Payment Types</Typography>
          <Typography variant="h4">{stats.totalPaymentTypes}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activePaymentTypes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactivePaymentTypes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Cash</Typography>
          <Typography variant="h4" color="info.main">
            {stats.cashPayments}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Card</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.cardPayments}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Other</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.otherPayments}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const getPaymentModeChip = (mode: string) => {
    let color = "default";
    switch (mode) {
      case "CASH":
        color = "success";
        break;
      case "CARD":
        color = "primary";
        break;
      case "CHECK":
        color = "secondary";
        break;
      case "TRANSFER":
        color = "info";
        break;
      case "MOBILE":
        color = "warning";
        break;
      case "ONLINE":
        color = "error";
        break;
    }

    const label = paymentModeOptions.find((option) => option.value === mode)?.label || mode;
    return <Chip size="small" color={color as any} label={label} />;
  };

  const columns: Column<BPayTypeDto>[] = [
    {
      key: "payCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "payName",
      header: "Payment Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "payMode",
      header: "Payment Mode",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
      formatter: (value: string) => getPaymentModeChip(value),
    },
    {
      key: "bankCharge",
      header: "Bank Charge (%)",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: number) => value.toFixed(2) + "%",
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
          Error loading payment types: {error}
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
              Payment Types
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
              <SmartButton text="Add Payment Type" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name or payment mode"
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
            <Tooltip title="Filter Payment Types">
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
                  label="Payment Mode"
                  name="paymentMode"
                  value={filters.paymentMode}
                  options={paymentModeOptions}
                  onChange={(e) => handleFilterChange("paymentMode", e.target.value)}
                  size="small"
                  defaultText="All Modes"
                />

                <DropdownSelect
                  label="Bank Charge"
                  name="bankCharge"
                  value={filters.bankCharge}
                  options={bankChargeOptions}
                  onChange={(e) => handleFilterChange("bankCharge", e.target.value)}
                  size="small"
                  defaultText="All Charges"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.paymentMode || filters.bankCharge) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredPaymentTypes} maxHeight="calc(100vh - 280px)" emptyStateMessage="No payment types found" loading={isLoading} />
      </Paper>

      {isFormOpen && <PaymentTypesForm open={isFormOpen} onClose={handleFormClose} initialData={selectedPaymentType} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the payment type "${selectedPaymentType?.payName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default PaymentTypesPage;
