import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import { ProductTaxListDto } from "../../../../interfaces/InventoryManagement/ProductTaxListDto";
import { store } from "../../../../store/store";
import { productTaxService } from "../../../../services/InventoryManagementService/inventoryManagementService";

interface ProductTaxListDetailsProps {
    selectedData?: ProductTaxListDto;
}

const ProductTaxListDetails: React.FC<ProductTaxListDetailsProps> = ({ selectedData }) => {
    const [formState, setFormState] = useState<ProductTaxListDto>({
        pTaxID: 0,
        pTaxCode: "",
        pTaxName: "",
        pTaxAmt: 0,
        pTaxDescription: "",
        rActiveYN: "Y",
        compID: 0,
        compCode: "",
        compName: "",
        transferYN: "N",
        rNotes: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { compID, compCode, compName } = store.getState().userDetails;
    const { setLoading } = useLoading();

    useEffect(() => {
        if (selectedData) {
            setFormState(selectedData);
        } else {
            handleClear();
        }
    }, [selectedData]);

    const handleClear = useCallback(async () => {
        setLoading(true);
        try {
            const nextCode = await productTaxService.getNextCode("TAX", "pTaxCode", 3);
            setFormState({
                pTaxID: 0,
                pTaxCode: nextCode.data,
                pTaxName: "",
                pTaxAmt: 0,
                pTaxDescription: "",
                rActiveYN: "Y",
                compID: compID || 0,
                compCode: compCode || "",
                compName: compName || "",
                transferYN: "N",
                rNotes: "",
            });
            setIsSubmitted(false);
        } catch (error) {
            showAlert("Error", "Failed to fetch the next Tax Code.", "error");
        } finally {
            setLoading(false);
        }
    }, [compID, compCode, compName]);

    useEffect(() => {
        if (!selectedData) {
            handleClear();
        }
    }, [handleClear, selectedData]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "pTaxAmt") {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue > 100) {
                return;
            }
        }
        setFormState(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = async () => {
        setIsSubmitted(true);
        if (!formState.pTaxCode.trim() || !formState.pTaxName) {
            showAlert("Error", "Product Tax Code and Name are mandatory.", "error");
            return;
        }

        setLoading(true);

        try {
            await productTaxService.save(formState);
            showAlert("Success", "Product Tax List saved successfully!", "success", {
                onConfirm: handleClear
            });
        } catch (error) {
            showAlert("Error", "An unexpected error occurred while saving.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleActiveToggle = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({
                ...prev,
                rActiveYN: event.target.checked ? "Y" : "N",
            }));
        },
        []
    );

    return (
        <Paper variant="elevation" sx={{ padding: 2 }}>
            <Typography variant="h6" id="product-tax-details-header">
                PRODUCT TAX DETAILS
            </Typography>
            <Grid container spacing={2}>
                <FormField
                    type="text"
                    label="Tax Code"
                    value={formState.pTaxCode}
                    onChange={handleInputChange}
                    name="pTaxCode"
                    ControlID="pTaxCode"
                    placeholder="Enter tax code"
                    isMandatory={true}
                    size="small"
                    isSubmitted={isSubmitted}
                />
                <FormField
                    type="text"
                    label="Tax Name"
                    value={formState.pTaxName}
                    onChange={handleInputChange}
                    name="pTaxName"
                    ControlID="pTaxName"
                    placeholder="Enter tax name"
                    isMandatory
                    size="small"
                    isSubmitted={isSubmitted}
                />
                <FormField
                    type="number"
                    label="Tax Amount"
                    value={formState.pTaxAmt?.toString()}
                    onChange={handleInputChange}
                    name="pTaxAmt"
                    ControlID="pTaxAmt"
                    placeholder="Enter tax amount"
                    isMandatory
                    size="small"
                />
                <FormField
                    type="text"
                    label="Tax Description"
                    value={formState.pTaxDescription}
                    onChange={handleInputChange}
                    name="pTaxDescription"
                    ControlID="pTaxDescription"
                    placeholder="Enter tax description"
                    size="small"
                />
                <FormField
                    type="textarea"
                    label="Notes"
                    value={formState.rNotes}
                    onChange={handleInputChange}
                    name="rNotes"
                    ControlID="rNotes"
                    placeholder="Notes"
                    maxLength={4000}
                />
            </Grid>

            <Grid container spacing={2}>
                <FormField
                    type="switch"
                    label={formState.rActiveYN === 'Y' ? 'Active' : 'Hidden'}
                    value={formState.rActiveYN}
                    checked={formState.rActiveYN === 'Y'}
                    onChange={handleActiveToggle}
                    name="rActiveYN"
                    ControlID="rActiveYN"
                    size="medium"
                />
            </Grid>

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

export default ProductTaxListDetails;