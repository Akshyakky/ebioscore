import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";
import { Box, Container } from "@mui/material";
import React, { useState } from "react";
import DepartmentListDetails from "../SubPage/DepartmentListDetails";
import DepartmentListSearch from "../SubPage/DepartmentListSearch";
import SearchIcon from "@mui/icons-material/Search";

const DepartmentListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DepartmentDto | undefined>(undefined);
  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };
  const handleSelect = (data: DepartmentDto) => {
    setSelectedData(data);
  };
  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  return (
    <>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
        </Box>
        <DepartmentListDetails editData={selectedData} />
        <DepartmentListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      </Container>
    </>
  );
};

export default DepartmentListPage;
