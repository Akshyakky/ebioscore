import { Grid, Paper, Typography } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { useState } from "react";
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
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [pTypeCode, setPTypeCode] = useState("");
    const [pTypeName, setPTypeName] = useState("");
    const [rNotes, setRNotes] = useState("");
    const [rActiveYN, setRActiveYN] = useState("Y");
    const { setLoading } = useLoading();
    const serverDate = useServerDate();

    const compID = store.getState().userDetails.compID || 0;
    const compCode = store.getState().userDetails.compCode || "";
    const compName = store.getState().userDetails.compName || "";
    const userID = store.getState().userDetails.userID || 0;
    const userName = store.getState().userDetails.userName || "";

    const handleSave = async () => {
        setIsSubmitted(true);
        setLoading(true);

        const bPatTypeDto: BPatTypeDto = {
            pTypeID: 0,
            pTypeCode: pTypeCode,
            pTypeName: pTypeName,
            rNotes: rNotes,
            rActiveYN: "Y",
            compID: compID,
            compCode: compCode,
            compName: compName,
            isInsuranceYN: "N",
            transferYN: "N",
            rCreatedID: userID,
            rCreatedOn: serverDate || new Date(),
            rCreatedBy: userName,
            rModifiedID: userID,
            rModifiedOn: serverDate || new Date(),
            rModifiedBy: userName,
        };

        try {
            debugger
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
    }

    const handleClear = () => {
        setPTypeCode("");
        setPTypeName("");
        setRNotes("");
        setRActiveYN("Y");
        setIsSubmitted(false);
    }

    const handleActiveToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRActiveYN(event.target.checked ? "Y" : "N");
    };

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
                            value={pTypeCode}
                            onChange={(e) => setPTypeCode(e.target.value)}
                            isMandatory
                            size="small"
                            isSubmitted={isSubmitted}
                            name="pTypeCode"
                            ControlID="PICCode"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Patient Invoice Name"
                            placeholder="Patient Invoice Name"
                            value={pTypeName}
                            onChange={(e) => setPTypeName(e.target.value)}
                            isMandatory
                            size="small"
                            isSubmitted={isSubmitted}
                            name="pTypeName"
                            ControlID="PatientInvoiceName"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextArea
                            label="Remarks"
                            name="rNotes"
                            value={rNotes}
                            placeholder="Remarks"
                            onChange={(e) => setRNotes(e.target.value)}
                            rows={2}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <CustomSwitch
                            label={rActiveYN === 'Y' ? 'Active' : 'Hidden'}
                            checked={rActiveYN === 'Y'}
                            onChange={handleActiveToggle}
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
