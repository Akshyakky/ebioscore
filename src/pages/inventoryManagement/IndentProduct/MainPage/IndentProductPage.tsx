import React, { useCallback, useState } from "react";
import { Box, Container } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import { IndentDetailDto, IndentMastDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import IndentProductDetails from "../SubPage/IndentProductList";
import IndentSearchDialog from "../SubPage/IndentProductSearch";

const IndentProductPage: React.FC = () => {
  const [department, setDepartment] = useState({ id: 0, name: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IndentSaveRequestDto | null>(null);
  const [indentDetails, setIndentDetails] = useState<IndentDetailDto[]>([]);
  const [selectedIndent, setSelectedIndent] = useState<IndentMastDto | undefined>(undefined);

  const handleDepartmentSelect = useCallback((id: number, name: string) => {
    setDepartment({ id, name });
    setIsDialogOpen(false);
  }, []);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: IndentMastDto) => {
    setSelectedIndent(data);
    setIsSearchOpen(false);
  };

  const handleCreateNew = () => {
    setSelectedIndent(undefined); // Clear any selected indent to start fresh
  };

  const onIndentDetailsChange = (updatedDetails: IndentDetailDto[]) => {
    setIndentDetails(updatedDetails);
  };

  const handleIndentSelect = (indentMastDto: IndentMastDto) => {
    if (!indentMastDto) return;

    // Create a new IndentSaveRequestDto with the selected indent master
    const newSelectedData: IndentSaveRequestDto = {
      id: 0,
      rActiveYN: "Y",
      IndentMaster: indentMastDto,
      IndentDetails: [], // This will be populated with indent details if needed
    };

    setSelectedData(newSelectedData);
    setIsSearchOpen(false); // Close the search dialog after selection
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
      {department.id > 0 && (
        <Container maxWidth={false}>
          <Box sx={{ mb: 2 }}>
            <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
          </Box>

          <IndentProductDetails
            selectedData={selectedData}
            selectedDeptId={department.id}
            selectedDeptName={department.name}
            handleDepartmentChange={() => setIsDialogOpen(true)}
            onIndentDetailsChange={onIndentDetailsChange}
          />
        </Container>
      )}

      <DepartmentSelectionDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectDepartment={handleDepartmentSelect}
        initialDeptId={department.id}
        requireSelection
      />

      {/* Indent Search Dialog */}
      <IndentSearchDialog open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </>
  );
};

export default IndentProductPage;
