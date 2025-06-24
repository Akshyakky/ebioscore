// Updated ProductSearchForm.tsx - Enhanced version with better clear mechanism

import { useProductSearch } from "@/hooks/InventoryManagement/Product/useProductSearch";
import { ProductOption } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { Autocomplete, Box, CircularProgress, TextField, Typography } from "@mui/material";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { ProductSearchProps } from "./ProductSearchProps";

export interface ProductSearchRef {
  clearSelection: () => void;
}

export const ProductSearch = forwardRef<ProductSearchRef, ProductSearchProps>(
  (
    {
      onProductSelect,
      clearTrigger = 0,
      minSearchLength = 2,
      label = "Search Product",
      placeholder = "Enter product name or code",
      disabled = false,
      initialSelection = null,
      className = "",
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
    } = useProductSearch({ minSearchLength });

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

    const handleProductSelect = (product: ProductOption | null) => {
      debugger;
      setSelectedProduct?.(product);

      if (product) {
        onProductSelect({
          productID: product.productID,
          productCode: product.productCode || "",
          productName: product.productName || "",
          catValue: product.productCategory || "",
          prescription: "",
          expiry: "",
          sellable: "",
          taxable: "",
          pLocationID: 0,
          chargableYN: "",
          isAssetYN: "",
          supplierStatus: product.rActiveYN,
          vedCode: "",
          abcCode: "",
          transferYN: "",
          rActiveYN: product.rActiveYN || "",
        });
      } else {
        onProductSelect(null);
      }
    };

    return (
      <Autocomplete
        id="product-search-autocomplete"
        options={options}
        loading={isLoading}
        value={selectedProduct}
        inputValue={inputValue}
        onChange={(_, newValue) => handleProductSelect(newValue)}
        onInputChange={(_, newInputValue) => hookSetInputValue(newInputValue)}
        getOptionLabel={(option) => option.productName || ""}
        isOptionEqualToValue={(option, value) => option.productID === value.productID}
        renderInput={(params) => (
          <TextField
            {...params}
            inputProps={params.inputProps}
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
                {option.productCategory ? `Category: ${option.productCategory}` : ""}
              </Typography>
            </Box>
          </li>
        )}
        noOptionsText="No products found"
        fullWidth
        size="small"
        disabled={disabled}
        className={className}
      />
    );
  }
);
