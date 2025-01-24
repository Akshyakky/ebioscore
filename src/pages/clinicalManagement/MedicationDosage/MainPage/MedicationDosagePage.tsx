import React, { useState } from "react";
import { Box, Container } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";


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
        </Container>
    );
};

export default MedicationDosagePage;
