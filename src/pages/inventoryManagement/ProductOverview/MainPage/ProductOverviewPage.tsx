import { useCallback, useState } from "react";
import { ProductOverviewDto } from "../../../../interfaces/InventoryManagement/ProductOverviewDto";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import { Box, Container } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ProductOverviewDetail from "../SubPage/ProductOverviewDetails";

const ProductOverviewPage: React.FC = () => {

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<ProductOverviewDto | undefined>(undefined);

    const handleAdvancedSearch = useCallback(() => {
        setIsSearchOpen(true);
    }, []);



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
                {/* <ActionButtonGroup buttons={actionButtons} groupVariant="contained" groupSize="medium" orientation="horizontal" color="primary" /> */}
            </Box>
            <ProductOverviewDetail selectedData={selectedData} />
            {/* <ProductTaxListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} /> */}

        </Container>

    )
}
export default ProductOverviewPage
