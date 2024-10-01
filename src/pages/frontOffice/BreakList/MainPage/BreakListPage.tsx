import React, { useState } from "react";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import { Container } from "@mui/system";
import { Box } from "@mui/material";
import BreakDetails from "../SubPage/BreakDetails";
import { BreakListDto } from "../../../../interfaces/FrontOffice/BreakListData";
import BreakListSearch from "../SubPage/BreakListsearch";

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
    }
  ];

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: BreakListDto) => {
    setSelectedData(data);
  };


  return (<>
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} groupVariant="contained" groupSize="medium" orientation="horizontal" color="primary" />
      </Box>
      <BreakDetails editData={selectedData} />
      <BreakListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  </>);
};

export default BreakListPage;
