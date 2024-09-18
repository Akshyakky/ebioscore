import { Box, Container } from "@mui/material"
import Search from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup"
import ProductListDetails from "../SubPage/ProductListDetails"
import { useState } from "react";
import { ProductListDto } from "../../../../interfaces/InventoryManagement/ProductListDto";

const ProductListPage: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<ProductListDto | undefined>(undefined);

    const handleAdvancedSearch = () => {
        setIsSearchOpen(true);
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
            <ProductListDetails />


        </Container>
    )
}
export default ProductListPage