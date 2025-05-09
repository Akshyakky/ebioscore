import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { initialPOMastDto, PurchaseOrderDetailDto, purchaseOrderSaveDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import { RootState } from "@/store";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import {
  addPurchaseOrderDetail,
  removePurchaseOrderDetail,
  removePurchaseOrderDetailByPOID,
  setSelectedProduct,
  updateAllPurchaseOrderDetails,
} from "@/store/features/purchaseOrder/purchaseOrderSlice";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { showAlert } from "@/utils/Common/showAlert";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Loader } from "lucide-react";

const PurchaseOrderGrid: React.FC = () => {
  const dropdownValues = useDropdownValues(["taxType"]);

  const selectedProduct = useSelector((state: RootState) => state.purchaseOrder.selectedProduct) ?? null;
  const departmentInfo = useSelector((state: RootState) => state.purchaseOrder.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const purchaseOrderMastData = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderMastData) ?? initialPOMastDto;
  const { pOID } = purchaseOrderMastData;
  const approvedDisable = useSelector((state: RootState) => state.purchaseOrder.disableApprovedFields) ?? false;
  const purchaseOrderDetails = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderDetails) ?? [];
  const { departmentId } = departmentInfo;

  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const fetchPODetails = async () => {
    setLoading(true);
    const response: OperationResult<purchaseOrderSaveDto> = await purchaseOrderMastServices.getPurchaseOrderDetailsByPOID(pOID);
    if (response.success && response.data) {
      const purchaseOrderDetailsData = response.data.purchaseOrderDetailDto;
      const purchaseOrderDetailDtos: PurchaseOrderDetailDto[] = purchaseOrderDetailsData.map((item) => {
        item.gstPerValue = (item.cgstPerValue || 0) + (item.sgstPerValue || 0);
        return item;
      });
      console.log("Purchase Order Details:", purchaseOrderDetailDtos);
      dispatch(updateAllPurchaseOrderDetails(purchaseOrderDetailDtos));
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
    if (selectedProduct && !approvedDisable) {
      const fetchPOProductDetails = async () => {
        setLoading(true);
        const response: OperationResult<PurchaseOrderDetailDto> = await purchaseOrderMastServices.getPOProductDetails(selectedProduct.productCode || "", departmentId);
        const purchaseOrderdetailDto: PurchaseOrderDetailDto | undefined = response.data;
        if (purchaseOrderdetailDto) {
          const productExist = purchaseOrderDetails.find((item) => item.productID === purchaseOrderdetailDto.productID);
          if (productExist) {
            if (productExist.rActiveYN === "Y") {
              showAlert("Product already exists in the grid", "", "warning");
              setLoading(false);
              return;
            }
            dispatch(removePurchaseOrderDetailByPOID(productExist.pODetID));
          }
          purchaseOrderdetailDto.gstPerValue = (purchaseOrderdetailDto.cgstPerValue || 0) + (purchaseOrderdetailDto.sgstPerValue || 0);
          dispatch(addPurchaseOrderDetail(purchaseOrderdetailDto));
        }
        setLoading(false);
      };
      fetchPOProductDetails();
    }
  }, [selectedProduct]);

  const handleDeleteRow = async (productId: number, pODetID: number) => {
    const confirmDelete = await showAlert("Confirm Delete", "Are you sure you want to delete this item?", "warning", true);
    if (!confirmDelete) {
      return;
    }
    setLoading(true);
    if (pOID === 0) {
      dispatch(removePurchaseOrderDetail(productId));
    } else {
      const updatedPODetailRActiveN = purchaseOrderDetails.map((item) => {
        if (item.pODetID === pODetID) {
          return { ...item, rActiveYN: "N" };
        }
        return item;
      });
      dispatch(updateAllPurchaseOrderDetails(updatedPODetailRActiveN));
    }
    dispatch(setSelectedProduct(null));
    setLoading(false);
  };

  const handleCellChange = (value: number, rowIndex: number, field: keyof PurchaseOrderDetailDto) => {
    const updatedData = [...purchaseOrderDetails];
    const currentRow = { ...updatedData[rowIndex] };

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
    updatedData[rowIndex] = currentRow;

    dispatch(updateAllPurchaseOrderDetails(updatedData));
  };

  const renderEditableNumberField = (row: PurchaseOrderDetailDto, field: string, index: number) => (
    <FormField
      type="number"
      value={row[field] || 0}
      onChange={(e) => handleCellChange(Number(e.target.value), index, field)}
      label=""
      name={field}
      disabled={approvedDisable}
      ControlID={`${field}_${row.productID}`}
    />
  );
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
  return (
    <Paper sx={{ mt: 2, overflowX: "auto" }}>
      <Box sx={{ minWidth: 1200 }}>
        <TableContainer sx={{ minHeight: 300, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {tableHeaderNames.map((header) => (
                  <TableCell align="center">{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {purchaseOrderDetails
                .filter((row) => row.rActiveYN !== "N")
                .map((row: PurchaseOrderDetailDto, index) => (
                  <TableRow key={row.productID}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.manufacturerName}</TableCell>
                    <TableCell align="right">{row.stock || 0}</TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "receivedQty", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {row.requiredUnitQty || 0}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "unitPack", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "unitPrice", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "totAmt", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "discAmt", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      {renderEditableNumberField(row, "discPercentageAmt", index)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 150 }}>
                      <FormField
                        type="select"
                        value={dropdownValues.taxType?.find((tax) => Number(tax.label) === Number(row.gstPerValue))?.value || ""}
                        onChange={(e) => {
                          const selectedTax = dropdownValues.taxType?.find((tax) => Number(tax.value) === Number(e.target.value));
                          const selectedRate = Number(selectedTax?.label || 0);

                          handleCellChange(selectedRate, index, "gstPerValue");
                        }}
                        options={dropdownValues.taxType || []}
                        label=""
                        name="gstPercent"
                        disabled={approvedDisable}
                        ControlID={`gstPercent_${row.productID}`}
                      />
                    </TableCell>
                    <TableCell align="right">{row.rOL || 0}</TableCell>
                    <TableCell align="right">{row.netAmount?.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton disabled={approvedDisable} size="small" onClick={() => handleDeleteRow(row.productID, row.pODetID)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    <Loader size={24} className="animate-spin" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default PurchaseOrderGrid;
