import { Box, Container } from "@mui/material";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { InsuranceListDto } from "@/interfaces/HospitalAdministration/InsuranceListDto";
import React from "react";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import InsuranceDetails from "../SubPage/InsuranceListDetails";
import InsuranceListSearch from "../SubPage/InsuranceListSearch";

const InsuranceListPage: React.FC = () => {
  const [selectedData, setSelectedData] = useState<InsuranceListDto | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: InsuranceListDto) => {
    setSelectedData(data);
  };

  return (
    <>
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
        <InsuranceDetails editData={selectedData} />
        <InsuranceListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
      </Container>
    </>
  );
};

export default InsuranceListPage;
