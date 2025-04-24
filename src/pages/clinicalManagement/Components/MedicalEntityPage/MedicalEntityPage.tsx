// src/components/MedicalEntityPage/MedicalEntityPage.tsx
import React, { useState, useCallback } from "react";
import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { Search } from "@mui/icons-material";
import { BaseDto } from "@/services/GenericEntityService/GenericEntityService";

interface MedicalEntityPageProps<T extends BaseDto> {
  title: string;
  DetailComponent: React.ComponentType<{ selectedData?: T }>;
  SearchComponent: React.ComponentType<{
    open: boolean;
    onClose: () => void;
    onSelect: (data: T) => void;
  }>;
  additionalButtons?: ButtonProps[];
}

export function MedicalEntityPage<T extends BaseDto>({ title, DetailComponent, SearchComponent, additionalButtons = [] }: MedicalEntityPageProps<T>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<T | undefined>(undefined);

  const handleAdvancedSearch = useCallback(() => setIsSearchOpen(true), []);
  const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);
  const handleSelect = useCallback((data: T) => {
    setSelectedData(data);
    setIsSearchOpen(false);
  }, []);

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
    ...additionalButtons,
  ];

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
      </Box>
      <DetailComponent selectedData={selectedData} />
      <SearchComponent open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
}

export default MedicalEntityPage;
