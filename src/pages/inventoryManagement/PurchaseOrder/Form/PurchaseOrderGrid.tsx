import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { Delete as DeleteIcon, Inventory as InventoryIcon, LocalFireDepartment, ShoppingCart as PurchaseIcon } from "@mui/icons-material";
import { alpha, Box, Card, CardContent, Chip, Divider, MenuItem, Paper, Select, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";

interface PurchaseOrderGridProps {
  control: Control<any>;
  purchaseOrderDetails: PurchaseOrderDetailDto[];
  onDetailsUpdate: (details: PurchaseOrderDetailDto[]) => void;
  selectedProduct: PurchaseOrderDetailDto | null;
  approvedDisable: boolean;
  setValue: UseFormSetValue<any>;
  pOID: number;
}

interface PurchaseOrderDetailRow extends PurchaseOrderDetailDto {
  id: string | number;
}

const PurchaseOrderGrid: React.FC<PurchaseOrderGridProps> = ({ control, purchaseOrderDetails, onDetailsUpdate, selectedProduct, approvedDisable, setValue, pOID }) => {
  const theme = useTheme();
  const { showAlert } = useAlert();
  const dropdownValues = useDropdownValues(["taxType"]);
  const { getProductDetailsForPO } = usePurchaseOrder();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  const departmentId = control._formValues.fromDeptID;
  // Convert purchase order details to rows with proper IDs
  const gridRows: PurchaseOrderDetailRow[] = useMemo(() => {
    return purchaseOrderDetails
      .filter((row) => row.rActiveYN !== "N")
      .map((row, index) => ({
        ...row,
        id: row.pODetID || `temp-${index}`,
        taxAfterDiscOnMrp: "N",
        taxOnUnitPrice: "N",
        transferYN: "N",
      }));
  }, [purchaseOrderDetails]);

  // Handle product selection
  useEffect(() => {
    if (selectedProduct && !approvedDisable) {
      addProductToGrid();
    }
  }, [selectedProduct]);

  const addProductToGrid = async () => {
    if (!selectedProduct || !departmentId) return;

    setIsLoading(true);
    try {
      const productDetails = await getProductDetailsForPO(selectedProduct.productCode || "");

      if (!productDetails) {
        showAlert("Error", "Failed to fetch product details", "error");
        return;
      }

      // Check if product already exists
      const existingProduct = purchaseOrderDetails.find((item) => item.productID === selectedProduct.productID && item.rActiveYN === "Y");

      if (existingProduct) {
        showAlert("Warning", "Product already exists in the grid", "warning");
        return;
      }

      const newDetail: PurchaseOrderDetailDto = {
        ...productDetails,
        pODetID: 0,
        pOID: pOID,
        productID: selectedProduct.productID,
        productCode: selectedProduct.productCode || "",
        productName: selectedProduct.productName || "",
        manufacturerID: selectedProduct.manufacturerID,
        manufacturerCode: selectedProduct.manufacturerCode,
        manufacturerName: selectedProduct.manufacturerName,
        pUnitID: selectedProduct.pUnitID || 0,
        pUnitName: selectedProduct.pUnitName || "",
        unitPack: selectedProduct.unitPack || 1,
        receivedQty: 0,
        requiredUnitQty: 0,
        unitPrice: selectedProduct.defaultPrice || 0,
        totAmt: 0,
        discAmt: 0,
        discPercentageAmt: 0,
        cgstPerValue: selectedProduct.cgstPerValue || 0,
        sgstPerValue: selectedProduct.sgstPerValue || 0,
        gstPerValue: (selectedProduct.cgstPerValue || 0) + (selectedProduct.sgstPerValue || 0),
        cgstTaxAmt: 0,
        sgstTaxAmt: 0,
        taxAmt: 0,
        netAmount: 0,
        rActiveYN: "Y",
      };

      onDetailsUpdate([...purchaseOrderDetails, newDetail]);

      // Clear product selection
      setValue("selectedProduct", null);
    } catch (error) {
      console.error("Error adding product:", error);
      showAlert("Error", "Failed to add product", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = useCallback(
    (id: string | number) => {
      const index = gridRows.findIndex((row) => row.id === id);
      setDeleteConfirmation({ open: true, index });
    },
    [gridRows]
  );

  const handleDeleteRow = () => {
    if (deleteConfirmation.index === null) return;

    const updatedDetails = [...purchaseOrderDetails];
    const rowToDelete = gridRows[deleteConfirmation.index];
    const originalIndex = purchaseOrderDetails.findIndex((item) => item.productID === rowToDelete.productID);

    if (originalIndex !== -1) {
      if (pOID === 0) {
        // Remove item for new PO
        updatedDetails.splice(originalIndex, 1);
      } else {
        // Mark as inactive for existing PO
        updatedDetails[originalIndex].rActiveYN = "N";
      }
    }

    onDetailsUpdate(updatedDetails);
    setDeleteConfirmation({ open: false, index: null });
  };

  const handleCellValueChange = useCallback(
    (id: string | number, field: keyof PurchaseOrderDetailDto, value: any) => {
      const updatedDetails = [...purchaseOrderDetails];
      const index = updatedDetails.findIndex((item) => (item.pODetID || `temp-${purchaseOrderDetails.indexOf(item)}`) === id);

      if (index === -1) return;

      const currentRow = updatedDetails[index];

      // Validation
      if (field === "discPercentageAmt" && value > 100) {
        showAlert("Warning", "Discount percentage cannot exceed 100%", "warning");
        return;
      }

      // Update field first
      (currentRow as any)[field] = value;

      // Get base values
      const requiredPack = currentRow.requiredPack || 0;
      const unitPack = currentRow.unitPack || 1;
      const unitPrice = currentRow.unitPrice || 0;
      const gstPercentage = currentRow.gstPerValue || 0;

      // Calculate required unit quantity
      currentRow.requiredUnitQty = parseFloat((requiredPack * unitPack).toFixed(2));

      // Calculate base amount (before discount and GST)
      const baseAmount = unitPrice * requiredPack;

      // Validation for discount amount
      if (field === "discAmt" && value > baseAmount) {
        showAlert("Warning", "Discount amount cannot exceed total pack price", "warning");
        return;
      }

      // Handle GST percentage split
      if (field === "gstPerValue") {
        currentRow.cgstPerValue = parseFloat((value / 2).toFixed(2));
        currentRow.sgstPerValue = parseFloat((value / 2).toFixed(2));
      }

      // Handle discount calculations
      let discPercentage = currentRow.discPercentageAmt || 0;
      let discAmount = currentRow.discAmt || 0;

      if (field === "discPercentageAmt") {
        // Calculate discount amount from percentage
        discAmount = parseFloat(((baseAmount * value) / 100).toFixed(2));
        currentRow.discAmt = discAmount;
      } else if (field === "discAmt") {
        // Calculate discount percentage from amount
        discPercentage = parseFloat((baseAmount > 0 ? (value / baseAmount) * 100 : 0).toFixed(2));
        currentRow.discPercentageAmt = discPercentage;
        discAmount = value;
      }

      // Calculate GST on original base amount (before discount)
      const gstAmount = parseFloat(((baseAmount * gstPercentage) / 100).toFixed(2));
      currentRow.gstTaxAmt = gstAmount;
      // Calculate final item total: (Base Amount + GST) - Discount
      const itemTotal = parseFloat((baseAmount + gstAmount - discAmount).toFixed(2));

      // Set the final net amount
      currentRow.netAmount = itemTotal;

      onDetailsUpdate(updatedDetails);
    },
    [purchaseOrderDetails, onDetailsUpdate, showAlert]
  );

  const handleDropdownChange = useCallback(
    (value: number, id: string | number) => {
      const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.label) === Number(value));
      const selectedRate = Number(selectedTax?.label || 0);
      handleCellValueChange(id, "gstPerValue", selectedRate);
    },
    [dropdownValues.taxType, handleCellValueChange]
  );
  // Render functions for different cell types
  const renderNumberField = useCallback(
    (params: GridRenderCellParams, field: keyof PurchaseOrderDetailDto) => (
      <TextField
        size="small"
        type="number"
        value={params.row[field] || ""}
        onChange={(e) => {
          const value = parseFloat(e.target.value) || 0;
          handleCellValueChange(params.id, field, value);
        }}
        sx={{ width: "100%" }}
        inputProps={{ style: { textAlign: "right" } }}
        fullWidth={true}
        disabled={approvedDisable}
      />
    ),
    [handleCellValueChange, approvedDisable]
  );

  const renderSelect = useCallback(
    (params: GridRenderCellParams) => (
      <Select
        size="small"
        value={params.row.gstPerValue || ""}
        onChange={(e) => {
          const value = Number(e.target.value);
          handleDropdownChange(value, params.id);
        }}
        sx={{ width: "100%" }}
        displayEmpty
        disabled={approvedDisable}
        renderValue={(selected) => {
          if (!selected) return "Select GST";
          const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.label) === Number(selected));
          return selectedTax ? `${selectedTax.label}%` : `${selected}%`;
        }}
      >
        {(dropdownValues.taxType || []).map((option) => (
          <MenuItem key={option.value} value={Number(option.label)}>
            {option.label}%
          </MenuItem>
        ))}
      </Select>
    ),
    [dropdownValues.taxType, handleDropdownChange, approvedDisable]
  );

  // Define columns for DataGrid
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "productName",
        headerName: "Product",
        width: 250,
        sortable: false,
      },
      {
        field: "manufacturerName",
        headerName: "Manufacturer",
        width: 150,
        sortable: false,
        renderCell: (params) => params.row.manufacturerName || "",
      },
      {
        field: "qoh",
        headerName: "QOH[Units]",
        width: 120,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => params.row.qoh || 0,
      },
      {
        field: "requiredPack",
        headerName: "Req. Pack",
        width: 120,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "requiredPack"),
      },
      {
        field: "requiredUnitQty",
        headerName: "Req. Unit Qty",
        width: 130,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => params.row.requiredUnitQty || 0,
      },
      {
        field: "unitPack",
        headerName: "Units/Pack",
        width: 120,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "unitPack"),
      },
      {
        field: "unitPrice",
        headerName: "Pack Price",
        width: 150,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "unitPrice"),
      },
      {
        field: "totAmt",
        headerName: "Selling Price",
        width: 150,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "totAmt"),
      },
      {
        field: "discAmt",
        headerName: "Disc",
        width: 140,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "discAmt"),
      },
      {
        field: "discPercentageAmt",
        headerName: "Disc[%]",
        width: 100,
        sortable: false,
        renderCell: (params) => renderNumberField(params, "discPercentageAmt"),
      },
      {
        field: "gstPerValue",
        headerName: "GST[%]",
        width: 120,
        sortable: false,
        renderCell: renderSelect,
      },
      {
        field: "rOL",
        headerName: "ROL",
        width: 80,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => params.row.rOL || 0,
      },
      {
        field: "netAmount",
        headerName: "Item Total",
        width: 120,
        sortable: false,
        type: "number",
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (params.row.netAmount || 0).toFixed(2),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Delete",
        width: 80,
        getActions: (params) => [
          <GridActionsCellItem
            icon={
              <Tooltip title="Remove Product">
                <DeleteIcon color="error" />
              </Tooltip>
            }
            label="Remove"
            onClick={() => handleDeleteClick(params.id)}
            disabled={approvedDisable}
            showInMenu={false}
          />,
        ],
      },
    ],
    [renderNumberField, renderSelect, handleDeleteClick, approvedDisable]
  );

  return (
    <>
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
              Purchase Order Products
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }} />
            <Typography variant="body2" color="text.secondary">
              Manage product quantities and pricing
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
          {isLoading ? (
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
                No Products Added
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: "auto" }}>
                Search and select products to add them to this purchase order
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

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

export default PurchaseOrderGrid;
