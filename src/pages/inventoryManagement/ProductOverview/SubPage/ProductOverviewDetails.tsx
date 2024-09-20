import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { showAlert } from "../../../../utils/Common/showAlert";
import { ProductOverviewDto } from "../../../../interfaces/InventoryManagement/ProductOverviewDto";
import { ProductListService } from "../../../../services/InventoryManagementService/ProductListService/ProductListService";
import { ProductListDto } from "../../../../interfaces/InventoryManagement/ProductListDto";

interface ProductOverviewDetailProps {
    selectedData?: ProductOverviewDto;
}

const ProductOverviewDetail: React.FC<ProductOverviewDetailProps> = ({ selectedData }) => {
    const [formState, setFormState] = useState<ProductOverviewDto>({
        pvID: 0,
        productID: 0,
        productCode: "",
        fsbCode: "",
        rackNo: "",
        shelfNo: "",
        minLevelUnits: 0,
        maxLevelUnits: 0,
        dangerLevelUnits: 0,
        reOrderLevel: 0,
        avgDemand: 0,
        stockLevel: 0,
        supplierAllocation: "",
        poStatus: "",
        deptID: 0,
        department: "",
        defaultYN: "N",
        isAutoIndentYN: "N",
        productLocation: "",
        rActiveYN: "Y",
        compID: 0,
        compCode: "",
        compName: "",
        transferYN: "N",
        rNotes: "",
    });

    const [productOptions, setProductOptions] = useState<ProductListDto[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductListDto | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);


    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchProductList = async () => {
            setIsLoading(true);
            try {
                const response = await ProductListService.getAllProductList();
                if (response.success) {
                    setProductOptions(response.data || []);
                }
            } catch (error) {
                // showAlert("Failed to fetch product list", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductList();
    }, []);

    const fetchProductSuggestions = useCallback(
        async (inputValue: string): Promise<string[]> => {
            return productOptions
                .filter(
                    (product) =>
                        product.productCode?.toLowerCase().includes(inputValue.toLowerCase()) ||
                        product.productName?.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((product) => `${product.productCode} - ${product.productName}`);
        },
        [productOptions]
    );

    const handleProductSelect = useCallback((selectedProductString: string) => {
        const [selectedProductCode] = selectedProductString.split(' - ');
        const product = productOptions.find((p) => p.productCode === selectedProductCode);
        if (product) {
            setSelectedProduct(product);
            setFormState((prevState) => ({
                ...prevState,
                productID: product.productID,
                productCode: product.productCode,
                // Add other fields you want to update here
            }));
        }
    }, [productOptions]);

    const handleProductCodeChange = (e) => {
        setFormState((prevState) => ({
            ...prevState,
            productCode: e.target.value,
        }));
    };


    const handleClear = () => {
        setFormState({
            pvID: 0,
            productID: 0,
            productCode: "",
            fsbCode: "",
            rackNo: "",
            shelfNo: "",
            minLevelUnits: 0,
            maxLevelUnits: 0,
            dangerLevelUnits: 0,
            reOrderLevel: 0,
            avgDemand: 0,
            stockLevel: 0,
            supplierAllocation: "",
            poStatus: "",
            deptID: 0,
            department: "",
            defaultYN: "N",
            isAutoIndentYN: "N",
            productLocation: "",
            rActiveYN: "Y",
            compID: 0,
            compCode: "",
            compName: "",
            transferYN: "N",
            rNotes: "",
        });
        setSelectedProduct(null);
    };

    const handleSave = async () => {
        try {
            // Call your save API logic here
            // e.g., await saveProductOverview(formState);
            setIsSubmitted(true);
            // showAlert("Product overview saved successfully", "success");
        } catch (error) {
            // showAlert("Failed to save product overview", "error");
        }
    };

    return (
        <Paper variant="elevation" sx={{ padding: 2 }}>
            <Typography variant="h6" id="product-overview-details-header">
                PRODUCT OVERVIEW DETAILS
            </Typography>
            <FormField
                type="autocomplete"
                label="Product"
                name="productCode"
                ControlID="productCode"
                value={formState.productCode}
                onChange={handleProductCodeChange}
                fetchSuggestions={fetchProductSuggestions}
                onSelectSuggestion={handleProductSelect}
                isSubmitted={isSubmitted}
                isMandatory={true}
                placeholder="Search by product code or name..."
                maxLength={20}
            />
            {/* Add other form fields here */}
            <FormSaveClearButton
                clearText="Clear"
                saveText="Save"
                onClear={handleClear}
                onSave={handleSave}
                clearIcon={DeleteIcon}
                saveIcon={SaveIcon}
            />
        </Paper>
    );
};

export default ProductOverviewDetail;