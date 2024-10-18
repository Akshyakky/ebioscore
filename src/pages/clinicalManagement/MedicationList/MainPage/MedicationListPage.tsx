// src/pages/inventoryManagement/MedicationListPage/MainPage/MedicationListPage.tsx
import React, { useState } from 'react';
import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import MedicationListDetails from '../SubPage/MedicationDetails';
import MedicationListSearch from '../SubPage/MedicationListSearch';
import { MedicationListDto } from '../../../../interfaces/ClinicalManagement/MedicationListDto';

const MedicationListPage: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<MedicationListDto | undefined>(undefined);

    const handleAdvancedSearch = () => {
        setIsSearchOpen(true);
    };

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
    };

    const handleSelect = (data: MedicationListDto) => {
        setSelectedData(data);
    };

    const actionButtons: ButtonProps[] = [
        {
            variant: "contained",
            icon: Search,
            text: "Advanced Search",
            onClick: handleAdvancedSearch,
        },
    ];

    return (
        <Container maxWidth={false}>
            <Box sx={{ marginBottom: 2 }}>
                <ActionButtonGroup buttons={actionButtons} groupVariant="contained" groupSize="medium" orientation="horizontal" color="primary" />
            </Box>
            <MedicationListDetails selectedData={selectedData} />
            <MedicationListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
        </Container>
    );
};

export default MedicationListPage;