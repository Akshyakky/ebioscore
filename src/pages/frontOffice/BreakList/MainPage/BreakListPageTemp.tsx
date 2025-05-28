import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { BreakListDto } from "@/interfaces/FrontOffice/BreakListData";
import { useAlert } from "@/providers/AlertProvider";
import { Search } from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import React, { useState } from "react";
import BreakDetails from "../SubPage/BreakDetails";
import BreakListSearch from "../SubPage/BreakListsearch";

const BreakListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<BreakListDto | undefined>(undefined);
  const { showAlert } = useAlert();

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

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: any) => {
    if (data && typeof data.bLID === "number") {
      setSelectedData(data);
    } else {
      console.error("Invalid Break List Data: Missing bLID", data);
      showAlert("Error", "Invalid Break List Data: Missing bLID", "error");
    }
  };

  return (
    <>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
        </Box>
        <BreakDetails editData={selectedData} />
        <BreakListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      </Container>
    </>
  );
};

export default BreakListPage;
