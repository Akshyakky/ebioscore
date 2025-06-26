import CustomButton from "@/components/Button/CustomButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GRNDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { usePurchaseOrder } from "@/pages/inventoryManagement/PurchaseOrder/hooks/usePurchaseOrder";
import { useAlert } from "@/providers/AlertProvider";
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  LocalFireDepartment,
  Assignment as POIcon,
  ShoppingCart as PurchaseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import POSearchDialog from "./POSearchDailogue";

interface PurchaseOrderSectionProps {
  expanded: boolean;
  onChange: () => void;
  isApproved: boolean;
  watchedDeptID: number | null;
  watchedDeptName: string;
  onPoDataFetched: (mast: PurchaseOrderMastDto | null, details: PurchaseOrderDetailDto[]) => void;
  onGRNDataFetched?: (grnDetails: GRNDetailDto[]) => void;
}

interface PurchaseOrderGRNDetailRow extends GRNDetailDto {
  id: string | number;
  _serialNo: number;
  _pastReceivedPack: number;
}

const PurchaseOrderSection: React.FC<PurchaseOrderSectionProps> = ({ expanded, onChange, isApproved, watchedDeptID, watchedDeptName, onPoDataFetched, onGRNDataFetched }) => {
  const { control, setValue, resetField } = useForm();
  const theme = useTheme();
  const { showAlert } = useAlert();
  const dropdownValues = useDropdownValues(["taxType"]);

  const [isPOSearchOpen, setIsPOSearchOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderMastDto | null>(null);
  const [poDetails, setPoDetails] = useState<PurchaseOrderDetailDto[]>([]);
  const [grnDetails, setGrnDetails] = useState<GRNDetailDto[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  const { getPurchaseOrderById, isLoading: isPoDetailsLoading } = usePurchaseOrder();

  const handlePoSelection = useCallback(
    async (po: PurchaseOrderMastDto) => {
      if (!po?.pOID) return;

      setIsPOSearchOpen(false);
      setSelectedPO(po);

      const fullPoData = await getPurchaseOrderById(po.pOID);

      if (fullPoData?.purchaseOrderMastDto) {
        const mast = fullPoData.purchaseOrderMastDto;
        const details = fullPoData.purchaseOrderDetailDto || [];

        setValue("poCode", mast.pOCode || "", { shouldDirty: true });
        setValue("poNo", mast.pOCode || "", { shouldDirty: true });
        setValue("poID", mast.pOID, { shouldDirty: true });
        setValue("poDate", mast.pODate ? dayjs(mast.pODate).toDate() : null, { shouldDirty: true });
        setValue("poTotalAmt", mast.totalAmt || 0, { shouldDirty: true });
        setValue("poDiscAmt", mast.discAmt || 0, { shouldDirty: true });

        setPoDetails(details);
        setGrnDetails([]);
        onPoDataFetched(mast, details);
      } else {
        setPoDetails([]);
        setGrnDetails([]);
        onPoDataFetched(po, []);
      }
    },
    [getPurchaseOrderById, setValue, onPoDataFetched]
  );

  const handleClearPO = useCallback(() => {
    setSelectedPO(null);
    setPoDetails([]);
    setGrnDetails([]);
    resetField("poCode");
    resetField("poNo");
    resetField("poID");
    resetField("poDate");
    resetField("poTotalAmt");
    resetField("poDiscAmt");
    onPoDataFetched(null, []);
    if (onGRNDataFetched) {
      onGRNDataFetched([]);
    }
  }, [resetField, onPoDataFetched, onGRNDataFetched]);

  // Convert purchase order details to GRN detail rows
  const gridRows: PurchaseOrderGRNDetailRow[] = useMemo(() => {
    return poDetails
      .filter((poDetail) => poDetail.rActiveYN !== "N")
      .map((poDetail, index) => {
        const existingGRNDetail = grnDetails.find((grn) => grn.poDetID === poDetail.pODetID);

        if (existingGRNDetail) {
          return {
            ...existingGRNDetail,
            id: existingGRNDetail.grnDetID || `temp-${index}`,
            _serialNo: index + 1,
            _pastReceivedPack: existingGRNDetail._pastReceivedPack || 0,
          };
        }

        const newGRNDetail: PurchaseOrderGRNDetailRow = {
          grnDetID: 0,
          grnID: 0,
          serialNo: index + 1,
          poDetID: poDetail.pODetID,
          productID: poDetail.productID,
          productCode: poDetail.productCode || "",
          productName: poDetail.productName || "",
          catValue: poDetail.catValue || "",
          catDesc: poDetail.catDesc || "",
          mfID: poDetail.manufacturerID,
          mfName: poDetail.manufacturerName || "",
          manufacturerID: poDetail.manufacturerID,
          manufacturerCode: poDetail.manufacturerCode,
          manufacturerName: poDetail.manufacturerName || "",
          pGrpID: poDetail.pGrpID,
          pGrpName: poDetail.pGrpName || "",
          psGrpID: poDetail.pSGrpID,
          psGrpName: poDetail.pSGrpName || "",
          pUnitID: poDetail.pUnitID,
          pUnitName: poDetail.pUnitName || "",
          pUnitsPerPack: poDetail.unitPack || 1,
          pkgID: poDetail.pPkgID,
          pkgName: poDetail.pPkgName || "",
          hsnCode: poDetail.hsnCode || "",

          requiredPack: poDetail.requiredPack || 0,
          requiredQty: poDetail.requiredUnitQty || 0,
          recvdPack: 0,
          recvdQty: 0,
          acceptQty: 0,
          freeItems: poDetail.freeQty || 0,
          rejectedQty: 0,

          unitPrice: poDetail.unitPrice || 0,
          sellingPrice: poDetail.totAmt || 0,
          packPrice: poDetail.unitPrice || 0,
          sellUnitPrice: 0,
          defaultPrice: poDetail.unitPrice || 0,
          mrp: 0,
          mrpAbated: 0,

          discAmt: poDetail.discAmt || 0,
          discPercentage: poDetail.discPercentageAmt || 0,

          gstPercentage: poDetail.gstPerValue || 0,
          cgstPerValue: poDetail.cgstPerValue || 0,
          cgstTaxAmt: poDetail.cgstTaxAmt || 0,
          sgstPerValue: poDetail.sgstPerValue || 0,
          sgstTaxAmt: poDetail.sgstTaxAmt || 0,
          igstPerValue: 0,
          igstTaxAmt: 0,
          taxableAmt: poDetail.taxableAmt || 0,
          totalTaxAmt: poDetail.taxAmt || 0,

          taxAfterDiscYN: poDetail.taxAfterDiscYN || "N",
          taxAfterDiscOnMrpYN: poDetail.taxAfterDiscOnMrp || "N",
          includeTaxYN: "N",
          taxOnFreeItemsYN: poDetail.taxOnFreeItemYN || "N",
          taxOnMrpYN: poDetail.taxOnMrpYN || "N",
          taxOnUnitPriceYN: poDetail.taxOnUnitPrice || "N",

          batchNo: "",
          referenceNo: "",
          expiryDate: "",
          lotNo: "",
          vendorBatchNo: "",
          shelfLife: 0,
          storageCondition: "",
          productNotes: "",

          expiryYN: "N",
          isFreeItemYN: poDetail.isFreeItemYN || "N",
          prescriptionYN: "N",
          qualityCheckYN: "N",
          qualityStatus: "",
          qualityRemarks: "",

          productValue: 0,
          itemMrpValue: 0,
          itemTotalProfit: 0,
          itemTotalVat: 0,

          _recievedQty: 0,
          _serialNo: index + 1,
          _pastReceivedPack: 0,
          _unitPrice: poDetail.unitPrice || 0,
          _sellingUnitPrice: 0,
          _calculatedValue: 0,
          _totalWithTax: 0,

          id: `temp-${index}`,
          rActiveYN: "Y",
          isDeleted: false,
          createdBy: "",
          createdAt: "",
          updatedBy: "",
          updatedAt: "",
        };

        return newGRNDetail;
      });
  }, [poDetails, grnDetails]);

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

    setGrnDetails(updatedDetails);
    if (onGRNDataFetched) {
      onGRNDataFetched(updatedDetails);
    }
    setDeleteConfirmation({ open: false, index: null });
  };

  const handleCellValueChange = useCallback(
    (id: string | number, field: keyof GRNDetailDto, value: any) => {
      const updatedDetails = [...grnDetails];
      let index = updatedDetails.findIndex((item) => (item.grnDetID || `temp-${grnDetails.indexOf(item)}`) === id);

      if (index === -1) {
        const rowData = gridRows.find((row) => row.id === id);
        if (rowData) {
          updatedDetails.push({ ...rowData });
          index = updatedDetails.length - 1;
        }
      }

      if (index === -1) return;

      const currentRow = updatedDetails[index];
      (currentRow as any)[field] = value;

      // --- Field-Specific Preparations ---
      if (field === "packPrice" || field === "pUnitsPerPack") {
        if ((currentRow.pUnitsPerPack || 0) > 0) {
          currentRow.unitPrice = parseFloat(((currentRow.packPrice || 0) / (currentRow.pUnitsPerPack || 1)).toFixed(4));
        }
      }
      if (field === "recvdPack" || field === "pUnitsPerPack") {
        currentRow.recvdQty = parseFloat(((currentRow.recvdPack || 0) * (currentRow.pUnitsPerPack || 1)).toFixed(2));
        currentRow.acceptQty = currentRow.recvdQty;
      }
      if (field === "gstPercentage") {
        const gstValue = Number(value) || 0;
        currentRow.cgstPerValue = parseFloat((gstValue / 2).toFixed(2));
        currentRow.sgstPerValue = parseFloat((gstValue / 2).toFixed(2));
      }

      // --- Core Calculation Logic based on Rules ---
      const receivedPack = currentRow.recvdPack || 0;
      const packPrice = currentRow.packPrice || 0;
      const discPercentage = currentRow.discPercentage || 0;
      const gstPercentage = currentRow.gstPercentage || 0;
      const isTaxAfterDisc = currentRow.taxAfterDiscYN === "Y";
      const isTaxInclusive = currentRow.includeTaxYN === "Y";

      let baseAmount = 0,
        discountAmount = 0,
        taxableAmount = 0,
        totalTaxAmount = 0,
        finalValue = 0;

      baseAmount = receivedPack * packPrice;

      if (isTaxInclusive) {
        finalValue = baseAmount;
        if (isTaxAfterDisc) {
          taxableAmount = baseAmount / (1 + gstPercentage / 100);
          totalTaxAmount = taxableAmount * (gstPercentage / 100);
          discountAmount = baseAmount - taxableAmount;
        } else {
          totalTaxAmount = baseAmount * (gstPercentage / 100);
          discountAmount = totalTaxAmount;
          taxableAmount = baseAmount - discountAmount;
        }
      } else {
        discountAmount = baseAmount * (discPercentage / 100);
        taxableAmount = baseAmount - discountAmount;
        if (isTaxAfterDisc) {
          totalTaxAmount = taxableAmount * (gstPercentage / 100);
        } else {
          totalTaxAmount = baseAmount * (gstPercentage / 100);
        }
        finalValue = taxableAmount + totalTaxAmount;
      }

      currentRow.discAmt = parseFloat(discountAmount.toFixed(2));
      currentRow.taxableAmt = parseFloat(taxableAmount.toFixed(2));

      const totalGstPercentage = (currentRow.cgstPerValue || 0) + (currentRow.sgstPerValue || 0);
      if (totalGstPercentage > 0) {
        currentRow.cgstTaxAmt = parseFloat((totalTaxAmount * ((currentRow.cgstPerValue || 0) / totalGstPercentage)).toFixed(2));
        currentRow.sgstTaxAmt = parseFloat((totalTaxAmount * ((currentRow.sgstPerValue || 0) / totalGstPercentage)).toFixed(2));
      } else {
        currentRow.cgstTaxAmt = 0;
        currentRow.sgstTaxAmt = 0;
      }

      currentRow.totalTaxAmt = parseFloat(totalTaxAmount.toFixed(2));
      currentRow.productValue = parseFloat(finalValue.toFixed(2));
      currentRow._calculatedValue = currentRow.productValue;
      currentRow._totalWithTax = currentRow.productValue;
      currentRow._recievedQty = currentRow.recvdQty;

      setGrnDetails(updatedDetails);
      if (onGRNDataFetched) {
        onGRNDataFetched(updatedDetails);
      }
    },
    [grnDetails, gridRows, onGRNDataFetched]
  );

  const handleDropdownChange = useCallback(
    (value: number, id: string | number) => {
      const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.label) === Number(value));
      const selectedRate = Number(selectedTax?.label || 0);
      handleCellValueChange(id, "gstPercentage", selectedRate);
    },
    [dropdownValues.taxType, handleCellValueChange]
  );

  const renderNumberField = useCallback(
    (params: GridRenderCellParams, field: keyof GRNDetailDto, precision: number = 2) => (
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
        disabled={isApproved}
      />
    ),
    [handleCellValueChange, isApproved]
  );

  const renderTextField = useCallback(
    (params: GridRenderCellParams, field: keyof GRNDetailDto) => (
      <TextField
        size="small"
        type="text"
        value={params.row[field] || ""}
        onChange={(e) => {
          handleCellValueChange(params.id, field, e.target.value);
        }}
        sx={{ width: "100%" }}
        fullWidth
        disabled={isApproved}
      />
    ),
    [handleCellValueChange, isApproved]
  );

  const renderDateField = useCallback(
    (params: GridRenderCellParams, field: keyof GRNDetailDto) => (
      <TextField
        size="small"
        type="date"
        value={params.row[field] ? dayjs(params.row[field]).format("YYYY-MM-DD") : ""}
        onChange={(e) => {
          handleCellValueChange(params.id, field, e.target.value);
        }}
        sx={{ width: "100%" }}
        fullWidth
        disabled={isApproved}
        InputLabelProps={{
          shrink: true,
        }}
      />
    ),
    [handleCellValueChange, isApproved]
  );

  const renderCheckbox = useCallback(
    (params: GridRenderCellParams, field: keyof GRNDetailDto) => (
      <Checkbox
        checked={params.row[field] === "Y"}
        onChange={(e) => {
          handleCellValueChange(params.id, field, e.target.checked ? "Y" : "N");
        }}
        disabled={isApproved}
        size="small"
      />
    ),
    [handleCellValueChange, isApproved]
  );

  const renderGSTSelect = useCallback(
    (params: GridRenderCellParams) => (
      <Select
        size="small"
        value={params.row.gstPercentage || ""}
        onChange={(e) => {
          const value = Number(e.target.value);
          handleDropdownChange(value, params.id);
        }}
        sx={{ width: "100%" }}
        displayEmpty
        disabled={isApproved}
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
    [dropdownValues.taxType, handleDropdownChange, isApproved]
  );

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
        field: "requiredPack",
        headerName: "Required Pack",
        width: 120,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => params.row.requiredPack || 0,
      },
      {
        field: "recvdPack",
        headerName: "Received Pack",
        width: 130,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "recvdPack", 0),
      },
      {
        field: "recvdQty",
        headerName: "Received Qty",
        width: 120,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => params.row.recvdQty || 0,
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
        field: "serialNo",
        headerName: "Serial No.",
        width: 100,
        sortable: false,
        renderCell: (params) => renderTextField(params, "serialNo"),
      },
      {
        field: "batchNo",
        headerName: "Batch No",
        width: 120,
        sortable: false,
        renderCell: (params) => renderTextField(params, "batchNo"),
      },
      {
        field: "referenceNo",
        headerName: "Reference No",
        width: 120,
        sortable: false,
        renderCell: (params) => renderTextField(params, "referenceNo"),
      },
      {
        field: "expiryDate",
        headerName: "Expiry Date",
        width: 130,
        sortable: false,
        renderCell: (params) => renderDateField(params, "expiryDate"),
      },
      {
        field: "sellingPrice",
        headerName: "Selling Price",
        width: 120,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "sellingPrice"),
      },
      {
        field: "packPrice",
        headerName: "Pack Price",
        width: 120,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "packPrice"),
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
        field: "includeTaxYN",
        headerName: "Inc.Tax",
        width: 80,
        sortable: false,
        renderCell: (params) => renderCheckbox(params, "includeTaxYN"),
      },
      {
        field: "totalTaxAmt",
        headerName: "GST Amt",
        width: 100,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (params.row.totalTaxAmt || 0).toFixed(2),
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
        field: "_pastReceivedPack",
        headerName: "Past Received Pack",
        width: 150,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => params.row._pastReceivedPack || 0,
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
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (params.row.unitPrice || 0).toFixed(4),
      },
      {
        field: "sellUnitPrice",
        headerName: "Selling Unit Price",
        width: 150,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "sellUnitPrice"),
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
            disabled={isApproved}
            showInMenu={false}
          />,
        ],
      },
    ],
    [renderNumberField, renderTextField, renderDateField, renderCheckbox, renderGSTSelect, handleDeleteClick, isApproved]
  );

  return (
    <>
      <Accordion expanded={expanded} onChange={onChange}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <POIcon color="primary" />
            <Typography variant="h6" color="primary">
              Purchase Order Information
            </Typography>
            <Chip label="Optional" size="small" color="info" variant="outlined" />
            {selectedPO && <Chip label={`PO: ${selectedPO.pOCode}`} size="small" color="success" variant="filled" onDelete={handleClearPO} />}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField
                name="poCode"
                control={control}
                type="text"
                label="PO Code"
                size="small"
                disabled
                helperText={selectedPO ? `Selected PO: ${selectedPO.pOCode}` : "Click search to select PO"}
                adornment={
                  <InputAdornment position="end">
                    <CustomButton
                      size="small"
                      variant="outlined"
                      icon={SearchIcon}
                      text="Search"
                      onClick={() => setIsPOSearchOpen(true)}
                      disabled={isApproved || !watchedDeptID}
                      color="primary"
                    />
                  </InputAdornment>
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField name="poNo" control={control} type="text" label="PO Number" size="small" disabled />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField name="poDate" control={control} type="datepicker" label="PO Date" size="small" disabled />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card
                variant="outlined"
                sx={{
                  mt: 2,
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
                      PO-based GRN Product Details
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }} />
                    <Typography variant="body2" color="text.secondary">
                      Products from selected Purchase Order
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
                  {isPoDetailsLoading ? (
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
                        Loading product details...
                      </Typography>
                    </Box>
                  ) : gridRows.length > 0 ? (
                    <Box sx={{ height: 600, width: "100%" }}>
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
                        bgcolor: alpha(theme.palette.grey[50], 0.8),
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
                        No Purchase Order Selected
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
                        Select a purchase order to view and manage product details for GRN
                      </Typography>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <POSearchDialog
        open={isPOSearchOpen}
        onClose={() => setIsPOSearchOpen(false)}
        onSelectPO={handlePoSelection}
        departmentId={watchedDeptID ?? undefined}
        departmentName={watchedDeptName}
      />

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
    </>
  );
};

export default PurchaseOrderSection;
