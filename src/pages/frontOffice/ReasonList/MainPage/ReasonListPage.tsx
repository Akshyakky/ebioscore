import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { ReasonListData } from "@/interfaces/frontOffice/ReasonListData";
import { Box, Container } from "@mui/material";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import ReasonDetails from "../SubPage/ReasonDetails";
import ReasonListSearch from "../SubPage/ReasonListSearch";

const ReasonListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ReasonListData | undefined>(undefined);
  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: ReasonListData) => {
    setSelectedData(data);
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup
          buttons={[
            {
              variant: "contained",
              size: "medium",
              icon: SearchIcon,
              text: "Advanced Search",
              onClick: handleAdvancedSearch,
            },
          ]}
        />
      </Box>
      <ReasonDetails editData={selectedData} />
      <ReasonListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default ReasonListPage;
