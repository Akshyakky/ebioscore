import React from "react";
import { Box, Container } from "@mui/material";
import { useState } from "react";
import Search from "@mui/icons-material/Search";
import { WardCategoryDto } from "@/interfaces/HospitalAdministration/WardCategoryDto";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import WardCategoryDetails from "../SubPage/WardCategoryDetails";
import WardCategorySearch from "../SubPage/WardCategorySearch";

const WardCategoryPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<WardCategoryDto | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };
  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: WardCategoryDto) => {
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
        <WardCategoryDetails editData={selectedData} />
        <WardCategorySearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      </Container>
    </>
  );
};
export default WardCategoryPage;
