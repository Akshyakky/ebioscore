import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import { useState } from "react";
import ChargeDetails from "../SubPage/ChargesDetails";
import ChargeDetailsSearch from "../SubPage/ChargeDetailsSearch";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";
import React from "react";

const ChargeDetailsPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ChargeDetailsDto | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (item: ChargeDetailsDto) => {
    if (!item || !item.chargeInfo) {
      console.error("Invalid item selected:", item);
      return;
    }
    console.log("Selected item:", item);
    setSelectedData(item);
    setIsSearchOpen(false);
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
        <ActionButtonGroup buttons={actionButtons} />
      </Box>
      <ChargeDetailsSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      <ChargeDetails editData={selectedData} />
    </Container>
  );
};

export default ChargeDetailsPage;
