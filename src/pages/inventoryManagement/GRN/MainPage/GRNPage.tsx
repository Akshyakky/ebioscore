import React, { useEffect } from "react";
import GRNHeader from "../SubPage/GRNHeader";
import GRNGrid from "../SubPage/GRNGrid";
import GRNFooter from "../SubPage/GRNFooter";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { setDepartmentInfo } from "@/store/features/grn/grnSlice";
import { GRNService } from "@/services/InventoryManagementService/GRNService/GRNService";

const GRNPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const departmentInfo = useSelector((state: RootState) => state.purchaseOrder.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentId } = departmentInfo;

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const handleDepartmentChange = () => {
    console.log("handleDepartmentChange");
    openDialog();
  };
  const fetchGRNMast = async () => {
    // const response = await GRNService.
  };
  useEffect(() => {
    if (isDepartmentSelected) {
      dispatch(setDepartmentInfo({ departmentId: deptId, departmentName: deptName }));
    }
  }, [deptId, deptName, isDepartmentSelected]);

  return (
    <>
      <GRNHeader handleDepartmentChange={handleDepartmentChange} />
      <GRNGrid />
      <GRNFooter />
      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} initialDeptId={departmentId ?? 0} requireSelection={true} />
    </>
  );
};

export default GRNPage;
