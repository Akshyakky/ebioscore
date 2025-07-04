import CustomButton from "@/components/Button/CustomButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GrnDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
import { PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { usePurchaseOrder } from "@/pages/inventoryManagement/PurchaseOrder/hooks/usePurchaseOrder";
import { useAlert } from "@/providers/AlertProvider";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  AddBusiness as IssueIcon,
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
  IconButton,
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import IssueDepartmentDialog, { IssueDepartmentData } from "./NewIssueDepartmentDialog";
import POSearchDialog from "./POSearchDailogue";

interface PurchaseOrderSectionProps {
  expanded: boolean;
  onChange: () => void;
  isApproved: boolean;
  watchedDeptID: number | null;
  watchedDeptName: string;
  onPoDataFetched: (mast: PurchaseOrderMastDto | null, details: PurchaseOrderDetailDto[]) => void;
  onGRNDataFetched?: (grnDetails: GrnDetailDto[]) => void;
  issueDepartments?: IssueDepartmentData[];
  onIssueDepartmentChange?: (departments: IssueDepartmentData[]) => void;
  existingGrnDetails?: GrnDetailDto[]; // FIXED: New prop to pass existing GRN details
}

interface PurchaseOrderGRNDetailRow extends GrnDetailDto {
  id: string | number;
  _serialNo: number;
  _issueDepartment?: IssueDepartmentData;
}

const PurchaseOrderSection: React.FC<PurchaseOrderSectionProps> = ({
  expanded,
  onChange,
  isApproved,
  watchedDeptID,
  watchedDeptName,
  onPoDataFetched,
  onGRNDataFetched,
  issueDepartments = [],
  onIssueDepartmentChange,
  existingGrnDetails = [], // FIXED: Default to empty array
}) => {
  const { control, setValue, resetField, watch } = useForm();
  const theme = useTheme();
  const { showAlert } = useAlert();
  const dropdownValues = useDropdownValues(["taxType"]);

  const [isPOSearchOpen, setIsPOSearchOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderMastDto | null>(null);
  const [poDetails, setPoDetails] = useState<PurchaseOrderDetailDto[]>([]);
  const [grnDetails, setGrnDetails] = useState<GrnDetailDto[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  const [isIssueDeptDialogOpen, setIsIssueDeptDialogOpen] = useState(false);
  const [selectedProductForIssue, setSelectedProductForIssue] = useState<GrnDetailDto | null>(null);
  const [editingIssueDepartment, setEditingIssueDepartment] = useState<IssueDepartmentData | null>(null);

  const { getPurchaseOrderById, isLoading: isPoDetailsLoading } = usePurchaseOrder();

  // FIXED: Watch for PO-related fields to detect existing PO data
  const watchedPoID = watch("poID");
  const watchedPoCode = watch("poCode");
  const watchedPoNo = watch("PoNo");

  // FIXED: Initialize GRN details with existing data when component mounts
  useEffect(() => {
    if (existingGrnDetails && existingGrnDetails.length > 0) {
      setGrnDetails(existingGrnDetails);

      // If there's existing GRN data with PO information, set the PO as selected
      const firstDetail = existingGrnDetails[0];
      if (firstDetail.poDetID && firstDetail.poDetID > 0) {
        // Create a mock PO master for display purposes
        const mockPOMaster: PurchaseOrderMastDto = {
          pOID: watchedPoID || 0,
          pOCode: watchedPoCode || watchedPoNo || "",
          supplierID: 0,
          supplierName: "",
          pODate: "",
          totalAmt: 0,
          discAmt: 0,
          pOApprovedYN: "Y",
          deptID: watchedDeptID || 0,
          deptName: watchedDeptName || "",
          // Add other required fields with default values
          pOStatusCode: "APPROVED",
          pOStatus: "Approved",
          auGrpID: 18,
          catValue: "MEDI",
          catDesc: "REVENUE",
          rActiveYN: "Y",
          rCreatedBy: "",
          rCreatedDate: "",
          rUpdatedBy: "",
          rUpdatedDate: "",
          rNotes: "",
          fromDeptID: 0, // Added missing property
          transferYN: "N", // Added missing property
        };
        setSelectedPO(mockPOMaster);
      }
    }
  }, [existingGrnDetails, watchedPoID, watchedPoCode, watchedPoNo, watchedDeptID, watchedDeptName]);

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
        setValue("PoNo", mast.pOCode || "", { shouldDirty: true });
        setValue("PoID", mast.pOID, { shouldDirty: true });
        setValue("PoDate", mast.pODate ? dayjs(mast.pODate).toDate() : null, { shouldDirty: true });
        setValue("PoTotalAmt", mast.totalAmt || 0, { shouldDirty: true });
        setValue("PoDiscAmt", mast.discAmt || 0, { shouldDirty: true });

        setPoDetails(details);
        setGrnDetails([]); // Clear existing GRN details when selecting new PO
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
    resetField("PoNo");
    resetField("PoID");
    resetField("PoDate");
    resetField("PoTotalAmt");
    resetField("PoDiscAmt");
    onPoDataFetched(null, []);
    if (onGRNDataFetched) {
      onGRNDataFetched([]);
    }
  }, [resetField, onPoDataFetched, onGRNDataFetched]);

  // FIXED: Enhanced gridRows logic to properly handle existing GRN details
  const gridRows: PurchaseOrderGRNDetailRow[] = useMemo(() => {
    // If we have existing GRN details (editing mode), use them directly
    if (existingGrnDetails && existingGrnDetails.length > 0) {
      return existingGrnDetails.map((grnDetail, index) => {
        const associatedIssueDept = issueDepartments.find((dept) => dept.productID === grnDetail.productID);

        return {
          ...grnDetail,
          id: grnDetail.grnDetID || `existing-${index}`,
          _serialNo: index + 1,
          _issueDepartment: associatedIssueDept,
        };
      });
    }

    // If we have PO details selected, create new GRN details from PO
    if (poDetails && poDetails.length > 0) {
      return poDetails
        .filter((poDetail) => poDetail.rActiveYN !== "N")
        .map((poDetail, index) => {
          const existingGRNDetail = grnDetails.find((grn) => grn.poDetID === poDetail.pODetID);
          const associatedIssueDept = issueDepartments.find((dept) => dept.productID === poDetail.productID);

          if (existingGRNDetail) {
            return {
              ...existingGRNDetail,
              id: existingGRNDetail.grnDetID || `temp-${index}`,
              _serialNo: index + 1,
              _issueDepartment: associatedIssueDept,
            };
          }

          // Create new GRN detail from PO detail
          const newGRNDetail: PurchaseOrderGRNDetailRow = {
            grnDetID: 0,
            grnID: 0,
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
            requiredUnitQty: poDetail.requiredUnitQty || 0,
            recvdQty: 0,
            acceptQty: 0,
            freeItems: poDetail.freeQty || 0,
            unitPrice: poDetail.unitPrice || 0,
            sellUnitPrice: 0,
            defaultPrice: poDetail.unitPrice || 0,
            mrp: 0,
            mrpAbated: 0,
            discAmt: poDetail.discAmt || 0,
            discPercentage: poDetail.discPercentageAmt || 0,
            cgstPerValue: poDetail.cgstPerValue || 0,
            cgstTaxAmt: poDetail.cgstTaxAmt || 0,
            sgstPerValue: poDetail.sgstPerValue || 0,
            sgstTaxAmt: poDetail.sgstTaxAmt || 0,
            taxableAmt: poDetail.taxableAmt || 0,
            taxAfterDiscYN: poDetail.taxAfterDiscYN || "N",
            taxAfterDiscOnMrpYN: poDetail.taxAfterDiscOnMrp || "N",
            taxOnFreeItemsYN: poDetail.taxOnFreeItemYN || "N",
            taxOnMrpYN: poDetail.taxOnMrpYN || "N",
            taxOnUnitPriceYN: poDetail.taxOnUnitPrice || "N",
            batchNo: "",
            refNo: "",
            expiryDate: "",
            productNotes: "",
            expiryYN: "N",
            isFreeItemYN: poDetail.isFreeItemYN || "N",
            productValue: 0,
            itemMrpValue: 0,
            itemTotalProfit: 0,
            itemTotalVat: 0,
            tax: 0,
            chargeablePercent: 0,
            taxCode: "",
            taxID: 0,
            taxModeCode: "",
            taxModeDescription: "",
            taxModeID: "",
            taxName: "",
            _serialNo: index + 1,
            _issueDepartment: associatedIssueDept,
            id: `temp-${index}`,
            rActiveYN: "Y",
            rCreatedBy: "",
            rCreatedDate: "",
            rUpdatedBy: "",
            rUpdatedDate: "",
          };

          return newGRNDetail;
        });
    }

    return [];
  }, [poDetails, grnDetails, issueDepartments, existingGrnDetails]);

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
    (id: string | number, field: keyof GrnDetailDto, value: any) => {
      const updatedDetails = [...grnDetails];
      let index = updatedDetails.findIndex((item) => (item.grnDetID || `temp-${grnDetails.indexOf(item)}`) === id);

      if (index === -1) {
        const rowData = gridRows.find((row) => row.id === id);
        if (rowData) {
          // Create a new GRN detail from the row data
          const newGrnDetail = { ...rowData };
          delete (newGrnDetail as any)._serialNo;
          delete (newGrnDetail as any)._issueDepartment;
          updatedDetails.push(newGrnDetail);
          index = updatedDetails.length - 1;
        }
      }

      if (index === -1) return;

      const currentRow = updatedDetails[index];
      (currentRow as any)[field] = value;

      // Field-specific calculations
      if (field === "unitPrice" || field === "pUnitsPerPack") {
        const unitPrice = currentRow.unitPrice || 0;
        const unitsPerPack = currentRow.pUnitsPerPack || 1;
        currentRow.productValue = unitPrice * unitsPerPack;
      }
      if (field === "recvdQty" || field === "pUnitsPerPack") {
        currentRow.acceptQty = currentRow.recvdQty;
      }
      if (field === "gstPercentage") {
        const gstValue = Number(value) || 0;
        currentRow.cgstPerValue = parseFloat((gstValue / 2).toFixed(2));
        currentRow.sgstPerValue = parseFloat((gstValue / 2).toFixed(2));
      }

      // Core calculation logic
      const receivedQty = currentRow.recvdQty || 0;
      const unitPrice = currentRow.unitPrice || 0;
      const discPercentage = currentRow.discPercentage || 0;
      const cgstRate = currentRow.cgstPerValue || 0;
      const sgstRate = currentRow.sgstPerValue || 0;
      const gstPercentage = cgstRate + sgstRate;
      const isTaxAfterDisc = currentRow.taxAfterDiscYN === "Y";

      let baseAmount = receivedQty * unitPrice;
      let discountAmount = baseAmount * (discPercentage / 100);
      let taxableAmount = baseAmount - discountAmount;
      let totalTaxAmount = isTaxAfterDisc ? taxableAmount * (gstPercentage / 100) : baseAmount * (gstPercentage / 100);
      let finalValue = taxableAmount + totalTaxAmount;

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

      currentRow.productValue = parseFloat(finalValue.toFixed(2));

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

  const handleIssueDepartmentClick = useCallback((row: PurchaseOrderGRNDetailRow) => {
    setSelectedProductForIssue(row);
    setEditingIssueDepartment(row._issueDepartment || null);
    setIsIssueDeptDialogOpen(true);
  }, []);

  const handleIssueDepartmentSubmit = useCallback(
    (data: IssueDepartmentData) => {
      if (onIssueDepartmentChange) {
        let updatedDepartments = [...issueDepartments];

        if (editingIssueDepartment) {
          const index = updatedDepartments.findIndex((dept) => dept.id === editingIssueDepartment.id);
          if (index !== -1) {
            updatedDepartments[index] = data;
            showAlert("Success", "Issue department updated successfully.", "success");
          }
        } else {
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
        disabled={isApproved}
      />
    ),
    [handleCellValueChange, isApproved]
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
        disabled={isApproved}
      />
    ),
    [handleCellValueChange, isApproved]
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
        disabled={isApproved}
        InputLabelProps={{
          shrink: true,
        }}
      />
    ),
    [handleCellValueChange, isApproved]
  );

  const renderCheckbox = useCallback(
    (params: GridRenderCellParams, field: keyof GrnDetailDto) => (
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
        value={(params.row.cgstPerValue || 0) + (params.row.sgstPerValue || 0) || ""}
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

  const renderIssueDepartmentCell = useCallback(
    (params: GridRenderCellParams) => {
      const row = params.row as PurchaseOrderGRNDetailRow;
      const hasIssueDept = row._issueDepartment;

      return (
        <Box display="flex" alignItems="center" gap={1}>
          {hasIssueDept ? (
            <>
              <Chip label={`${row._issueDepartment?.deptName} (${row._issueDepartment?.quantity})`} size="small" color="success" variant="outlined" />
              <Tooltip title="Edit Issue Department">
                <IconButton size="small" onClick={() => handleIssueDepartmentClick(row)} disabled={isApproved}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Add Issue Department">
              <IconButton size="small" onClick={() => handleIssueDepartmentClick(row)} disabled={isApproved} color="primary">
                <IssueIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },
    [handleIssueDepartmentClick, isApproved]
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
        field: "requiredUnitQty",
        headerName: "Required Qty",
        width: 120,
        sortable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => params.row.requiredUnitQty || 0,
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
        field: "sellUnitPrice",
        headerName: "Selling Price",
        width: 120,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "sellUnitPrice"),
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
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (params.row.unitPrice || 0).toFixed(4),
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
            disabled={isApproved}
            showInMenu={false}
          />,
        ],
      },
    ],
    [renderNumberField, renderTextField, renderDateField, renderCheckbox, renderGSTSelect, renderIssueDepartmentCell, handleDeleteClick, isApproved]
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
              <EnhancedFormField name="PoNo" control={control} type="text" label="PO Number" size="small" disabled />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField name="PoDate" control={control} type="datepicker" label="PO Date" size="small" disabled />
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

export default PurchaseOrderSection;
