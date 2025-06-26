import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GRNDetailDto } from "@/interfaces/InventoryManagement/GRNDto";
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
  grnDetails: GRNDetailDto[];
  onGrnDetailsChange: (details: GRNDetailDto[]) => void;
  disabled?: boolean;
  grnApproved?: boolean;
  expanded: boolean;
  onToggle: () => void;
  // New props for issue department management
  issueDepartments?: IssueDepartmentData[];
  onIssueDepartmentChange?: (departments: IssueDepartmentData[]) => void;
}

interface GRNDetailRow extends GRNDetailDto {
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
  const [selectedProductForIssue, setSelectedProductForIssue] = useState<GRNDetailDto | null>(null);
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
        _pastReceivedPack: detail._pastReceivedPack || 0,
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
        const nextSerialNo = grnDetails.length > 0 ? Math.max(...grnDetails.map((d) => d.serialNo)) + 1 : 1;

        const newDetail: GRNDetailDto = {
          grnDetID: 0,
          grnID: 0,
          serialNo: nextSerialNo,
          productID: productData.data.productID,
          productCode: productData.data.productCode,
          productName: productData.data.productName,
          catValue: "",
          catDesc: "",
          mfID: productData.data.manufacturerID,
          mfName: productData.data.manufacturerName,
          manufacturerID: productData.data.manufacturerID,
          manufacturerCode: productData.data.manufacturerCode,
          manufacturerName: productData.data.manufacturerName,
          pGrpID: productData.data.pGrpID,
          pGrpName: productData.data.productGroupName,
          psGrpID: productData.data.psGrpID,
          psGrpName: productData.data.psGroupName,
          pUnitID: productData.data.pUnitID,
          pUnitName: productData.data.pUnitName,
          pUnitsPerPack: productData.data.unitPack || 1,
          pkgID: productData.data.pkgID,
          pkgName: productData.data.pkgName,
          hsnCode: productData.data.hsnCODE,
          requiredPack: 0,
          requiredQty: 0,
          recvdPack: 0,
          recvdQty: 0,
          acceptQty: 0,
          freeItems: 0,
          rejectedQty: 0,
          unitPrice: productData.data.defaultPrice || 0,
          sellingPrice: productData.data.defaultPrice || 0,
          packPrice: productData.data.defaultPrice || 0,
          sellUnitPrice: 0,
          defaultPrice: productData.data.defaultPrice || 0,
          mrp: 0,
          mrpAbated: 0,
          discAmt: 0,
          discPercentage: 0,
          gstPercentage: (productData.data.cgstPerValue || 0) + (productData.data.sgstPerValue || 0),
          cgstPerValue: productData.data.cgstPerValue || 0,
          cgstTaxAmt: 0,
          sgstPerValue: productData.data.sgstPerValue || 0,
          sgstTaxAmt: 0,
          igstPerValue: 0,
          igstTaxAmt: 0,
          taxableAmt: 0,
          totalTaxAmt: 0,
          taxAfterDiscYN: "N",
          taxAfterDiscOnMrpYN: "N",
          includeTaxYN: "N",
          taxOnFreeItemsYN: "N",
          taxOnMrpYN: "N",
          taxOnUnitPriceYN: "N",
          batchNo: "",
          referenceNo: "",
          expiryDate: "",
          lotNo: "",
          vendorBatchNo: "",
          shelfLife: 0,
          storageCondition: "",
          productNotes: "",
          expiryYN: productData.data.expiry === "Y" ? "Y" : "N",
          isFreeItemYN: "N",
          prescriptionYN: "N",
          qualityCheckYN: "N",
          qualityStatus: "",
          qualityRemarks: "",
          productValue: 0,
          itemMrpValue: 0,
          itemTotalProfit: 0,
          itemTotalVat: 0,
          _recievedQty: 0,
          _serialNo: nextSerialNo,
          _pastReceivedPack: 0,
          _unitPrice: productData.data.defaultPrice || 0,
          _sellingUnitPrice: 0,
          _calculatedValue: 0,
          _totalWithTax: 0,
          rActiveYN: "Y",
          isDeleted: false,
          createdBy: "",
          createdAt: "",
          updatedBy: "",
          updatedAt: "",
        };

        onGrnDetailsChange([...grnDetails, newDetail]);
        showAlert("Success", `Product "${productData.data.productName}" added.`, "success");
      } catch (error) {
        showAlert("Error", "Failed to add product. Please check if the product exists.", "error");
      } finally {
        setIsAddingProduct(false);
        productSearchRef.current?.clearSelection();
      }
    },
    [grnDetails, onGrnDetailsChange, showAlert]
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

    // Re-sequence serial numbers
    const resequencedDetails = updatedDetails.map((detail, index) => ({
      ...detail,
      serialNo: index + 1,
    }));

    onGrnDetailsChange(resequencedDetails);
    setDeleteConfirmation({ open: false, index: null });
    showAlert("Success", "Product removed successfully.", "success");
  };

  const handleCellValueChange = useCallback(
    (id: string | number, field: keyof GRNDetailDto, value: any) => {
      const updatedDetails = [...grnDetails];
      const index = updatedDetails.findIndex((item) => (item.grnDetID || `temp-${grnDetails.indexOf(item)}`) === id);

      if (index === -1) return;

      const currentRow = updatedDetails[index];
      (currentRow as any)[field] = value;

      // --- Field-Specific Preparations ---
      if (field === "unitPrice" || field === "pUnitsPerPack") {
        currentRow.packPrice = parseFloat(((currentRow.unitPrice || 0) * (currentRow.pUnitsPerPack || 1)).toFixed(2));
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

      // Rule 1: Base Amount (Always first)
      baseAmount = receivedPack * packPrice;

      if (isTaxInclusive) {
        // Rule 7: Final Value (Inclusive) is set to Base Amount
        finalValue = baseAmount;

        // Recalculate other values based on the final value (as per rule's note)
        if (isTaxAfterDisc) {
          // When tax is applied *after* discount.
          // finalValue = taxableAmount * (1 + gstPercentage / 100)
          taxableAmount = baseAmount / (1 + gstPercentage / 100);
          totalTaxAmount = taxableAmount * (gstPercentage / 100);
          // Recalculate discount based on the derived taxable amount
          discountAmount = baseAmount - taxableAmount;
        } else {
          // When tax is applied on base amount (before discount).
          // finalValue = (baseAmount - discountAmount) + (baseAmount * gstPercentage / 100)
          // Since finalValue = baseAmount, discountAmount must equal the tax amount.
          totalTaxAmount = baseAmount * (gstPercentage / 100);
          discountAmount = totalTaxAmount;
          taxableAmount = baseAmount - discountAmount;
        }
      } else {
        // --- EXCLUSIVE TAX SCENARIO ---
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
      }

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

      currentRow.totalTaxAmt = parseFloat(totalTaxAmount.toFixed(2));
      currentRow.productValue = parseFloat(finalValue.toFixed(2));

      // Update other dependent fields
      currentRow._calculatedValue = currentRow.productValue;
      currentRow._totalWithTax = currentRow.productValue;
      currentRow._recievedQty = currentRow.recvdQty;

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
        disabled={disabled || grnApproved}
      />
    ),
    [handleCellValueChange, disabled, grnApproved]
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
        disabled={disabled || grnApproved}
      />
    ),
    [handleCellValueChange, disabled, grnApproved]
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
        disabled={disabled || grnApproved}
        InputLabelProps={{
          shrink: true,
        }}
      />
    ),
    [handleCellValueChange, disabled, grnApproved]
  );

  const renderCheckbox = useCallback(
    (params: GridRenderCellParams, field: keyof GRNDetailDto) => (
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
        value={params.row.gstPercentage || ""}
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

  // Define columns for DataGrid - Same as PurchaseOrderSection but updated for manual products
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
        renderCell: (params) => renderNumberField(params, "requiredPack", 0),
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
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (params.row.packPrice || 0).toFixed(2),
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
        renderCell: (params) => renderNumberField(params, "unitPrice"),
      },
      {
        field: "sellUnitPrice",
        headerName: "Selling Unit Price",
        width: 150,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "sellUnitPrice"),
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
