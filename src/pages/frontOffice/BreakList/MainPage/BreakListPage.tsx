import React, { useState } from "react";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import { Container } from "@mui/system";
import { Box } from "@mui/material";
import BreakDetails from "../SubPage/BreakDetails";
import { BreakListDto } from "../../../../interfaces/frontOffice/BreakListData";
import BreakListSearch from "../SubPage/BreakListsearch";
import { showAlert } from "../../../../utils/Common/showAlert";

const BreakListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<BreakListDto | undefined>(undefined);

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
