import React, { useCallback, useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import DepartmentSelectionDialog from "../../CommonPage/DepartmentSelectionDialog";
import IndentProductListDetails from "../SubPage/IndentProductList";
import { IndentDetailDto, IndentSaveRequestDto } from "@/interfaces/InventoryManagement/IndentProductDto";
import IndentProductGrid from "../SubPage/IndentProdctDetails";

const IndentProductPage: React.FC = () => {
  const [deptId, setDeptId] = useState(0);
  const [deptName, setDeptName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(true); // Open initially to force department selection
  const [isDepartmentSelected, setIsDepartmentSelected] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IndentSaveRequestDto | null>(null);
  const [indentDetails, setIndentDetails] = useState<IndentDetailDto[]>([]);

  const handleDepartmentSelect = (id: number, name: string) => {
    setDeptId(id);
    setDeptName(name);
    setIsDepartmentSelected(true);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const requireDepartmentSelection = (callback: () => void) => {
    if (deptId === 0) {
      setIsDialogOpen(true);
    } else {
      callback();
    }
  };

  const handleAdvancedSearch = useCallback(() => {
    requireDepartmentSelection(() => {
      setIsSearchOpen(true);
    });
  }, [deptId]);

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

          <IndentProductListDetails selectedData={selectedData} selectedDeptId={deptId} selectedDeptName={deptName} handleDepartmentChange={handleOpenDialog} />
          <IndentProductGrid
            data={indentDetails}
            unitOptions={[]} // No static data, will load dynamically later
            packageOptions={[]}
            onChange={setIndentDetails}
          />
        </Container>
      )}

      <DepartmentSelectionDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelectDepartment={handleDepartmentSelect}
        initialDeptId={deptId}
        requireSelection={true}
      />
    </>
  );
};

export default IndentProductPage;
