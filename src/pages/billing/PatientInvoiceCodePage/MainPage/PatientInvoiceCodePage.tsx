import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import PatientInvoiceCodeDetails from "../SubPage/PatientInvoiceCodeDetails";
import PatientInvoiceCodeSearch from "../SubPage/PatientInvoiceCodeSearch";
import { useState } from "react";
import { BPatTypeDto } from "../../../../interfaces/Billing/BPatTypeDto";
import React from "react";

const PatientInvoiceCodePage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<BPatTypeDto | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: BPatTypeDto) => {
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
        <PatientInvoiceCodeDetails editData={selectedData} />
        <PatientInvoiceCodeSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      </Container>
    </>
  );
};

export default PatientInvoiceCodePage;
