import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Container } from "@mui/material";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import { LComponentEntryTypeDto } from "@/interfaces/Laboratory/LInvMastDto";
import ComponentEntryTypeDetails from "../SubPage/ComponentEntryTypeDetails";
import ComponentEntryTypeSearch from "../SubPage/ComponentEntryTypeSearch";

const ComponentEntryTypePage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<LComponentEntryTypeDto | undefined>(undefined);
  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: LComponentEntryTypeDto) => {
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
      <ComponentEntryTypeDetails editData={selectedData} />
      <ComponentEntryTypeSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default ComponentEntryTypePage;
