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
import { InsuranceListDto } from "@/interfaces/HospitalAdministration/InsuranceListDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import InsuranceListForm from "../Form/InsuranceListForm";
import { useInsuranceList } from "../hooks/useInsuranceList";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const transferOptions = [
  { value: "Y", label: "Transferable" },
  { value: "N", label: "Non-Transferable" },
];

const InsuranceListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { insuranceList, isLoading, error, fetchInsuranceList, deleteInsurance } = useInsuranceList();

  const [filters, setFilters] = useState<{
    status: string;
    transfer: string;
    category: string;
  }>({
    status: "",
    transfer: "",
    category: "",
  });

  useEffect(() => {
    document.title = "Insurance Management";
  }, []);

  const handleRefresh = useCallback(() => {
    fetchInsuranceList();
  }, [fetchInsuranceList]);

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
    setSelectedInsurance(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((insurance: InsuranceListDto) => {
    setSelectedInsurance(insurance);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((insurance: InsuranceListDto) => {
    setSelectedInsurance(insurance);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((insurance: InsuranceListDto) => {
    setSelectedInsurance(insurance);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedInsurance) return;

    try {
      const success = await deleteInsurance(selectedInsurance.insurID);

      if (success) {
        showAlert("Success", "Insurance deleted successfully", "success");
      } else {
        throw new Error("Failed to delete insurance");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete insurance", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedInsurance, deleteInsurance]);

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
      transfer: "",
      category: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!insuranceList.length) {
      return {
        totalInsurance: 0,
        activeInsurance: 0,
        inactiveInsurance: 0,
        transferableInsurance: 0,
        categoriesCount: 0,
      };
    }

    const activeCount = insuranceList.filter((i) => i.rActiveYN === "Y").length;
    const transferableCount = insuranceList.filter((i) => i.transferYN === "Y").length;
    const categories = new Set(insuranceList.filter((i) => i.inCategory).map((i) => i.inCategory)).size;

    return {
      totalInsurance: insuranceList.length,
      activeInsurance: activeCount,
      inactiveInsurance: insuranceList.length - activeCount,
      transferableInsurance: transferableCount,
      categoriesCount: categories,
    };
  }, [insuranceList]);

  const filteredInsurance = useMemo(() => {
    if (!insuranceList.length) return [];
    return insuranceList.filter((insurance) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        insurance.insurName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        insurance.insurCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        insurance.inCategory?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        insurance.insurEmail?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        insurance.insurCity?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        insurance.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && insurance.rActiveYN === "Y") || (filters.status === "inactive" && insurance.rActiveYN === "N");

      const matchesTransfer = filters.transfer === "" || insurance.transferYN === filters.transfer;

      const matchesCategory = filters.category === "" || insurance.inCategory?.toLowerCase().includes(filters.category.toLowerCase());

      return matchesSearch && matchesStatus && matchesTransfer && matchesCategory;
    });
  }, [insuranceList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Total Insurance</Typography>
          <Typography variant="h4">{stats.totalInsurance}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeInsurance}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveInsurance}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Transferable</Typography>
          <Typography variant="h4" color="info.main">
            {stats.transferableInsurance}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Categories</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.categoriesCount}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<InsuranceListDto>[] = [
    {
      key: "insurCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "insurName",
      header: "Insurance Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "inCategory",
      header: "Category",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "insurEmail",
      header: "Email",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => value || "-",
    },
    {
      key: "insurPh1",
      header: "Phone",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "insurCity",
      header: "City",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => value || "-",
    },
    {
      key: "transferYN",
      header: "Transferable",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
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
          Error loading insurance list: {error}
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
              Insurance Management
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
              <SmartButton text="Add Insurance" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by name, code, category, email, or city"
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
            <Tooltip title="Filter Insurance List">
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

                <DropdownSelect
                  label="Transfer"
                  name="transfer"
                  value={filters.transfer}
                  options={transferOptions}
                  onChange={(e) => handleFilterChange("transfer", e.target.value)}
                  size="small"
                  defaultText="All Transfer Status"
                />

                <TextField
                  label="Category"
                  name="category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  size="small"
                  placeholder="Filter by category"
                  sx={{ minWidth: 150 }}
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
        <CustomGrid columns={columns} data={filteredInsurance} maxHeight="calc(100vh - 280px)" emptyStateMessage="No insurance providers found" loading={isLoading} />
      </Paper>

      {isFormOpen && <InsuranceListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedInsurance} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the insurance provider "${selectedInsurance?.insurName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default InsuranceListPage;
