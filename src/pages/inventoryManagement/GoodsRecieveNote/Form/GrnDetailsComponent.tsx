import { DeleteSweep as DeleteSweepIcon, Info as InfoIcon, ShoppingCart as ProductIcon } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Grid, Paper, Stack, Typography, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridExpandMoreIcon, GridRenderCellParams, GridRowModel, GridRowSelectionModel, GridToolbar } from "@mui/x-data-grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useRef, useState } from "react";

import { GRNDetailDto, GRNHelpers } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { useAlert } from "@/providers/AlertProvider";
import { formatCurrency } from "@/utils/Common/formatUtils";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm"; // Ensure this path is correct

interface EnhancedGrnDetailsComponentProps {
  grnDetails: GRNDetailDto[];
  onGrnDetailsChange: (details: GRNDetailDto[]) => void;
  disabled?: boolean;
  grnApproved?: boolean;
}

const GrnDetailsComponent: React.FC<EnhancedGrnDetailsComponentProps> = ({ grnDetails, onGrnDetailsChange, disabled = false, grnApproved = false }) => {
  const [expanded, setExpanded] = useState(true);
  const { showAlert } = useAlert();
  const theme = useTheme();
  const productSearchRef = useRef<ProductSearchRef>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>();

  const handleProductSelect = useCallback(
    (product: ProductListDto | null) => {
      const newDetail: Partial<GRNDetailDto> = {
        grnDetID: 0, // 0 indicates a new, unsaved record.
        serialNo: grnDetails.length + 1,
        recvdQty: 1 * (product.unitPack || 1), // Default to qty for 1 pack.
        acceptQty: 1 * (product.unitPack || 1), // Default, mirrors recvdQty initially.
        freeItems: 0, // Default to 0, user can edit.
        batchNo: "", // User must enter this for each GRN item.
        referenceNo: "", // User can enter this.
        expiryDate: null, // User must enter this.
        discPercentage: 0, // Default to 0, user can edit.
        discAmt: 0, // Calculated from percentage, or user can edit.
        rActiveYN: "Y",

        // --- Fields mapped directly from the selected Product's master data (ProductListDto) ---
        productID: product.productID,
        productName: product.productName,
        productCode: product.productCode,
        catValue: product.catValue,
        pUnitName: product.pUnitName,
        pUnitsPerPack: product.unitPack || 1, // The number of base units in one pack.

        // --- Pricing details from the Product Master ---
        unitPrice: product.defaultPrice || 0, // This is the price per single unit.
        sellingPrice: product.defaultPrice || 0, // Default selling price, can be overridden.
        packPrice: (product.defaultPrice || 0) * (product.unitPack || 1), // A calculated default for the whole pack.
        mrp: product.defaultPrice || 0, // Default MRP, can be overridden.

        // --- Tax details from the Product Master ---
        cgstPerValue: product.cgstPerValue || 0,
        sgstPerValue: product.sgstPerValue || 0,
        hsnCode: product.hsnCODE,

        // --- Boolean flags based on product settings ---
        includeTaxYN: "Y", // Map 'Y'/'N' string to a boolean for the grid.
        taxAfterDiscYN: "N", // Default to a standard business rule, user can edit.
      };

      // 3. Perform initial calculations for the new row using helper functions
      const calculatedDetail = GRNHelpers.calculateTaxAmounts(newDetail);
      const finalProductValue = GRNHelpers.calculateProductValue(newDetail);

      const finalDetail: GRNDetailDto = {
        ...newDetail,
        taxableAmt: calculatedDetail.taxableAmount,
        cgstTaxAmt: calculatedDetail.cgstAmount,
        sgstTaxAmt: calculatedDetail.sgstAmount,
        totalTaxAmt: calculatedDetail.totalTax,
        productValue: finalProductValue,
      } as GRNDetailDto;

      // 4. Update the main component state with the new, fully-formed product row
      onGrnDetailsChange([...grnDetails, finalDetail]);

      // 5. Clear the search input for the next selection
      productSearchRef.current?.clearSelection();
    },
    [grnDetails, onGrnDetailsChange, showAlert]
  );

  const processRowUpdate = useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel): GridRowModel => {
      const index = grnDetails.findIndex((row) => row.serialNo === newRow.serialNo);
      if (index === -1) return oldRow;

      // Start with the new data merged over the old
      let updatedDetail = { ...grnDetails[index], ...newRow };

      // If the user updates the number of received packs, automatically update the total received quantity.
      if (newRow.recvdPack !== undefined && newRow.recvdPack !== oldRow.recvdPack) {
        updatedDetail.recvdQty = (newRow.recvdPack || 0) * (updatedDetail.pUnitsPerPack || 1);
        // Also update accepted quantity to match, assuming they are accepted by default
        updatedDetail.acceptQty = updatedDetail.recvdQty;
      }

      // Recalculate financial totals based on the updated data
      const calculatedTax = GRNHelpers.calculateTaxAmounts(updatedDetail);
      const calculatedValue = GRNHelpers.calculateProductValue(updatedDetail);

      const finalUpdatedDetail: GRNDetailDto = {
        ...updatedDetail,
        taxableAmt: calculatedTax.taxableAmount,
        cgstTaxAmt: calculatedTax.cgstAmount,
        sgstTaxAmt: calculatedTax.sgstAmount,
        totalTaxAmt: calculatedTax.totalTax,
        productValue: calculatedValue,
      };

      const updatedDetails = [...grnDetails];
      updatedDetails[index] = finalUpdatedDetail;
      onGrnDetailsChange(updatedDetails);

      // Return the new row to update the grid's internal state
      return { ...finalUpdatedDetail, id: oldRow.id };
    },
    [grnDetails, onGrnDetailsChange]
  );

  const handleProcessRowUpdateError = useCallback(
    (error: Error) => {
      showAlert("Error", `Failed to update row: ${error.message}`, "error");
    },
    [showAlert]
  );

  /**
   * Removes one or more products from the grid based on their `serialNo`.
   */
  const removeProducts = useCallback(
    (idsToRemove: (string | number)[]) => {
      if (idsToRemove.length === 0) return;
      const serialsToRemove = idsToRemove.map(Number);
      const updatedDetails = grnDetails.filter((detail) => !serialsToRemove.includes(detail.serialNo)).map((detail, index) => ({ ...detail, serialNo: index + 1 })); // Re-number serials

      onGrnDetailsChange(updatedDetails);
      // setSelectedRowIds([]); // Clear selection after removal
    },
    [grnDetails, onGrnDetailsChange]
  );

  const columns = useMemo((): GridColDef[] => {
    const isEditable = !disabled && !grnApproved;

    return [
      { field: "serialNo", headerName: "Sl. No", width: 60, editable: false },
      { field: "productName", headerName: "Product Name", width: 220, editable: false },
      { field: "requiredPack", headerName: "Required Pack", width: 120, type: "number", editable: isEditable },
      { field: "recvdPack", headerName: "Received Pack", width: 120, type: "number", editable: isEditable },
      { field: "recvdQty", headerName: "Received Qty", width: 120, type: "number", editable: isEditable },
      { field: "freeItems", headerName: "Free Items", width: 100, type: "number", editable: isEditable },
      { field: "pUnitName", headerName: "UOM", width: 80, editable: false },
      { field: "pUnitsPerPack", headerName: "Units/Pack", width: 90, type: "number", editable: isEditable },
      { field: "batchNo", headerName: "Batch No", width: 120, editable: isEditable },
      { field: "referenceNo", headerName: "Reference No", width: 120, editable: isEditable },
      {
        field: "expiryDate",
        headerName: "Expiry Date",
        width: 150,
        type: "date",
        editable: isEditable,
        valueGetter: (value) => (value ? dayjs(value).toDate() : null),
        renderCell: (params: GridRenderCellParams) => (params.value ? dayjs(params.value).format("DD/MM/YYYY") : ""),
        renderEditCell: (params) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={params.value ? dayjs(params.value) : null}
              onChange={(newValue) => params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue })}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </LocalizationProvider>
        ),
      },
      { field: "sellingPrice", headerName: "Selling Price", width: 120, type: "number", editable: isEditable, valueFormatter: (value) => formatCurrency(value) },
      { field: "packPrice", headerName: "Pack Price", width: 120, type: "number", editable: isEditable, valueFormatter: (value) => formatCurrency(value) },
      {
        field: "gstPercentage",
        headerName: "GST[%]",
        width: 80,
        type: "number",
        editable: false, // This is a calculated field, should not be editable directly
        valueGetter: (value, row) => (row.cgstPerValue || 0) + (row.sgstPerValue || 0),
      },
      { field: "discPercentage", headerName: "Disc[%]", width: 80, type: "number", editable: isEditable },
      { field: "taxAfterDiscYN", headerName: "Tax after Disc", width: 130, type: "boolean", editable: isEditable },
      { field: "includeTaxYN", headerName: "Inc.Tax", width: 80, type: "boolean", editable: isEditable },
      { field: "totalTaxAmt", headerName: "GST Amt", width: 100, editable: false, valueFormatter: (value) => formatCurrency(value) },
      { field: "cgstPerValue", headerName: "CGST%", width: 80, type: "number", editable: isEditable },
      { field: "cgstTaxAmt", headerName: "CGST Tax Amt", width: 120, editable: false, valueFormatter: (value) => formatCurrency(value) },
      { field: "sgstPerValue", headerName: "SGST%", width: 80, type: "number", editable: isEditable },
      { field: "sgstTaxAmt", headerName: "SGST Tax Amt", width: 120, editable: false, valueFormatter: (value) => formatCurrency(value) },
      { field: "productValue", headerName: "Value", width: 120, type: "number", editable: false, valueFormatter: (value) => formatCurrency(value) },
    ];
  }, [disabled, grnApproved]);

  const statistics = useMemo(() => GRNHelpers.calculateGRNTotals(grnDetails), [grnDetails]);

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1.5} width="100%" flexWrap="wrap">
          <ProductIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Product Details
          </Typography>
          <Chip label={`${statistics.totalItems} items`} size="small" color="primary" variant="outlined" />
          <Chip label={`Total Value: ${formatCurrency(statistics.grandTotal)}`} size="small" color="success" variant="outlined" />
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        <Stack spacing={2}>
          {/* --- Product Search and Action Toolbar --- */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <ProductSearch
                  ref={productSearchRef}
                  onProductSelect={handleProductSelect as (product: any) => void}
                  label="Product Search"
                  placeholder="Scan or type to add a product to the grid..."
                  disabled={disabled || grnApproved}
                  className="product-search-field"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {/* <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteSweepIcon />}
                    onClick={() => removeProducts(selectedRowIds)}
                    disabled={disabled || grnApproved || selectedRowIds.length === 0}
                  >
                    Remove Selected ({selectedRowIds.length})
                  </Button> */}
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteSweepIcon />}
                    onClick={() => removeProducts(grnDetails.map((d) => d.serialNo))}
                    disabled={disabled || grnApproved || grnDetails.length === 0}
                  >
                    Remove All
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* --- The DataGrid for Inline Editing --- */}
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={grnDetails}
              columns={columns}
              getRowId={(row) => row.serialNo}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={handleProcessRowUpdateError}
              editMode="row"
              checkboxSelection
              onRowSelectionModelChange={(newSelectionModel) => {
                setSelectedRowIds(newSelectionModel);
              }}
              rowSelectionModel={selectedRowIds}
              density="compact"
              slots={{
                toolbar: GridToolbar,
                noRowsOverlay: () => (
                  <Stack height="100%" alignItems="center" justifyContent="center">
                    <InfoIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h6">The GRN is empty.</Typography>
                    <Typography variant="body2">Use the search bar above to add products.</Typography>
                  </Stack>
                ),
              }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              sx={{
                "& .MuiDataGrid-cell--editable": { bgcolor: "rgba(3, 169, 244, 0.1)" },
                "& .MuiDataGrid-columnHeaders": { bgcolor: theme.palette.grey[100] },
              }}
            />
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(GrnDetailsComponent);
