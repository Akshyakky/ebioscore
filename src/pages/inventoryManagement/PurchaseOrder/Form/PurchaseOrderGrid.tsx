import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { ProductSearchResult } from "@/interfaces/InventoryManagement/Product/ProductSearch.interface";
import { PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { useAlert } from "@/providers/AlertProvider";
import { Delete as DeleteIcon, LocalFireDepartment } from "@mui/icons-material";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Control, UseFormSetValue } from "react-hook-form";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";

interface PurchaseOrderGridProps {
  control: Control<any>;
  purchaseOrderDetails: PurchaseOrderDetailDto[];
  onDetailsUpdate: (details: PurchaseOrderDetailDto[]) => void;
  selectedProduct: ProductSearchResult | null;
  approvedDisable: boolean;
  setValue: UseFormSetValue<any>;
  pOID: number;
}

const PurchaseOrderGrid: React.FC<PurchaseOrderGridProps> = ({ control, purchaseOrderDetails, onDetailsUpdate, selectedProduct, approvedDisable, setValue, pOID }) => {
  const { showAlert } = useAlert();
  const dropdownValues = useDropdownValues(["taxType"]);
  const { getProductDetailsForPO } = usePurchaseOrder();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  const departmentId = control._formValues.fromDeptID;

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

  const handleDeleteClick = (index: number) => {
    setDeleteConfirmation({ open: true, index });
  };

  const handleDeleteRow = () => {
    if (deleteConfirmation.index === null) return;

    const updatedDetails = [...purchaseOrderDetails];

    if (pOID === 0) {
      // Remove item for new PO
      updatedDetails.splice(deleteConfirmation.index, 1);
    } else {
      // Mark as inactive for existing PO
      updatedDetails[deleteConfirmation.index].rActiveYN = "N";
    }

    onDetailsUpdate(updatedDetails);
    setDeleteConfirmation({ open: false, index: null });
  };

  const handleCellChange = (index: number, field: keyof PurchaseOrderDetailDto, value: any) => {
    const updatedDetails = [...purchaseOrderDetails];
    const currentRow = updatedDetails[index];

    // Validation
    if (field === "discPercentageAmt" && value > 100) {
      showAlert("Warning", "Discount percentage cannot exceed 100%", "warning");
      return;
    }

    if (field === "discAmt") {
      const totalPackPrice = (currentRow.unitPrice || 0) * (currentRow.receivedQty || 0);
      if (value > totalPackPrice) {
        showAlert("Warning", "Discount amount cannot exceed pack price", "warning");
        return;
      }
    }

    // Update field
    (currentRow as any)[field] = value;

    // Recalculate amounts
    const receivedQty = currentRow.receivedQty || 0;
    const unitPack = currentRow.unitPack || 1;
    const unitPrice = currentRow.unitPrice || 0;
    const gstPerValue = currentRow.gstPerValue || 0;

    currentRow.requiredUnitQty = receivedQty * unitPack;
    const totalPrice = unitPrice * receivedQty;

    // Handle discount calculations
    if (field === "discPercentageAmt") {
      currentRow.discAmt = (totalPrice * value) / 100;
    } else if (field === "discAmt") {
      currentRow.discPercentageAmt = totalPrice > 0 ? (value / totalPrice) * 100 : 0;
    }

    // Handle GST calculations
    if (field === "gstPerValue") {
      currentRow.cgstPerValue = value / 2;
      currentRow.sgstPerValue = value / 2;
    }

    const discAmt = currentRow.discAmt || 0;

    // Calculate tax amounts
    currentRow.cgstTaxAmt = (totalPrice * (currentRow.cgstPerValue || 0)) / 100 || 0;
    currentRow.sgstTaxAmt = (totalPrice * (currentRow.sgstPerValue || 0)) / 100 || 0;
    currentRow.gstPerValue = (currentRow.cgstPerValue || 0) + (currentRow.sgstPerValue || 0);
    currentRow.taxAmt = currentRow.cgstTaxAmt + currentRow.sgstTaxAmt;

    // Calculate net amount
    currentRow.netAmount = totalPrice + currentRow.taxAmt - discAmt;
    currentRow.totAmt = currentRow.netAmount;

    onDetailsUpdate(updatedDetails);
  };

  const handleDropdownChange = (value: number, index: number) => {
    const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.value) === Number(value));
    const selectedRate = Number(selectedTax?.label || 0);
    handleCellChange(index, "gstPerValue", selectedRate);
  };

  const tableHeaderNames = [
    "#",
    "Product",
    "Manufacturer",
    "QOH[Units]",
    "Required Pack",
    "Required Unit Qty",
    "Units/Pack",
    "Pack Price",
    "Selling Price",
    "Disc",
    "Disc[%]",
    "GST[%]",
    "ROL",
    "Item Total",
    "Delete",
  ];

  const activeDetails = purchaseOrderDetails.filter((row) => row.rActiveYN !== "N");

  return (
    <Paper sx={{ mt: 2, overflowX: "auto" }}>
      <Box sx={{ minWidth: 1200 }}>
        <TableContainer sx={{ minHeight: 300, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {tableHeaderNames.map((header, index) => (
                  <TableCell align="center" key={index}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {activeDetails.map((row, index) => (
                <TableRow key={`${row.productID}-${index}`}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell>{row.manufacturerName}</TableCell>
                  <TableCell align="right">{row.stock || 0}</TableCell>
                  <TableCell align="right" sx={{ minWidth: 150 }}>
                    <FormField
                      control={control}
                      name={`purchaseOrderDetails.${index}.receivedQty`}
                      type="number"
                      label=""
                      disabled={approvedDisable}
                      onChange={(value) => handleCellChange(index, "receivedQty", Number(value))}
                    />
                  </TableCell>
                  <TableCell align="right">{row.requiredUnitQty || 0}</TableCell>
                  <TableCell align="right" sx={{ minWidth: 150 }}>
                    <FormField
                      control={control}
                      name={`purchaseOrderDetails.${index}.unitPack`}
                      type="number"
                      label=""
                      disabled={approvedDisable}
                      onChange={(value) => handleCellChange(index, "unitPack", Number(value))}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 150 }}>
                    <FormField
                      control={control}
                      name={`purchaseOrderDetails.${index}.unitPrice`}
                      type="number"
                      label=""
                      disabled={approvedDisable}
                      onChange={(value) => handleCellChange(index, "unitPrice", Number(value))}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 150 }}>
                    <FormField
                      control={control}
                      name={`purchaseOrderDetails.${index}.totAmt`}
                      type="number"
                      label=""
                      disabled={approvedDisable}
                      onChange={(value) => handleCellChange(index, "totAmt", Number(value))}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 150 }}>
                    <FormField
                      control={control}
                      name={`purchaseOrderDetails.${index}.discAmt`}
                      type="number"
                      label=""
                      disabled={approvedDisable}
                      onChange={(value) => handleCellChange(index, "discAmt", Number(value))}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 150 }}>
                    <FormField
                      control={control}
                      name={`purchaseOrderDetails.${index}.discPercentageAmt`}
                      type="number"
                      label=""
                      disabled={approvedDisable}
                      onChange={(value) => handleCellChange(index, "discPercentageAmt", Number(value))}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 150 }}>
                    <FormField
                      control={control}
                      name={`purchaseOrderDetails.${index}.gstPerValue`}
                      type="select"
                      label=""
                      options={dropdownValues.taxType || []}
                      disabled={approvedDisable}
                      onChange={(value) => handleDropdownChange(value, index)}
                    />
                  </TableCell>
                  <TableCell align="right">{row.rOL || 0}</TableCell>
                  <TableCell align="right">{row.netAmount?.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton disabled={approvedDisable} size="small" onClick={() => handleDeleteClick(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    <LocalFireDepartment />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && activeDetails.length === 0 && (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    No products added yet. Search and select products to add.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

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
    </Paper>
  );
};

export default PurchaseOrderGrid;
