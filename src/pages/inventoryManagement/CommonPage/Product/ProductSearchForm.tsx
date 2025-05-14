// ProductSearch.tsx
import React, { useEffect } from "react";
import { TextField, Autocomplete, Box, CircularProgress, Typography } from "@mui/material";
import { ProductSearchProps } from "./ProductSearchProps";
import { ProductOption } from "@/interfaces/InventoryManagement/Product/ProductSearch.interfacr";
import { useProductSearch } from "@/hooks/InventoryManagement/Product/useProductSearch";

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onProductSelect,
  clearTrigger = 0,
  minSearchLength = 2,
  label = "Search Product",
  placeholder = "Enter product name or code",
  disabled = false,
  initialSelection = null,
  className,
  setInputValue,
  setSelectedProduct,
}) => {
  const {
    inputValue,
    setInputValue: hookSetInputValue,
    options,
    loading,
    selectedProduct,
    setSelectedProduct: hookSetSelectedProduct,
    clearSearch,
  } = useProductSearch({ minSearchLength });

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
    setSelectedProduct?.(product);

    if (product) {
      onProductSelect({
        productID: product.productID,
        productCode: product.productCode,
        productName: product.productName,
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
        compID: 0,
        compCode: "",
        compName: "",
        transferYN: "",
        rActiveYN: product.rActiveYN || "",
      });
      setTimeout(() => {
        setInputValue?.("");
        setSelectedProduct?.(null);
        clearSearch();
      }, 100);
    } else {
      onProductSelect(null);
      setInputValue?.("");
      setSelectedProduct?.(null);
    }
  };

  return (
    <Autocomplete
      id="product-search-autocomplete"
      options={options}
      loading={loading}
      value={selectedProduct}
      inputValue={inputValue}
      onChange={(_, newValue) => handleProductSelect(newValue)}
      onInputChange={(_, newInputValue) => hookSetInputValue(newInputValue)}
      getOptionLabel={(option) => option.productName || ""}
      isOptionEqualToValue={(option, value) => option.productID === value.productID}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
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
};
