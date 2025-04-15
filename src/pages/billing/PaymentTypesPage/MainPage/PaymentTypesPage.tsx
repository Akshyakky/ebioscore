import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { BPayTypeDto } from "@/interfaces/Billing/BPayTypeDto";
import { Search } from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import React, { useState } from "react";
import PaymentTypesDetails from "../SubPage/PaymentTypesDetails";
import PaymentTypesSearch from "../SubPage/PaymentTypesSearch";

const PaymentTypesPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<BPayTypeDto | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: BPayTypeDto) => {
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
        <PaymentTypesDetails editData={selectedData} />
        <PaymentTypesSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      </Container>
    </>
  );
};

export default PaymentTypesPage;
