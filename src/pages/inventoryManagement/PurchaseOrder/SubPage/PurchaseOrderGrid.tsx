import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { initialPOMastDto, PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import { RootState } from "@/store";
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { addPurchaseOrderDetail, removePurchaseOrderDetail, updateAllPurchaseOrderDetails } from "@/store/features/purchaseOrder/purchaseOrderSlice";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { showAlert } from "@/utils/Common/showAlert";
import { Delete as DeleteIcon } from "@mui/icons-material";
//
const PurchaseOrderGrid: React.FC = () => {
  const dropdownValues = useDropdownValues(["taxType"]);
  const selectedProduct = useSelector((state: RootState) => state.purchaseOrder.selectedProduct) ?? null;
  const departmentInfo = useSelector((state: RootState) => state.purchaseOrder.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const purchaseOrderMastData = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderMastData) ?? initialPOMastDto;
  const { pOID, pOApprovedYN } = purchaseOrderMastData;
  const disabled = pOApprovedYN === "Y";
  const purchaseOrderDetails = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderDetails) ?? [];
  const { departmentId } = departmentInfo;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (pOID > 0) {
      const fetchPOProductDetails = async () => {
        const response: OperationResult<PurchaseOrderDetailDto[]> = await purchaseOrderMastServices.getPurchaseOrderDetailsByPOID(pOID);
        if (response.success && response.data) {
          const purchaseOrderDetailDtos: PurchaseOrderDetailDto[] = response.data.map((item) => {
            item.gstPerValue = (item.cgstPerValue || 0) + (item.sgstPerValue || 0);
            return item;
          });
          dispatch(updateAllPurchaseOrderDetails(purchaseOrderDetailDtos));
        } else {
          showAlert("error", "Failed to fetch PO Product details", "error");
        }
      };
      fetchPOProductDetails();
    }
  }, [pOID]);

  useEffect(() => {
    if (selectedProduct && !disabled) {
      const fetchPOProductDetails = async () => {
        const response: OperationResult<PurchaseOrderDetailDto> = await purchaseOrderMastServices.getPOProductDetails(selectedProduct.productCode || "", departmentId);
        const purchaseOrderdetailDto: PurchaseOrderDetailDto | undefined = response.data;
        if (purchaseOrderdetailDto) {
          const productExist = purchaseOrderDetails.find((item) => item.productID === purchaseOrderdetailDto.productID);
          if (productExist) {
            showAlert("Product already exists in the grid", "", "warning");
            return;
          }
          purchaseOrderdetailDto.gstPerValue = (purchaseOrderdetailDto.cgstPerValue || 0) + (purchaseOrderdetailDto.sgstPerValue || 0);
          dispatch(addPurchaseOrderDetail(purchaseOrderdetailDto));
        }
      };
      fetchPOProductDetails();
    }
  }, [selectedProduct]);

  const handleDeleteRow = (productId: number) => {
    dispatch(removePurchaseOrderDetail(productId));
  };

  const handleCellChange = (value: number, rowIndex: number, field: keyof PurchaseOrderDetailDto) => {
    const updatedData = [...purchaseOrderDetails];
    const currentRow = { ...updatedData[rowIndex] };

    if (field === "discPercentageAmt" && value > 100) {
      showAlert("error", "Discount percentage cannot exceed 100%", "error");
      return;
    }

    if (field === "discAmt") {
      const totalPackPrice = (currentRow.packPrice || 0) * (currentRow.receivedQty || 0);
      if (value > totalPackPrice) {
        showAlert("error", "Discount amount cannot exceed pack price", "error");
        return;
      }
    }

    currentRow[field] = value;
    const receivedQty = currentRow.receivedQty || 0;
    const unitPack = currentRow.unitPack || 1;
    const packPrice = currentRow.packPrice || 0;
    const totAmt = currentRow.totAmt || 0;
    const gstPerValue = currentRow.gstPerValue || 0;
    currentRow.requiredUnitQty = receivedQty * unitPack;
    const totalPrice = packPrice * receivedQty;

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
    updatedData[rowIndex] = currentRow;

    dispatch(updateAllPurchaseOrderDetails(updatedData));
  };

  return (
    <Paper sx={{ mt: 2 }}>
      <TableContainer sx={{ minHeight: 300 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell align="right">QOH[Units]</TableCell>
              <TableCell align="right">Required Pack</TableCell>
              <TableCell align="right">Required Unit Qty</TableCell>
              <TableCell align="right">Units/Pack</TableCell>
              <TableCell align="right">Pack Price</TableCell>
              <TableCell align="right">Selling Price</TableCell>
              <TableCell align="right">Disc</TableCell>
              <TableCell align="right">Disc[%]</TableCell>
              <TableCell align="right">GST[%]</TableCell>
              <TableCell align="right">ROL</TableCell>
              <TableCell align="right">Item Total</TableCell>
              <TableCell align="center">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrderDetails.map((row: PurchaseOrderDetailDto, index) => (
              <TableRow key={row.productID}>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell>{row.productName}</TableCell>
                <TableCell>{row.manufacturerName}</TableCell>
                <TableCell align="right">{row.stock || 0}</TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.receivedQty || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "receivedQty")}
                    label=""
                    name="receivedQty"
                    disabled={disabled}
                    ControlID={`receivedQty_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">{row.requiredUnitQty || 0}</TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.unitPack || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "unitPack")}
                    label=""
                    name="unitPack"
                    disabled={disabled}
                    ControlID={`unitPack_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.packPrice || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "packPrice")}
                    label=""
                    name="packPrice"
                    disabled={disabled}
                    ControlID={`packPrice_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.totAmt || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "totAmt")}
                    label=""
                    name="totAmt"
                    disabled={disabled}
                    ControlID={`totAmt_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.discAmt || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "discAmt")}
                    label=""
                    name="discAmt"
                    disabled={disabled}
                    ControlID={`discAmt_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.discPercentageAmt || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "discPercentageAmt")}
                    label=""
                    name="discPercentageAmt"
                    disabled={disabled}
                    ControlID={`discPercentageAmt_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
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
                    disabled={disabled}
                    ControlID={`gstPercent_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">{row.rOL || 0}</TableCell>

                <TableCell align="right">{row.netAmount?.toFixed(2)}</TableCell>

                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleDeleteRow(row.productID)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PurchaseOrderGrid;
