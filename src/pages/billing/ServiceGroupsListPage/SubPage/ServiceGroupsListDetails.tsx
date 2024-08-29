import { Grid, Paper, Typography } from "@mui/material";
import { BServiceGrpDto } from "../../../../interfaces/Billing/BServiceGrpDto";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { useCallback, useEffect, useState } from "react";
import { useLoading } from "../../../../context/LoadingContext";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import { ServiceGroupListCodeService } from "../../../../services/BillingServices/ServiceGroupsListService";
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import TextArea from "../../../../components/TextArea/TextArea";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";

const SeviceGroupsListDetails: React.FC<{ editData?: BServiceGrpDto }> = ({ editData }) => {
    const [formState, setFormState] = useState({
        isSubmitted: false,
        sGrpCode: "",
        sGrpName: "",
        rNotes: "",
        rActiveYN: "Y",
        labServiceYN: "Y",
        isTherapyYN: "Y"
    });

    const { setLoading } = useLoading();
    const serverDate = useServerDate();

    const { userID, userName } = store.getState().userDetails;

    useEffect(() => {
        if (editData) {
            setFormState({
                isSubmitted: false,
                sGrpCode: editData.sGrpCode || "",
                sGrpName: editData.sGrpName || "",
                rNotes: editData.rNotes || "",
                rActiveYN: editData.rActiveYN || "Y",
                labServiceYN: editData.labServiceYN || "Y",
                isTherapyYN: editData.isTherapyYN || "Y"
            });
        } else {
            handleClear();
        }
    }, [editData]);

    const CreateBServiceGrpDto = useCallback((): BServiceGrpDto => ({
        sGrpID: editData ? editData.sGrpID : 0,
        sGrpCode: formState.sGrpCode,
        sGrpName: formState.sGrpName,
        modifyYN: "N",
        defaultYN: "N",
        rActiveYN: formState.rActiveYN,
        rCreatedID: userID || 0,
        rCreatedOn: serverDate || new Date(),
        rCreatedBy: userName || "",
        rModifiedID: userID || 0,
        rModifiedOn: serverDate || new Date(),
        rModifiedBy: userName || "",
        rNotes: formState.rNotes,
        prnSGrpOrder: 1,
        labServiceYN: formState.labServiceYN,
        isTherapyYN: formState.isTherapyYN
    }), [formState, editData, userID, userName, serverDate]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = async () => {
        setFormState(prev => ({ ...prev, isSubmitted: true }));
        setLoading(true);

        try {
            const bPatTypeDto = CreateBServiceGrpDto();
            const result = await ServiceGroupListCodeService.saveBServiceGrp(bPatTypeDto);
            if (result.success) {
                showAlert("Success", "Service Group Code saved successfully!", "success", {
                    onConfirm: handleClear
                });
            } else {
                showAlert("Error", result.errorMessage || "Failed to save Service Group Code.", "error");
            }
        } catch (error) {
            console.error("Error saving Service Group Code:", error);
            showAlert("Error", "An unexpected error occurred while saving.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = useCallback(() => {
        setFormState({
            isSubmitted: false,
            sGrpCode: "",
            sGrpName: "",
            rNotes: "",
            rActiveYN: "Y",
            labServiceYN: "Y",
            isTherapyYN: "Y"
        });
    }, []);

    const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, rActiveYN: event.target.checked ? "Y" : "N" }));
    }, []);

    const handleLabServiceToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, labServiceYN: event.target.checked ? "Y" : "N" }));
    }, []);

    const handleTherapyYNToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, isTherapyYN: event.target.checked ? "Y" : "N" }));
    }, []);

    return (
        <Paper variant="elevation" sx={{ padding: 2 }}>
            <Typography variant="h6" id="patient-invoice-code-header">
                Service Groups List
            </Typography>
            <section>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Service Group Code"
                            placeholder="Service Group Code"
                            value={formState.sGrpCode}
                            onChange={handleInputChange}
                            isMandatory
                            size="small"
                            isSubmitted={formState.isSubmitted}
                            name="sGrpCode"
                            ControlID="ServiceGroupCode"
                            aria-label="Service Group Code"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FloatingLabelTextBox
                            title="Service Group Name"
                            placeholder="Service Group Name"
                            value={formState.sGrpName}
                            onChange={handleInputChange}
                            isMandatory
                            size="small"
                            isSubmitted={formState.isSubmitted}
                            name="sGrpName"
                            ControlID="ServiceGroupName"
                            aria-label="Service Group Name"
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
                    <Grid item xs={12} sm={6} md={3}>
                        <CustomSwitch
                            label={formState.labServiceYN === 'Y' ? 'lab Service' : 'Hidden'}
                            checked={formState.labServiceYN === 'Y'}
                            onChange={handleLabServiceToggle}
                            aria-label="lab Service Status"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <CustomSwitch
                            label={formState.isTherapyYN === 'Y' ? 'Therapy' : 'Hidden'}
                            checked={formState.isTherapyYN === 'Y'}
                            onChange={handleTherapyYNToggle}
                            aria-label="Therapy Status"
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

export default SeviceGroupsListDetails;
