import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { BServiceGrpDto } from "@/interfaces/Billing/BServiceGrpDto";
import { Search } from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import React, { useState } from "react";
import ServiceGroupsListDetails from "../SubPage/ServiceGroupsListDetails";
import ServiceGroupsListSearch from "../SubPage/ServiceGroupsListSearch";

const ServiceGroupsListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<BServiceGrpDto | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: BServiceGrpDto) => {
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
        <ServiceGroupsListDetails editData={selectedData} />
        <ServiceGroupsListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      </Container>
    </>
  );
};
export default ServiceGroupsListPage;
