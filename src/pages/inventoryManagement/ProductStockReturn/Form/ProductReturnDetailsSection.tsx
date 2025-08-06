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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  invoiceNo: z.string().optional(),
  recvdQty: z.number().optional(),
  invDate: z.string().optional(),
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

const TablePaginationActions: React.FC<TablePaginationActionsProps> = ({ count, page, rowsPerPage, onPageChange }) => {
  const theme = useTheme();
  const maxPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1);

  const handleClick = (newPage: number) => (event: React.MouseEvent<HTMLButtonElement>) => onPageChange(event, newPage);

  const iconButtonStyle = {
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
  };

  const buttons = [
    { onClick: handleClick(0), disabled: page === 0, icon: theme.direction === "rtl" ? <LastPage /> : <FirstPage />, title: "First page" },
    { onClick: handleClick(page - 1), disabled: page === 0, icon: theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />, title: "Previous page" },
    { onClick: handleClick(page + 1), disabled: page >= maxPage, icon: theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />, title: "Next page" },
    { onClick: handleClick(maxPage), disabled: page >= maxPage, icon: theme.direction === "rtl" ? <FirstPage /> : <LastPage />, title: "Last page" },
  ];

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5, display: "flex", alignItems: "center", gap: 0.5 }}>
      {buttons.map((btn, idx) => (
        <Tooltip key={idx} title={btn.title}>
          <span>
            <IconButton onClick={btn.onClick} disabled={btn.disabled} size="small" sx={iconButtonStyle}>
              {React.cloneElement(btn.icon, { fontSize: "small" })}
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Box>
  );
};

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
  const grnProductSearchRef = useRef<GrnProductSearchRef>(null);

  // Consolidated state
  const [state, setState] = useState({
    selectedGrnProduct: null as GrnProductSearchResult | null,
    selectedQuantity: undefined as number | undefined,
    isAddingProduct: false,
    isLoadingBatches: false,
    editingProductIndex: null as number | null,
    isEditingExistingProduct: false,
    grnProductSearchSelection: null as any,
    grnProductSearchInputValue: "",
    clearGrnProductSearchTrigger: 0,
    returnReason: "",
    page: 0,
    rowsPerPage: 10,
    selectedRows: new Set<string | number>(),
    globalFilter: "",
    columnFilters: {} as Record<string, string>,
    sortField: "",
    sortDirection: "asc" as "asc" | "desc",
    showColumnFilters: false,
    viewType: "all" as "all" | "expired" | "nonExpired",
    isRefreshing: false,
    quantities: {} as { [key: string]: number },
  });

  const updateState = (updates: Partial<typeof state>) => setState((prev) => ({ ...prev, ...updates }));

  const watchedDetails = useWatch({ control, name: "productStockReturnDetails" });
  const fromDeptID = useWatch({ control, name: "fromDeptID" });
  const returnTypeCode = useWatch({ control, name: "returnTypeCode" });
  const { isDialogOpen: isBatchSelectionDialogOpen, availableBatches, closeDialog: closeBatchDialog } = useBatchSelection();

  // Effects
  useEffect(() => {
    const newQuantities = Object.fromEntries(fields.map((field) => [field.id, field.quantity || 0]));
    updateState({ quantities: newQuantities });
  }, [fields]);

  useEffect(() => {
    const currentQuantities = Object.fromEntries(watchedDetails?.map((detail, index) => [fields[index]?.id, detail.quantity || 0]).filter(([id]) => id) || []);
    const hasChanges = Object.keys(currentQuantities).some((key) => currentQuantities[key] !== state.quantities[key]);
    if (hasChanges) updateState({ quantities: currentQuantities });
  }, [watchedDetails, fields, state.quantities]);

  // Utility functions
  const clearTemporaryFields = useCallback(() => {
    updateState({
      selectedGrnProduct: null,
      selectedQuantity: undefined,
      isAddingProduct: false,
      isLoadingBatches: false,
      editingProductIndex: null,
      isEditingExistingProduct: false,
      grnProductSearchSelection: null,
      grnProductSearchInputValue: "",
      returnReason: "",
      clearGrnProductSearchTrigger: state.clearGrnProductSearchTrigger + 1,
    });
  }, [state.clearGrnProductSearchTrigger]);

  const mapGrnProductToReturnDetail = useCallback(
    (grnProduct: GrnProductSearchResult, quantity = 0, reason = ""): ProductStockReturnDetailDto =>
      ({
        psrdID: 0,
        psrID: 0,
        productID: grnProduct.productID,
        productName: grnProduct.productName || "",
        quantity: Math.max(quantity, 0),
        unitPrice: grnProduct.unitPrice || 0,
        totalAmount: Math.max(quantity, 0) * (grnProduct.unitPrice || 0),
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
        invoiceNo: grnProduct.invoiceNo || "",
        recvdQty: grnProduct.recvdQty || 0,
      } as ProductStockReturnDetailDto),
    []
  );

  const getDefaultReasonByReturnType = (type: string): string =>
    ({
      [ReturnType.Supplier]: "Quality issues - returning to supplier",
      [ReturnType.Internal]: "Department transfer adjustment",
      [ReturnType.Expired]: "Item has reached expiry date",
      [ReturnType.Damaged]: "Item damaged in storage",
    }[type] || "Stock adjustment");

  const getReturnTypeLabel = () =>
    ({
      [ReturnType.Supplier]: "Supplier Return",
      [ReturnType.Internal]: "Internal Transfer Return",
      [ReturnType.Expired]: "Expired Items Return",
      [ReturnType.Damaged]: "Damaged Items Return",
    }[returnTypeCode] || "Product Return");

  const getExpiryWarning = (expiryDate?: Date) => {
    if (!expiryDate) return null;
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? "expired" : diffDays <= 30 ? "warning" : null;
  };

  // Event handlers
  const handleQuantityChange = useCallback(
    (rowId: string | number, value: number) => {
      updateState({ quantities: { ...state.quantities, [rowId]: value } });
      const rowIndex = fields.findIndex((field) => field.id === rowId);
      if (rowIndex !== -1) {
        setValue(`productStockReturnDetails.${rowIndex}.quantity`, value, { shouldValidate: true, shouldDirty: true });
        setValue(`productStockReturnDetails.${rowIndex}.totalAmount`, value * (fields[rowIndex].unitPrice || 0), { shouldValidate: true, shouldDirty: true });
      }
    },
    [fields, setValue, state.quantities]
  );

  const handleGrnProductSelect = useCallback(
    async (grnProduct: GrnProductSearchResult | null) => {
      if (!grnProduct?.productID) return clearTemporaryFields();
      if (!fromDeptID) return showAlert("Warning", "Please select a department first for the return", "warning");
      if (!state.isEditingExistingProduct && fields.find((d) => d.productID === grnProduct.productID && d.batchNo === grnProduct.batchNo)) {
        showAlert("Warning", `"${grnProduct.productName}" with batch "${grnProduct.batchNo}" is already added to the return list.`, "warning");
        return grnProductSearchRef.current?.clearSelection();
      }

      try {
        updateState({ selectedGrnProduct: grnProduct, isAddingProduct: true, isLoadingBatches: true });
        const newProductDetail = mapGrnProductToReturnDetail(grnProduct, state.selectedQuantity || 0, state.returnReason || getDefaultReasonByReturnType(returnTypeCode));

        if (state.isEditingExistingProduct && state.editingProductIndex !== null) {
          setValue(`productStockReturnDetails.${state.editingProductIndex}`, newProductDetail, { shouldValidate: true, shouldDirty: true });
          showAlert("Success", `Return product "${grnProduct.productName}" updated successfully`, "success");
        } else {
          append(newProductDetail);
          showAlert("Success", `Product "${grnProduct.productName}" Batch: ${grnProduct.batchNo}`, "success");
        }
        clearTemporaryFields();
      } catch (error) {
        showAlert("Error", "Failed to add GRN product for return. Please try again.", "error");
        clearTemporaryFields();
      } finally {
        updateState({ isAddingProduct: false, isLoadingBatches: false });
      }
    },
    [
      state.selectedQuantity,
      state.returnReason,
      returnTypeCode,
      state.isEditingExistingProduct,
      state.editingProductIndex,
      append,
      setValue,
      showAlert,
      clearTemporaryFields,
      mapGrnProductToReturnDetail,
      fields,
      fromDeptID,
    ]
  );

  // Statistics and filtering
  const statistics = useMemo(() => {
    const totalProducts = watchedDetails?.length || 0;
    const totalReturnQuantity = watchedDetails?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const expiredItems = watchedDetails?.filter((item) => item.expiryDate && new Date(item.expiryDate) < new Date()).length || 0;
    const zeroQohItems = watchedDetails?.filter((item) => (item.availableQty || 0) === 0).length || 0;
    return { totalProducts, totalReturnQuantity, expiredItems, zeroQohItems };
  }, [watchedDetails]);

  const filteredRows = useMemo(() => {
    let filtered = [...fields];

    if (state.viewType === "expired") {
      filtered = filtered.filter((row) => row.expiryDate && new Date(row.expiryDate) < new Date());
    } else if (state.viewType === "nonExpired") {
      filtered = filtered.filter((row) => !row.expiryDate || new Date(row.expiryDate) >= new Date());
    }

    if (state.globalFilter) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) => (typeof value === "string" || typeof value === "number") && String(value).toLowerCase().includes(state.globalFilter.toLowerCase()))
      );
    }

    Object.entries(state.columnFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) => {
          const rowValue = row[key as keyof typeof row];
          return rowValue && String(rowValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    if (state.sortField) {
      filtered.sort((a, b) => {
        const aValue = a[state.sortField as keyof typeof a];
        const bValue = b[state.sortField as keyof typeof b];
        if (!aValue && !bValue) return 0;
        if (!aValue) return state.sortDirection === "asc" ? -1 : 1;
        if (!bValue) return state.sortDirection === "asc" ? 1 : -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return state.sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return state.sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
        }
        return state.sortDirection === "asc" ? (aValue < bValue ? -1 : 1) : bValue < aValue ? -1 : 1;
      });
    }

    return filtered;
  }, [fields, state.viewType, state.globalFilter, state.columnFilters, state.sortField, state.sortDirection]);

  const paginatedRows = useMemo(() => {
    const startIndex = state.page * state.rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + state.rowsPerPage);
  }, [filteredRows, state.page, state.rowsPerPage]);

  // Pagination and table handlers
  const handleChangePage = useCallback((event: unknown, newPage: number) => updateState({ page: newPage }), []);
  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ rowsPerPage: parseInt(event.target.value, 10), page: 0 });
  }, []);

  const handleColumnFilterChange = useCallback(
    (columnId: string, value: string) => {
      updateState({ columnFilters: { ...state.columnFilters, [columnId]: value }, page: 0 });
    },
    [state.columnFilters]
  );

  const handleGlobalFilterChange = useCallback((value: string) => updateState({ globalFilter: value, page: 0 }), []);
  const handleClearFilters = useCallback(() => updateState({ columnFilters: {}, globalFilter: "", page: 0 }), []);

  const handleRefresh = useCallback(async () => {
    updateState({ isRefreshing: true });
    await new Promise((resolve) => setTimeout(resolve, 800));
    updateState({ isRefreshing: false });
    showAlert("Success", "Data refreshed successfully", "success");
  }, [showAlert]);

  const handleSortColumn = useCallback(
    (columnId: string) => {
      if (state.sortField === columnId) {
        updateState({ sortDirection: state.sortDirection === "asc" ? "desc" : "asc" });
      } else {
        updateState({ sortField: columnId, sortDirection: "asc" });
      }
    },
    [state.sortField, state.sortDirection]
  );

  const handleSelectAllClick = useCallback(() => {
    updateState({ selectedRows: state.selectedRows.size === paginatedRows.length ? new Set() : new Set(paginatedRows.map((row) => row.id)) });
  }, [paginatedRows, state.selectedRows.size]);

  const handleSelectRow = useCallback(
    (id: string | number) => {
      const newSet = new Set(state.selectedRows);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      updateState({ selectedRows: newSet });
    },
    [state.selectedRows]
  );

  const handleDeleteSelected = useCallback(() => {
    if (state.selectedRows.size === 0) return;
    const rowsToKeep = fields.filter((field) => !state.selectedRows.has(field.id));
    const deletedCount = state.selectedRows.size;

    rowsToKeep.forEach((row, i) => setValue(`productStockReturnDetails.${i}`, row));
    for (let i = fields.length - 1; i >= rowsToKeep.length; i--) remove(i);

    updateState({ selectedRows: new Set() });
    showAlert("Success", `${deletedCount} items removed from return list`, "success");
  }, [fields, remove, state.selectedRows, setValue, showAlert]);

  // Component helpers
  const ColumnFilter: React.FC<{ columnId: string; label: string }> = ({ columnId, label }) => (
    <TextField
      size="small"
      placeholder={`Filter ${label}...`}
      value={state.columnFilters[columnId] || ""}
      onChange={(e) => handleColumnFilterChange(columnId, e.target.value)}
      InputProps={{ sx: { fontSize: "0.75rem", "& .MuiOutlinedInput-input": { padding: "4px 8px" } } }}
      sx={{ width: "100%", minWidth: "120px", "& .MuiOutlinedInput-root": { backgroundColor: alpha(theme.palette.background.paper, 0.8) } }}
    />
  );

  const tableColumns = [
    { id: "grnDate", label: "GRN Date", sortable: true, minWidth: 100 },
    { id: "invoiceNo", label: "INV No.", sortable: true, minWidth: 100, filterable: true },
    { id: "productName", label: "Product Name", sortable: true, minWidth: 200, filterable: true },
    { id: "hsnCode", label: "HSN Code", sortable: true, minWidth: 80, filterable: true },
    { id: "manufacturerName", label: "Manufacturer", sortable: true, minWidth: 120, filterable: true },
    { id: "batchNo", label: "Batch No.", sortable: true, minWidth: 100, filterable: true },
    { id: "recvdQty", label: "GRN Qty", sortable: true, minWidth: 80, align: "right" },
    { id: "availableQty", label: "QOH", sortable: true, minWidth: 80, align: "right" },
    { id: "quantity", label: "Return Qty", minWidth: 120 },
    { id: "expiryDate", label: "Expiry Date", sortable: true, minWidth: 110 },
    { id: "unitPrice", label: "Unit Price", sortable: true, minWidth: 100, align: "right" },
    { id: "totalAmount", label: "Return Amount", sortable: true, minWidth: 120, align: "right" },
    { id: "tax", label: "GST %", sortable: true, minWidth: 80, align: "right" },
    { id: "cgst", label: "CGST %", minWidth: 80, align: "right" },
    { id: "sgst", label: "SGST %", minWidth: 80, align: "right" },
    { id: "returnReason", label: "Return Reason", sortable: true, minWidth: 150, filterable: true },
  ];

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
                clearTrigger={state.clearGrnProductSearchTrigger}
                label={`Search GRN Product for ${returnTypeCode} Return`}
                placeholder={fromDeptID ? "Search by product name, code, or batch..." : "Select department first..."}
                disabled={isViewMode || state.isAddingProduct || !fromDeptID}
                initialSelection={state.grnProductSearchSelection}
                setInputValue={(value) => updateState({ grnProductSearchInputValue: value })}
                setSelectedProduct={(product) => updateState({ grnProductSearchSelection: product })}
                approvedGrnsOnly={true}
                availableStockOnly={true}
              />
              {state.isAddingProduct && (
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
                value={state.selectedQuantity || ""}
                onChange={(e) => updateState({ selectedQuantity: parseFloat(e.target.value) || undefined })}
                disabled={isViewMode || !state.selectedGrnProduct || state.isAddingProduct}
                size="small"
                fullWidth
                inputProps={{ min: 1, max: state.selectedGrnProduct?.availableQty, step: 1 }}
                placeholder="Qty"
                helperText={state.selectedGrnProduct ? `Avail: ${state.selectedGrnProduct.availableQty}` : ""}
              />
            </Grid>

            <Grid size={{ sm: 6, md: 4 }}>
              <TextField
                label="Return Reason"
                value={state.returnReason}
                onChange={(e) => updateState({ returnReason: e.target.value })}
                disabled={isViewMode || !state.selectedGrnProduct || state.isAddingProduct}
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
          "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}>
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
                {state.viewType === "all" ? "All products" : state.viewType === "expired" ? "Expired products" : "Non-expired products"}
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
              {state.selectedRows.size > 0 && <Chip label={`${state.selectedRows.size} Selected`} variant="filled" color="secondary" size="small" sx={{ fontWeight: "600" }} />}
            </Box>
          </Box>

          <Toolbar variant="dense" sx={{ pl: 0, pr: 0, minHeight: "auto !important", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <OutlinedInput
                value={state.globalFilter}
                onChange={(e) => handleGlobalFilterChange(e.target.value)}
                placeholder="Search all columns..."
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                }
                endAdornment={
                  state.globalFilter && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleGlobalFilterChange("")}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }
                sx={{ "& .MuiOutlinedInput-root": { backgroundColor: theme.palette.background.paper } }}
              />
            </FormControl>

            <Tabs
              value={state.viewType}
              onChange={(_, newValue) => {
                updateState({ viewType: newValue, page: 0 });
              }}
            >
              {[
                { value: "all", label: "All Products", count: fields.length },
                { value: "expired", label: "Expired", count: fields.filter((row) => row.expiryDate && new Date(row.expiryDate) < new Date()).length, color: "error" },
                { value: "nonExpired", label: "Non-Expired", count: fields.filter((row) => !row.expiryDate || new Date(row.expiryDate) >= new Date()).length, color: "success" },
              ].map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{tab.label}</span>
                      <Chip label={tab.count} size="small" color={"primary"} sx={{ height: 18, minWidth: 24 }} />
                    </Box>
                  }
                />
              ))}
            </Tabs>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => updateState({ showColumnFilters: !state.showColumnFilters })}
                color={state.showColumnFilters ? "primary" : "inherit"}
              >
                Filters
              </Button>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={state.isRefreshing}>
                {state.isRefreshing ? <CircularProgress size={16} /> : "Refresh"}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={!state.globalFilter && Object.keys(state.columnFilters).length === 0}
              >
                Clear Filters
              </Button>
              {state.selectedRows.size > 0 && (
                <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteSelected} disabled={isViewMode}>
                  Delete Selected ({state.selectedRows.size})
                </Button>
              )}
            </Stack>
          </Toolbar>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {state.isAddingProduct ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
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
                  "& ::-webkit-scrollbar": { width: "12px", height: "12px" },
                  "& ::-webkit-scrollbar-track": { borderRadius: "6px" },
                  "& ::-webkit-scrollbar-thumb": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.6),
                    borderRadius: "6px",
                    border: `2px solid ${alpha(theme.palette.background.paper, 1)}`,
                    "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.8) },
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
                          checked={state.selectedRows.size === paginatedRows.length && paginatedRows.length > 0}
                          indeterminate={state.selectedRows.size > 0 && state.selectedRows.size < paginatedRows.length}
                          onChange={handleSelectAllClick}
                          size="small"
                          disabled={isViewMode}
                        />
                      </TableCell>
                      <TableCell align="center">Sl. No</TableCell>
                      {tableColumns.map((col) => (
                        <TableCell key={col.id} align={"left"} sx={{ minWidth: col.minWidth }}>
                          {col.sortable ? (
                            <TableSortLabel
                              active={state.sortField === col.id}
                              direction={state.sortField === col.id ? state.sortDirection : "asc"}
                              onClick={() => handleSortColumn(col.id)}
                            >
                              {col.label}
                            </TableSortLabel>
                          ) : (
                            col.label
                          )}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ minWidth: 80 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                    {state.showColumnFilters && (
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
                        {tableColumns.map((col) => (
                          <TableCell key={col.id}>{col.filterable && <ColumnFilter columnId={col.id} label={col.label} />}</TableCell>
                        ))}
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableHead>
                  <TableBody>
                    {paginatedRows.map((row, index) => {
                      const isSelected = state.selectedRows.has(row.id);
                      const warning = getExpiryWarning(row.expiryDate);
                      const currentQuantity = state.quantities[row.id] || row.quantity || 0;

                      return (
                        <TableRow
                          key={row.id}
                          hover
                          selected={isSelected}
                          sx={{ bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : "inherit", "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected} onChange={() => handleSelectRow(row.id)} size="small" disabled={isViewMode} />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={500}>
                              {state.page * state.rowsPerPage + index + 1}
                            </Typography>
                          </TableCell>
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
                              value={currentQuantity}
                              onChange={(e) => handleQuantityChange(row.id, parseInt(e.target.value) || 0)}
                              sx={{ width: "100px" }}
                              inputProps={{ style: { textAlign: "right" }, min: 0, max: row.availableQty }}
                              disabled={isViewMode}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: warning === "expired" ? "error.main" : warning === "warning" ? "warning.main" : "inherit" }}>
                              {row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : ""}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">₹{(row.unitPrice || 0).toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontWeight: 500 }}>₹{(currentQuantity * (row.unitPrice || 0)).toFixed(2)}</Typography>
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
                                  updateState({ quantities: Object.fromEntries(Object.entries(state.quantities).filter(([key]) => key !== row.id)) });
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
                rowsPerPage={state.rowsPerPage}
                page={state.page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
                sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}
              />
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2, border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`, m: 2 }}>
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
                {state.globalFilter || Object.keys(state.columnFilters).length > 0 ? "No products match your filters" : "No Products Added for Return"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: "auto" }}>
                {state.globalFilter || Object.keys(state.columnFilters).length > 0
                  ? "Try adjusting your search criteria or clearing the filters to see more results."
                  : `Use the search above to add products for ${getReturnTypeLabel()}.`}
              </Typography>
              {(state.globalFilter || Object.keys(state.columnFilters).length > 0) && (
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
          {[
            { label: "Total Products", value: statistics.totalProducts, color: "primary" },
            { label: "Total Return Qty", value: statistics.totalReturnQuantity, color: "info.main" },
            { label: "Expired Items", value: statistics.expiredItems, color: statistics.expiredItems > 0 ? "error.main" : "text.primary" },
            { label: "Zero Stock", value: statistics.zeroQohItems, color: statistics.zeroQohItems > 0 ? "warning.main" : "text.primary" },
          ].map((stat, index) => (
            <Grid key={index} size={{ sm: 3, xs: 6 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <BatchSelectionDialog open={isBatchSelectionDialogOpen} onClose={closeBatchDialog} onSelect={() => {}} data={availableBatches} />
    </>
  );
};

export default StockReturnProductSection;
