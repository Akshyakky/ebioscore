import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { ProductTaxListDto } from "@/interfaces/InventoryManagement/ProductTaxListDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  CheckCircle as ActiveIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TrendingUp as HighIcon,
  Cancel as InactiveIcon,
  TrendingDown as LowIcon,
  Percent as RateIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  LocalOffer as TaxIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProductTaxListForm from "../Form/ProductTaxListForm";
import { useProductTaxList } from "../hooks/useProductTaxListPage";

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
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedProductTax, setSelectedProductTax] = useState<ProductTaxListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);

  const { productTaxList, isLoading, error, fetchProductTaxList, deleteProductTax } = useProductTaxList();

  const [filters, setFilters] = useState<{
    status: string;
    taxRange: string;
  }>({
    status: "",
    taxRange: "",
  });

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
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <TaxIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalTaxes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Taxes
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
                <ActiveIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {stats.activeTaxes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
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
                <InactiveIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.inactiveTaxes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inactive
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
                <RateIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.averageTaxRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average Rate
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
                <HighIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.highestTaxRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Highest Rate
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
                <LowIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {stats.lowestTaxRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lowest Rate
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const columns: Column<ProductTaxListDto>[] = [
    {
      key: "pTaxCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => value || "-",
    },
    {
      key: "pTaxName",
      header: "Tax Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
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
      width: 300,
      formatter: (value: string) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
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
          Error loading product taxes: {error}
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
          Product Tax List
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
          <Grid size={{ xs: 12, md: 5 }}>
            <Tooltip title="Filter Product Taxes">
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
              <SmartButton text="Add Tax" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredProductTaxes} maxHeight="calc(100vh - 280px)" emptyStateMessage="No product taxes found" density="small" loading={isLoading} />
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
