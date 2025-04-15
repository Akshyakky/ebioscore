import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";
import { Box, Container } from "@mui/material";
import React, { useState } from "react";
import MedicationDosageDetails from "../SubPage/MedicationDosageDetails";
import MedicationDosageSearch from "../SubPage/MedicationDosageSearch";
import SearchIcon from "@mui/icons-material/Search";

const MedicationDosagePage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<MedicationDosageDto | undefined>(undefined);
  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: MedicationDosageDto) => {
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
      <MedicationDosageDetails selectedData={selectedData} />
      <MedicationDosageSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default MedicationDosagePage;
