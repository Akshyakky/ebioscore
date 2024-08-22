import { Paper, Typography, Grid } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { useState, useMemo, useCallback } from "react";
import TextArea from "../../../../components/TextArea/TextArea";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { PatientInvoiceCodeService } from "../../../../services/BillingServices/PatientInvoiceService";
import { BPatTypeDto } from "../../../../interfaces/Billing/BPatTypeDto";
import { useLoading } from "../../../../context/LoadingContext";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import { useServerDate } from "../../../../hooks/Common/useServerDate";

const PatientInvoiceCodeDetails: React.FC = () => {
    const [formState, setFormState] = useState({
        isSubmitted: false,
        pTypeCode: "",
        pTypeName: "",
        rNotes: "",
        rActiveYN: "Y"
    });

    const { setLoading } = useLoading();
    const serverDate = useServerDate();

    const { compID, compCode, compName, userID, userName } = useMemo(() => ({
        compID: store.getState().userDetails.compID || 0,
        compCode: store.getState().userDetails.compCode || "",
        compName: store.getState().userDetails.compName || "",
        userID: store.getState().userDetails.userID || 0,
        userName: store.getState().userDetails.userName || ""
    }), []);

    const createBPatTypeDto = useCallback((): BPatTypeDto => ({
        pTypeID: 0,
        pTypeCode: formState.pTypeCode,
        pTypeName: formState.pTypeName,
        rNotes: formState.rNotes,
        rActiveYN: formState.rActiveYN,
        compID,
        compCode,
        compName,
        isInsuranceYN: "N",
        transferYN: "N",
        rCreatedID: userID,
        rCreatedOn: serverDate || new Date(),
        rCreatedBy: userName,
        rModifiedID: userID,
        rModifiedOn: serverDate || new Date(),
        rModifiedBy: userName,
    }), [formState, compID, compCode, compName, userID, userName, serverDate]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = async () => {
        setFormState(prev => ({ ...prev, isSubmitted: true }));
        setLoading(true);

        try {
            const bPatTypeDto = createBPatTypeDto();
            const result = await PatientInvoiceCodeService.saveBPatType(bPatTypeDto);
            if (result.success) {
                showAlert("Success", "Patient Invoice Code saved successfully!", "success", {
                    onConfirm: handleClear
                });
            } else {
                showAlert("Error", result.errorMessage || "Failed to save Patient Invoice Code.", "error");
            }
        } catch (error) {
            console.error("Error saving Patient Invoice Code:", error);
            showAlert("Error", "An unexpected error occurred while saving.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = useCallback(() => {
        setFormState({
            isSubmitted: false,
            pTypeCode: "",
            pTypeName: "",
            rNotes: "",
            rActiveYN: "Y"
        });
    }, []);

    const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, rActiveYN: event.target.checked ? "Y" : "N" }));
    }, []);

    return (
        <Paper variant="elevation" sx={{ padding: 2 }}>
            <Typography variant="h6" id="patient-invoice-code-header">
                Patient Invoice Code List
            </Typography>
            <section>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Patient Invoice Code"
                            placeholder="Patient Invoice Code"
                            value={formState.pTypeCode}
                            onChange={handleInputChange}
                            isMandatory
                            size="small"
                            isSubmitted={formState.isSubmitted}
                            name="pTypeCode"
                            ControlID="PICCode"
                            aria-label="Patient Invoice Code"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Patient Invoice Name"
                            placeholder="Patient Invoice Name"
                            value={formState.pTypeName}
                            onChange={handleInputChange}
                            isMandatory
                            size="small"
                            isSubmitted={formState.isSubmitted}
                            name="pTypeName"
                            ControlID="PatientInvoiceName"
                            aria-label="Patient Invoice Name"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextArea
                            label="Remarks"
                            name="rNotes"
                            value={formState.rNotes}
                            placeholder="Remarks"
                            onChange={handleInputChange}
                            rows={2}
                            aria-label="Remarks"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <CustomSwitch
                            label={formState.rActiveYN === 'Y' ? 'Active' : 'Hidden'}
                            checked={formState.rActiveYN === 'Y'}
                            onChange={handleActiveToggle}
                            aria-label="Active Status"
                        />
                    </Grid>
                </Grid>
                <FormSaveClearButton
                    clearText="Clear"
                    saveText="Save"
                    onClear={handleClear}
                    onSave={handleSave}
                    clearIcon={DeleteIcon}
                    saveIcon={SaveIcon}
                />
            </section>
        </Paper>
    );
}

export default PatientInvoiceCodeDetails;