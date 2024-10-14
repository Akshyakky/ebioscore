import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import { IcdDetailDto } from "../../../../interfaces/ClinicalManagement/IcdDetailDto";
import { store } from "../../../../store/store";
import { createEntityService } from "../../../../utils/Common/serviceFactory";

interface DiagnosisDetailsProps {
    selectedData?: IcdDetailDto;
}

const DiagnosisDetails: React.FC<DiagnosisDetailsProps> = ({ selectedData }) => {
    const { compID, compCode, compName } = store.getState().userDetails;
    const [formState, setFormState] = useState<IcdDetailDto>(() => ({
        icddId: 0,
        icdmId: 0,
        icddCode: "",
        icddName: "",
        icddCustYN: "N",
        icddVer: "",
        icddNameGreek: "",
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        rNotes: "",
        transferYN: "N"
    }));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { setLoading } = useLoading();

    const icdDetailService = useMemo(() => createEntityService<IcdDetailDto>('IcdDetail', 'clinicalManagementURL'), []);

    const handleClear = useCallback(async () => {
        setLoading(true);
        try {
            const nextCode = await icdDetailService.getNextCode("ICD", 4);
            setFormState({
                icddId: 0,
                icdmId: 0,
                icddCode: nextCode.data,
                icddName: "",
                icddCustYN: "N",
                icddVer: "",
                icddNameGreek: "",
                rActiveYN: "Y",
                compID: compID || 0,
                compCode: compCode || "",
                compName: compName || "",
                rNotes: "",
                transferYN: "N"
            });
            setIsSubmitted(false);
            setIsEditing(false);
        } catch (error) {
            showAlert("Error", "Failed to fetch the next ICD Code.", "error");
        } finally {
            setLoading(false);
        }
    }, [compID, compCode, compName, icdDetailService]);

    useEffect(() => {
        if (selectedData) {
            setFormState(selectedData);
            setIsEditing(true);
        } else {
            handleClear();
        }
    }, [selectedData, handleClear]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        setIsSubmitted(true);
        if (!formState.icddCode.trim() || !formState.icddName) {
            showAlert("Error", "ICD Code and Name are mandatory.", "error");
            return;
        }

        setLoading(true);

        try {
            await icdDetailService.save(formState);
            showAlert("Success", `ICD Detail ${isEditing ? 'updated' : 'saved'} successfully!`, "success", {
                onConfirm: handleClear
            });
        } catch (error) {
            showAlert("Error", `An unexpected error occurred while ${isEditing ? 'updating' : 'saving'}.`, "error");
        } finally {
            setLoading(false);
        }
    }, [formState, handleClear, icdDetailService, isEditing]);

    const handleActiveToggle = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({
                ...prev,
                rActiveYN: event.target.checked ? "Y" : "N",
            }));
        },
        []
    );

    const handleCustomToggle = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({
                ...prev,
                icddCustYN: event.target.checked ? "Y" : "N",
            }));
        },
        []
    );

    return (
        <Paper variant="elevation" sx={{ padding: 2 }}>
            <Typography variant="h6" id="icd-details-header">
                DIAGNOSIS DETAILS
            </Typography>
            <Grid container spacing={2}>
                <FormField
                    type="text"
                    label="ICD Code"
                    value={formState.icddCode}
                    onChange={handleInputChange}
                    name="icddCode"
                    ControlID="icddCode"
                    placeholder="Enter ICD code"
                    isMandatory={true}
                    size="small"
                    isSubmitted={isSubmitted}
                />
                <FormField
                    type="text"
                    label="ICD Name"
                    value={formState.icddName}
                    onChange={handleInputChange}
                    name="icddName"
                    ControlID="icddName"
                    placeholder="Enter ICD name"
                    isMandatory
                    size="small"
                    isSubmitted={isSubmitted}
                />
                <FormField
                    type="text"
                    label="Version"
                    value={formState.icddVer || ""}
                    onChange={handleInputChange}
                    name="icddVer"
                    ControlID="icddVer"
                    placeholder="Enter version"
                    size="small"
                />
                <FormField
                    type="text"
                    label="Greek Name"
                    value={formState.icddNameGreek || ""}
                    onChange={handleInputChange}
                    name="icddNameGreek"
                    ControlID="icddNameGreek"
                    placeholder="Enter Greek name"
                    size="small"
                />
                <FormField
                    type="switch"
                    label="Custom"
                    value={formState.icddCustYN}
                    checked={formState.icddCustYN === 'Y'}
                    onChange={handleCustomToggle}
                    name="icddCustYN"
                    ControlID="icddCustYN"
                    size="medium"
                />
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
                saveText={isEditing ? "Update" : "Save"}
                onClear={handleClear}
                onSave={handleSave}
                clearIcon={DeleteIcon}
                saveIcon={SaveIcon}
            />
        </Paper>
    );
};

export default React.memo(DiagnosisDetails);