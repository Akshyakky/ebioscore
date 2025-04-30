import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import React, { useCallback, useEffect, useState } from "react";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { Box, Container } from "@mui/material";
import PurchaseOrderHeader from "../SubPage/PurchaseOrderHeader";
import { Delete as DeleteIcon, Save as SaveIcon, Search } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setDepartmentInfo, setPurchaseOrderMastData, resetPurchaseOrderState } from "@/store/features/purchaseOrder/purchaseOrderSlice";
import { AppDispatch } from "@/store";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { initialPOMastDto, PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import PurchaseOrderGrid from "../SubPage/PurchaseOrderGrid";
import PurchaseOrderFooter from "../SubPage/PurchaseOrderFooter";
import PurchaseOrderSearch from "../SubPage/PurchaseOrderSearch";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";

const PurchaseOrderPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const departmentInfo = useSelector((state: RootState) => state.purchaseOrder.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentId } = departmentInfo;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSelect = useCallback((data: PurchaseOrderMastDto) => {
    dispatch(setPurchaseOrderMastData(data));
  }, []);

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
  const handleAdvancedSearch = () => {
    requireDepartmentSelection(() => {
      setIsSearchOpen(true);
    });
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  return (
    <>
      {deptId > 0 && (
        <Container maxWidth={false}>
          <Box sx={{ marginBottom: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>
          <PurchaseOrderHeader handleDepartmentChange={handleDepartmentChange} />
          <PurchaseOrderGrid />
          <PurchaseOrderFooter />
          <PurchaseOrderSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
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
