import React, { useCallback, useEffect, useState } from "react";
import { Delete as DeleteIcon, Save as SaveIcon, Search } from "@mui/icons-material";
import GRNHeader from "../SubPage/GRNHeader";
import GRNGrid from "../SubPage/GRNGrid";
import GRNFooter from "../SubPage/GRNFooter";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { resetGRNState, setDepartmentInfo, setGRNMastData } from "@/store/features/grn/grnSlice";
import { GRNService } from "@/services/InventoryManagementService/GRNService/GRNService";
import { Box, Container } from "@mui/material";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { GRNMastDto } from "@/interfaces/InventoryManagement/GRNDto";
import GRNSearch from "../SubPage/GRNSearch";
const GRNPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const grnService = new GRNService();
  const dispatch = useDispatch<AppDispatch>();
  const departmentInfo = useSelector((state: RootState) => state.grn.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentId } = departmentInfo;
  const grnMastData = useSelector((state: RootState) => state.grn.grnMastData) ?? null;
  useEffect(() => {
    console.log(grnMastData);
  }, [grnMastData]);
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const handleDepartmentChange = () => {
    openDialog();
  };

  useEffect(() => {
    if (isDepartmentSelected) {
      dispatch(setDepartmentInfo({ departmentId: deptId, departmentName: deptName }));
    }
  }, [deptId, deptName, isDepartmentSelected]);
  const handleClear = () => {
    dispatch(resetGRNState());
    handleDepartmentSelect(0, "");
    openDialog();
  };
  const handleSave = () => {
    console.log(grnMastData);
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

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);
  return (
    <>
      {departmentId > 0 && (
        <Container maxWidth={false}>
          <Box sx={{ marginBottom: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>
          <GRNHeader handleDepartmentChange={handleDepartmentChange} />
          <GRNGrid />
          <GRNFooter />
          <GRNSearch open={isSearchOpen} onClose={handleCloseSearch} />
          <Box sx={{ mt: 4 }}>
            <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
          </Box>
        </Container>
      )}
      <DepartmentSelectionDialog open={isDialogOpen} onClose={closeDialog} onSelectDepartment={handleDepartmentSelect} initialDeptId={departmentId ?? 0} requireSelection={true} />
    </>
  );
};

export default GRNPage;
