import React, { useEffect, useState } from "react";
import { Control, UseFieldArrayAppend, UseFieldArrayRemove, UseFieldArrayUpdate, UseFormSetValue, useWatch } from "react-hook-form";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { PurchaseOrderDetailDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import { showAlert } from "@/utils/Common/showAlert";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import Loader from "@/components/Loader/SkeletonLoader";

interface PurchaseOrderGridProps {
  control: Control<any>;
  fields: PurchaseOrderDetailDto[];
  append: UseFieldArrayAppend<any, "purchaseOrderDetails">;
  remove: UseFieldArrayRemove;
  update: UseFieldArrayUpdate<any, "purchaseOrderDetails">;
  approvedDisable: boolean;
  setValue: UseFormSetValue<any>;
}

const PurchaseOrderGrid: React.FC<PurchaseOrderGridProps> = ({ control, fields, append, remove, update, approvedDisable, setValue }) => {
  const dropdownValues = useDropdownValues(["taxType"]);
  const [isLoading, setLoading] = useState(false);
  const [gridKey, setGridKey] = useState(0);

  // Use useWatch instead of accessing control._formValues directly
  const selectedProduct = useWatch({
    control,
    name: "selectedProduct",
  });

  const departmentId = useWatch({
    control,
    name: "purchaseOrderMast.fromDeptID",
  });

  const pOID = useWatch({
    control,
    name: "purchaseOrderMast.pOID",
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  const fetchPODetails = async () => {
    setLoading(true);
    const response: OperationResult<purchaseOrderSaveDto> = await purchaseOrderMastServices.getPurchaseOrderDetailsByPOID(pOID);
    if (response.success && response.data) {
      const purchaseOrderDetailsData = response.data.purchaseOrderDetailDto.map((item) => ({
        ...item,
        id: `${item.productID}-${Date.now()}`,
        gstPerValue: (item.cgstPerValue || 0) + (item.sgstPerValue || 0),
      }));
      purchaseOrderDetailsData.forEach((item, index) => update(index, item));
    } else {
      showAlert("error", "Failed to fetch PO Product details", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (pOID > 0) {
      fetchPODetails();
    }
  }, [pOID]);

  useEffect(() => {
    console.log("Current fields:", fields);
  }, [fields]);

  useEffect(() => {
    console.log("Selected Product changed:", selectedProduct);
    console.log("Approved Disable:", approvedDisable);
    console.log("Department ID:", departmentId);

    if (!departmentId) {
      showAlert("Please select a department", "", "warning");
      return;
    }

    if (selectedProduct && !approvedDisable) {
      const fetchPOProductDetails = async () => {
        setLoading(true);
        try {
          console.log("Fetching product details for:", selectedProduct.productCode);
          const response: OperationResult<PurchaseOrderDetailDto> = await purchaseOrderMastServices.getPOProductDetails(selectedProduct.productCode || "", departmentId);

          console.log("API Response:", response);
          if (!response.success || !response.data) {
            showAlert("Error", "Failed to fetch product details", "error");
            setLoading(false);
            return;
          }

          const purchaseOrderdetailDto = {
            ...response.data,
            id: `${response.data.productID}-${Date.now()}`,
            gstPerValue: (response.data.cgstPerValue || 0) + (response.data.sgstPerValue || 0),
            receivedQty: response.data.receivedQty ?? 0,
            unitPack: response.data.unitPack ?? 1,
            unitPrice: response.data.unitPrice ?? 0,
            totAmt: response.data.totAmt ?? 0,
            discAmt: response.data.discAmt ?? 0,
            discPercentageAmt: response.data.discPercentageAmt ?? 0,
            cgstTaxAmt: response.data.cgstTaxAmt ?? 0,
            sgstTaxAmt: response.data.sgstTaxAmt ?? 0,
            netAmount: response.data.netAmount ?? 0,
            rActiveYN: response.data.rActiveYN || "Y",
          };

          console.log("Purchase Order Detail:", purchaseOrderdetailDto);

          const productExist = fields.find((item) => item.productID === purchaseOrderdetailDto.productID && item.rActiveYN === "Y");
          if (productExist) {
            showAlert("Product already exists in the grid", "", "warning");
            setLoading(false);
            return;
          }

          if (fields.some((item) => item.productID === purchaseOrderdetailDto.productID && item.rActiveYN === "N")) {
            const index = fields.findIndex((item) => item.productID === purchaseOrderdetailDto.productID);
            remove(index);
          }

          console.log("Appending product:", purchaseOrderdetailDto);
          append(purchaseOrderdetailDto);

          // Clear the selected product after a brief delay
          setTimeout(() => {
            setValue("selectedProduct", null);
            console.log("Selected Product cleared");
          }, 100);

          setGridKey((prev) => {
            console.log("Updating gridKey:", prev + 1);
            return prev + 1;
          });
        } catch (error) {
          console.error("Error fetching product details:", error);
          showAlert("Error", "Failed to fetch product details", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchPOProductDetails();
    }
  }, [selectedProduct, approvedDisable, append, remove, departmentId, setValue, fields]);

  const handleDeleteClick = (index: number) => {
    setDeleteConfirmation({ open: true, index });
  };

  const handleDeleteRow = async () => {
    if (deleteConfirmation.index === null) return;
    setLoading(true);
    if (pOID === 0) {
      remove(deleteConfirmation.index);
    } else {
      update(deleteConfirmation.index, {
        ...fields[deleteConfirmation.index],
        rActiveYN: "N",
      });
    }
    setLoading(false);
    setDeleteConfirmation({ open: false, index: null });
    setGridKey((prev) => {
      console.log("Updating gridKey:", prev + 1);
      return prev + 1;
    });
  };

  const handleCellChange = (value: number, index: number, field: keyof PurchaseOrderDetailDto) => {
    const currentRow = { ...fields[index] };

    if (field === "discPercentageAmt" && value > 100) {
      showAlert("", "Discount percentage cannot exceed 100%", "warning");
      return;
    }

    if (field === "discAmt") {
      const totalPackPrice = (currentRow.unitPrice || 0) * (currentRow.receivedQty || 0);
      if (value > totalPackPrice) {
        showAlert("", "Discount amount cannot exceed pack price", "warning");
        return;
      }
    }

    currentRow[field] = value;
    const receivedQty = currentRow.receivedQty || 0;
    const unitPack = currentRow.unitPack || 1;
    const unitPrice = currentRow.unitPrice || 0;
    const totAmt = currentRow.totAmt || 0;
    const gstPerValue = currentRow.gstPerValue || 0;
    currentRow.requiredUnitQty = receivedQty * unitPack;
    const totalPrice = unitPrice * receivedQty;

    if (field === "discPercentageAmt") {
      currentRow.discAmt = (totalPrice * value) / 100;
    } else if (field === "discAmt") {
      currentRow.discPercentageAmt = totalPrice > 0 ? (value / totalPrice) * 100 : 0;
    }

    if (field === "gstPerValue") {
      currentRow.cgstPerValue = value / 2;
      currentRow.sgstPerValue = value / 2;
    }

    const discAmt = currentRow.discAmt || 0;
    const taxableAmount = totalPrice - discAmt;

    currentRow.cgstTaxAmt = (totalPrice * (currentRow.cgstPerValue || 0)) / 100 || 0;
    currentRow.sgstTaxAmt = (totalPrice * (currentRow.sgstPerValue || 0)) / 100 || 0;
    currentRow.gstPerValue = (currentRow.cgstPerValue || 0) + (currentRow.sgstPerValue || 0);
    const gstTaxAmt = (totalPrice * (currentRow.gstPerValue || 0)) / 100;
    currentRow.netAmount = totalPrice + gstTaxAmt - discAmt;
    currentRow.mrpAbdated = (totAmt * 100) / (gstPerValue + 100);
    currentRow.taxAmtOnMrp = (totAmt * receivedQty * gstTaxAmt) / 100;
    currentRow.taxAfterDiscOnMrp = "N";
    currentRow.taxAfterDiscYN = "N";

    update(index, currentRow);
    setGridKey((prev) => {
      console.log("Updating gridKey:", prev + 1);
      return prev + 1;
    });
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

  console.log("Rendering fields:", fields);
  return (
    <Paper sx={{ mt: 2, overflowX: "auto" }}>
      <Box sx={{ minWidth: 1200 }}>
        <TableContainer sx={{ minHeight: 300, overflowX: "auto" }} key={gridKey}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {tableHeaderNames.map((header) => (
                  <TableCell align="center" key={header}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {fields
                .filter((row) => row.rActiveYN !== "N")
                .map((row, index) => (
                  <TableRow key={row.id || `${row.productID}-${index}`}>
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
                        onChange={(value) => {
                          handleCellChange(Number(value.target.value), index, "receivedQty");
                        }}
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
                        onChange={(value) => handleCellChange(Number(value.target.value), index, "unitPack")}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      <FormField
                        control={control}
                        name={`purchaseOrderDetails.${index}.unitPrice`}
                        type="number"
                        label=""
                        disabled={approvedDisable}
                        onChange={(value) => handleCellChange(Number(value.target.value), index, "unitPrice")}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      <FormField
                        control={control}
                        name={`purchaseOrderDetails.${index}.totAmt`}
                        type="number"
                        label=""
                        disabled={approvedDisable}
                        onChange={(value) => handleCellChange(Number(value.target.value), index, "totAmt")}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      <FormField
                        control={control}
                        name={`purchaseOrderDetails.${index}.discAmt`}
                        type="number"
                        label=""
                        disabled={approvedDisable}
                        onChange={(value) => handleCellChange(Number(value.target.value), index, "discAmt")}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      <FormField
                        control={control}
                        name={`purchaseOrderDetails.${index}.discPercentageAmt`}
                        type="number"
                        label=""
                        disabled={approvedDisable}
                        onChange={(value) => handleCellChange(Number(value.target.value), index, "discPercentageAmt")}
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
                        onChange={(value) => {
                          const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.value) === Number(value.value));
                          const selectedRate = Number(selectedTax?.label || 0);
                          handleCellChange(selectedRate, index, "gstPerValue");
                        }}
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
                    <Loader type="spinner" />
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
