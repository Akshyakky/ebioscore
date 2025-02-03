import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import { OTProcedureListDto } from "@/interfaces/ClinicalManagement/ProcedureListDto";
import { Search } from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import ProcedureListDetails from "../SubPage/ProcedureListDetails";
import ProcedureListSearch from "../SubPage/ProcedureListSearch";

const ProcedureListPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<OTProcedureListDto | undefined>(undefined);

  const handleAdvancedSearch = useCallback(() => setIsSearchOpen(true), []);
  const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);
  const handleSelect = useCallback((data: OTProcedureListDto) => {
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
      <ProcedureListDetails selectedData={selectedData} />
      <ProcedureListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};
export default React.memo(ProcedureListPage);
