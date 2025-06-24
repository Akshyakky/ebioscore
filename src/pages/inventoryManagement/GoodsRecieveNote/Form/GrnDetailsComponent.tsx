import { GRNDetailDto, GRNHelpers } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { useAlert } from "@/providers/AlertProvider";
import { formatCurrency } from "@/utils/Common/formatUtils";

import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import {
  Abc as AbcIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  Category as CategoryIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  ExpandMore as ExpandMoreIcon,
  Factory as FactoryIcon,
  HourglassTop as HourglassTopIcon,
  Info as InfoIcon,
  Inventory2 as Inventory2Icon,
  Medication as MedicationIcon,
  Percent as PercentIcon,
  Pin as PinIcon,
  ShoppingCart as ProductIcon,
  Straighten as StraightenIcon,
  Warehouse as WarehouseIcon,
} from "@mui/icons-material";

import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, CircularProgress, Grid, Paper, Stack, Tooltip, Typography, alpha, useTheme } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams, GridRowModel, GridRowSelectionModel, GridToolbar, gridClasses } from "@mui/x-data-grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";

interface EnhancedGrnDetailsComponentProps {
  grnDetails: GRNDetailDto[];
  onGrnDetailsChange: (details: GRNDetailDto[]) => void;
  disabled?: boolean;
  grnApproved?: boolean;
}

const StyledHeader = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    {icon}
    <Typography variant="body2" fontWeight="bold">
      {text}
    </Typography>
  </Stack>
);

const GrnDetailsComponent: React.FC<EnhancedGrnDetailsComponentProps> = ({ grnDetails, onGrnDetailsChange, disabled = false, grnApproved = false }) => {
  const [expanded, setExpanded] = useState(true);
  const { showAlert } = useAlert();
  const theme = useTheme();
  const productSearchRef = useRef<ProductSearchRef>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>();

  const handleProductSelect = useCallback(
    async (product: ProductListDto | null) => {
      if (!product?.productID) return;
      if (grnDetails.find((d) => d.productID === product.productID)) {
        showAlert("Warning", `"${product.productName}" is already added.`, "warning");
        productSearchRef.current?.clearSelection();
        return;
      }
      setIsAddingProduct(true);
      try {
        const productData = await productListService.getById(product.productID);
        const nextSerialNo = grnDetails.length > 0 ? Math.max(...grnDetails.map((d) => d.serialNo)) + 1 : 1;
        const newDetail: GRNDetailDto = {
          grnDetID: 0,
          grnID: 0,
          serialNo: nextSerialNo,
          productID: productData.data.productID,
          productCode: productData.data.productCode,
          productName: productData.data.productName,
          pGrpID: productData.data.pGrpID,
          pGrpName: productData.data.productGroupName,
          psGrpID: productData.data.psGrpID,
          psGrpName: productData.data.psGroupName,
          mfID: productData.data.manufacturerID,
          mfName: productData.data.manufacturerName,
          manufacturerID: productData.data.manufacturerID,
          manufacturerCode: productData.data.manufacturerCode,
          manufacturerName: productData.data.manufacturerName,
          pUnitID: productData.data.pUnitID,
          pUnitName: productData.data.pUnitName,
          pUnitsPerPack: productData.data.unitPack || 1,
          defaultPrice: productData.data.defaultPrice || 0,
          unitPrice: productData.data.defaultPrice || 0,
          sellingPrice: productData.data.defaultPrice || 0,
          packPrice: (productData.data.defaultPrice || 0) * (productData.data.unitPack || 1),
          mrp: 0,
          taxID: productData.data.taxID,
          taxCode: productData.data.taxCode,
          taxName: productData.data.taxName,
          gstPercentage: (productData.data.cgstPerValue || 0) + (productData.data.sgstPerValue || 0),
          cgstPerValue: productData.data.cgstPerValue || 0,
          sgstPerValue: productData.data.sgstPerValue || 0,
          igstPerValue: 0,
          hsnCode: productData.data.hsnCODE,
          requiredPack: 0,
          requiredQty: 0,
          recvdPack: 0,
          recvdQty: 0,
          acceptQty: 0,
          freeItems: 0,
          productValue: 0,
          discAmt: 0,
          discPercentage: 0,
          taxableAmt: 0,
          cgstTaxAmt: 0,
          sgstTaxAmt: 0,
          igstTaxAmt: 0,
          totalTaxAmt: 0,
          taxAfterDiscYN: "N",
          includeTaxYN: "N",
          expiryYN: productData.data.expiry === "Y" ? "Y" : "N",
          batchNo: "",
          referenceNo: "",
          expiryDate: undefined,
          _pastReceivedPack: 0,
        } as GRNDetailDto;

        onGrnDetailsChange([...grnDetails, newDetail]);
        showAlert("Success", `Product "${productData.data.productName}" added.`, "success");
      } catch (error) {
        console.error("Error adding product:", error);
        showAlert("Error", "Failed to add product. Please check if the product exists.", "error");
      } finally {
        setIsAddingProduct(false);
        productSearchRef.current?.clearSelection();
      }
    },
    [grnDetails, onGrnDetailsChange, showAlert]
  );

  // ... NO OTHER CHANGES are needed in the rest of the file.
  // The processRowUpdate, removeProducts, columns, and JSX remain the same.

  const processRowUpdate = useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel): GridRowModel => {
      let updatedDetail = { ...newRow } as GRNDetailDto;
      if (newRow.recvdPack !== oldRow.recvdPack) {
        updatedDetail.recvdQty = (newRow.recvdPack || 0) * (updatedDetail.pUnitsPerPack || 1);
        updatedDetail.acceptQty = updatedDetail.recvdQty;
      }
      if (newRow.unitPrice !== oldRow.unitPrice) {
        updatedDetail.packPrice = (newRow.unitPrice || 0) * (updatedDetail.pUnitsPerPack || 1);
      }
      const calculatedTax = GRNHelpers.calculateTaxAmounts(updatedDetail);
      const calculatedValue = GRNHelpers.calculateProductValue(updatedDetail);
      const finalUpdatedDetail: GRNDetailDto = {
        ...updatedDetail,
        taxableAmt: calculatedTax.taxableAmount,
        discAmt: calculatedTax.cgstAmount,
        cgstTaxAmt: calculatedTax.cgstAmount,
        sgstTaxAmt: calculatedTax.sgstAmount,
        totalTaxAmt: calculatedTax.totalTax,
        productValue: calculatedValue,
      };
      const updatedDetails = grnDetails.map((row) => (row.serialNo === newRow.serialNo ? finalUpdatedDetail : row));
      onGrnDetailsChange(updatedDetails);
      return finalUpdatedDetail;
    },
    [grnDetails, onGrnDetailsChange]
  );

  const removeProducts = useCallback(
    (serialsToRemove: readonly (string | number)[]) => {
      if (serialsToRemove.length === 0) return;
      const updatedDetails = grnDetails.filter((detail) => !serialsToRemove.includes(detail.serialNo)).map((detail, index) => ({ ...detail, serialNo: index + 1 }));
      onGrnDetailsChange(updatedDetails);
      // setSelectedRowIds();
      showAlert("Success", `${serialsToRemove.length} product(s) removed.`, "success");
    },
    [grnDetails, onGrnDetailsChange, showAlert]
  );

  const removeSelectedProducts = useCallback(() => {
    removeProducts(selectedRowIds as unknown as readonly (string | number)[]);
  }, [selectedRowIds, removeProducts]);
  const removeAllProducts = useCallback(() => removeProducts(grnDetails.map((d) => d.serialNo)), [grnDetails, removeProducts]);

  const columns = useMemo((): GridColDef<GRNDetailDto>[] => {
    const isEditable = !disabled && !grnApproved;
    const currencyFormatter = (value: number) => (value ? formatCurrency(value) : "₹0.00");
    const commonNumberProps: Partial<GridColDef<GRNDetailDto>> = {
      align: "right",
      headerAlign: "right",
      editable: isEditable,
      type: "number",
      cellClassName: "font-mono",
    };

    return [
      { field: "serialNo", headerName: "Sl.", width: 60, editable: false },
      {
        field: "productName",
        minWidth: 320,
        flex: 2,
        editable: false,
        renderHeader: () => <StyledHeader icon={<CategoryIcon fontSize="small" />} text="Product Name" />,
        renderCell: (params: GridRenderCellParams) => (
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%" }}>
            <Inventory2Icon color="action" />
            <Tooltip title={`${params.row.productName} (Code: ${params.row.productCode})`} placement="bottom-start">
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {params.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Code: {params.row.productCode}
                </Typography>
              </Box>
            </Tooltip>
          </Stack>
        ),
      },
      { field: "recvdPack", headerName: "Rcvd. Pack", minWidth: 120, ...commonNumberProps },
      { field: "recvdQty", headerName: "Rcvd. Qty", minWidth: 120, ...commonNumberProps, editable: false },
      { field: "freeItems", headerName: "Free", minWidth: 90, ...commonNumberProps },
      {
        field: "batchNo",
        minWidth: 150,
        editable: isEditable,
        renderHeader: () => <StyledHeader icon={<ConfirmationNumberIcon fontSize="small" />} text="Batch No" />,
      },
      {
        field: "expiryDate",
        minWidth: 160,
        type: "date",
        editable: isEditable,
        renderHeader: () => <StyledHeader icon={<CalendarTodayIcon fontSize="small" />} text="Expiry Date" />,
        valueGetter: (value) => (value ? dayjs(value).toDate() : null),
        renderCell: (params) => (params.value ? dayjs(params.value).format("MMM YYYY") : "N/A"),
        renderEditCell: (params) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              {...params}
              value={params.value ? dayjs(params.value) : null}
              onChange={(newValue) => params.api.setEditCellValue({ id: params.id, field: params.field, value: newValue?.toDate() })}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small", fullWidth: true, autoFocus: true } }}
            />
          </LocalizationProvider>
        ),
      },

      {
        field: "unitPrice",
        minWidth: 140,
        ...commonNumberProps,
        renderHeader: () => <StyledHeader icon={<AttachMoneyIcon fontSize="small" />} text="Unit Price" />,
        valueFormatter: currencyFormatter,
      },
      {
        field: "discPercentage",
        minWidth: 120,
        ...commonNumberProps,
        renderHeader: () => <StyledHeader icon={<PercentIcon fontSize="small" />} text="Disc %" />,
      },
      {
        field: "productValue",
        minWidth: 150,
        ...commonNumberProps,
        editable: false,
        renderHeader: () => <StyledHeader icon={<AttachMoneyIcon fontSize="small" />} text="Total Value" />,
        valueFormatter: currencyFormatter,
      },

      // --- DETAILED INFO COLUMNS (Hidden by Default) ---
      { field: "pUnitName", renderHeader: () => <StyledHeader icon={<StraightenIcon fontSize="small" />} text="UOM" />, minWidth: 90, editable: false },
      { field: "pUnitsPerPack", headerName: "Units/Pack", minWidth: 110, ...commonNumberProps },
      { field: "packPrice", headerName: "Pack Price", minWidth: 130, ...commonNumberProps, valueFormatter: currencyFormatter, editable: false },
      { field: "sellingPrice", headerName: "Selling Price", minWidth: 130, ...commonNumberProps, valueFormatter: currencyFormatter },
      {
        field: "manufacturerName",
        renderHeader: () => <StyledHeader icon={<FactoryIcon fontSize="small" />} text="Manufacturer" />,
        minWidth: 200,
        flex: 1,
        editable: false,
      },
      { field: "pGrpName", headerName: "Product Group", minWidth: 150, editable: false },
      { field: "psGrpName", headerName: "Sub Group", minWidth: 150, editable: false },

      // --- TAX COLUMNS (Hidden by Default) ---
      { field: "hsnCode", headerName: "HSN Code", minWidth: 120, editable: false },
      { field: "gstPercentage", headerName: "GST [%]", width: 90, ...commonNumberProps, editable: false },
      { field: "taxName", headerName: "Tax Profile", minWidth: 150, editable: false },
      { field: "taxableAmt", headerName: "Taxable Amt", minWidth: 130, ...commonNumberProps, valueFormatter: currencyFormatter, editable: false },
      { field: "totalTaxAmt", headerName: "Total Tax", minWidth: 130, ...commonNumberProps, valueFormatter: currencyFormatter, editable: false },

      // --- INVENTORY CODES (Hidden by Default) ---
      { field: "vedCode", renderHeader: () => <StyledHeader icon={<PinIcon fontSize="small" />} text="VED Code" />, minWidth: 100, editable: false },
      { field: "abcCode", renderHeader: () => <StyledHeader icon={<AbcIcon fontSize="small" />} text="ABC Code" />, minWidth: 100, editable: false },
      {
        field: "rOL",
        renderHeader: () => <StyledHeader icon={<WarehouseIcon fontSize="small" />} text="Re-Order Lvl" />,
        minWidth: 120,
        type: "number",
        editable: false,
      },
      {
        field: "leadTime",
        renderHeader: () => <StyledHeader icon={<HourglassTopIcon fontSize="small" />} text="Lead Time (d)" />,
        minWidth: 120,
        type: "number",
        editable: false,
      },

      // --- PRODUCT FLAGS (Hidden by Default) ---
      {
        field: "prescription",
        renderHeader: () => <StyledHeader icon={<MedicationIcon fontSize="small" />} text="Prescription" />,
        minWidth: 120,
        renderCell: (params) => <Chip label={params.value === "Y" ? "Required" : "Not Required"} color={params.value === "Y" ? "warning" : "default"} size="small" />,
      },

      {
        field: "actions",
        type: "actions",
        headerName: "Action",
        width: 80,
        getActions: (params) => [
          <Tooltip title="Delete this item">
            <span>
              <GridActionsCellItem icon={<DeleteIcon color="error" />} label="Delete" onClick={() => removeProducts([params.id])} disabled={!isEditable} />
            </span>
          </Tooltip>,
        ],
      },
    ];
  }, [disabled, grnApproved, removeProducts]);

  const statistics = useMemo(() => GRNHelpers.calculateGRNTotals(grnDetails), [grnDetails]);
  const isComponentDisabled = disabled || grnApproved;

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ mt: 2, boxShadow: 3, "&.Mui-expanded": { mt: 2 } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={1.5} width="100%" flexWrap="wrap">
          <ProductIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Product Details
          </Typography>
          <Chip label={`${statistics.totalItems} items`} size="small" color="primary" variant="outlined" />
          <Chip label={`Grand Total: ${formatCurrency(statistics.grandTotal)}`} size="small" color="success" variant="outlined" />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: { xs: 1, md: 2 } }}>
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ProductSearch
                    ref={productSearchRef}
                    onProductSelect={handleProductSelect as any}
                    label="Product Search"
                    placeholder="Scan or type to add products..."
                    disabled={isComponentDisabled || isAddingProduct}
                    className="product-search-field"
                  />
                  {isAddingProduct && <CircularProgress size={24} />}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={removeSelectedProducts}
                    disabled={isComponentDisabled || (Array.isArray(selectedRowIds) ? selectedRowIds.length === 0 : true)}
                  >
                    Remove Selected
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<DeleteSweepIcon />}
                    onClick={removeAllProducts}
                    disabled={isComponentDisabled || grnDetails.length === 0}
                  >
                    Remove All
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ height: 700, width: "100%" }}>
            <DataGrid
              rows={grnDetails}
              columns={columns}
              getRowId={(row) => row.serialNo}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={(error) => showAlert("Error", `Update failed: ${error.message}`, "error")}
              editMode="row"
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={setSelectedRowIds}
              rowSelectionModel={selectedRowIds}
              getRowHeight={() => "auto"}
              getEstimatedRowHeight={() => 64}
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
                boxShadow: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
                [`& .${gridClasses.cell}`]: { py: 1.5 },
                [`& .${gridClasses.row}`]: {
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.25),
                    },
                  },
                },
                [`& .${gridClasses.columnHeaders}`]: {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.dark,
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                },
                [`& .${gridClasses.cell}--editable`]: {
                  bgcolor: alpha(theme.palette.info.light, 0.15),
                  "&:focus-within": {
                    bgcolor: alpha(theme.palette.info.light, 0.25),
                  },
                },
                "& .font-mono": {
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                },
                [`& .${gridClasses.footerContainer}`]: {
                  borderTop: `1px solid ${theme.palette.divider}`,
                },
              }}
            />
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(GrnDetailsComponent);
