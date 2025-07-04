import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { ProductListDto } from "@/interfaces/InventoryManagement/ProductListDto";
import { useAlert } from "@/providers/AlertProvider";
import { productListService } from "@/services/InventoryManagementService/inventoryManagementService";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  AddBusiness as IssueIcon,
  LocalFireDepartment,
  ShoppingCart as PurchaseIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ProductSearch, ProductSearchRef } from "../../CommonPage/Product/ProductSearchForm";
import IssueDepartmentDialog, { IssueDepartmentData } from "./NewIssueDepartmentDialog";

interface UpdatedGrnDetailsComponentProps {
  grnDetails: GrnDetailDto[];
  onGrnDetailsChange: (details: GrnDetailDto[]) => void;
  disabled?: boolean;
  grnApproved?: boolean;
  expanded: boolean;
  onToggle: () => void;
  grnID?: number;
  catValue?: string;
  issueDepartments?: IssueDepartmentData[];
  onIssueDepartmentChange?: (departments: IssueDepartmentData[]) => void;
}

interface GRNDetailRow extends GrnDetailDto {
  id: string | number;
  _serialNo: number;
  _pastReceivedPack: number;
  _issueDepartment?: IssueDepartmentData;
}

const GrnDetailsComponent: React.FC<UpdatedGrnDetailsComponentProps> = ({
  grnDetails,
  onGrnDetailsChange,
  disabled = false,
  grnApproved = false,
  expanded,
  onToggle,
  grnID,
  catValue,
  issueDepartments = [],
  onIssueDepartmentChange,
}) => {
  const theme = useTheme();
  const { showAlert } = useAlert();
  const dropdownValues = useDropdownValues(["taxType"]);
  const productSearchRef = useRef<ProductSearchRef>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  // Issue Department Dialog state
  const [isIssueDeptDialogOpen, setIsIssueDeptDialogOpen] = useState(false);
  const [selectedProductForIssue, setSelectedProductForIssue] = useState<GrnDetailDto | null>(null);
  const [editingIssueDepartment, setEditingIssueDepartment] = useState<IssueDepartmentData | null>(null);

  // Convert GRN details to rows with proper IDs
  const gridRows: GRNDetailRow[] = useMemo(() => {
    return grnDetails.map((detail, index) => {
      // Find associated issue department
      const associatedIssueDept = issueDepartments.find((dept) => dept.productID === detail.productID);

      return {
        ...detail,
        id: detail.grnDetID || `temp-${index}`,
        _serialNo: index + 1,
        _pastReceivedPack: 0,
        _issueDepartment: associatedIssueDept,
      };
    });
  }, [grnDetails, issueDepartments]);

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

        const newDetail: GrnDetailDto = {
          grnDetID: 0,
          // Don't set grnID here for new records - let the backend handle it during save
          grnID: grnID && grnID > 0 ? grnID : 0, // Only set if we have a valid existing grnID
          pGrpID: productData.data.pGrpID,
          pGrpName: productData.data.productGroupName,
          productID: productData.data.productID,
          productCode: productData.data.productCode,
          catValue: catValue || "MEDI",
          mfID: productData.data.manufacturerID,
          pUnitID: productData.data.pUnitID,
          pUnitName: productData.data.pUnitName,
          pUnitsPerPack: productData.data.unitPack || 1,
          pkgID: productData.data.pkgID,
          batchNo: "",
          expiryDate: "",
          unitPrice: productData.data.defaultPrice || 0,
          tax: 0,
          sellUnitPrice: 0,
          recvdQty: 1,
          acceptQty: 1,
          freeItems: 0,
          productValue: productData.data.defaultPrice || 0,
          productNotes: "",
          psGrpID: productData.data.psGrpID,
          chargeablePercent: 0,
          discAmt: 0,
          discPercentage: 0,
          expiryYN: productData.data.expiry === "Y" ? "Y" : "N",
          isFreeItemYN: "N",
          itemMrpValue: 0,
          itemTotalProfit: 0,
          itemTotalVat: 0,
          manufacturerCode: productData.data.manufacturerCode,
          manufacturerID: productData.data.manufacturerID,
          manufacturerName: productData.data.manufacturerName,
          mrpAbated: 0,
          mrp: 0,
          poDetID: 0,
          requiredUnitQty: 1,
          taxAfterDiscOnMrpYN: "N",
          taxAfterDiscYN: "N",
          taxCode: "",
          taxID: 0,
          taxModeCode: "",
          taxModeDescription: "",
          taxModeID: "",
          taxName: "",
          taxOnFreeItemsYN: "N",
          taxOnMrpYN: "N",
          taxOnUnitPriceYN: "N",
          catDesc: "REVENUE",
          mfName: productData.data.manufacturerName,
          pkgName: productData.data.pkgName,
          productName: productData.data.productName,
          psGrpName: productData.data.psGroupName,
          refNo: "",
          hsnCode: productData.data.hsnCODE,
          cgstPerValue: productData.data.cgstPerValue || 0,
          cgstTaxAmt: 0,
          sgstPerValue: productData.data.sgstPerValue || 0,
          sgstTaxAmt: 0,
          taxableAmt: productData.data.defaultPrice || 0,
          defaultPrice: productData.data.defaultPrice || 0,
        };

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
    [grnDetails, onGrnDetailsChange, showAlert, grnID, catValue]
  );

  const handleDeleteClick = useCallback(
    (id: string | number) => {
      const index = gridRows.findIndex((row) => row.id === id);
      setDeleteConfirmation({ open: true, index });
    },
    [gridRows]
  );

  const handleDeleteRow = () => {
    if (deleteConfirmation.index === null) return;

    const updatedDetails = [...grnDetails];
    const rowToDelete = gridRows[deleteConfirmation.index];
    const originalIndex = grnDetails.findIndex((item) => item.productID === rowToDelete.productID);

    if (originalIndex !== -1) {
      updatedDetails.splice(originalIndex, 1);
    }

    onGrnDetailsChange(updatedDetails);
    setDeleteConfirmation({ open: false, index: null });
    showAlert("Success", "Product removed successfully.", "success");
  };

  const handleCellValueChange = useCallback(
    (id: string | number, field: keyof GrnDetailDto, value: any) => {
      const updatedDetails = [...grnDetails];
      const index = updatedDetails.findIndex((item) => (item.grnDetID || `temp-${grnDetails.indexOf(item)}`) === id);

      if (index === -1) return;

      const currentRow = updatedDetails[index];
      (currentRow as any)[field] = value;

      // --- Field-Specific Preparations ---
      if (field === "unitPrice" || field === "pUnitsPerPack") {
        const packPrice = parseFloat(((currentRow.unitPrice || 0) * (currentRow.pUnitsPerPack || 1)).toFixed(2));
        // Store pack price in productValue temporarily for calculation
        currentRow.productValue = packPrice;
      }
      if (field === "recvdQty" || field === "pUnitsPerPack") {
        currentRow.acceptQty = currentRow.recvdQty;
      }
      if (field === "gstPercentage") {
        const gstValue = Number(value) || 0;
        currentRow.cgstPerValue = parseFloat((gstValue / 2).toFixed(2));
        currentRow.sgstPerValue = parseFloat((gstValue / 2).toFixed(2));
      }

      // --- Core Calculation Logic based on Rules ---
      const receivedQty = currentRow.recvdQty || 0;
      const unitPrice = currentRow.unitPrice || 0;
      const discPercentage = currentRow.discPercentage || 0;
      const cgstRate = currentRow.cgstPerValue || 0;
      const sgstRate = currentRow.sgstPerValue || 0;
      const gstPercentage = cgstRate + sgstRate;
      const isTaxAfterDisc = currentRow.taxAfterDiscYN === "Y";

      let baseAmount = 0,
        discountAmount = 0,
        taxableAmount = 0,
        totalTaxAmount = 0,
        finalValue = 0;

      // Rule 1: Base Amount (Always first)
      baseAmount = receivedQty * unitPrice;

      // Rule 2: Discount Amount
      discountAmount = baseAmount * (discPercentage / 100);
      // Rule 3: Taxable Amount
      taxableAmount = baseAmount - discountAmount;
      // Rule 4 & 5: Total Tax Amount
      if (isTaxAfterDisc) {
        totalTaxAmount = taxableAmount * (gstPercentage / 100);
      } else {
        totalTaxAmount = baseAmount * (gstPercentage / 100);
      }
      // Rule 6: Final Value
      finalValue = taxableAmount + totalTaxAmount;

      // Update the current row with all the calculated values
      currentRow.discAmt = parseFloat(discountAmount.toFixed(2));
      currentRow.taxableAmt = parseFloat(taxableAmount.toFixed(2));

      // Split the total tax into CGST and SGST
      const totalGstPercentage = (currentRow.cgstPerValue || 0) + (currentRow.sgstPerValue || 0);
      if (totalGstPercentage > 0) {
        currentRow.cgstTaxAmt = parseFloat((totalTaxAmount * ((currentRow.cgstPerValue || 0) / totalGstPercentage)).toFixed(2));
        currentRow.sgstTaxAmt = parseFloat((totalTaxAmount * ((currentRow.sgstPerValue || 0) / totalGstPercentage)).toFixed(2));
      } else {
        currentRow.cgstTaxAmt = 0;
        currentRow.sgstTaxAmt = 0;
      }

      currentRow.productValue = parseFloat(finalValue.toFixed(2));

      onGrnDetailsChange(updatedDetails);
    },
    [grnDetails, onGrnDetailsChange]
  );

  const handleDropdownChange = useCallback(
    (value: number, id: string | number) => {
      const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.label) === Number(value));
      const selectedRate = Number(selectedTax?.label || 0);
      handleCellValueChange(id, "gstPercentage", selectedRate);
    },
    [dropdownValues.taxType, handleCellValueChange]
  );

  // Issue Department handlers
  const handleIssueDepartmentClick = useCallback((row: GRNDetailRow) => {
    setSelectedProductForIssue(row);
    setEditingIssueDepartment(row._issueDepartment || null);
    setIsIssueDeptDialogOpen(true);
  }, []);

  const handleIssueDepartmentSubmit = useCallback(
    (data: IssueDepartmentData) => {
      if (onIssueDepartmentChange) {
        let updatedDepartments = [...issueDepartments];

        if (editingIssueDepartment) {
          // Update existing
          const index = updatedDepartments.findIndex((dept) => dept.id === editingIssueDepartment.id);
          if (index !== -1) {
            updatedDepartments[index] = data;
            showAlert("Success", "Issue department updated successfully.", "success");
          }
        } else {
          // Add new
          updatedDepartments.push(data);
          showAlert("Success", "Issue department added successfully.", "success");
        }

        onIssueDepartmentChange(updatedDepartments);
      }

      setIsIssueDeptDialogOpen(false);
      setEditingIssueDepartment(null);
      setSelectedProductForIssue(null);
    },
    [editingIssueDepartment, issueDepartments, onIssueDepartmentChange, showAlert]
  );

  const handleIssueDepartmentDialogClose = useCallback(() => {
    setIsIssueDeptDialogOpen(false);
    setEditingIssueDepartment(null);
    setSelectedProductForIssue(null);
  }, []);

  // Render functions for different cell types
  const renderNumberField = useCallback(
    (params: GridRenderCellParams, field: keyof GrnDetailDto, precision: number = 2) => (
      <TextField
        size="small"
        type="number"
        value={params.row[field] || ""}
        onChange={(e) => {
          const value = parseFloat(e.target.value) || 0;
          handleCellValueChange(params.id, field, precision > 0 ? parseFloat(value.toFixed(precision)) : value);
        }}
        sx={{ width: "100%" }}
        inputProps={{
          step: precision > 0 ? 0.01 : 1,
          style: { textAlign: "right" },
        }}
        fullWidth
        disabled={disabled || grnApproved}
      />
    ),
    [handleCellValueChange, disabled, grnApproved]
  );

  const renderTextField = useCallback(
    (params: GridRenderCellParams, field: keyof GrnDetailDto) => (
      <TextField
        size="small"
        type="text"
        value={params.row[field] || ""}
        onChange={(e) => {
          handleCellValueChange(params.id, field, e.target.value);
        }}
        sx={{ width: "100%" }}
        fullWidth
        disabled={disabled || grnApproved}
      />
    ),
    [handleCellValueChange, disabled, grnApproved]
  );

  const renderDateField = useCallback(
    (params: GridRenderCellParams, field: keyof GrnDetailDto) => (
      <TextField
        size="small"
        type="date"
        value={params.row[field] ? dayjs(params.row[field]).format("YYYY-MM-DD") : ""}
        onChange={(e) => {
          handleCellValueChange(params.id, field, e.target.value);
        }}
        sx={{ width: "100%" }}
        fullWidth
        disabled={disabled || grnApproved}
        InputLabelProps={{
          shrink: true,
        }}
      />
    ),
    [handleCellValueChange, disabled, grnApproved]
  );

  const renderCheckbox = useCallback(
    (params: GridRenderCellParams, field: keyof GrnDetailDto) => (
      <Checkbox
        checked={params.row[field] === "Y"}
        onChange={(e) => {
          handleCellValueChange(params.id, field, e.target.checked ? "Y" : "N");
        }}
        disabled={disabled || grnApproved}
        size="small"
      />
    ),
    [handleCellValueChange, disabled, grnApproved]
  );

  const renderGSTSelect = useCallback(
    (params: GridRenderCellParams) => (
      <Select
        size="small"
        value={(params.row.cgstPerValue || 0) + (params.row.sgstPerValue || 0) || ""}
        onChange={(e) => {
          const value = Number(e.target.value);
          handleDropdownChange(value, params.id);
        }}
        sx={{ width: "100%" }}
        displayEmpty
        disabled={disabled || grnApproved}
        renderValue={(selected) => {
          if (!selected) return "Select GST";
          return `${selected}%`;
        }}
      >
        {(dropdownValues.taxType || []).map((option) => (
          <MenuItem key={option.value} value={Number(option.label)}>
            {option.label}%
          </MenuItem>
        ))}
      </Select>
    ),
    [dropdownValues.taxType, handleDropdownChange, disabled, grnApproved]
  );

  const renderIssueDepartmentCell = useCallback(
    (params: GridRenderCellParams) => {
      const row = params.row as GRNDetailRow;
      const hasIssueDept = row._issueDepartment;

      return (
        <Box display="flex" alignItems="center" gap={1}>
          {hasIssueDept ? (
            <>
              <Chip label={`${row._issueDepartment?.deptName} (${row._issueDepartment?.quantity})`} size="small" color="success" variant="outlined" />
              <Tooltip title="Edit Issue Department">
                <IconButton size="small" onClick={() => handleIssueDepartmentClick(row)} disabled={disabled || grnApproved}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Add Issue Department">
              <IconButton size="small" onClick={() => handleIssueDepartmentClick(row)} disabled={disabled || grnApproved} color="primary">
                <IssueIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },
    [handleIssueDepartmentClick, disabled, grnApproved]
  );

  const handleRemoveAll = useCallback(() => {
    onGrnDetailsChange([]);
    showAlert("Success", "All products removed successfully.", "success");
  }, [onGrnDetailsChange, showAlert]);

  // Define columns for DataGrid
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "_serialNo",
        headerName: "Sl. No",
        width: 80,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => params.row._serialNo,
      },
      {
        field: "productName",
        headerName: "Product Name",
        width: 200,
        sortable: false,
      },
      {
        field: "requiredUnitQty",
        headerName: "Required Qty",
        width: 120,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "requiredUnitQty", 0),
      },
      {
        field: "recvdQty",
        headerName: "Received Qty",
        width: 130,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "recvdQty", 0),
      },
      {
        field: "acceptQty",
        headerName: "Accept Qty",
        width: 120,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => renderNumberField(params, "acceptQty", 0),
      },
      {
        field: "freeItems",
        headerName: "Free Items",
        width: 100,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "freeItems", 0),
      },
      {
        field: "pUnitName",
        headerName: "UOM",
        width: 80,
        sortable: false,
      },
      {
        field: "pUnitsPerPack",
        headerName: "Units/Pack",
        width: 100,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "pUnitsPerPack", 0),
      },
      {
        field: "batchNo",
        headerName: "Batch No",
        width: 120,
        sortable: false,
        renderCell: (params) => renderTextField(params, "batchNo"),
      },
      {
        field: "refNo",
        headerName: "Reference No",
        width: 120,
        sortable: false,
        renderCell: (params) => renderTextField(params, "refNo"),
      },
      {
        field: "expiryDate",
        headerName: "Expiry Date",
        width: 130,
        sortable: false,
        renderCell: (params) => renderDateField(params, "expiryDate"),
      },
      {
        field: "SellunitPrice",
        headerName: "Selling Price",
        width: 120,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "SellunitPrice"),
      },
      {
        field: "gstPercentage",
        headerName: "GST[%]",
        width: 100,
        sortable: false,
        renderCell: renderGSTSelect,
      },
      {
        field: "discPercentage",
        headerName: "Disc[%]",
        width: 100,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "discPercentage"),
      },
      {
        field: "taxAfterDiscYN",
        headerName: "Tax after Disc[%]",
        width: 130,
        sortable: false,
        renderCell: (params) => renderCheckbox(params, "taxAfterDiscYN"),
      },
      {
        field: "cgstPerValue",
        headerName: "CGST%",
        width: 80,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => `${params.row.cgstPerValue || 0}%`,
      },
      {
        field: "cgstTaxAmt",
        headerName: "CGST Tax Amt",
        width: 120,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (params.row.cgstTaxAmt || 0).toFixed(2),
      },
      {
        field: "sgstPerValue",
        headerName: "SGST%",
        width: 80,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => `${params.row.sgstPerValue || 0}%`,
      },
      {
        field: "sgstTaxAmt",
        headerName: "SGST Tax Amt",
        width: 120,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (params.row.sgstTaxAmt || 0).toFixed(2),
      },
      {
        field: "productValue",
        headerName: "Value",
        width: 100,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (params.row.productValue || 0).toFixed(2),
      },
      {
        field: "manufacturerName",
        headerName: "Manufacturer",
        width: 150,
        sortable: false,
      },
      {
        field: "discAmt",
        headerName: "Disc",
        width: 100,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (params.row.discAmt || 0).toFixed(2),
      },
      {
        field: "unitPrice",
        headerName: "Unit Price",
        width: 120,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "unitPrice"),
      },
      {
        field: "issueDepartment",
        headerName: "Issue Department",
        width: 200,
        sortable: false,
        renderCell: renderIssueDepartmentCell,
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Delete",
        width: 80,
        getActions: (params) => [
          <GridActionsCellItem
            key="delete"
            icon={
              <Tooltip title="Remove Product">
                <DeleteIcon color="error" />
              </Tooltip>
            }
            label="Remove"
            onClick={() => handleDeleteClick(params.id)}
            disabled={disabled || grnApproved}
            showInMenu={false}
          />,
        ],
      },
    ],
    [renderNumberField, renderTextField, renderDateField, renderCheckbox, renderGSTSelect, renderIssueDepartmentCell, handleDeleteClick, disabled, grnApproved]
  );

  const isComponentDisabled = disabled || grnApproved;

  return (
    <>
      <Accordion expanded={expanded} onChange={onToggle} sx={{ mt: 2, boxShadow: 3, "&.Mui-expanded": { mt: 2 } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <PurchaseIcon color="primary" />
            <Typography variant="h6" color="primary">
              Manual Product Addition
            </Typography>
            <Chip label={`${gridRows.length} ${gridRows.length === 1 ? "Product" : "Products"}`} size="small" color="primary" variant="outlined" />
            <Chip label="Independent from PO" size="small" color="info" variant="outlined" />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 1, md: 2 } }}>
          <Stack spacing={2}>
            {/* Product Search Section */}
            <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ProductSearch
                      ref={productSearchRef}
                      onProductSelect={handleProductSelect as any}
                      label="Product Search"
                      placeholder="Scan or type to add products manually..."
                      disabled={isComponentDisabled || isAddingProduct}
                      className="product-search-field"
                    />
                    {isAddingProduct && <CircularProgress size={24} />}
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveAll}
                      disabled={isComponentDisabled || gridRows.length === 0}
                    >
                      Remove All
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* DataGrid Section */}
            <Card
              variant="outlined"
              sx={{
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
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
                    <PurchaseIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="600" color="primary.main">
                    Manual GRN Product Details
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }} />
                  <Typography variant="body2" color="text.secondary">
                    Manually added products for GRN
                  </Typography>
                </Box>
                {gridRows.length > 0 && (
                  <Chip
                    label={`${gridRows.length} ${gridRows.length === 1 ? "Product" : "Products"}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{
                      fontWeight: "600",
                      borderWidth: 2,
                    }}
                  />
                )}
              </Box>

              <CardContent sx={{ pt: 3 }}>
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
                ) : gridRows.length > 0 ? (
                  <Box sx={{ width: "100%" }}>
                    <DataGrid
                      rows={gridRows}
                      columns={columns}
                      density="compact"
                      disableRowSelectionOnClick
                      hideFooterSelectedRowCount
                      pageSizeOptions={[5, 10, 25, 50]}
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 10 },
                        },
                      }}
                      onProcessRowUpdateError={(error) => {
                        console.error("Row update error:", error);
                        showAlert("Error", "Failed to update field", "error");
                      }}
                      sx={{
                        "& .MuiDataGrid-cell:focus": {
                          outline: "none",
                        },
                        "& .MuiDataGrid-row:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.06),
                          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          fontWeight: "600",
                        },
                        "& .MuiDataGrid-cell": {
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        },
                        "& .MuiDataGrid-columnHeader:focus": {
                          outline: "none",
                        },
                        "& .MuiDataGrid-columnHeader:focus-within": {
                          outline: "none",
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: "center",
                      borderRadius: 2,
                      border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
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
                      <InventoryIcon sx={{ fontSize: 32, color: alpha(theme.palette.primary.main, 0.7) }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600" color="text.primary" gutterBottom>
                      No Manual Products Added
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
                      Use the product search above to manually add products to this GRN
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <ConfirmationDialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, index: null })}
        onConfirm={handleDeleteRow}
        title="Confirm Delete"
        message="Are you sure you want to delete this item?"
        confirmText="Delete"
        cancelText="Cancel"
        type="warning"
      />

      {/* Issue Department Dialog */}
      <IssueDepartmentDialog
        open={isIssueDeptDialogOpen}
        onClose={handleIssueDepartmentDialogClose}
        onSubmit={handleIssueDepartmentSubmit}
        selectedProduct={selectedProductForIssue}
        editData={editingIssueDepartment}
        title={editingIssueDepartment ? "Edit Issue Department" : "New Issue Department"}
      />
    </>
  );
};

export default React.memo(GrnDetailsComponent);
