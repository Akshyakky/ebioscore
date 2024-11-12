// src/components/Billing/ChargeDetailsPage.tsx
import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import { useState } from "react";
import ChargeDetails from "../SubPage/ChargesDetails";
import ChargeDetailsSearch from "../SubPage/ChargeDetailsSearch";
import { ChargeDetailsDto } from "../../../../interfaces/Billing/BChargeDetails";

const ChargeDetailsPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ChargeDetailsDto | undefined>(undefined);
  const [specificChargeID, setSpecificChargeID] = useState<number | undefined>(undefined); // Define specificChargeID state

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: ChargeDetailsDto) => {
    setSelectedData(data);
    setIsSearchOpen(false);
    setSpecificChargeID(data.chargeInfo.chargeID); // Set the specificChargeID on selection
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
      <ChargeDetails editData={selectedData} />
      <ChargeDetailsSearch
        open={isSearchOpen}
        onClose={handleCloseSearch}
        onSelect={handleSelect}
        filterId={specificChargeID} // Pass specificChargeID state to filterId
      />
    </Container>
  );
};

export default ChargeDetailsPage;
