import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import PaymentTypesDetails from "../SubPage/PaymentTypesDetails";
import PaymentTypesSearch from "../SubPage/PaymentTypesSearch";
import { useState } from "react";
import { BPayTypeDto } from "../../../../interfaces/Billing/BPayTypeDto";

const PaymentTypesPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<BPayTypeDto | undefined>(
    undefined
  );

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
          <ActionButtonGroup buttons={actionButtons} groupVariant="contained" groupSize="medium" orientation="horizontal" color="primary" />
        </Box>
        <PaymentTypesDetails editData={selectedData} />
        <PaymentTypesSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      </Container>
    </>
  );
};

export default PaymentTypesPage;
