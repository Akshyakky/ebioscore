import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { ThumbUp } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import Search from "@mui/icons-material/Search";
import { ProductOverviewDto } from "@/interfaces/InventoryManagement/ProductOverviewDto";
import useDropdownChange from "@/hooks/useDropdownChange";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { showAlert } from "@/utils/Common/showAlert";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import ProductOverviewDetail from "../SubPage/ProductOverviewDetails";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import FormField from "@/components/FormField/FormField";
import CustomButton from "@/components/Button/CustomButton";
import ProductOverviewSearch from "../SubPage/ProductOverviewSearch";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";

const ProductOverviewPage: React.FC = () => {
  const [selectedData, setSelectedData] = useState<ProductOverviewDto>({
    pvID: 0,
    productID: 0,
    fsbCode: "",
    supplierAllocation: "",
    poStatus: "",
    deptID: 0,
    department: "",
    defaultYN: "N",
    isAutoIndentYN: "N",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "N",
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const isSubmitted = false;
  const handleDepartmentChange = useCallback(() => {
    openDialog();
  }, [openDialog]);
  const handleAdvancedSearch = useCallback(() => {
    if (!isDepartmentSelected) {
      showAlert("Warning", "Please select a department first before searching.", "warning");
      return;
    }
    setIsSearchOpen(true);
  }, [isDepartmentSelected]);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleSelect = useCallback((data: ProductOverviewDto) => {
    setSelectedData((prev) => ({
      ...prev,
      ...data,
    }));
    showAlert("Success", "Product overview details loaded successfully!", "success");
  }, []);

  useEffect(() => {
    if (isDepartmentSelected) {
      setSelectedData((prev) => ({
        ...prev,
        deptID: deptId,
        department: deptName,
      }));
    }
  }, [deptId, deptName, isDepartmentSelected]);

  const actionButtons: ButtonProps[] = useMemo(
    () => [
      {
        variant: "contained",
        icon: Search,
        text: "Advanced Search",
        onClick: handleAdvancedSearch,
      },
    ],
    [handleAdvancedSearch]
  );

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
      </Box>
      <Box sx={{ marginBottom: 2 }} />

      {isDepartmentSelected && <ProductOverviewDetail selectedData={selectedData} onChangeDepartment={handleDepartmentChange} />}

      <DepartmentSelectionDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onSelectDepartment={handleDepartmentSelect}
        initialDeptId={selectedData.deptID}
        requireSelection={true}
      />

      <ProductOverviewSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} selectedDeptID={selectedData.deptID} />
    </Container>
  );
};

export default React.memo(ProductOverviewPage);
