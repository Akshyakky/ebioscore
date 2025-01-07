import React from "react";
import { Box, Container } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import ProductListDetails from "../SubPage/ProductListDetails";
import { useState } from "react";
import { ProductListDto } from "../../../../interfaces/InventoryManagement/ProductListDto";
import ProductListSearch from "../SubPage/ProductListSearch";

const ProductListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ProductListDto | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };
  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: ProductListDto) => {
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
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
      </Box>
      <ProductListDetails editData={selectedData} />
      <ProductListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};
export default ProductListPage;
