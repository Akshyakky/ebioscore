// src/pages/inventoryManagement/commonPage/product/ProductSearch.tsx
import React, { useEffect } from "react";
import { TextField, Autocomplete, Box, CircularProgress, Typography } from "@mui/material";
import { ProductSearchProps } from "./ProductSearchProps";
import { ProductOption } from "@/interfaces/InventoryManagement/Product/ProductSearch.interfacr";
import { useProductSearch } from "@/hooks/InventoryManagement/Product/useProductSearch";

/**
 * Reusable product search component with autocomplete
 */
export const ProductSearch: React.FC<ProductSearchProps> = ({
  onProductSelect,
  clearTrigger = 0,
  minSearchLength = 2,
  label = "Search Product",
  placeholder = "Enter product name or code",
  disabled = false,
  initialSelection = null,
  className,
}) => {
  const { inputValue, setInputValue, options, loading, selectedProduct, setSelectedProduct, clearSearch } = useProductSearch({ minSearchLength });

  // Handle external clear trigger
  useEffect(() => {
    if (clearTrigger > 0) {
      clearSearch();
    }
  }, [clearTrigger, clearSearch]);

  // Handle initial selection if provided
  useEffect(() => {
    if (initialSelection && !selectedProduct) {
      setSelectedProduct(initialSelection);
    }
  }, [initialSelection, selectedProduct, setSelectedProduct]);

  // Handle product selection and propagate to parent
  const handleProductSelect = (product: ProductOption | null) => {
    setSelectedProduct(product);

    if (product) {
      onProductSelect({
        productID: product.productID,
        productCode: product.productCode,
        productName: product.productName,
        catValue: product.productCategory || "", // Mapping productCategory to catValue
        prescription: "", // Default value as it's not present in ProductOption
        expiry: "", // Default value as it's not present in ProductOption
        sellable: "", // Default value as it's not present in ProductOption
        taxable: "", // Default value as it's required in ProductSearchResult
        pLocationID: 0, // Default value as it's required in ProductSearchResult
        chargableYN: "", // Default value as it's required in ProductSearchResult
        isAssetYN: "", // Default value as it's required in ProductSearchResult
        supplierStatus: product.rActiveYN, // Mapping rActiveYN to supplierStatus
        vedCode: "", // Default value as it's required in ProductSearchResult
        abcCode: "", // Default value as it's required in ProductSearchResult
        compID: 0, // Default value as it's required in ProductSearchResult
        compCode: "", // Default value as it's required in ProductSearchResult
        compName: "", // Default value as it's required in ProductSearchResult
        transferYN: "", // Default value as it's required in ProductSearchResult
        rActiveYN: product.rActiveYN || "", // Mapping rActiveYN to rActiveYN
        // Add other required properties of ProductSearchResult here
      });
    } else {
      onProductSelect(null);
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
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
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
