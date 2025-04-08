import { Box, Container } from "@mui/material";
import React, { useEffect } from "react";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import useDepartmentSelection from "@/hooks/InventoryManagement/useDepartmentSelection";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import PurchaseOrderHeader from "../SubPage/PurchaseOrderHeader";

const PurchaseOrderPage: React.FC = () => {
  const initialPOMastDto: PurchaseOrderMastDto = {
    pOID: 0,
    supplierID: 0,
    supplierName: "",
    fromDeptID: 0,
    fromDeptName: "",
    pODate: "",
    auGrpID: 0,
    catDesc: "",
    catValue: "",
    coinAdjAmt: 0,
    discAmt: 0,
    netAmt: 0,
    pOAcknowledgement: "",
    pOApprovedBy: "",
    pOApprovedID: 0,
    pOApprovedNo: "",
    pOApprovedYN: "",
    pOCode: "",
    pOSActionNo: "",
    pOTypeValue: "",
    pOType: "",
    taxAmt: 0,
    totalAmt: 0,
    pOStatusCode: "",
    pOStatus: "",
    netCGSTTaxAmt: 0,
    netSGSTTaxAmt: 0,
    totalTaxableAmt: 0,
    rActiveYN: "",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "",
    rNotes: "",
  };

  const [selectedData, setSelectedData] = React.useState<PurchaseOrderMastDto>(initialPOMastDto);
  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
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

  useEffect(() => {
    if (isDepartmentSelected) {
      console.log("Department selected:", deptId, deptName);
      setSelectedData((prev) => ({
        ...prev,
        fromDeptID: deptId,
        fromDeptName: deptName,
      }));
    }
  }, [deptId, deptName, isDepartmentSelected]);

  useEffect(() => {
    console.log("Selected Data:", selectedData);
  }, [selectedData]);

  const handleDepartmentChange = () => {
    openDialog();
  };
  const handleFormDataChange = (fieldName: keyof PurchaseOrderMastDto, value: any) => {
    setSelectedData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };
  const handleClear = () => {
    setSelectedData(initialPOMastDto);
  };
  const handleSave = () => {
    setIsSubmitted(true);
    console.log("Form Data to Save:", selectedData);
  };
  return (
    <>
      {deptId > 0 && (
        <Container maxWidth={false}>
          <Box sx={{ marginBottom: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>
          <PurchaseOrderHeader purchaseOrderData={selectedData} handleDepartmentChange={handleDepartmentChange} onFormChange={handleFormDataChange} isSubmitted={isSubmitted} />
          <Box sx={{ mt: 4 }}>
            <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
          </Box>
        </Container>
      )}
      <DepartmentSelectionDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onSelectDepartment={handleDepartmentSelect}
        initialDeptId={selectedData.fromDeptID}
        requireSelection={true}
      />
    </>
  );
};

export default PurchaseOrderPage;
