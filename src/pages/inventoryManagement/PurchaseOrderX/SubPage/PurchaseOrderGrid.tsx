import FormField from "@/components/FormField/FormField";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { PurchaseOrderDetailDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import { purchaseOrderMastServices } from "@/services/InventoryManagementService/PurchaseOrderService/PurchaseOrderMastServices";
import { RootState } from "@/store";
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { use, useEffect } from "react";
//
import { useSelector } from "react-redux";
//
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { addPurchaseOrderDetail, removePurchaseOrderDetail } from "@/store/features/purchaseOrder/purchaseOrderSlice";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { showAlert } from "@/utils/Common/showAlert";
import { Delete as DeleteIcon } from "@mui/icons-material";
//
const PurchaseOrderGrid: React.FC = () => {
  const dropdownValues = useDropdownValues(["taxType"]);
  const selectedProduct = useSelector((state: RootState) => state.purchaseOrder.selectedProduct) ?? null;
  const departmentInfo = useSelector((state: RootState) => state.purchaseOrder.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const purchaseOrderDetails = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderDetails) ?? [];
  useEffect(() => {
    console.log("purchaseOrderDetails:", purchaseOrderDetails);
  }, [purchaseOrderDetails]);

  const { departmentId } = departmentInfo;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (selectedProduct) {
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

  const handleCellChange = (value: number, rowIndex: number, field: string) => {};

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
                    value={row.requiredPack || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "requiredPack")}
                    label=""
                    name="requiredPack"
                    ControlID={`requiredPack_${row.productID}`}
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
                    ControlID={`packPrice_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.sellingPrice || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "sellingPrice")}
                    label=""
                    name="sellingPrice"
                    ControlID={`sellingPrice_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">
                  <FormField
                    type="number"
                    value={row.discAmt || 0}
                    onChange={(e) => handleCellChange(Number(e.target.value), index, "discAmt")}
                    label=""
                    name="discAmt"
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
                    ControlID={`gstPercent_${row.productID}`}
                  />
                </TableCell>

                <TableCell align="right">{row.rOL || 0}</TableCell>

                <TableCell align="right">{row.totAmt.toFixed(2)}</TableCell>

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
