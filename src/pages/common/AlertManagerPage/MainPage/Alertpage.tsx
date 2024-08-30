import { Container } from "@mui/system";
import AlertDetails from "../SubPage/AlertDetails";
import { Box } from "@mui/material";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import { useState } from "react";
import { AlertDto } from "../../../../interfaces/Common/AlertManager";
import SearchIcon from "@mui/icons-material/Search";

const AlertPage: React.FC = () => {

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<AlertDto | undefined>(undefined);
    const handleAdvancedSearch = () => {
        setIsSearchOpen(true);
    };

    const handleCloseSearch = () => {
        setIsSearchOpen(false);
    };

    const handleSelect = (data: AlertDto) => {
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
            <AlertDetails editData={selectedData} />

        </Container>
    );
}

export default AlertPage;