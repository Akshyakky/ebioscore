import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { ProductListService } from "@/services/InventoryManagementService/ProductListService/ProductListService";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import SmartButton from "@/components/Button/SmartButton";
import ProductForm from "./ProductForm";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { showAlert } from "@/utils/Common/showAlert";
import { useLoading } from "@/context/LoadingContext";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";

const productService = new ProductListService();

const ProductList: React.FC = () => {
  const { setLoading } = useLoading();
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<ProductListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    category: string;
    productGroup: string;
    status: string;
  }>({
    category: "",
    productGroup: "",
    status: "",
  });

  // Load dropdown values
  const { productCategory, productGroup } = useDropdownValues(["productCategory", "productGroup"]);

  const status = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        showAlert("Error", "Failed to fetch products", "error");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlert("Error", "Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Open form dialog for creating new product
  const handleAddNew = () => {
    setSelectedProduct(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  };

  // Open form dialog for editing existing product
  const handleEdit = (product: ProductListDto) => {
    setSelectedProduct(product);
    setIsViewMode(false);
    setIsFormOpen(true);
  };

  // Open form dialog for viewing product details
  const handleView = (product: ProductListDto) => {
    setSelectedProduct(product);
    setIsViewMode(true);
    setIsFormOpen(true);
  };

  // Open confirm dialog for deleting a product
  const handleDeleteClick = (product: ProductListDto) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  // Confirm and execute product deletion
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      const response = await productService.delete(selectedProduct.productID, true);
      if (response.success) {
        showAlert("Success", "Product deleted successfully", "success");
        fetchProducts();
      } else {
        showAlert("Error", response.errorMessage || "Failed to delete product", "error");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showAlert("Error", "Failed to delete product", "error");
    } finally {
      setLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  // Close product form dialog
  const handleFormClose = (refreshData?: boolean) => {
    setIsFormOpen(false);
    if (refreshData) {
      fetchProducts();
    }
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      category: "",
      productGroup: "",
      status: "",
    });
  };

  // Filter products based on search term and filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search term filter
      const matchesSearch =
        searchTerm === "" || product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || product.productCode?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = filters.category === "" || product.catValue === filters.category;

      // Product group filter
      const matchesGroup = filters.productGroup === "" || product.pGrpID?.toString() === filters.productGroup;

      // Status filter
      const matchesStatus = filters.status === "" || (filters.status === "active" && product.rActiveYN === "Y") || (filters.status === "inactive" && product.rActiveYN === "N");

      return matchesSearch && matchesCategory && matchesGroup && matchesStatus;
    });
  }, [products, searchTerm, filters]);

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

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Product List
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent="flex-end">
            <Stack direction="row" spacing={1}>
              <SmartButton text="Refresh" icon={RefreshIcon} onClick={fetchProducts} color="info" variant="outlined" size="small" />
              <SmartButton text="Add Product" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          {/* Search and Filter Row */}
          <Grid size={{ xs: 12, md: 6 }}>
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
          <Grid size={{ xs: 12, md: 6 }} display="flex" justifyContent="flex-end">
            <Box display="flex" alignItems="center" gap={1}>
              {(filters.category || filters.productGroup || filters.status) && (
                <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
              )}
              <Tooltip title="Filter Products">
                <IconButton onClick={() => setFilterOpen(true)}>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
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
        />
      </Paper>

      {/* Product Form Dialog */}
      {isFormOpen && <ProductForm open={isFormOpen} onClose={handleFormClose} product={selectedProduct} viewOnly={isViewMode} />}

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

      {/* Filter Dialog */}
      <GenericDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Products"
        maxWidth="xs"
        fullWidth
        showCloseButton
        actions={
          <>
            <CustomButton text="Clear Filters" onClick={handleClearFilters} variant="outlined" color="error" />
            <CustomButton text="Apply" onClick={() => setFilterOpen(false)} variant="contained" color="primary" />
          </>
        }
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
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
            name="ProductGroup"
            value={filters.productGroup}
            options={
              productGroup?.map((option) => ({
                value: option.value.toString(),
                label: option.label,
              })) || []
            }
            onChange={(e) => handleFilterChange("productGroup", e.target.value)}
            size="small"
            defaultText="All Product Group"
          />

          <DropdownSelect
            label="Status"
            name="Status"
            value={filters.status}
            options={status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            size="small"
            defaultText="All Records"
          />
        </Stack>
      </GenericDialog>
    </Box>
  );
};

export default ProductList;
