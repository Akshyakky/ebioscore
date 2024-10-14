import React, { useCallback, useState, useMemo } from "react";
import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import DiagnosisDetails from "../SubPage/DiagnosisDetails";
import DiagnosisSearch from "../SubPage/DiagnosisSearch";
import { IcdDetailDto } from '../../../../interfaces/ClinicalManagement/IcdDetailDto';

const DiagnosisListPage: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<IcdDetailDto | undefined>(undefined);

    const handleAdvancedSearch = useCallback(() => setIsSearchOpen(true), []);
    const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);
    const handleSelect = useCallback((data: IcdDetailDto) => {
        setSelectedData(data);
        setIsSearchOpen(false);
    }, []);

    const actionButtons: ButtonProps[] = useMemo(() => [
        {
            variant: "contained",
            icon: Search,
            text: "Advanced Search",
            onClick: handleAdvancedSearch,
        },
    ], [handleAdvancedSearch]);

    return (
        <Container maxWidth={false}>
            <Box sx={{ marginBottom: 2 }}>
                <ActionButtonGroup
                    buttons={actionButtons}
                    groupVariant="contained"
                    groupSize="medium"
                    orientation="horizontal"
                    color="primary"
                />
            </Box>
            <DiagnosisDetails selectedData={selectedData} />
            <DiagnosisSearch
                open={isSearchOpen}
                onClose={handleCloseSearch}
                onSelect={handleSelect}
            />
        </Container>
    );
};

export default React.memo(DiagnosisListPage);