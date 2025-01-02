import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import DepartmentListDetails from "../SubPage/DepartmentListDetails";
import { useState } from "react";
import DepartmentListSearch from "../SubPage/DepartmentListSearch";
import { DepartmentDto } from "./../../../../interfaces/Billing/DepartmentDto";
import React from "react";

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
      icon: Search,
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
