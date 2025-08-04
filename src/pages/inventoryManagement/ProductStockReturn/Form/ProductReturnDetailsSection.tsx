import { GrnProductSearchResult } from "@/interfaces/InventoryManagement/Product/GrnProductSearch.interface";
import { ProductStockReturnDetailDto, ReturnType } from "@/interfaces/InventoryManagement/ProductStockReturnDto";
import { BatchSelectionDialog, useBatchSelection } from "@/pages/inventoryManagement/CommonPage/BatchSelectionDialog";
import {
  Add as AddIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  FirstPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
  LocalFireDepartment,
  Refresh as RefreshIcon,
  Reply as ReturnIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Control, FieldArrayWithId, FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove, UseFormSetValue, useWatch } from "react-hook-form";
import * as z from "zod";
import { GrnProductSearch, GrnProductSearchRef } from "../../CommonPage/GrnProduct/GrnProductSearchForm";

const returnDetailSchema = z.object({
  psrdID: z.number(),
  psrID: z.number(),
  productID: z.number().min(1, "Product is required"),
  productCode: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  batchNo: z.string().optional(),
  expiryDate: z.date().optional(),
  prescriptionYN: z.string().optional(),
  expiryYN: z.string().optional(),
  sellableYN: z.string().optional(),
  taxableYN: z.string().optional(),
  availableQty: z.number().optional(),

  tax: z.number().optional(),
  returnReason: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  // Add missing fields from DTO
  grnDate: z.date().optional(),
  manufacturedDate: z.date().optional(),
  psGrpID: z.number().optional(),
  psGrpName: z.string().optional(),
  manufacturerID: z.number().optional(),
  manufacturerCode: z.string().optional(),
  manufacturerName: z.string().optional(),
  taxID: z.number().optional(),
  taxCode: z.string().optional(),
  taxName: z.string().optional(),
  mrp: z.number().optional(),
  transferYN: z.string().optional(),
  freeRetQty: z.number().optional(),
  freeRetUnitQty: z.number().optional(),
  psdID: z.number().optional(),
  hsnCode: z.string().optional(),
  pUnitID: z.number().optional(),
  pUnitName: z.string().optional(),
  pUnitsPerPack: z.number().optional(),
  pkgID: z.number().optional(),
  pkgName: z.string().optional(),
  psbid: z.number().optional(),
  sellUnitPrice: z.number().optional(),
  mfID: z.number().optional(),
  mfName: z.string().optional(),
  pGrpID: z.number().optional(),
  pGrpName: z.string().optional(),
  cgst: z.number().optional(),
  sgst: z.number().optional(),
  // Additional fields from GRN
  grnCode: z.string().optional(),
  supplierName: z.string().optional(),
  invoiceNo: z.string().optional(),
  recvdQty: z.number().optional(),
  invDate: z.string().optional(),
  supplierID: z.number().optional(),
  supplrID: z.number().optional(),
  supplrName: z.string().optional(),
  dcNo: z.string().optional(),
  poNo: z.string().optional(),
  grnType: z.string().optional(),
  grnStatus: z.string().optional(),
  grnApprovedYN: z.string().optional(),
  freeItems: z.number().optional(),
});

const schema = z.object({
  psrID: z.number(),
  psrDate: z.date(),
  returnTypeCode: z.string().min(1, "Return type is required"),
  fromDeptID: z.number().min(1, "From department is required"),
  fromDeptName: z.string(),
  toDeptID: z.number().optional(),
  toDeptName: z.string().optional(),
  supplierID: z.number().optional(),
  supplierName: z.string().optional(),
  auGrpID: z.number().optional(),
  catDesc: z.string().optional(),
  catValue: z.string().optional(),
  psrCode: z.string().optional(),
  approvedYN: z.string(),
  approvedID: z.number().optional(),
  approvedBy: z.string().optional(),
  rActiveYN: z.string().default("Y"),
  productStockReturnDetails: z.array(returnDetailSchema).min(1, "At least one product detail is required"),
});

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5, display: "flex", alignItems: "center", gap: 0.5 }}>
      <Tooltip title="First page">
        <span>
          <IconButton
            onClick={handleFirstPageButtonClick}
            disabled={page === 0}
            aria-label="first page"
            size="small"
            sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {theme.direction === "rtl" ? <LastPage fontSize="small" /> : <FirstPage fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Previous page">
        <span>
          <IconButton
            onClick={handleBackButtonClick}
            disabled={page === 0}
            aria-label="previous page"
            size="small"
            sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {theme.direction === "rtl" ? <KeyboardArrowRight fontSize="small" /> : <KeyboardArrowLeft fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Next page">
        <span>
          <IconButton
            onClick={handleNextButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            aria-label="next page"
            size="small"
            sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {theme.direction === "rtl" ? <KeyboardArrowLeft fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Last page">
        <span>
          <IconButton
            onClick={handleLastPageButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            aria-label="last page"
            size="small"
            sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {theme.direction === "rtl" ? <FirstPage fontSize="small" /> : <LastPage fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

type ProductStockReturnFormData = z.infer<typeof schema>;

interface ProductDetailsSectionProps {
  control: Control<ProductStockReturnFormData>;
  fields: FieldArrayWithId<ProductStockReturnFormData, "productStockReturnDetails", "id">[];
  append: UseFieldArrayAppend<ProductStockReturnFormData, "productStockReturnDetails">;
  remove: UseFieldArrayRemove;
  setValue: UseFormSetValue<ProductStockReturnFormData>;
  errors: FieldErrors<ProductStockReturnFormData>;
  isViewMode: boolean;
  showAlert: (type: string, message: string, severity: "success" | "error" | "warning" | "info") => void;
}

const StockReturnProductSection: React.FC<ProductDetailsSectionProps> = ({ control, fields, append, remove, setValue, errors, isViewMode, showAlert }) => {
  const theme = useTheme();
  const [selectedGrnProduct, setSelectedGrnProduct] = useState<GrnProductSearchResult | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number | undefined>(undefined);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [isEditingExistingProduct, setIsEditingExistingProduct] = useState(false);
  const [grnProductSearchSelection, setGrnProductSearchSelection] = useState<any>(null);
  const [, setGrnProductSearchInputValue] = useState<string>("");
  const [clearGrnProductSearchTrigger, setClearGrnProductSearchTrigger] = useState(0);
  const [returnReason, setReturnReason] = useState<string>("");
  const grnProductSearchRef = useRef<GrnProductSearchRef>(null);
  const watchedDetails = useWatch({ control, name: "productStockReturnDetails" });
  const fromDeptID = useWatch({ control, name: "fromDeptID" });
  const returnTypeCode = useWatch({ control, name: "returnTypeCode" });
  const { isDialogOpen: isBatchSelectionDialogOpen, availableBatches, closeDialog: closeBatchDialog } = useBatchSelection();

  // Enhanced grid state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [viewType, setViewType] = useState<"all" | "expired" | "nonExpired">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const clearTemporaryFields = useCallback(() => {
    setSelectedGrnProduct(null);
    setSelectedQuantity(undefined);
    setIsAddingProduct(false);
    setIsLoadingBatches(false);
    setEditingProductIndex(null);
    setIsEditingExistingProduct(false);
    setGrnProductSearchSelection(null);
    setGrnProductSearchInputValue("");
    setReturnReason("");
    setClearGrnProductSearchTrigger((prev) => prev + 1);
  }, []);

  const mapGrnProductToReturnDetail = useCallback((grnProduct: GrnProductSearchResult, quantity: number = 0, reason: string = ""): ProductStockReturnDetailDto => {
    // Don't set default quantity, let user enter the value
    const userQuantity = quantity > 0 ? quantity : 0;
    return {
      psrdID: 0,
      psrID: 0,
      productID: grnProduct.productID,
      productName: grnProduct.productName || "",
      quantity: userQuantity,
      unitPrice: grnProduct.unitPrice || 0,
      totalAmount: userQuantity * (grnProduct.unitPrice || 0),
      batchNo: grnProduct.batchNo || "",
      expiryDate: grnProduct.expiryDate,
      manufacturedDate: undefined,
      grnDate: grnProduct.grnDate || new Date(),
      prescriptionYN: grnProduct.prescriptionYN || "N",
      expiryYN: grnProduct.expiryYN || "N",
      sellableYN: grnProduct.sellableYN || "N",
      taxableYN: grnProduct.taxableYN || "N",
      psGrpID: grnProduct.psGrpID || 0,
      psGrpName: grnProduct.psGrpName || "",
      manufacturerID: grnProduct.manufacturerID || 0,
      manufacturerCode: grnProduct.manufacturerCode || "",
      manufacturerName: grnProduct.manufacturerName || grnProduct.mfName || "",
      taxID: grnProduct.taxID || 0,
      taxCode: grnProduct.taxCode || "",
      taxName: grnProduct.taxName || "",
      mrp: grnProduct.mrp || 0,
      transferYN: "N",
      freeRetQty: 0,
      freeRetUnitQty: 0,
      psdID: 1,
      hsnCode: grnProduct.hsnCode || "",
      productCode: grnProduct.productCode || "",
      pUnitID: grnProduct.pUnitID || 0,
      pUnitName: grnProduct.pUnitName || "",
      pUnitsPerPack: grnProduct.pUnitsPerPack || 1,
      pkgID: grnProduct.pkgID || 0,
      pkgName: grnProduct.pkgName || "",
      availableQty: grnProduct.availableQty || 0,
      psbid: grnProduct.grnDetID || 0,
      returnReason: reason,
      tax: grnProduct.tax || 0,
      sellUnitPrice: grnProduct.sellUnitPrice || grnProduct.unitPrice || 0,
      mfID: grnProduct.mfID || 0,
      mfName: grnProduct.mfName || "",
      pGrpID: grnProduct.pGrpID || 0,
      pGrpName: grnProduct.pGrpName || "",
      cgst: (grnProduct.tax || 0) / 2,
      sgst: (grnProduct.tax || 0) / 2,
      rActiveYN: "Y",
      grnCode: grnProduct.grnCode || "",
      supplierName: grnProduct.supplierName || grnProduct.supplrName || "",
      invoiceNo: grnProduct.invoiceNo || "",
      recvdQty: grnProduct.recvdQty || 0,
    } as ProductStockReturnDetailDto;
  }, []);

  const handleQuantityChange = (rowId: string | number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [rowId]: value,
    }));

    // Also update the form
    const rowIndex = fields.findIndex((field) => field.id === rowId);
    if (rowIndex !== -1) {
      setValue(`productStockReturnDetails.${rowIndex}.quantity`, value);
    }
  };

  const getDefaultReasonByReturnType = (type: string): string => {
    switch (type) {
      case ReturnType.Supplier:
        return "Quality issues - returning to supplier";
      case ReturnType.Internal:
        return "Department transfer adjustment";
      case ReturnType.Expired:
        return "Item has reached expiry date";
      case ReturnType.Damaged:
        return "Item damaged in storage";
      default:
        return "Stock adjustment";
    }
  };

  const handleGrnProductSelect = useCallback(
    async (grnProduct: GrnProductSearchResult | null) => {
      if (!grnProduct?.productID) {
        clearTemporaryFields();
        return;
      }

      if (!fromDeptID) {
        showAlert("Warning", "Please select a department first for the return", "warning");
        return;
      }

      if (!isEditingExistingProduct && fields.find((d) => d.productID === grnProduct.productID && d.batchNo === grnProduct.batchNo)) {
        showAlert("Warning", `"${grnProduct.productName}" with batch "${grnProduct.batchNo}" is already added to the return list.`, "warning");
        grnProductSearchRef.current?.clearSelection();
        return;
      }

      try {
        setSelectedGrnProduct(grnProduct);
        setIsAddingProduct(true);
        setIsLoadingBatches(true);
        const newProductDetail = mapGrnProductToReturnDetail(grnProduct, selectedQuantity || 0, returnReason || getDefaultReasonByReturnType(returnTypeCode));

        if (isEditingExistingProduct && editingProductIndex !== null) {
          setValue(`productStockReturnDetails.${editingProductIndex}`, newProductDetail, {
            shouldValidate: true,
            shouldDirty: true,
          });
          showAlert("Success", `Return product "${grnProduct.productName}" updated successfully`, "success");
        } else {
          append(newProductDetail);
          showAlert("Success", `Product "${grnProduct.productName}" added for return from GRN: ${grnProduct.grnCode}, Batch: ${grnProduct.batchNo}`, "success");
        }

        clearTemporaryFields();
      } catch (error) {
        console.error("Error adding GRN product:", error);
        showAlert("Error", `Failed to add GRN product for return. Please try again.`, "error");
        clearTemporaryFields();
      } finally {
        setIsAddingProduct(false);
        setIsLoadingBatches(false);
      }
    },
    [
      selectedQuantity,
      returnReason,
      returnTypeCode,
      isEditingExistingProduct,
      editingProductIndex,
      append,
      setValue,
      showAlert,
      clearTemporaryFields,
      mapGrnProductToReturnDetail,
      fields,
      fromDeptID,
    ]
  );

  const statistics = useMemo(() => {
    const totalProducts = watchedDetails?.length || 0;
    const totalReturnQuantity = watchedDetails?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const expiredItems =
      watchedDetails?.filter((item) => {
        if (!item.expiryDate) return false;
        return new Date(item.expiryDate) < new Date();
      }).length || 0;
    const zeroQohItems = watchedDetails?.filter((item) => (item.availableQty || 0) === 0).length || 0;

    return {
      totalProducts,
      totalReturnQuantity,
      expiredItems,
      zeroQohItems,
    };
  }, [watchedDetails]);

  // Filter and sort data
  const filteredRows = useMemo(() => {
    let filtered = [...fields];

    // Apply view type filter
    if (viewType === "expired") {
      filtered = filtered.filter((row) => {
        if (!row.expiryDate) return false;
        return new Date(row.expiryDate) < new Date();
      });
    } else if (viewType === "nonExpired") {
      filtered = filtered.filter((row) => {
        if (!row.expiryDate) return true;
        return new Date(row.expiryDate) >= new Date();
      });
    }

    // Apply global filter
    if (globalFilter) {
      filtered = filtered.filter((row) =>
        Object.entries(row).some(([key, value]) => {
          if (typeof value === "string" || typeof value === "number") {
            return String(value).toLowerCase().includes(globalFilter.toLowerCase());
          }
          return false;
        })
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) => {
          const rowValue = row[key as keyof typeof row];
          if (rowValue === undefined || rowValue === null) return false;
          return String(rowValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof typeof a];
        const bValue = b[sortField as keyof typeof b];

        // Handle undefined or null values
        if (aValue === undefined || aValue === null) return sortDirection === "asc" ? -1 : 1;
        if (bValue === undefined || bValue === null) return sortDirection === "asc" ? 1 : -1;

        // Compare values based on their types
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        // For dates, convert to timestamp for comparison
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        }

        // For numbers or mixed types, use standard comparison
        return sortDirection === "asc" ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) : bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      });
    }

    return filtered;
  }, [fields, viewType, globalFilter, columnFilters, sortField, sortDirection]);

  // Get paginated data
  const paginatedRows = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleColumnFilterChange = useCallback((columnId: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
    setPage(0);
  }, []);

  const handleGlobalFilterChange = useCallback((value: string) => {
    setGlobalFilter(value);
    setPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters({});
    setGlobalFilter("");
    setPage(0);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
    showAlert("Success", "Data refreshed successfully", "success");
  }, [showAlert]);

  const handleSortColumn = useCallback(
    (columnId: string) => {
      if (sortField === columnId) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(columnId);
        setSortDirection("asc");
      }
    },
    [sortField]
  );

  const handleSelectAllClick = useCallback(() => {
    if (selectedRows.size === paginatedRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedRows.map((row) => row.id)));
    }
  }, [paginatedRows, selectedRows.size]);

  const handleSelectRow = useCallback((id: string | number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedRows.size === 0) return;

    const rowsToKeep = fields.filter((field) => !selectedRows.has(field.id));
    const deletedCount = selectedRows.size;

    for (let i = rowsToKeep.length - 1; i >= 0; i--) {
      setValue(`productStockReturnDetails.${i}`, rowsToKeep[i]);
    }

    for (let i = fields.length - 1; i >= rowsToKeep.length; i--) {
      remove(i);
    }

    setSelectedRows(new Set());
    showAlert("Success", `${deletedCount} items removed from return list`, "success");
  }, [fields, remove, selectedRows, setValue, showAlert]);

  const getExpiryWarning = (expiryDate?: Date) => {
    if (!expiryDate) return null;
    const today = new Date();
    const diffTime = new Date(expiryDate).getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "expired";
    if (diffDays <= 30) return "warning";
    return null;
  };

  const getReturnTypeLabel = () => {
    switch (returnTypeCode) {
      case ReturnType.Supplier:
        return "Supplier Return";
      case ReturnType.Internal:
        return "Internal Transfer Return";
      case ReturnType.Expired:
        return "Expired Items Return";
      case ReturnType.Damaged:
        return "Damaged Items Return";
      default:
        return "Product Return";
    }
  };

  // Column filter component
  const ColumnFilter = ({ columnId, label }: { columnId: string; label: string }) => {
    const filterValue = columnFilters[columnId] || "";

    return (
      <TextField
        size="small"
        placeholder={`Filter ${label}...`}
        value={filterValue}
        onChange={(e) => handleColumnFilterChange(columnId, e.target.value)}
        InputProps={{
          sx: {
            fontSize: "0.75rem",
            "& .MuiOutlinedInput-input": {
              padding: "4px 8px",
            },
          },
        }}
        sx={{
          width: "100%",
          minWidth: "120px",
          "& .MuiOutlinedInput-root": {
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          },
        }}
      />
    );
  };

  return (
    <>
      {!isViewMode && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon color="primary" /> Add Products for {getReturnTypeLabel()}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ sm: 12, md: 6 }}>
              <GrnProductSearch
                ref={grnProductSearchRef}
                departmentId={fromDeptID}
                onProductSelect={handleGrnProductSelect}
                clearTrigger={clearGrnProductSearchTrigger}
                label={`Search GRN Product for ${returnTypeCode} Return`}
                placeholder={fromDeptID ? "Search by product name, code, or batch..." : "Select department first..."}
                disabled={isViewMode || isAddingProduct || !fromDeptID}
                initialSelection={grnProductSearchSelection}
                setInputValue={setGrnProductSearchInputValue}
                setSelectedProduct={setGrnProductSearchSelection}
                approvedGrnsOnly={true}
                availableStockOnly={true}
              />
              {isAddingProduct && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Processing GRN product...
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ sm: 6, md: 2 }}>
              <TextField
                label="Return Quantity"
                type="number"
                value={selectedQuantity || ""}
                onChange={(e) => setSelectedQuantity(parseFloat(e.target.value) || undefined)}
                disabled={isViewMode || !selectedGrnProduct || isAddingProduct}
                size="small"
                fullWidth
                inputProps={{
                  min: 1,
                  max: selectedGrnProduct?.availableQty || undefined,
                  step: 1,
                }}
                placeholder="Qty"
                helperText={selectedGrnProduct ? `Avail: ${selectedGrnProduct.availableQty}` : ""}
              />
            </Grid>

            <Grid size={{ sm: 6, md: 4 }}>
              <TextField
                label="Return Reason"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                disabled={isViewMode || !selectedGrnProduct || isAddingProduct}
                size="small"
                fullWidth
                placeholder={`Reason for ${returnTypeCode} return`}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <ReturnIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
              </Box>
              <Typography variant="h6" fontWeight="600" color="primary.main">
                {getReturnTypeLabel()} Products
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }} />
              <Typography variant="body2" color="text.secondary">
                {viewType === "all" ? "All products" : viewType === "expired" ? "Expired products" : "Non-expired products"}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={`${filteredRows.length} ${filteredRows.length === 1 ? "Product" : "Products"} ${
                  filteredRows.length !== fields.length ? `(filtered from ${fields.length})` : ""
                }`}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ fontWeight: "600", borderWidth: 2 }}
              />
              {selectedRows.size > 0 && <Chip label={`${selectedRows.size} Selected`} variant="filled" color="secondary" size="small" sx={{ fontWeight: "600" }} />}
            </Box>
          </Box>

          <Toolbar
            variant="dense"
            sx={{
              pl: 0,
              pr: 0,
              minHeight: "auto !important",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <OutlinedInput
                value={globalFilter}
                onChange={(e) => handleGlobalFilterChange(e.target.value)}
                placeholder="Search all columns..."
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                }
                endAdornment={
                  globalFilter && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleGlobalFilterChange("")}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
            </FormControl>

            <Tabs
              value={viewType}
              onChange={(_, newValue) => {
                setViewType(newValue);
                setPage(0);
              }}
            >
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>All Products</span>
                    <Chip label={fields.length} size="small" color="primary" sx={{ height: 18, minWidth: 24 }} />
                  </Box>
                }
                value="all"
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>Expired</span>
                    <Chip
                      label={
                        fields.filter((row) => {
                          if (!row.expiryDate) return false;
                          return new Date(row.expiryDate) < new Date();
                        }).length
                      }
                      size="small"
                      color="error"
                      sx={{ height: 18, minWidth: 24 }}
                    />
                  </Box>
                }
                value="expired"
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>Non-Expired</span>
                    <Chip
                      label={
                        fields.filter((row) => {
                          if (!row.expiryDate) return true;
                          return new Date(row.expiryDate) >= new Date();
                        }).length
                      }
                      size="small"
                      color="success"
                      sx={{ height: 18, minWidth: 24 }}
                    />
                  </Box>
                }
                value="nonExpired"
              />
            </Tabs>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowColumnFilters(!showColumnFilters)}
                color={showColumnFilters ? "primary" : "inherit"}
              >
                Filters
              </Button>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? <CircularProgress size={16} /> : "Refresh"}
              </Button>
              <Button size="small" variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters} disabled={!globalFilter && Object.keys(columnFilters).length === 0}>
                Clear Filters
              </Button>
              {selectedRows.size > 0 && (
                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteSelected} disabled={isViewMode}>
                  Delete Selected ({selectedRows.size})
                </Button>
              )}
            </Stack>
          </Toolbar>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {isAddingProduct ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <LocalFireDepartment sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              <Typography variant="body1" sx={{ ml: 2 }} color="primary">
                Adding product...
              </Typography>
            </Box>
          ) : filteredRows.length > 0 ? (
            <>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  maxHeight: 500,
                  borderRadius: 0,
                  border: "none",
                  "& ::-webkit-scrollbar": {
                    width: "12px",
                    height: "12px",
                  },
                  "& ::-webkit-scrollbar-track": {
                    borderRadius: "6px",
                  },
                  "& ::-webkit-scrollbar-thumb": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.6),
                    borderRadius: "6px",
                    border: `2px solid ${alpha(theme.palette.background.paper, 1)}`,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.8),
                    },
                  },
                  scrollbarWidth: "thin",
                }}
              >
                <Table stickyHeader size="small" sx={{ minWidth: 1600 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          fontWeight: "700",
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          fontSize: "0.875rem",
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.size === paginatedRows.length && paginatedRows.length > 0}
                          indeterminate={selectedRows.size > 0 && selectedRows.size < paginatedRows.length}
                          onChange={handleSelectAllClick}
                          size="small"
                          disabled={isViewMode}
                        />
                      </TableCell>
                      <TableCell align="center">Sl. No</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <TableSortLabel
                          active={sortField === "supplierName"}
                          direction={sortField === "supplierName" ? sortDirection : "asc"}
                          onClick={() => handleSortColumn("supplierName")}
                        >
                          Supplier
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        <TableSortLabel active={sortField === "grnCode"} direction={sortField === "grnCode" ? sortDirection : "asc"} onClick={() => handleSortColumn("grnCode")}>
                          GRN No.
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        <TableSortLabel active={sortField === "grnDate"} direction={sortField === "grnDate" ? sortDirection : "asc"} onClick={() => handleSortColumn("grnDate")}>
                          GRN Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        <TableSortLabel
                          active={sortField === "invoiceNo"}
                          direction={sortField === "invoiceNo" ? sortDirection : "asc"}
                          onClick={() => handleSortColumn("invoiceNo")}
                        >
                          INV No.
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ minWidth: 200 }}>
                        <TableSortLabel
                          active={sortField === "productName"}
                          direction={sortField === "productName" ? sortDirection : "asc"}
                          onClick={() => handleSortColumn("productName")}
                        >
                          Product Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ minWidth: 80 }}>
                        <TableSortLabel active={sortField === "hsnCode"} direction={sortField === "hsnCode" ? sortDirection : "asc"} onClick={() => handleSortColumn("hsnCode")}>
                          HSN Code
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <TableSortLabel
                          active={sortField === "manufacturerName"}
                          direction={sortField === "manufacturerName" ? sortDirection : "asc"}
                          onClick={() => handleSortColumn("manufacturerName")}
                        >
                          Manufacturer
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        <TableSortLabel active={sortField === "batchNo"} direction={sortField === "batchNo" ? sortDirection : "asc"} onClick={() => handleSortColumn("batchNo")}>
                          Batch No.
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 80 }}>
                        <TableSortLabel active={sortField === "recvdQty"} direction={sortField === "recvdQty" ? sortDirection : "asc"} onClick={() => handleSortColumn("recvdQty")}>
                          GRN Qty
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 80 }}>
                        <TableSortLabel
                          active={sortField === "availableQty"}
                          direction={sortField === "availableQty" ? sortDirection : "asc"}
                          onClick={() => handleSortColumn("availableQty")}
                        >
                          QOH
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Return Qty</TableCell>
                      <TableCell sx={{ minWidth: 110 }}>
                        <TableSortLabel
                          active={sortField === "expiryDate"}
                          direction={sortField === "expiryDate" ? sortDirection : "asc"}
                          onClick={() => handleSortColumn("expiryDate")}
                        >
                          Expiry Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 100 }}>
                        <TableSortLabel
                          active={sortField === "unitPrice"}
                          direction={sortField === "unitPrice" ? sortDirection : "asc"}
                          onClick={() => handleSortColumn("unitPrice")}
                        >
                          Unit Price
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 120 }}>
                        <TableSortLabel
                          active={sortField === "totalAmount"}
                          direction={sortField === "totalAmount" ? sortDirection : "asc"}
                          onClick={() => handleSortColumn("totalAmount")}
                        >
                          Return Amount
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 80 }}>
                        <TableSortLabel active={sortField === "tax"} direction={sortField === "tax" ? sortDirection : "asc"} onClick={() => handleSortColumn("tax")}>
                          GST %
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 80 }}>
                        CGST %
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 80 }}>
                        SGST %
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <TableSortLabel
                          active={sortField === "returnReason"}
                          direction={sortField === "returnReason" ? sortDirection : "asc"}
                          onClick={() => handleSortColumn("returnReason")}
                        >
                          Return Reason
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center" sx={{ minWidth: 80 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                    {showColumnFilters && (
                      <TableRow
                        sx={{
                          "& th": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            position: "sticky",
                            top: 57,
                            zIndex: 9,
                            padding: "4px 8px",
                          },
                        }}
                      >
                        <TableCell padding="checkbox"></TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                          <ColumnFilter columnId="supplierName" label="Supplier" />
                        </TableCell>
                        <TableCell>
                          <ColumnFilter columnId="grnCode" label="GRN No." />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                          <ColumnFilter columnId="invoiceNo" label="Invoice" />
                        </TableCell>
                        <TableCell>
                          <ColumnFilter columnId="productName" label="Product" />
                        </TableCell>
                        <TableCell>
                          <ColumnFilter columnId="hsnCode" label="HSN" />
                        </TableCell>
                        <TableCell>
                          <ColumnFilter columnId="manufacturerName" label="Manufacturer" />
                        </TableCell>
                        <TableCell>
                          <ColumnFilter columnId="batchNo" label="Batch" />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                          <ColumnFilter columnId="returnReason" label="Reason" />
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((row, index) => {
                      const isSelected = selectedRows.has(row.id);
                      const warning = getExpiryWarning(row.expiryDate);

                      return (
                        <TableRow
                          key={row.id}
                          hover
                          selected={isSelected}
                          sx={{
                            bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : "inherit",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                            },
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected} onChange={() => handleSelectRow(row.id)} size="small" disabled={isViewMode} />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={500}>
                              {page * rowsPerPage + index + 1}
                            </Typography>
                          </TableCell>
                          <TableCell>{row.supplierName}</TableCell>
                          <TableCell>{row.grnCode}</TableCell>
                          <TableCell>{row.grnDate ? new Date(row.grnDate).toLocaleDateString() : ""}</TableCell>
                          <TableCell>{row.invoiceNo}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {row.productName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {row.productCode}
                            </Typography>
                          </TableCell>
                          <TableCell>{row.hsnCode}</TableCell>
                          <TableCell>{row.manufacturerName}</TableCell>
                          <TableCell>{row.batchNo}</TableCell>
                          <TableCell align="right">{row.recvdQty}</TableCell>
                          <TableCell align="right">{row.availableQty}</TableCell>

                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={quantities[row.id] || 0}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                handleQuantityChange(row.id, value);
                              }}
                              sx={{ width: "100px" }}
                              inputProps={{
                                style: { textAlign: "right" },
                              }}
                              disabled={isViewMode}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                color: warning === "expired" ? "error.main" : warning === "warning" ? "warning.main" : "inherit",
                              }}
                            >
                              {row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : ""}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">₹{(row.unitPrice || 0).toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontWeight: 500 }}>₹{(row.totalAmount || 0).toFixed(2)}</Typography>
                          </TableCell>
                          <TableCell align="right">{(row.tax || 0).toFixed(2)}%</TableCell>
                          <TableCell align="right">{(row.cgst || 0).toFixed(2)}%</TableCell>
                          <TableCell align="right">{(row.sgst || 0).toFixed(2)}%</TableCell>
                          <TableCell>{row.returnReason}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Remove from Return">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const rowIndex = fields.findIndex((field) => field.id === row.id);
                                  remove(rowIndex);
                                  showAlert("Info", `Product "${row.productName}" removed from return`, "info");
                                }}
                                disabled={isViewMode}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                component="div"
                count={filteredRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                sx={{
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              />
            </>
          ) : (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                m: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  mx: "auto",
                  mb: 2,
                }}
              >
                <ReturnIcon sx={{ fontSize: 32, color: alpha(theme.palette.primary.main, 0.7) }} />
              </Box>
              <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom>
                {globalFilter || Object.keys(columnFilters).length > 0 ? "No products match your filters" : "No Products Added for Return"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: "auto" }}>
                {globalFilter || Object.keys(columnFilters).length > 0
                  ? "Try adjusting your search criteria or clearing the filters to see more results."
                  : `Use the search above to add products for ${getReturnTypeLabel()}.`}
              </Typography>
              {(globalFilter || Object.keys(columnFilters).length > 0) && (
                <Button variant="outlined" onClick={handleClearFilters} sx={{ mt: 2 }} startIcon={<ClearIcon />}>
                  Clear All Filters
                </Button>
              )}
            </Paper>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Return Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ sm: 3, xs: 6 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" color="primary">
                {statistics.totalProducts}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Products
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ sm: 3, xs: 6 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" color="info.main">
                {statistics.totalReturnQuantity}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Return Qty
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ sm: 3, xs: 6 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" color={statistics.expiredItems > 0 ? "error.main" : "text.primary"}>
                {statistics.expiredItems}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Expired Items
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ sm: 3, xs: 6 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" color={statistics.zeroQohItems > 0 ? "warning.main" : "text.primary"}>
                {statistics.zeroQohItems}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Zero Stock
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <BatchSelectionDialog open={isBatchSelectionDialogOpen} onClose={closeBatchDialog} onSelect={() => {}} data={availableBatches} />
    </>
  );
};

export default StockReturnProductSection;
