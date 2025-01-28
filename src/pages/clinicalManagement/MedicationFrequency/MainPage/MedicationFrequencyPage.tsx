import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import { MedicationFrequencyDto } from "@/interfaces/ClinicalManagement/MedicationFrequencyDto";
import { Box, Container } from "@mui/material";
import React, { useState } from "react";
import MedicationFrequencyDetails from "../SubPage/MedicationFrequencyDetails";
import MedicationFrequencySearch from "../SubPage/MedicationFrequencySearch";
import SearchIcon from "@mui/icons-material/Search";

const MedicationFrequencyPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<MedicationFrequencyDto | undefined>(undefined);
  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: MedicationFrequencyDto) => {
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
      <MedicationFrequencyDetails selectedData={selectedData} />
      <MedicationFrequencySearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default MedicationFrequencyPage;
