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
  Business as DepartmentIcon,
  Inventory as ProductIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Warning as LowStockIcon,
} from "@mui/icons-material";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import ProductForm from "./ProductForm";
import ProductDepartmentOverview from "./ProductDepartmentOverview";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { debounce } from "@/utils/Common/debounceUtils";
import { useProductsQuery, useDeleteProductMutation } from "@/hooks/InventoryManagement/useProductQuery";
import { FormProvider, useForm } from "react-hook-form";

interface FormData {
  selectedProduct: ProductListDto | null;
}

const ProductList: React.FC = () => {
  // Form context setup
  const methods = useForm<FormData>({
    defaultValues: {
      selectedProduct: null,
    },
  });
  const { setValue } = methods;

  // State management
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<ProductListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [isDepartmentOverviewOpen, setIsDepartmentOverviewOpen] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);

  const { department: departments } = useDropdownValues(["department"]);
  const [filters, setFilters] = useState<{
    category: string;
    productGroup: string;
    status: string;
  }>({
    category: "",
    productGroup: "",
    status: "",
  });

  // Update form context when selectedProduct changes
  useEffect(() => {
    setValue("selectedProduct", selectedProduct);
  }, [selectedProduct, setValue]);

  // React Query hooks
  const { data: products, isLoading, error, refetch, isFetching } = useProductsQuery();
  const deleteProductMutation = useDeleteProductMutation();

  // Load dropdown values
  const { productCategory, productGroup } = useDropdownValues(["productCategory", "productGroup"]);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Debounced search implementation
  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search input changes with debounce
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Open form dialog for creating new product
  const handleAddNew = useCallback(() => {
    setSelectedProduct(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  // Open form dialog for editing existing product
  const handleEdit = useCallback((product: ProductListDto) => {
    setSelectedProduct(product);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  // Open form dialog for viewing product details
  const handleView = useCallback((product: ProductListDto) => {
    setSelectedProduct(product);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  // Open department overview dialog
  const handleDepartmentOverview = useCallback((product: ProductListDto) => {
    setSelectedProduct(product);
    setIsDepartmentOverviewOpen(true);
  }, []);

  // Open confirm dialog for deleting a product
  const handleDeleteClick = useCallback((product: ProductListDto) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  }, []);

  // Confirm and execute product deletion
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProduct) return;

    try {
      await deleteProductMutation.mutateAsync({
        id: selectedProduct.productID,
        softDelete: true,
      });
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Delete operation failed:", error);
    }
  }, [selectedProduct, deleteProductMutation]);

  // Close product form dialog
  const handleFormClose = useCallback((refreshData?: boolean) => {
    setIsFormOpen(false);
  }, []);

  // Close department overview dialog
  const handleDepartmentOverviewClose = useCallback(
    (refreshData?: boolean) => {
      setIsDepartmentOverviewOpen(false);
      if (refreshData) {
        refetch();
      }
    },
    [refetch]
  );

  // Handle filter changes
  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      category: "",
      productGroup: "",
      status: "",
    });
  }, []);

  // Calculate statistics with memoization
  const stats = useMemo(() => {
    if (!products)
      return {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        lowStockProducts: 0,
      };

    const activeCount = products.filter((p) => p.rActiveYN === "Y").length;
    const lowStockCount = products.filter((p) => (p.rOL || 0) > 0).length;

    return {
      totalProducts: products.length,
      activeProducts: activeCount,
      inactiveProducts: products.length - activeCount,
      lowStockProducts: lowStockCount,
    };
  }, [products]);

  // Filter products with debounced search and filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        product.productName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.productCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesCategory = filters.category === "" || product.catValue === filters.category;
      const matchesGroup = filters.productGroup === "" || product.pGrpID?.toString() === filters.productGroup;
      const matchesStatus = filters.status === "" || (filters.status === "active" && product.rActiveYN === "Y") || (filters.status === "inactive" && product.rActiveYN === "N");

      return matchesSearch && matchesCategory && matchesGroup && matchesStatus;
    });
  }, [products, debouncedSearchTerm, filters]);

  // Render enhanced statistics dashboard
  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 3 }}>
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

      <Grid size={{ xs: 12, sm: 3 }}>
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
                  Active Products
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}>
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
                  Inactive Products
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}>
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
    </Grid>
  );

  // Define grid columns
  const columns: Column<ProductListDto>[] = [
    {
      key: "productCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "productName",
      header: "Product Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "catValue",
      header: "Category",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "productGroupName",
      header: "Group",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "pUnitName",
      header: "Unit",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
    },
    {
      key: "defaultPrice",
      header: "Price",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: any) => (value ? `₹${parseFloat(value).toFixed(2)}` : "-"),
      align: "right",
    },
    {
      key: "taxName",
      header: "Tax",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
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
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 220,
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
          <Tooltip title="Edit Product">
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
          </Tooltip>
          <Tooltip title="Product Overview">
            <IconButton
              size="small"
              color="success"
              onClick={() => handleDepartmentOverview(item)}
              sx={{
                bgcolor: "rgba(76, 175, 80, 0.08)",
                "&:hover": { bgcolor: "rgba(76, 175, 80, 0.15)" },
              }}
            >
              <DepartmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Product">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(item)}
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

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading products: {error.message}
        </Typography>
        <CustomButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
            Product List
          </Typography>
          <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
        </Box>

        {/* Statistics Dashboard */}
        {showStats && renderStatsDashboard()}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Field */}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Search by name or code"
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Tooltip title="Filter Products">
                <Stack direction="row" spacing={2} alignItems="center">
                  <DropdownSelect
                    label="Category"
                    name="category"
                    value={filters.category}
                    options={
                      productCategory?.map((option) => ({
                        value: option.value.toString(),
                        label: option.label,
                      })) || []
                    }
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    size="small"
                    defaultText="All Categories"
                  />

                  <DropdownSelect
                    label="Product Group"
                    name="productGroup"
                    value={filters.productGroup}
                    options={
                      productGroup?.map((option) => ({
                        value: option.value.toString(),
                        label: option.label,
                      })) || []
                    }
                    onChange={(e) => handleFilterChange("productGroup", e.target.value)}
                    size="small"
                    defaultText="All Groups"
                  />

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

            {/* Action Buttons */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <SmartButton
                  text="Refresh"
                  icon={RefreshIcon}
                  onClick={handleRefresh}
                  color="info"
                  variant="outlined"
                  size="small"
                  disabled={isFetching}
                  loadingText="Refreshing..."
                  asynchronous={true}
                  showLoadingIndicator={true}
                />
                <SmartButton text="Add Product" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Products Grid */}
        <Paper sx={{ p: 2 }}>
          <CustomGrid
            columns={columns}
            data={filteredProducts}
            pagination
            pageSize={10}
            maxHeight="calc(100vh - 280px)"
            showExportCSV
            showExportPDF
            exportFileName="product-list"
            emptyStateMessage="No products found"
            showColumnCustomization
            initialSortBy={{ field: "productName", direction: "asc" }}
            density="small"
            loading={isLoading || isFetching}
          />
        </Paper>

        {/* Product Form Dialog */}
        {isFormOpen && <ProductForm open={isFormOpen} onClose={handleFormClose} viewOnly={isViewMode} product={selectedProduct} />}

        {/* Product Department Overview Dialog */}
        {isDepartmentOverviewOpen && <ProductDepartmentOverview open={isDepartmentOverviewOpen} onClose={handleDepartmentOverviewClose} departments={departments} />}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Delete"
          message={`Are you sure you want to delete the product "${selectedProduct?.productName}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          type="error"
          maxWidth="xs"
        />
      </Box>
    </FormProvider>
  );
};

export default ProductList;
