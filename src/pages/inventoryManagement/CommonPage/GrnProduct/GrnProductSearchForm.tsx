import { useGrnProductSearch } from "@/hooks/InventoryManagement/Product/useGrnProductSearch";
import { GrnProductOption } from "@/interfaces/InventoryManagement/Product/GrnProductSearch.interface";
import { Alert, Autocomplete, Box, CircularProgress, TextField, Typography } from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle } from "react";

export interface GrnProductSearchProps {
  onProductSelect: (product: any | null) => void;
  clearTrigger?: number;
  departmentId?: number;
  approvedGrnsOnly?: boolean;
  availableStockOnly?: boolean;
  minSearchLength?: number;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  initialSelection?: any;
  className?: string;
  showGrnInfo?: boolean;
  showBatchInfo?: boolean;
  setInputValue?: (value: string) => void;
  setSelectedProduct?: (product: any | null) => void;
}

export interface GrnProductSearchRef {
  clearSelection: () => void;
}

export const GrnProductSearch = forwardRef<GrnProductSearchRef, GrnProductSearchProps>(
  (
    {
      onProductSelect,
      clearTrigger = 0,
      departmentId,
      approvedGrnsOnly = true,
      availableStockOnly = true,
      minSearchLength = 2,
      label = "Search GRN Product",
      placeholder = "Enter product name, code, or batch number",
      disabled = false,
      initialSelection = null,
      className = "",
      showGrnInfo = true,
      showBatchInfo = true,
      setInputValue,
      setSelectedProduct,
    },
    ref
  ) => {
    const {
      inputValue,
      setInputValue: hookSetInputValue,
      options,
      isLoading,
      selectedProduct,
      setSelectedProduct: hookSetSelectedProduct,
      clearSearch,
      error,
    } = useGrnProductSearch({
      departmentId,
      minSearchLength,
      approvedGrnsOnly,
      availableStockOnly,
    });

    useImperativeHandle(ref, () => ({
      clearSelection: () => {
        clearSearch();
        setInputValue?.("");
        setSelectedProduct?.(null);
      },
    }));

    useEffect(() => {
      if (clearTrigger > 0) {
        clearSearch();
      }
    }, [clearTrigger, clearSearch]);

    useEffect(() => {
      if (initialSelection && !selectedProduct) {
        setSelectedProduct?.(initialSelection);
      }
    }, [initialSelection]);

    const handleProductSelect = (product: GrnProductOption | null) => {
      setSelectedProduct?.(product);

      if (product) {
        onProductSelect({
          productID: product.productID,
          productCode: product.productCode || "",
          productName: product.productName || "",
          catValue: product.productCategory || "",
          catDesc: product.productCategory || "",
          mfName: product.mfName || product.manufacturerName || "",
          batchNo: product.batchNo || "",
          expiryDate: product.expiryDate,
          unitPrice: product.unitPrice || 0,
          availableQty: product.availableQty || 0,
          grnDetID: product.grnDetID,
          grnID: product.grnID,
          grnCode: product.grnCode || "",
          grnDate: product.grnDate,
          deptID: product.deptID,
          deptName: product.deptName || "",
          supplierName: product.supplierName || product.supplrName || "",
          rActiveYN: product.rActiveYN || "Y",
          hsnCode: product.hsnCode || "",
          recvdQty: product.recvdQty || 0,
          invoiceNo: product.invoiceNo || "",
          tax: product.tax || 0,
          sellUnitPrice: product.sellUnitPrice || 0,
          // manufacturerID: product.manufacturerID || 0,
          manufacturerName: product.manufacturerName || "",
          supplierID: product.supplierID || product.supplrID || 0,
          supplrID: product.supplrID || 0,
          supplrName: product.supplrName || "",
        });
      } else {
        onProductSelect(null);
      }
    };

    return (
      <Box>
        <Autocomplete
          id="grn-product-search-autocomplete"
          options={options}
          loading={isLoading}
          value={selectedProduct}
          inputValue={inputValue}
          onChange={(_, newValue) => handleProductSelect(newValue)}
          onInputChange={(_, newInputValue) => hookSetInputValue(newInputValue)}
          getOptionLabel={(option) => option.productName || ""}
          isOptionEqualToValue={(option, value) => option.productID === value.productID && option.batchNo === value.batchNo && option.grnDetID === value.grnDetID}
          renderInput={(params) => (
            <TextField
              {...params}
              inputProps={{
                ...params.inputProps,
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              InputLabelProps={{
                className: params.InputLabelProps?.className || "",
              }}
              label={label}
              variant="outlined"
              size="small"
              placeholder={placeholder}
              disabled={disabled}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box>
                <Typography variant="body1">
                  {option.productName} ({option.productCode})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.batchNo ? `Batch: ${option.batchNo}` : "No Batch"} |{showGrnInfo && ` GRN: ${option.grnCode || "N/A"}`} | Rcvd Qty: {option.recvdQty || 0} | Avail:{" "}
                  {option.availableQty || 0}
                </Typography>
              </Box>
            </li>
          )}
          noOptionsText={
            !departmentId
              ? "Please select a department first"
              : inputValue.length < minSearchLength
              ? `Type at least ${minSearchLength} characters to search`
              : isLoading
              ? "Searching..."
              : "No GRN products found"
          }
          fullWidth
          size="small"
          disabled={disabled || !departmentId}
          className={className}
        />

        {/* Error Alert */}
        {error && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        {/* Department context info */}
        {!departmentId && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Please select a department to search for GRN products.
          </Alert>
        )}

        {/* Search context info */}
        {departmentId && options.length > 0 && inputValue.length >= minSearchLength && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Found {options.length} product(s) from GRN records
            {approvedGrnsOnly && " (approved GRNs only)"}
            {availableStockOnly && " (with available stock)"}
          </Typography>
        )}
      </Box>
    );
  }
);

GrnProductSearch.displayName = "GrnProductSearch";
