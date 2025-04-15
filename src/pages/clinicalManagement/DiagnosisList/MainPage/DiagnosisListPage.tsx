import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import { IcdDetailDto } from "@/interfaces/ClinicalManagement/IcdDetailDto";
import { Search } from "@mui/icons-material";
import { Box, ButtonProps, Container } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import DiagnosisDetails from "../SubPage/DiagnosisDetails";
import DiagnosisSearch from "../SubPage/DiagnosisSearch";

const DiagnosisListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IcdDetailDto | undefined>(undefined);

  const handleAdvancedSearch = useCallback(() => setIsSearchOpen(true), []);
  const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);
  const handleSelect = useCallback((data: IcdDetailDto) => {
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
      <DiagnosisDetails selectedData={selectedData} />
      <DiagnosisSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default React.memo(DiagnosisListPage);
