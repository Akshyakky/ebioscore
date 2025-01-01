import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import MedicationFormDetails from "../SubPage/MedicationFormDetails";
import MedicationFormSearch from "../SubPage/MedicationFormSearch";
import { MedicationFormDto } from "../../../../interfaces/ClinicalManagement/MedicationFormDto";

const MedicationFormPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<MedicationFormDto | undefined>(undefined);

  const handleAdvancedSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSelect = (data: MedicationFormDto) => {
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
      <MedicationFormDetails selectedData={selectedData} />
      <MedicationFormSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default MedicationFormPage;
