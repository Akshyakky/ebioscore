import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import React, { useEffect } from "react";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { Box, Container } from "@mui/material";
import PurchaseOrderHeader from "../SubPage/PurchaseOrderHeader";
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
//
import { useDispatch } from "react-redux";
import { setDepartmentInfo, setPurchaseOrderMastData, updatePurchaseOrderMastField, resetPurchaseOrderState } from "@/store/features/purchaseOrder/purchaseOrderSlice";
import { AppDispatch } from "@/store";
//
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { initialPOMastDto, PurchaseOrderDetailDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import PurchaseOrderGrid from "../SubPage/PurchaseOrderGrid";
import PurchaseOrderFooter from "../SubPage/PurchaseOrderFooter";

const PurchaseOrderPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const purchaseOrderDetails = useSelector((state: RootState) => state.purchaseOrder.purchaseOrderDetails) ?? [];
  const departmentInfo = useSelector((state: RootState) => state.purchaseOrder.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentId } = departmentInfo;

  useEffect(() => {
    if (isDepartmentSelected) {
      dispatch(setDepartmentInfo({ departmentId: deptId, departmentName: deptName }));
      dispatch(
        setPurchaseOrderMastData({
          ...initialPOMastDto,
          fromDeptID: deptId,
          fromDeptName: deptName,
        } as PurchaseOrderMastDto)
      );
    }
  }, [deptId, deptName, isDepartmentSelected]);

  const handleDepartmentChange = () => {
    openDialog();
  };

  const recalculateFooterAmounts = (details: PurchaseOrderDetailDto[]) => {
    let totalAmt = 0;
    let discAmt = 0;
    let taxAmt = 0;
    let netAmt = 0;

    details.forEach((item) => {
      const packPrice = item.packPrice || 0;
      const requiredPack = item.requiredPack || 0;
      const itemTotalPrice = packPrice * requiredPack;
      const itemDisc = item.discAmt || 0;
      const itemCGST = item.cgstTaxAmt || 0;
      const itemSGST = item.sgstTaxAmt || 0;

      totalAmt += itemTotalPrice;
      discAmt += itemDisc;
      taxAmt += itemCGST + itemSGST;
      netAmt += itemTotalPrice - itemDisc + itemCGST + itemSGST;
    });

    dispatch(updatePurchaseOrderMastField({ field: "totalAmt", value: totalAmt }));
    dispatch(updatePurchaseOrderMastField({ field: "discAmt", value: discAmt }));
    dispatch(updatePurchaseOrderMastField({ field: "taxAmt", value: taxAmt }));
    dispatch(updatePurchaseOrderMastField({ field: "netAmt", value: netAmt }));
  };

  useEffect(() => {
    recalculateFooterAmounts(purchaseOrderDetails);
  }, [purchaseOrderDetails]);

  useEffect(() => {
    return () => {
      dispatch(resetPurchaseOrderState());
    };
  }, []);

  const handleClear = () => {
    dispatch(resetPurchaseOrderState());
  };
  const handleSave = () => {
    console.log("Save button clicked");
  };
  return (
    <>
      {deptId > 0 && (
        <Container maxWidth={false}>
          <PurchaseOrderHeader handleDepartmentChange={handleDepartmentChange} />
          <PurchaseOrderGrid />
          <PurchaseOrderFooter />
          <Box sx={{ mt: 4 }}>
            {departmentId > 0 && <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />}
          </Box>
        </Container>
      )}
      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} initialDeptId={departmentId ?? 0} requireSelection={true} />
    </>
  );
};

export default PurchaseOrderPage;
