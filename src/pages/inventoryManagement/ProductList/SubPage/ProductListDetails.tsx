import React, { useState, useCallback, useEffect } from "react";
import { Paper, Typography, Grid } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../context/LoadingContext";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { ProductListDto } from "../../../../interfaces/InventoryManagement/ProductListDto";
import { ProductListService } from "../../../../services/InventoryManagementService/ProductListService/ProductListService";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";

const ProductListDetails: React.FC<{ editData?: ProductListDto }> = ({ editData }) => {
    const [formState, setFormState] = useState<ProductListDto>({
        productID: 0,
        catValue: "",
        prescription: "",
        expiry: "",
        sellable: "",
        taxable: "",
        pLocationID: 0,
        chargableYN: "",
        supplierStatus: "",
        vedCode: "",
        abcCode: "",
        rActiveYN: "Y",
        compID: 0,
        compCode: "",
        compName: "",
        transferYN: "Y",
        isAssetYN: "",
    });


    const { handleDropdownChange } = useDropdownChange<ProductListDto>(setFormState);
    const { categoryValues } = useDropdownValues();

    const [isSubmitted, setIsSubmitted] = useState(false);
    const { setLoading } = useLoading();
    const { compID } = store.getState().userDetails;

    useEffect(() => {
        if (editData) {
            setFormState(editData);
        } else {
            handleClear();
        }
    }, [editData]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormState((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleSave = async () => {
        setIsSubmitted(true);

        if (!formState.productCode?.trim()) {
            showAlert("Error", "Product Code is mandatory.", "error");
            return;
        }
        setLoading(true);
        try {
            const result = await ProductListService.saveProductList(formState);

            if (result.success) {
                showAlert("Success", "Product saved successfully!", "success", {
                    onConfirm: handleClear,
                });
            } else {
                showAlert("Error", result.errorMessage || "Failed to save Product.", "error");
            }
        } catch (error) {
            console.error("Error saving Product:", error);
            showAlert("Error", "An unexpected error occurred while saving. Please check the console for more details.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = useCallback(() => {
        setFormState({
            productID: 0,
            catValue: "",
            prescription: "",
            expiry: "",
            sellable: "",
            taxable: "",
            pLocationID: 0,
            chargableYN: "",
            supplierStatus: "",
            vedCode: "",
            abcCode: "",
            rActiveYN: "Y",
            compID: 0,
            compCode: "",
            compName: "",
            transferYN: "Y",
            isAssetYN: "",
        });
        setIsSubmitted(false);
    }, [compID]);

    const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
            ...prev,
            rActiveYN: event.target.checked ? "Y" : "N",
        }));
    }, []);

    return (
        <Paper variant="elevation" sx={{ padding: 2 }}>
            <Typography variant="h6" id="product-list-header">
                Product Details
            </Typography>
            <Grid container spacing={2}>

                <FormField
                    type="select"
                    label="Category Value"
                    value={formState.catValue}
                    onChange={handleDropdownChange(
                        [""],
                        ["catValue"],
                        categoryValues
                    )}
                    options={categoryValues}
                    isSubmitted={isSubmitted}
                    name="catValue"
                    ControlID="catValue"
                    placeholder="Category Value"
                    maxLength={50}
                    isMandatory
                />

                <FormField
                    type="text"
                    label="Product Code"
                    value={formState.productCode || ""}
                    onChange={handleInputChange}
                    isSubmitted={isSubmitted}
                    name="productCode"
                    ControlID="productCode"
                    placeholder="Product Code"
                    maxLength={25}
                    isMandatory
                />
                <FormField
                    type="text"
                    label="Product Name"
                    value={formState.productName || ""}
                    onChange={handleInputChange}
                    isSubmitted={isSubmitted}
                    name="productName"
                    ControlID="productName"
                    placeholder="Product Name"
                    maxLength={50}
                />

                <FormField
                    type="text"
                    label="Prescription"
                    value={formState.prescription}
                    onChange={handleInputChange}
                    isSubmitted={isSubmitted}
                    name="prescription"
                    ControlID="prescription"
                    placeholder="Prescription"
                    maxLength={1}
                    isMandatory
                />
                <FormField
                    type="text"
                    label="Expiry"
                    value={formState.expiry}
                    onChange={handleInputChange}
                    isSubmitted={isSubmitted}
                    name="expiry"
                    ControlID="expiry"
                    placeholder="Expiry"
                    maxLength={1}
                    isMandatory
                />
                <FormField
                    type="text"
                    label="Sellable"
                    value={formState.sellable}
                    onChange={handleInputChange}
                    isSubmitted={isSubmitted}
                    name="sellable"
                    ControlID="sellable"
                    placeholder="Sellable"
                    maxLength={1}
                    isMandatory
                />
                <FormField
                    type="text"
                    label="Taxable"
                    value={formState.taxable}
                    onChange={handleInputChange}
                    isSubmitted={isSubmitted}
                    name="taxable"
                    ControlID="taxable"
                    placeholder="Taxable"
                    maxLength={1}
                    isMandatory
                />
                <FormField
                    type="number"
                    label="Location ID"
                    value={formState.pLocationID.toString()}
                    onChange={handleInputChange}
                    isSubmitted={isSubmitted}
                    name="pLocationID"
                    ControlID="pLocationID"
                    placeholder="Location ID"
                    isMandatory
                />

            </Grid>
            <Grid container spacing={2}>
                <FormField
                    type="textarea"
                    label="Notes"
                    value={formState.rNotes || ""}
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
                    label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
                    value={formState.rActiveYN}
                    checked={formState.rActiveYN === "Y"}
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

export default ProductListDetails;
