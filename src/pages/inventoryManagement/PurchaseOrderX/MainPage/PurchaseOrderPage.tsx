import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import React, { useEffect } from "react";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { Box, Container } from "@mui/material";
import PurchaseOrderHeader from "../SubPage/PurchaseOrderHeader";
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setDepartmentInfo, setPurchaseOrderMastData, resetPurchaseOrderState } from "@/store/features/purchaseOrder/purchaseOrderSlice";
import { AppDispatch } from "@/store";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { initialPOMastDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import PurchaseOrderGrid from "../SubPage/PurchaseOrderGrid";
import PurchaseOrderFooter from "../SubPage/PurchaseOrderFooter";

const PurchaseOrderPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
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
