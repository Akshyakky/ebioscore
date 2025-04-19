import React, { useCallback, useState } from "react";
import { Box, Container } from "@mui/material";
import Search from "@mui/icons-material/Search";

import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import IndentProductListDetails from "../SubPage/IndentProductList";

const IndentProductPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAdvancedSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

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

      <IndentProductListDetails />
      {/* You can add the search dialog here later if needed */}
    </Container>
  );
};

export default IndentProductPage;
