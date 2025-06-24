import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import { GRNDetailDto } from "@/interfaces/InventoryManagement/GRNDto";

import { Add as AddIcon, Calculate as CalculateIcon, Delete as DeleteIcon, ShoppingCart as ProductIcon } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Grid, IconButton, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridExpandMoreIcon, GridRenderCellParams, GridRowModel } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState } from "react";

interface GrnDetailsComponentProps {
  grnDetails: GRNDetailDto[];
  onGrnDetailsChange: (details: GRNDetailDto[]) => void;
  products: { value: string; label: string }[];
  disabled?: boolean;
}

interface ProductGridRow {
  id: string;
  grnDetID: number;
  productID: number;
  productName: string;
  productCode?: string;
  batchNo?: string;
  expiryDate?: string;
  unitPrice: number;
  recvdQty: number;
  acceptQty: number;
  freeItems: number;
  productValue: number;
  taxableAmt: number;
  cgstPerValue: number;
  cgstTaxAmt: number;
  sgstPerValue: number;
  sgstTaxAmt: number;
  mrp: number;
  sellUnitPrice: number;
  discAmt: number;
  discPercentage: number;
  pUnitsPerPack: number;
  catValue: string;
}

const GrnDetailsComponent: React.FC<GrnDetailsComponentProps> = ({ grnDetails, onGrnDetailsChange, products, disabled = false }) => {
  const [expanded, setExpanded] = useState(true);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<GRNDetailDto>>({});

  // Convert GRN details to grid format
  const gridData = useMemo((): ProductGridRow[] => {
    return grnDetails.map((detail, index) => ({
      id: `detail-${index}`,
      grnDetID: detail.grnDetID || 0,
      productID: detail.productID,
      productName: detail.productName || getProductName(detail.productID),
      productCode: detail.productCode || "",
      batchNo: detail.batchNo || "",
      expiryDate: detail.expiryDate ? dayjs(detail.expiryDate).format("DD/MM/YYYY") : "",
      unitPrice: detail.unitPrice || 0,
      recvdQty: detail.recvdQty || 0,
      acceptQty: detail.acceptQty || detail.recvdQty || 0,
      freeItems: detail.freeItems || 0,
      productValue: detail.productValue || 0,
      taxableAmt: detail.taxableAmt || 0,
      cgstPerValue: detail.cgstPerValue || 0,
      cgstTaxAmt: detail.cgstTaxAmt || 0,
      sgstPerValue: detail.sgstPerValue || 0,
      sgstTaxAmt: detail.sgstTaxAmt || 0,
      mrp: detail.mrp || 0,
      sellUnitPrice: detail.sellUnitPrice || 0,
      discAmt: detail.discAmt || 0,
      discPercentage: detail.discPercentage || 0,
      pUnitsPerPack: detail.pUnitsPerPack || 1,
      catValue: detail.catValue || "MEDI",
    }));
  }, [grnDetails]);

  const getProductName = useCallback(
    (productId: number): string => {
      const product = products.find((p) => Number(p.value) === productId);
      return product?.label || `Product ${productId}`;
    },
    [products]
  );

  const calculateProductValue = useCallback((detail: Partial<GRNDetailDto>): number => {
    const qty = detail.acceptQty || detail.recvdQty || 0;
    const price = detail.unitPrice || 0;
    const discount = detail.discAmt || 0;

    return Math.max(0, qty * price - discount);
  }, []);

  const calculateTaxAmounts = useCallback(
    (detail: Partial<GRNDetailDto>): { cgstAmt: number; sgstAmt: number; taxableAmt: number } => {
      const productValue = calculateProductValue(detail);
      const cgstRate = detail.cgstPerValue || 0;
      const sgstRate = detail.sgstPerValue || 0;

      const taxableAmt = productValue;
      const cgstAmt = (taxableAmt * cgstRate) / 100;
      const sgstAmt = (taxableAmt * sgstRate) / 100;

      return {
        cgstAmt: Math.round(cgstAmt * 100) / 100,
        sgstAmt: Math.round(sgstAmt * 100) / 100,
        taxableAmt: Math.round(taxableAmt * 100) / 100,
      };
    },
    [calculateProductValue]
  );

  const addProduct = useCallback(() => {
    setFormData({
      grnDetID: 0,
      grnID: 0,
      productID: 0,
      catValue: "MEDI",
      unitPrice: 0,
      recvdQty: 0,
      acceptQty: 0,
      freeItems: 0,
      pUnitsPerPack: 1,
      cgstPerValue: 9,
      sgstPerValue: 9,
      expiryYN: "N",
      taxOnUnitPriceYN: "Y",
      rActiveYN: "Y",
      transferYN: "N",
      defaultPrice: 0,
      _recievedQty: 0,
      _serialNo: grnDetails.length + 1,
      _pastReceivedPack: 0,
      _unitPrice: 0,
      _sellingUnitPrice: 0,
    });
    setEditMode(-1); // -1 indicates adding new
    if (!expanded) {
      setExpanded(true);
    }
  }, [grnDetails.length, expanded]);

  const editProduct = useCallback(
    (index: number) => {
      setFormData(grnDetails[index]);
      setEditMode(index);
    },
    [grnDetails]
  );

  const cancelEdit = useCallback(() => {
    setEditMode(null);
    setFormData({});
  }, []);

  const saveProduct = useCallback(() => {
    if (!formData.productID || formData.productID <= 0) {
      return;
    }

    // Calculate values
    const productValue = calculateProductValue(formData);
    const taxAmounts = calculateTaxAmounts(formData);

    const updatedDetail: GRNDetailDto = {
      ...formData,
      productValue,
      taxableAmt: taxAmounts.taxableAmt,
      cgstTaxAmt: taxAmounts.cgstAmt,
      sgstTaxAmt: taxAmounts.sgstAmt,
      productName: getProductName(formData.productID || 0),
      acceptQty: formData.acceptQty || formData.recvdQty || 0,
    } as GRNDetailDto;

    let updatedDetails = [...grnDetails];

    if (editMode === -1) {
      // Adding new
      updatedDetails.push(updatedDetail);
    } else if (editMode !== null) {
      // Editing existing
      updatedDetails[editMode] = updatedDetail;
    }

    onGrnDetailsChange(updatedDetails);
    cancelEdit();
  }, [formData, calculateProductValue, calculateTaxAmounts, getProductName, grnDetails, editMode, onGrnDetailsChange, cancelEdit]);

  const removeProduct = useCallback(
    (index: number) => {
      const updatedDetails = grnDetails.filter((_, i) => i !== index);
      onGrnDetailsChange(updatedDetails);
    },
    [grnDetails, onGrnDetailsChange]
  );

  const handleInputChange = useCallback((field: keyof GRNDetailDto, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate related fields
      if (field === "recvdQty" && !updated.acceptQty) {
        updated.acceptQty = value;
      }

      if (field === "unitPrice" && !updated.sellUnitPrice) {
        updated.sellUnitPrice = value;
      }

      return updated;
    });
  }, []);

  const processRowUpdate = useCallback(
    (newRow: GridRowModel) => {
      const index = grnDetails.findIndex((_, i) => `detail-${i}` === newRow.id);
      if (index === -1) return newRow;

      const updatedDetail = { ...grnDetails[index] };

      // Update fields that can be edited inline
      if (newRow.acceptQty !== undefined) updatedDetail.acceptQty = Math.max(0, Number(newRow.acceptQty) || 0);
      if (newRow.freeItems !== undefined) updatedDetail.freeItems = Math.max(0, Number(newRow.freeItems) || 0);
      if (newRow.unitPrice !== undefined) updatedDetail.unitPrice = Math.max(0, Number(newRow.unitPrice) || 0);
      if (newRow.discAmt !== undefined) updatedDetail.discAmt = Math.max(0, Number(newRow.discAmt) || 0);

      // Recalculate values
      const productValue = calculateProductValue(updatedDetail);
      const taxAmounts = calculateTaxAmounts(updatedDetail);

      updatedDetail.productValue = productValue;
      updatedDetail.taxableAmt = taxAmounts.taxableAmt;
      updatedDetail.cgstTaxAmt = taxAmounts.cgstAmt;
      updatedDetail.sgstTaxAmt = taxAmounts.sgstAmt;

      const updatedDetails = [...grnDetails];
      updatedDetails[index] = updatedDetail;
      onGrnDetailsChange(updatedDetails);

      return newRow;
    },
    [grnDetails, calculateProductValue, calculateTaxAmounts, onGrnDetailsChange]
  );

  const columns: GridColDef[] = [
    {
      field: "productName",
      headerName: "Product",
      width: 200,
      editable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          {params.row.productCode && (
            <Typography variant="caption" color="text.secondary">
              {params.row.productCode}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "batchNo",
      headerName: "Batch No",
      width: 120,
      editable: false,
    },
    {
      field: "expiryDate",
      headerName: "Expiry",
      width: 100,
      editable: false,
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      width: 120,
      type: "number",
      editable: !disabled,
      renderCell: (params: GridRenderCellParams) => <Typography variant="body2">₹{(params.value || 0).toFixed(2)}</Typography>,
    },
    {
      field: "recvdQty",
      headerName: "Received Qty",
      width: 120,
      type: "number",
      editable: false,
    },
    {
      field: "acceptQty",
      headerName: "Accept Qty",
      width: 120,
      type: "number",
      editable: !disabled,
    },
    {
      field: "freeItems",
      headerName: "Free Items",
      width: 100,
      type: "number",
      editable: !disabled,
    },
    {
      field: "discAmt",
      headerName: "Discount",
      width: 100,
      type: "number",
      editable: !disabled,
      renderCell: (params: GridRenderCellParams) => <Typography variant="body2">₹{(params.value || 0).toFixed(2)}</Typography>,
    },
    {
      field: "productValue",
      headerName: "Product Value",
      width: 130,
      editable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="medium" color="primary">
          ₹{(params.value || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "cgstTaxAmt",
      headerName: "CGST",
      width: 100,
      editable: false,
      renderCell: (params: GridRenderCellParams) => <Typography variant="body2">₹{(params.value || 0).toFixed(2)}</Typography>,
    },
    {
      field: "sgstTaxAmt",
      headerName: "SGST",
      width: 100,
      editable: false,
      renderCell: (params: GridRenderCellParams) => <Typography variant="body2">₹{(params.value || 0).toFixed(2)}</Typography>,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      editable: false,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const index = grnDetails.findIndex((_, i) => `detail-${i}` === params.id);
        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton size="small" color="primary" onClick={() => editProduct(index)} disabled={disabled}>
                <ProductIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove">
              <IconButton size="small" color="error" onClick={() => removeProduct(index)} disabled={disabled}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  const statistics = useMemo(() => {
    const totalItems = grnDetails.length;
    const totalQty = grnDetails.reduce((sum, detail) => sum + (detail.acceptQty || 0), 0);
    const totalValue = grnDetails.reduce((sum, detail) => sum + (detail.productValue || 0), 0);
    const totalTax = grnDetails.reduce((sum, detail) => sum + (detail.cgstTaxAmt || 0) + (detail.sgstTaxAmt || 0), 0);

    return { totalItems, totalQty, totalValue, totalTax };
  }, [grnDetails]);

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<GridExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1} width="100%">
          <ProductIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Product Details
          </Typography>

          <Chip label={`${statistics.totalItems} items`} size="small" color="primary" variant="outlined" />

          <Chip label={`Qty: ${statistics.totalQty}`} size="small" color="info" variant="outlined" />

          <Chip label={`Value: ₹${statistics.totalValue.toFixed(2)}`} size="small" color="success" variant="outlined" />

          <Box sx={{ ml: "auto" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                addProduct();
              }}
              color="primary"
              disabled={disabled}
            >
              <Tooltip title="Add product">
                <AddIcon />
              </Tooltip>
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ padding: "16px" }}>
        <Stack spacing={2}>
          {/* Add/Edit Product Form */}
          {editMode !== null && (
            <Paper sx={{ p: 2, backgroundColor: "grey.50", border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" color="primary" fontWeight="medium">
                  {editMode === -1 ? "Add New Product" : "Edit Product"}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <EnhancedFormField
                    name="productID"
                    control={null}
                    // control={control}
                    type="select"
                    label="Product"
                    size="small"
                    required
                    defaultValue={formData.productID}
                    onChange={(value) => handleInputChange("productID", Number(value))}
                    options={products}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField label="Batch No" size="small" fullWidth value={formData.batchNo || ""} onChange={(e) => handleInputChange("batchNo", e.target.value)} />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <EnhancedFormField
                    name="expiryDate"
                    control={null}
                    type="datepicker"
                    label="Expiry Date"
                    size="small"
                    defaultValue={formData.expiryDate ? new Date(formData.expiryDate) : null}
                    onChange={(value) => handleInputChange("expiryDate", value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label="Unit Price"
                    type="number"
                    size="small"
                    fullWidth
                    value={formData.unitPrice || ""}
                    onChange={(e) => handleInputChange("unitPrice", Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label="MRP"
                    type="number"
                    size="small"
                    fullWidth
                    value={formData.mrp || ""}
                    onChange={(e) => handleInputChange("mrp", Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label="Received Qty"
                    type="number"
                    size="small"
                    fullWidth
                    value={formData.recvdQty || ""}
                    onChange={(e) => handleInputChange("recvdQty", Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label="Accept Qty"
                    type="number"
                    size="small"
                    fullWidth
                    value={formData.acceptQty || ""}
                    onChange={(e) => handleInputChange("acceptQty", Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label="Free Items"
                    type="number"
                    size="small"
                    fullWidth
                    value={formData.freeItems || ""}
                    onChange={(e) => handleInputChange("freeItems", Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label="CGST %"
                    type="number"
                    size="small"
                    fullWidth
                    value={formData.cgstPerValue || ""}
                    onChange={(e) => handleInputChange("cgstPerValue", Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0, max: 100, step: 0.01 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label="SGST %"
                    type="number"
                    size="small"
                    fullWidth
                    value={formData.sgstPerValue || ""}
                    onChange={(e) => handleInputChange("sgstPerValue", Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0, max: 100, step: 0.01 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label="Discount Amt"
                    type="number"
                    size="small"
                    fullWidth
                    value={formData.discAmt || ""}
                    onChange={(e) => handleInputChange("discAmt", Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                    <Button variant="outlined" size="small" onClick={cancelEdit}>
                      Cancel
                    </Button>
                    <Button variant="contained" size="small" onClick={saveProduct} color="primary" disabled={!formData.productID} startIcon={<CalculateIcon />}>
                      {editMode === -1 ? "Add Product" : "Update Product"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Products Grid */}
          {grnDetails.length > 0 ? (
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <DataGrid
                rows={gridData}
                columns={columns}
                processRowUpdate={processRowUpdate}
                density="compact"
                disableRowSelectionOnClick
                hideFooterSelectedRowCount
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell": {
                    borderRight: "1px solid #e0e0e0",
                  },
                }}
              />
            </Paper>
          ) : (
            <Alert severity="info">No products added yet. Click the "+" button above to add products to this GRN.</Alert>
          )}

          {/* Summary */}
          {grnDetails.length > 0 && (
            <Paper sx={{ p: 2, backgroundColor: "primary.light", color: "primary.contrastText" }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="body2">
                    Total Items: <strong>{statistics.totalItems}</strong>
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="body2">
                    Total Quantity: <strong>{statistics.totalQty}</strong>
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="body2">
                    Total Value: <strong>₹{statistics.totalValue.toFixed(2)}</strong>
                  </Typography>
                </Grid>
                <Grid size={{ xs: 3 }}>
                  <Typography variant="body2">
                    Total Tax: <strong>₹{statistics.totalTax.toFixed(2)}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {grnDetails.length === 0 && editMode === null && (
            <Box textAlign="center" mt={2}>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addProduct} size="small" disabled={disabled}>
                Add First Product
              </Button>
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(GrnDetailsComponent);
