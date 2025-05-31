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
import { BPatTypeDto } from "@/interfaces/Billing/BPatTypeDto";
import PatientInvoiceCodeForm from "../Form/PatientInvoiceCodeForm";
import { usePatientInvoiceCode } from "../hooks/usePatientInvoiceCode";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const insuranceOptions = [
  { value: "all", label: "All Types" },
  { value: "insurance", label: "Insurance" },
  { value: "non-insurance", label: "Non-Insurance" },
];

const PatientInvoiceCodePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedInvoiceCode, setSelectedInvoiceCode] = useState<BPatTypeDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const { showAlert } = useAlert();

  const { patientInvoiceList, isLoading, error, fetchPatientInvoiceList, deletePatientInvoice } = usePatientInvoiceCode();

  const [filters, setFilters] = useState<{
    status: string;
    insurance: string;
  }>({
    status: "",
    insurance: "",
  });

  const handleRefresh = useCallback(() => {
    fetchPatientInvoiceList();
  }, [fetchPatientInvoiceList]);

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
    setSelectedInvoiceCode(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((invoiceCode: BPatTypeDto) => {
    setSelectedInvoiceCode(invoiceCode);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((invoiceCode: BPatTypeDto) => {
    setSelectedInvoiceCode(invoiceCode);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((invoiceCode: BPatTypeDto) => {
    setSelectedInvoiceCode(invoiceCode);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedInvoiceCode) return;

    try {
      const success = await deletePatientInvoice(selectedInvoiceCode.pTypeID);

      if (success) {
        showAlert("Success", "Invoice code deleted successfully", "success");
      } else {
        throw new Error("Failed to delete invoice code");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete invoice code", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedInvoiceCode, deletePatientInvoice]);

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
      insurance: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!patientInvoiceList.length) {
      return {
        totalInvoiceCodes: 0,
        activeInvoiceCodes: 0,
        inactiveInvoiceCodes: 0,
        insuranceCodes: 0,
        nonInsuranceCodes: 0,
      };
    }

    const activeCount = patientInvoiceList.filter((i) => i.rActiveYN === "Y").length;
    const insuranceCount = patientInvoiceList.filter((i) => i.isInsuranceYN === "Y").length;

    return {
      totalInvoiceCodes: patientInvoiceList.length,
      activeInvoiceCodes: activeCount,
      inactiveInvoiceCodes: patientInvoiceList.length - activeCount,
      insuranceCodes: insuranceCount,
      nonInsuranceCodes: patientInvoiceList.length - insuranceCount,
    };
  }, [patientInvoiceList]);

  const filteredInvoiceCodes = useMemo(() => {
    if (!patientInvoiceList.length) return [];

    return patientInvoiceList.filter((invoiceCode) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        invoiceCode.pTypeName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        invoiceCode.pTypeCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        invoiceCode.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "" || (filters.status === "active" && invoiceCode.rActiveYN === "Y") || (filters.status === "inactive" && invoiceCode.rActiveYN === "N");

      const matchesInsurance =
        filters.insurance === "" ||
        filters.insurance === "all" ||
        (filters.insurance === "insurance" && invoiceCode.isInsuranceYN === "Y") ||
        (filters.insurance === "non-insurance" && invoiceCode.isInsuranceYN === "N");

      return matchesSearch && matchesStatus && matchesInsurance;
    });
  }, [patientInvoiceList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Total Invoice Codes</Typography>
          <Typography variant="h4">{stats.totalInvoiceCodes}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeInvoiceCodes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveInvoiceCodes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Insurance</Typography>
          <Typography variant="h4" color="info.main">
            {stats.insuranceCodes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Non-Insurance</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.nonInsuranceCodes}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<BPatTypeDto>[] = [
    {
      key: "pTypeCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "pTypeName",
      header: "Invoice Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "isInsuranceYN",
      header: "Insurance",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 300,
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
          Error loading invoice codes: {error}
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
              Patient Invoice Codes
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
              <SmartButton text="Add Invoice Code" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
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
          <Grid size={{ xs: 12, md: 8 }}>
            <Tooltip title="Filter Invoice Codes">
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
                  label="Type"
                  name="insurance"
                  value={filters.insurance}
                  options={insuranceOptions}
                  onChange={(e) => handleFilterChange("insurance", e.target.value)}
                  size="small"
                  defaultText="All Types"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.insurance) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredInvoiceCodes} maxHeight="calc(100vh - 280px)" emptyStateMessage="No invoice codes found" loading={isLoading} />
      </Paper>

      {isFormOpen && <PatientInvoiceCodeForm open={isFormOpen} onClose={handleFormClose} initialData={selectedInvoiceCode} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the invoice code "${selectedInvoiceCode?.pTypeName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default PatientInvoiceCodePage;
