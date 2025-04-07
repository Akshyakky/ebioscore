import { Box, Container } from "@mui/material";
import React, { useEffect } from "react";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { PurchaseOrderMastDto } from "@/interfaces/InventoryManagement/PurchaseOrderDto";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import useDepartmentSelection from "@/hooks/Common/useDepartmentSelection";

const PurchaseOrderPage: React.FC = () => {
  const [selectedData, setSelectedData] = React.useState<PurchaseOrderMastDto>({
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
  });

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const { deptId, deptName, isDialogOpen, isDepartmentSelected, openDialog, closeDialog, handleDepartmentSelect, requireDepartmentSelection } = useDepartmentSelection({
    isDialogOpen: true,
  });

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

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
      </Box>

      <DepartmentSelectionDialog
        open={isDialogOpen}
        onClose={closeDialog}
        onSelectDepartment={handleDepartmentSelect}
        initialDeptId={selectedData.fromDeptID}
        requireSelection={true}
      />
    </Container>
  );
};

export default PurchaseOrderPage;
