import { Box, Container } from "@mui/material";
import DeptUnitListDetails from "../SubPage/DeptUnitListDetails";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { DeptUnitListDto } from "../../../../interfaces/HospitalAdministration/DeptunitListDto";
import DeptUnitListSearch from "../SubPage/DeptunitListSearch";

const DeptUnitListPage: React.FC = () => {

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<DeptUnitListDto | undefined>(undefined);


    const handleAdvancedSearch = () => {
        setIsSearchOpen(true);
    };

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
    };

    const handleSelect = (data: DeptUnitListDto) => {
        setSelectedData(data);
    };

    return (
        <>
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


                <DeptUnitListDetails editData={selectedData} />
                <DeptUnitListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />


            </Container >
        </>
    );
};

export default DeptUnitListPage;
