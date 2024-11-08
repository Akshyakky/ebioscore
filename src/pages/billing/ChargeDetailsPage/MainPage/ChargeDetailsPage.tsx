import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import { useState } from "react";
import ChargeDetails from "../SubPage/ChargesDetails";

const ChargeDetailsPage: React.FC = () => {
  const [, setIsSearchOpen] = useState(false);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
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
          <ChargeDetails />
        </Box>
      </Container>
    </>
  );
};

export default ChargeDetailsPage;
