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
  Dashboard as DashboardIcon,
  ChangeCircleRounded as ChangeDepartmentIcon,
  Inventory as ProductIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as LowStockIcon,
  Dangerous as DangerIcon,
  AutoMode as AutoIndentIcon,
} from "@mui/icons-material";
import CustomGrid, { Column, GridDensity } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import ProductOverviewForm from "../Form/ProductOverviewForm";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { useProductOverview } from "../hooks/useProductOverview";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const stockLevelOptions = [
  { value: "normal", label: "Normal Stock" },
  { value: "low", label: "Low Stock" },
  { value: "danger", label: "Danger Level" },
];

const autoIndentOptions = [
  { value: "Y", label: "Auto Indent: Yes" },
  { value: "N", label: "Auto Indent: No" },
];

const ProductOverviewPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedProductOverview, setSelectedProductOverview] = useState<ProductOverviewDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);
  const [gridDensity] = useState<GridDensity>("medium");
  const { isLoading, error, deleteProductOverview, getProductOverviewByDepartment } = useProductOverview();
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect } = useDepartmentSelection({});
  const [departmentProductList, setDepartmentProductList] = useState<ProductOverviewDto[]>([]);

  const [filters, setFilters] = useState<{
    status: string;
    stockLevel: string;
    autoIndent: string;
    transfer: string;
  }>({
    status: "",
    stockLevel: "",
    autoIndent: "",
    transfer: "",
  });

  useEffect(() => {
    if (!isDepartmentSelected && !isDialogOpen) {
      openDialog();
    }
  }, [isDepartmentSelected, isDialogOpen, openDialog]);

  useEffect(() => {
    if (isDepartmentSelected && deptId) {
      fetchDepartmentProducts();
    }
  }, [isDepartmentSelected, deptId]);

  const fetchDepartmentProducts = useCallback(async () => {
    if (deptId) {
      try {
        const products = await getProductOverviewByDepartment(deptId);
        setDepartmentProductList(products);
      } catch (error) {
        showAlert("Error", "Failed to fetch department products", "error");
      }
    }
  }, [deptId, getProductOverviewByDepartment]);

  const handleRefresh = useCallback(() => {
    if (isDepartmentSelected) {
      fetchDepartmentProducts();
    }
  }, [fetchDepartmentProducts, isDepartmentSelected]);

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
    setSelectedProductOverview(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, [isDepartmentSelected]);

  const handleEdit = useCallback((productOverview: ProductOverviewDto) => {
    setSelectedProductOverview(productOverview);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((productOverview: ProductOverviewDto) => {
    setSelectedProductOverview(productOverview);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((productOverview: ProductOverviewDto) => {
    setSelectedProductOverview(productOverview);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProductOverview) return;

    try {
      const success = await deleteProductOverview(selectedProductOverview.pvID);

      if (success) {
        showAlert("Success", "Product overview deleted successfully", "success");
        fetchDepartmentProducts();
      } else {
        throw new Error("Failed to delete product overview");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete product overview", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedProductOverview, deleteProductOverview, fetchDepartmentProducts]);

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      if (refreshData) {
        fetchDepartmentProducts();
      }
    },
    [fetchDepartmentProducts]
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
      stockLevel: "",
      autoIndent: "",
      transfer: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!departmentProductList.length) {
      return {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        lowStockProducts: 0,
        dangerLevelProducts: 0,
        autoIndentProducts: 0,
      };
    }

    const activeCount = departmentProductList.filter((p) => p.rActiveYN === "Y").length;
    const lowStockCount = departmentProductList.filter((p) => p.stockLevel && p.minLevelUnits && p.stockLevel <= p.minLevelUnits).length;
    const dangerLevelCount = departmentProductList.filter((p) => p.stockLevel && p.dangerLevelUnits && p.stockLevel <= p.dangerLevelUnits).length;
    const autoIndentCount = departmentProductList.filter((p) => p.isAutoIndentYN === "Y").length;

    return {
      totalProducts: departmentProductList.length,
      activeProducts: activeCount,
      inactiveProducts: departmentProductList.length - activeCount,
      lowStockProducts: lowStockCount,
      dangerLevelProducts: dangerLevelCount,
      autoIndentProducts: autoIndentCount,
    };
  }, [departmentProductList]);

  const filteredProducts = useMemo(() => {
    if (!departmentProductList.length) return [];

    return departmentProductList.filter((product) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        product.productCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.productLocation?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && product.rActiveYN === "Y") || (filters.status === "inactive" && product.rActiveYN === "N");

      const matchesStockLevel =
        filters.stockLevel === "" ||
        (filters.stockLevel === "low" && product.stockLevel && product.minLevelUnits && product.stockLevel <= product.minLevelUnits) ||
        (filters.stockLevel === "danger" && product.stockLevel && product.dangerLevelUnits && product.stockLevel <= product.dangerLevelUnits) ||
        (filters.stockLevel === "normal" && product.stockLevel && product.minLevelUnits && product.stockLevel > product.minLevelUnits);

      const matchesAutoIndent =
        filters.autoIndent === "" || (filters.autoIndent === "Y" && product.isAutoIndentYN === "Y") || (filters.autoIndent === "N" && product.isAutoIndentYN === "N");

      const matchesTransfer = filters.transfer === "" || (filters.transfer === "Y" && product.transferYN === "Y") || (filters.transfer === "N" && product.transferYN === "N");

      return matchesSearch && matchesStatus && matchesStockLevel && matchesAutoIndent && matchesTransfer;
    });
  }, [departmentProductList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <ProductIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalProducts}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Products
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
                  {stats.activeProducts}
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
                  {stats.inactiveProducts}
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
        <Card sx={{ borderLeft: "3px solid #ff9800" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                <LowStockIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.lowStockProducts}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Low Stock
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #d32f2f" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#d32f2f", width: 40, height: 40 }}>
                <DangerIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#d32f2f" fontWeight="bold">
                  {stats.dangerLevelProducts}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Danger Level
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
                <AutoIndentIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.autoIndentProducts}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Auto Indent
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const getStockLevelColor = (product: ProductOverviewDto) => {
    if (product.stockLevel && product.dangerLevelUnits && product.stockLevel <= product.dangerLevelUnits) {
      return "error";
    }
    if (product.stockLevel && product.minLevelUnits && product.stockLevel <= product.minLevelUnits) {
      return "warning";
    }
    return "success";
  };

  const columns: Column<ProductOverviewDto>[] = [
    {
      key: "productCode",
      header: "Product Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "stockLevel",
      header: "Stock Level",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: number, item: ProductOverviewDto) => <Chip size="small" color={getStockLevelColor(item)} label={value || 0} />,
    },
    {
      key: "minLevelUnits",
      header: "Min Level",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: number) => value || "-",
    },
    {
      key: "maxLevelUnits",
      header: "Max Level",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: number) => value || "-",
    },
    {
      key: "dangerLevelUnits",
      header: "Danger Level",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: number) => value || "-",
    },
    {
      key: "location",
      header: "Location",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      render: (item: ProductOverviewDto) => {
        const locationParts = [item.productLocation || "", item.rackNo || "", item.shelfNo || ""].filter((part) => part);
        return locationParts.join(" - ") || "-";
      },
    },
    {
      key: "isAutoIndentYN",
      header: "Auto Indent",
      visible: true,
      sortable: true,
      filterable: true,
      width: 110,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "info" : "default"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: gridDensity === "large" ? 120 : gridDensity === "medium" ? 100 : 80,
      formatter: (value: string) => (
        <Chip size={gridDensity === "large" ? "medium" : "small"} color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />
      ),
    },
    {
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => (value ? (value.length > 30 ? value.substring(0, 30) + "..." : value) : "-"),
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
          Error loading product overview: {error}
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
              Product Overview - {deptName}
            </Typography>
            <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" icon={DashboardIcon} />
          </Box>

          {/* Statistics Dashboard */}
          {showStats && renderStatsDashboard()}

          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Department Info */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SmartButton text={deptName} icon={ChangeDepartmentIcon} onClick={handleDepartmentChange} color="warning" variant="outlined" size="small" />
                </Stack>
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
                  <SmartButton text="Add Product" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
                </Stack>
              </Grid>

              {/* Search Field */}
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search by code, location, or notes"
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

              {/* Inline Filters */}
              <Grid size={{ xs: 12, md: 9 }}>
                <Tooltip title="Filter Product Overview">
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
                      label="Stock Level"
                      name="stockLevel"
                      value={filters.stockLevel}
                      options={stockLevelOptions}
                      onChange={(e) => handleFilterChange("stockLevel", e.target.value)}
                      size="small"
                      defaultText="All Stock Levels"
                    />

                    <DropdownSelect
                      label="Auto Indent"
                      name="autoIndent"
                      value={filters.autoIndent}
                      options={autoIndentOptions}
                      onChange={(e) => handleFilterChange("autoIndent", e.target.value)}
                      size="small"
                      defaultText="All Auto Indent"
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
              data={filteredProducts}
              maxHeight="calc(100vh - 280px)"
              emptyStateMessage="No product overviews found for this department"
              density="small"
              loading={isLoading}
            />
          </Paper>
        </>
      )}

      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} initialDeptId={deptId} requireSelection={true} />
      {isFormOpen && isDepartmentSelected && (
        <ProductOverviewForm
          open={isFormOpen}
          onClose={handleFormClose}
          initialData={selectedProductOverview}
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
        message={`Are you sure you want to delete the product overview "${selectedProductOverview?.productCode}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default ProductOverviewPage;
