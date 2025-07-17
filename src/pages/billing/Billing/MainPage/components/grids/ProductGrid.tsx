// src/pages/billing/Billing/MainPage/components/grids/ProductGrid.tsx
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Box, Chip, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React, { useCallback, useMemo } from "react";
import { Control } from "react-hook-form";
import { z } from "zod";
import { BillingFormData, BillProductRow, BillProductsDtoSchema } from "../../types";
import { validateQuantity } from "../../utils/billingUtils";

interface ProductGridProps {
  products: any[];
  control: Control<BillingFormData>;
  updateProduct: (index: number, data: any) => void;
  removeProduct: (index: number) => void;
  calculateDiscountFromPercent: (amount: number, percentage: number) => number;
  showAlert: (title: string, message: string, type: "success" | "error" | "warning" | "info") => void;
 
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, control, updateProduct, removeProduct, calculateDiscountFromPercent, showAlert }) => {
  // Convert products to DataGrid rows
  const productRows: BillProductRow[] = useMemo(() => {
    return products.map((product, index) => ({
      ...product,
      id: `temp-product-${index}`,
    }));
  }, [products]);

  const handleProductFieldChange = useCallback(
    (index: number, field: string, value: any) => {
      const currentProduct = products[index];
      const updatedProduct = { ...currentProduct };

      // Validate quantity against available stock
      if (field === "selectedQuantity") {
        const enteredQty = parseFloat(value) || 0;
        const availableQty = currentProduct.productQOH || 0;

        if (enteredQty > availableQty) {
          showAlert("Warning", `Quantity cannot exceed available stock (${availableQty})`, "warning");
          // Set to maximum available quantity
          updatedProduct[field] = availableQty;
        } else if (enteredQty < 0) {
          showAlert("Warning", "Quantity cannot be negative", "warning");
          updatedProduct[field] = 0;
        } else {
          updatedProduct[field] = enteredQty;
        }
      } else {
        updatedProduct[field] = value;
      }

      // Recalculate based on what changed
      const quantity = updatedProduct.selectedQuantity || 1;
      const hospAmt = updatedProduct.hValue || 0;
      const hospDiscPerc = updatedProduct.hospPercShare || 0;

      if (field === "hospPercShare" || field === "hValue" || field === "selectedQuantity") {
        updatedProduct.hValDisc = calculateDiscountFromPercent(hospAmt * quantity, hospDiscPerc);
      }

      updateProduct(index, updatedProduct);
    },
    [products, updateProduct, calculateDiscountFromPercent, showAlert]
  );
  const handleProductCellValueChange = useCallback(
    (id: string | number, field: keyof z.infer<typeof BillProductsDtoSchema>, value: any) => {
      const index = products.findIndex((_product, idx) => `temp-product-${idx}` === id);
      if (index !== -1) {
        handleProductFieldChange(index, field, value);
      }
    },
    [products, handleProductFieldChange]
  );
  const renderProductNumberField = useCallback(
    (params: GridRenderCellParams, field: keyof z.infer<typeof BillProductsDtoSchema>) => {
      const isQuantityField = field === "selectedQuantity";
      const maxQuantity = isQuantityField ? params.row.productQOH : undefined;

      return (
        <TextField
          size="small"
          type="number"
          value={params.row[field] || ""}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            handleProductCellValueChange(params.id, field, value);
          }}
          sx={{ width: "100%" }}
          inputProps={{
            style: { textAlign: "right" },
            min: 0,
            max: maxQuantity,
            step: 1,
          }}
          fullWidth
          error={isQuantityField && params.row[field] > params.row.productQOH}
          helperText={isQuantityField && params.row[field] > params.row.productQOH ? "Exceeds available" : ""}
        />
      );
    },
    [handleProductCellValueChange]
  );
  // Define simplified columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "productName",
        headerName: "Product Name",
        width: 250,
        sortable: false,
      },
      {
        field: "batchNo",
        headerName: "Batch No",
        width: 120,
        sortable: false,
      },
      {
        field: "productQOH",
        headerName: "Available",
        width: 100,
        sortable: false,
        renderCell: (params) => <Chip label={params.value || 0} size="small" color={params.value > 10 ? "success" : params.value > 0 ? "warning" : "error"} variant="outlined" />,
      },
      {
        field: "selectedQuantity",
        headerName: "Qty",
        width: 120,
        sortable: false,
        type: "number",
        renderCell: (params) => renderProductNumberField(params, "selectedQuantity"),
      },
      {
        field: "expiryDate",
        headerName: "Expiry Date",
        width: 130,
        sortable: false,
        renderCell: (params) => {
          const date = params.row.expiryDate;
          if (!date) return "-";
          const formattedDate = new Date(date).toLocaleDateString();
          return formattedDate;
        },
      },
      {
        field: "selectedQuantity",
        headerName: "Qty",
        width: 120,
        sortable: false,
        type: "number",
        renderCell: (params) => renderProductNumberField(params, "selectedQuantity"),
      },
      {
        field: "hValue",
        headerName: "Hosp Amt (₹)",
        width: 150,
        sortable: false,
        type: "number",
        renderCell: (params) => renderProductNumberField(params, "hValue"),
      },
      {
        field: "hospPercShare",
        headerName: "Hosp Disc %",
        width: 150,
        sortable: false,
        type: "number",
        renderCell: (params) => renderProductNumberField(params, "hospPercShare"),
      },
      {
        field: "hValDisc",
        headerName: "Hosp Disc ₹",
        width: 150,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <TextField value={params.row.hValDisc?.toFixed(2) || "0.00"} size="small" fullWidth disabled InputProps={{ readOnly: true, style: { textAlign: "right" } }} />
        ),
      },
      {
        field: "grossAmt",
        headerName: "Gross Amt",
        width: 150,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const quantity = params.row.selectedQuantity || 1;
          const hospAmt = params.row.hValue || 0;
          const grossAmt = quantity * hospAmt;
          return (
            <Typography variant="body2" fontWeight="medium">
              ₹{grossAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "discAmt",
        headerName: "Disc Amt",
        width: 150,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const totalDiscAmt = params.row.hValDisc || 0;
          return (
            <Typography variant="body2" color="error">
              ₹{totalDiscAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "netAmt",
        headerName: "Net Amt",
        width: 90,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => {
          const quantity = params.row.selectedQuantity || 1;
          const hospAmt = params.row.hValue || 0;
          const grossAmt = quantity * hospAmt;
          const totalDiscAmt = params.row.hValDisc || 0;
          const netAmt = grossAmt - totalDiscAmt;
          return (
            <Typography variant="body2" fontWeight="bold" color="primary">
              ₹{netAmt.toFixed(2)}
            </Typography>
          );
        },
      },
      {
        field: "packName",
        headerName: "Pack Name",
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>
            {params.row.packName || ""}
          </Typography>
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Delete",
        width: 100,
        getActions: (params) => {
          const index = productRows.findIndex((row) => row.id === params.id);
          return [
            <GridActionsCellItem
              icon={
                <Tooltip title="Remove Product">
                  <DeleteIcon color="error" />
                </Tooltip>
              }
              label="Remove"
              onClick={() => removeProduct(index)}
              showInMenu={false}
            />,
          ];
        },
      },
    ],
    [renderProductNumberField, removeProduct, productRows]
  );

  const handleProcessRowUpdate = (newRow: any) => {
    // Validate quantity
    if (newRow.selectedQuantity !== undefined) {
      const validation = validateQuantity(newRow.selectedQuantity, newRow.productQOH);
      if (!validation.isValid) {
        showAlert("Warning", validation.message!, "warning");
        return productRows.find((row) => row.id === newRow.id) || newRow;
      }
    }

    const index = productRows.findIndex((row) => row.id === newRow.id);
    if (index !== -1) {
      updateProduct(index, newRow);
    }
    return newRow;
  };

  if (productRows.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Typography color="text.secondary">No products added. Use the search box above to add products.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={productRows}
        columns={columns}
        density="compact"
        disableRowSelectionOnClick
        processRowUpdate={handleProcessRowUpdate}
        hideFooterSelectedRowCount
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10 },
          },
        }}
      />
    </Box>
  );
};
