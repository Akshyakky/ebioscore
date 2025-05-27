// src/components/InsuranceManagement/InsuranceManagementDialog.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip, Alert } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import InsuranceForm from "./InsuranceForm";
import useDayjs from "@/hooks/Common/useDateTime";
import { useInsuranceManagement } from "../hooks/useInsuranceForm";

interface InsuranceManagementDialogProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  pChartID: number;
  pChartCode?: string;
  patientName?: string;
  title?: string;
  readOnly?: boolean;
  showSaveAll?: boolean;
  onSaveAll?: (insuranceList: OPIPInsurancesDto[]) => Promise<boolean>;
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const InsuranceManagementDialog: React.FC<InsuranceManagementDialogProps> = ({
  open,
  onClose,
  pChartID,
  pChartCode,
  patientName,
  title = "Insurance Management",
  readOnly = false,
  showSaveAll = false,
  onSaveAll,
}) => {
  const { formatDate } = useDayjs();
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedInsurance, setSelectedInsurance] = useState<OPIPInsurancesDto | null>(null);
  const [isInsuranceFormOpen, setIsInsuranceFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const {
    insuranceList,
    isLoading,
    error,
    fetchInsuranceList,
    deleteInsurance,
    addInsuranceToList,
    updateInsuranceInList,
    removeInsuranceFromList,
    clearInsuranceList,
    saveAllInsurance,
  } = useInsuranceManagement();

  const [filters, setFilters] = useState<{
    status: string;
  }>({
    status: "",
  });

  // Load insurance data when dialog opens or pChartID changes
  useEffect(() => {
    if (open && pChartID) {
      fetchInsuranceList(pChartID);
    } else if (!open) {
      clearInsuranceList();
      setSearchTerm("");
      setDebouncedSearchTerm("");
    }
  }, [open, pChartID, fetchInsuranceList, clearInsuranceList]);

  const handleRefresh = useCallback(() => {
    if (pChartID) {
      fetchInsuranceList(pChartID);
    }
  }, [pChartID, fetchInsuranceList]);

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
    if (readOnly) return;
    setSelectedInsurance(null);
    setIsViewMode(false);
    setIsInsuranceFormOpen(true);
  }, [readOnly]);

  const handleEdit = useCallback(
    (insurance: OPIPInsurancesDto) => {
      setSelectedInsurance(insurance);
      setIsViewMode(readOnly);
      setIsInsuranceFormOpen(true);
    },
    [readOnly]
  );

  const handleView = useCallback((insurance: OPIPInsurancesDto) => {
    setSelectedInsurance(insurance);
    setIsViewMode(true);
    setIsInsuranceFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback(
    (insurance: OPIPInsurancesDto) => {
      if (readOnly) return;
      setSelectedInsurance(insurance);
      setIsDeleteConfirmOpen(true);
    },
    [readOnly]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedInsurance) return;

    try {
      if (selectedInsurance.oPIPInsID) {
        // Delete from server if it exists
        const success = await deleteInsurance(selectedInsurance.oPIPInsID, pChartID);
        if (success) {
          showAlert("Success", "Insurance record deleted successfully", "success");
        }
      } else {
        // Remove from local state if it's a new record
        removeInsuranceFromList(selectedInsurance.ID || 0);
        showAlert("Success", "Insurance record removed successfully", "success");
      }
    } catch (error) {
      console.error("Error deleting insurance:", error);
      showAlert("Error", "Failed to delete insurance record", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
      setSelectedInsurance(null);
    }
  }, [selectedInsurance, deleteInsurance, pChartID, removeInsuranceFromList]);

  const handleInsuranceFormSave = useCallback(
    (insuranceData: OPIPInsurancesDto) => {
      const formattedData = {
        ...insuranceData,
        pChartID,
        pChartCode,
      };

      if (!formattedData.oPIPInsID && !formattedData.ID) {
        // New record
        addInsuranceToList(formattedData);
      } else {
        // Update existing record
        updateInsuranceInList(formattedData);
      }

      setIsInsuranceFormOpen(false);
      setSelectedInsurance(null);
      showAlert("Success", "Insurance record saved successfully", "success");
    },
    [pChartID, pChartCode, addInsuranceToList, updateInsuranceInList]
  );

  const handleInsuranceFormClose = useCallback(() => {
    setIsInsuranceFormOpen(false);
    setSelectedInsurance(null);
  }, []);

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

  const handleSaveAll = useCallback(async () => {
    if (!onSaveAll && !showSaveAll) return;

    try {
      setIsSavingAll(true);

      let success = false;
      if (onSaveAll) {
        success = await onSaveAll(insuranceList);
      } else {
        const result = await saveAllInsurance(pChartID);
        success = result.success;
      }

      if (success) {
        showAlert("Success", "All insurance records saved successfully", "success");
        onClose(true);
      } else {
        showAlert("Error", "Failed to save insurance records", "error");
      }
    } catch (error) {
      console.error("Error saving all insurance records:", error);
      showAlert("Error", "Failed to save insurance records", "error");
    } finally {
      setIsSavingAll(false);
    }
  }, [onSaveAll, showSaveAll, insuranceList, saveAllInsurance, pChartID, onClose]);

  const stats = useMemo(() => {
    if (!insuranceList.length) {
      return {
        totalRecords: 0,
        activeRecords: 0,
        inactiveRecords: 0,
        newRecords: 0,
      };
    }

    const activeCount = insuranceList.filter((i) => i.rActiveYN === "Y").length;
    const newCount = insuranceList.filter((i) => !i.oPIPInsID).length;

    return {
      totalRecords: insuranceList.length,
      activeRecords: activeCount,
      inactiveRecords: insuranceList.length - activeCount,
      newRecords: newCount,
    };
  }, [insuranceList]);

  const filteredInsurance = useMemo(() => {
    if (!insuranceList.length) return [];

    return insuranceList.filter((insurance) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        insurance.insurName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        insurance.policyNumber?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        insurance.policyHolder?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        insurance.guarantor?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && insurance.rActiveYN === "Y") || (filters.status === "inactive" && insurance.rActiveYN === "N");

      return matchesSearch && matchesStatus;
    });
  }, [insuranceList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Total Records</Typography>
          <Typography variant="h4">{stats.totalRecords}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeRecords}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveRecords}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Typography variant="h6">New Records</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.newRecords}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  // Safe date formatter function
  const formatDateSafely = useCallback(
    (dateValue: any): string => {
      if (!dateValue) return "-";

      try {
        if (dateValue instanceof Date) {
          return formatDate(dateValue);
        } else if (typeof dateValue === "string") {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return formatDate(date);
          }
        }
        return "-";
      } catch (error) {
        console.error("Error formatting date:", error);
        return "-";
      }
    },
    [formatDate]
  );

  // Safe string formatter function
  const formatStringSafely = useCallback((value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string") return value || "-";
    if (typeof value === "number") return value.toString();
    return String(value) || "-";
  }, []);

  const columns: Column<OPIPInsurancesDto>[] = [
    {
      key: "insurName",
      header: "Insurance Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: any) => formatStringSafely(value),
    },
    {
      key: "policyNumber",
      header: "Policy Number",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: any) => formatStringSafely(value),
    },
    {
      key: "policyHolder",
      header: "Policy Holder",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
      formatter: (value: any) => formatStringSafely(value),
    },
    {
      key: "coveredFor",
      header: "Covered For",
      visible: true,
      sortable: true,
      filterable: true,
      width: 130,
      formatter: (value: any) => formatStringSafely(value),
    },
    {
      key: "policyStartDt",
      header: "Start Date",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: any) => formatDateSafely(value),
    },
    {
      key: "policyEndDt",
      header: "End Date",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: any) => formatDateSafely(value),
    },
    {
      key: "guarantor",
      header: "Guarantor",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: any) => formatStringSafely(value),
    },
    {
      key: "relation",
      header: "Relation",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: any) => formatStringSafely(value),
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
      width: 150,
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
          {!readOnly && (
            <>
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
            </>
          )}
        </Stack>
      ),
    },
  ];

  const dialogActions = (
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <SmartButton text="Close" onClick={() => onClose()} variant="outlined" color="inherit" disabled={isSavingAll} />
      {showSaveAll && !readOnly && (
        <SmartButton
          text="Save All Records"
          onClick={handleSaveAll}
          variant="contained"
          color="primary"
          icon={SaveIcon}
          asynchronous={true}
          showLoadingIndicator={true}
          loadingText="Saving..."
          successText="Saved!"
          disabled={isSavingAll || !insuranceList.length}
        />
      )}
    </Box>
  );

  if (error) {
    return (
      <GenericDialog open={open} onClose={() => onClose()} title={title} maxWidth="lg" fullWidth actions={dialogActions}>
        <Box sx={{ p: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading insurance data: {error}
          </Alert>
          <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
        </Box>
      </GenericDialog>
    );
  }

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title={`${title}${patientName ? ` - ${patientName}` : ""}`}
        maxWidth="xl"
        fullWidth
        showCloseButton
        actions={dialogActions}
      >
        <Box sx={{ p: 2 }}>
          {/* Header Controls */}
          <Box sx={{ mb: 2 }}>
            <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
          </Box>

          {/* Statistics Dashboard */}
          {showStats && renderStatsDashboard()}

          {/* Main Content */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Insurance Records
                  {pChartCode && (
                    <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                      (Patient: {pChartCode})
                    </Typography>
                  )}
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
                  {!readOnly && <SmartButton text="Add Insurance" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />}
                </Stack>
              </Grid>

              {/* Search and Filters */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search by insurance name, policy number, holder, or guarantor"
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
                <Tooltip title="Filter Insurance Records">
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

          {/* Insurance Grid */}
          <Paper sx={{ p: 2 }}>
            <CustomGrid columns={columns} data={filteredInsurance} maxHeight="calc(100vh - 400px)" emptyStateMessage="No insurance records found" loading={isLoading} />
          </Paper>
        </Box>
      </GenericDialog>

      {/* Insurance Form Dialog */}
      {isInsuranceFormOpen && (
        <InsuranceForm
          open={isInsuranceFormOpen}
          onClose={handleInsuranceFormClose}
          onSave={handleInsuranceFormSave}
          initialData={selectedInsurance}
          pChartID={pChartID}
          pChartCode={pChartCode}
          viewOnly={isViewMode}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the insurance record for "${selectedInsurance?.insurName || "this insurance"}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="sm"
      />
    </>
  );
};

export default InsuranceManagementDialog;
