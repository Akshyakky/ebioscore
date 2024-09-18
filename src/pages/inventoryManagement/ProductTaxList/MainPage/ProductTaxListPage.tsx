import { Box, Container } from "@mui/material"
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup"
import Search from "@mui/icons-material/Search";
import { useState } from "react";
import { ProductTaxListDto } from "../../../../interfaces/InventoryManagement/ProductTaxListDto";
import ProductTaxListDetails from "../SubPage/ProductTaxDetails";
import ProductTaxListSearch from "../SubPage/ProductTaxListSearch";

const ProductTaxListPage: React.FC = () => {

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<ProductTaxListDto | undefined>(undefined);

    const handleAdvancedSearch = () => {
        setIsSearchOpen(true);
    };
    const handleCloseSearch = () => {
        setIsSearchOpen(false);
    };

    const handleSelect = (data: ProductTaxListDto) => {
        setSelectedData(data);
    };

    const actionButtons: ButtonProps[] = [
        {
            variant: "contained",
            icon: Search,
            text: "Advanced Search",
            onClick: handleAdvancedSearch,
        }
    ];


    return (
        <Container maxWidth={false}>
            <Box sx={{ marginBottom: 2 }}>
                <ActionButtonGroup buttons={actionButtons} groupVariant="contained" groupSize="medium" orientation="horizontal" color="primary" />
            </Box>
            <ProductTaxListDetails editData={selectedData} />
            <ProductTaxListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />

        </Container>

    )
}

export default ProductTaxListPage