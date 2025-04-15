import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";
import { Search } from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import MedicationGenericDetails from "../SubPage/MedicationGenericDetails";
import MedicationGenericSearch from "../SubPage/MedicationGenericSearch";
const MedicationGenericPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<MedicationGenericDto | undefined>(undefined);

  const handleAdvancedSearch = useCallback(() => setIsSearchOpen(true), []);
  const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);
  const handleSelect = useCallback((data: MedicationGenericDto) => {
    setSelectedData(data);
    setIsSearchOpen(false);
  }, []);

  const actionButtons: ButtonProps[] = useMemo(
    () => [
      {
        variant: "contained",
        icon: Search,
        text: "Advanced Search",
        onClick: handleAdvancedSearch,
      },
    ],
    [handleAdvancedSearch]
  );

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
      </Box>
      <MedicationGenericDetails selectedData={selectedData} />
      <MedicationGenericSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};
export default React.memo(MedicationGenericPage);
