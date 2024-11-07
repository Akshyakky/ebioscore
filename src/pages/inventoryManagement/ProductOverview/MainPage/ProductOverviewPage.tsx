import React, { useCallback, useMemo, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import ProductOverviewDetail from "../SubPage/ProductOverviewDetails";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import FormField from "../../../../components/FormField/FormField";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import CustomButton from "../../../../components/Button/CustomButton";
import { ThumbUp } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { ProductOverviewDto } from "../../../../interfaces/InventoryManagement/ProductOverviewDto";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import ProductOverviewSearch from "../SubPage/ProductOverviewSearch";
import Search from "@mui/icons-material/Search";
import { showAlert } from "../../../../utils/Common/showAlert";

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

  const [dialogOpen, setDialogOpen] = useState(true);
  const [isDepartmentSelected, setIsDepartmentSelected] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { handleDropdownChange } = useDropdownChange<ProductOverviewDto>(setSelectedData);
  const dropdownValues = useDropdownValues(["department"]);
  const isSubmitted = false;

  const handleCloseDialog = useCallback(() => {
    if (isDepartmentSelected) {
      setDialogOpen(false);
    } else {
      showAlert("Warning", "Please select a department before closing.", "warning");
    }
  }, [isDepartmentSelected]);

  const handleOkClick = useCallback(() => {
    if (selectedData.deptID === 0) {
      showAlert("Warning", "Please select a department to continue.", "warning");
    } else {
      setIsDepartmentSelected(true);
      setDialogOpen(false);
      showAlert("Success", "Department selected successfully!", "success");
    }
  }, [selectedData.deptID]);

  const handleDepartmentChange = useCallback(() => {
    setDialogOpen(true);
  }, []);

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

      <GenericDialog open={dialogOpen} onClose={handleCloseDialog} title="Select Department" maxWidth="sm">
        <Typography variant="h6" gutterBottom>
          Please select a department
        </Typography>
        <FormField
          type="select"
          label="Department"
          name="deptID"
          ControlID="Department"
          value={selectedData.deptID === 0 ? "" : String(selectedData.deptID)}
          options={dropdownValues.department}
          onChange={handleDropdownChange(["deptID"], ["department"], dropdownValues.department)}
          isMandatory={true}
          isSubmitted={isSubmitted}
          gridProps={{ xs: 12, sm: 6, md: 6 }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
          <CustomButton variant="contained" onClick={handleCloseDialog} text="Close" sx={{ marginRight: 1 }} color="error" icon={Close} />
          <CustomButton variant="contained" onClick={handleOkClick} text="OK" color="success" icon={ThumbUp} />
        </Box>
      </GenericDialog>

      <ProductOverviewSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} selectedDeptID={selectedData.deptID} />
    </Container>
  );
};

export default React.memo(ProductOverviewPage);
