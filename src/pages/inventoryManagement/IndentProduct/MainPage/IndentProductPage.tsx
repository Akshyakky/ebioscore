import React, { useCallback, useState } from "react";
import { Box, Container } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import IndentProductGrid from "../SubPage/IndentProdctDetails";
import { IndentDetailDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import IndentProductDetails from "../SubPage/IndentProductList";

const IndentProductPage: React.FC = () => {
  const [deptId, setDeptId] = useState(0);
  const [deptName, setDeptName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IndentSaveRequestDto | null>(null);
  const [indentDetails, setIndentDetails] = useState<IndentDetailDto[]>([]);

  const handleDepartmentSelect = (id: number, name: string) => {
    setDeptId(id);
    setDeptName(name);
    setIsDialogOpen(false);
  };
  const onIndentDetailsChange = (updatedDetails: IndentDetailDto[]) => {
    setIndentDetails(updatedDetails);
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Advanced Search",
      onClick: () => setIsSearchOpen(true),
    },
  ];

  return (
    <>
      {deptId > 0 && (
        <Container maxWidth={false}>
          <Box sx={{ mb: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>
          {/* ➜ entry form */}
          <IndentProductDetails
            selectedData={selectedData}
            selectedDeptId={deptId}
            selectedDeptName={deptName}
            handleDepartmentChange={() => setIsDialogOpen(true)}
            onIndentDetailsChange={onIndentDetailsChange} // Passing the function to child component
          />
        </Container>
      )}

      {/* department dialog */}
      <DepartmentSelectionDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSelectDepartment={handleDepartmentSelect} initialDeptId={deptId} requireSelection />
    </>
  );
};

export default IndentProductPage;
