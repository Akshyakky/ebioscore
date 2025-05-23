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
import { ProductTaxListDto } from "@/interfaces/InventoryManagement/ProductTaxListDto";
import ProductTaxListForm from "../Form/ProductTaxListForm";
import { useProductTaxList } from "../hooks/useProductTaxListPage";
import { showAlert } from "@/utils/Common/showAlert";
import { debounce } from "@/utils/Common/debounceUtils";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const taxRangeOptions = [
  { value: "low", label: "Low (0-5%)" },
  { value: "medium", label: "Medium (5-15%)" },
  { value: "high", label: "High (15%+)" },
];

const ProductTaxListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedProductTax, setSelectedProductTax] = useState<ProductTaxListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { productTaxList, isLoading, error, fetchProductTaxList, deleteProductTax } = useProductTaxList();

  const [filters, setFilters] = useState<{
    status: string;
    taxRange: string;
  }>({
    status: "",
    taxRange: "",
  });

  useEffect(() => {
    document.title = "Product Tax List Management";
  }, []);

  const handleRefresh = useCallback(() => {
    fetchProductTaxList();
  }, [fetchProductTaxList]);

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
    setSelectedProductTax(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((productTax: ProductTaxListDto) => {
    setSelectedProductTax(productTax);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((productTax: ProductTaxListDto) => {
    setSelectedProductTax(productTax);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((productTax: ProductTaxListDto) => {
    setSelectedProductTax(productTax);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProductTax) return;

    try {
      const success = await deleteProductTax(selectedProductTax.pTaxID);

      if (success) {
        showAlert("Success", "Product tax deleted successfully", "success");
      } else {
        throw new Error("Failed to delete product tax");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete product tax", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedProductTax, deleteProductTax]);

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
      taxRange: "",
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!productTaxList.length) {
      return {
        totalTaxes: 0,
        activeTaxes: 0,
        inactiveTaxes: 0,
        averageTaxRate: 0,
        highestTaxRate: 0,
        lowestTaxRate: 0,
      };
    }

    const activeCount = productTaxList.filter((t) => t.rActiveYN === "Y").length;
    const taxAmounts = productTaxList.map((t) => t.pTaxAmt || 0).filter((amt) => amt > 0);
    const averageRate = taxAmounts.length > 0 ? taxAmounts.reduce((sum, amt) => sum + amt, 0) / taxAmounts.length : 0;
    const highestRate = taxAmounts.length > 0 ? Math.max(...taxAmounts) : 0;
    const lowestRate = taxAmounts.length > 0 ? Math.min(...taxAmounts) : 0;

    return {
      totalTaxes: productTaxList.length,
      activeTaxes: activeCount,
      inactiveTaxes: productTaxList.length - activeCount,
      averageTaxRate: Math.round(averageRate * 100) / 100,
      highestTaxRate: highestRate,
      lowestTaxRate: lowestRate,
    };
  }, [productTaxList]);

  // Apply filters to the list
  const filteredProductTaxes = useMemo(() => {
    if (!productTaxList.length) return [];

    return productTaxList.filter((productTax) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        productTax.pTaxCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        productTax.pTaxName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        productTax.pTaxDescription?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        productTax.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "" || (filters.status === "active" && productTax.rActiveYN === "Y") || (filters.status === "inactive" && productTax.rActiveYN === "N");

      const matchesTaxRange =
        filters.taxRange === "" ||
        (filters.taxRange === "low" && (productTax.pTaxAmt || 0) >= 0 && (productTax.pTaxAmt || 0) <= 5) ||
        (filters.taxRange === "medium" && (productTax.pTaxAmt || 0) > 5 && (productTax.pTaxAmt || 0) <= 15) ||
        (filters.taxRange === "high" && (productTax.pTaxAmt || 0) > 15);

      return matchesSearch && matchesStatus && matchesTaxRange;
    });
  }, [productTaxList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Taxes</Typography>
          <Typography variant="h4">{stats.totalTaxes}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeTaxes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveTaxes}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Average Rate</Typography>
          <Typography variant="h4" color="info.main">
            {stats.averageTaxRate}%
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Highest Rate</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.highestTaxRate}%
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Lowest Rate</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.lowestTaxRate}%
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<ProductTaxListDto>[] = [
    {
      key: "pTaxCode",
      header: "Tax Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "pTaxName",
      header: "Tax Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => value || "-",
    },
    {
      key: "pTaxAmt",
      header: "Tax Rate (%)",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: number) => (value !== undefined && value !== null ? `${value}%` : "-"),
    },
    {
      key: "pTaxDescription",
      header: "Description",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
      formatter: (value: string) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
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
          Error loading product taxes: {error}
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
              Product Tax List
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
              <SmartButton text="Add Tax" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name, description, or notes"
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
            <Tooltip title="Filter Product Taxes">
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
                  label="Tax Range"
                  name="taxRange"
                  value={filters.taxRange}
                  options={taxRangeOptions}
                  onChange={(e) => handleFilterChange("taxRange", e.target.value)}
                  size="small"
                  defaultText="All Ranges"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.taxRange) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredProductTaxes} maxHeight="calc(100vh - 280px)" emptyStateMessage="No product taxes found" loading={isLoading} />
      </Paper>

      {isFormOpen && <ProductTaxListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedProductTax} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the product tax "${selectedProductTax?.pTaxName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default ProductTaxListPage;
