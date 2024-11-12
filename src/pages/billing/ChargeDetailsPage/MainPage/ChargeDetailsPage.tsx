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

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: any) => {
    setSelectedData(data);
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
        <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
      </Box>
      <ChargeDetails editData={selectedData} />
      <ChargeDetailsSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default ChargeDetailsPage;
