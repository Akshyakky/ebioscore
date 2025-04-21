import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import { Box, Container } from "@mui/material";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import ResourceDetails from "../SubPage/ResourceDetails";
import ResourceListSearch from "../SubPage/ResourceListSearch";

const ResourceListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ResourceListData | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: ResourceListData) => {
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
      <ResourceDetails editData={selectedData} />

      <ResourceListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default ResourceListPage;
