import { useLoading } from "@/context/LoadingContext";
import useDropdownChange from "@/hooks/useDropdownChange";
import { MedicationFrequencyDto } from "@/interfaces/ClinicalManagement/MedicationFrequencyDto";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import { useAppSelector } from "@/store/hooks";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { Grid, Paper, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import { showAlert } from "@/utils/Common/showAlert";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

interface MedicationFrequencyDetailsProps {
    selectedData?: MedicationFrequencyDto;
    editData?: MedicationFrequencyDto;
}

const MedicationFrequencyDetails: React.FC<MedicationFrequencyDetailsProps> = ({ selectedData, editData }) => {
    const { compID, compCode, compName } = useAppSelector((state) => state.auth);
    const [formState, setFormState] = useState<MedicationFrequencyDto>({
        mFrqId: 0,
        mFrqCode: "",
        mFrqName: "",
        modifyYN: "N",
        defaultYN: "N",
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        transferYN: "Y",
        rNotes: "",
        mFrqSnomedCode: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { setLoading } = useLoading();
    const { handleDropdownChange } = useDropdownChange(setFormState);

    const medicationFrequencyService = useMemo(() => createEntityService<MedicationFrequencyDto>("MedicationFrequency", "clinicalManagementURL"), []);
    //const dropdownValues = useDropdownValues(["medicationFrequency"]);

    useEffect(() => {
        if (editData) {
            setFormState({
                ...formState,
                ...editData,
            });
        } else if (selectedData) {
            setFormState({
                ...formState,
                ...selectedData,
                mFrqId: selectedData.mFrqId || 0,
            });
        } else {
            handleClear();
        }
    }, [editData, selectedData]);

    const handleClear = useCallback(async () => {
        setLoading(true);
        try {
            const nextCode = await medicationFrequencyService.getNextCode("MFRQ", 5);
            setFormState({
                mFrqId: 0,
                mFrqCode: nextCode.data || "",
                mFrqName: "",
                modifyYN: "N",
                defaultYN: "N",
                rActiveYN: "Y",
                compID: compID ?? 0,
                compCode: compCode ?? "",
                compName: compName ?? "",
                transferYN: "Y",
                rNotes: "",
                mFrqSnomedCode: "",
            });
            setIsSubmitted(false);
        } catch (error) {
            showAlert("Error", "Failed to fetch the Medication Frequency Code.", "error");
        } finally {
            setLoading(false);
        }
    }, [compID, compCode, compName, medicationFrequencyService]);

    const handleInputChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            if (name === "defaultYN" && value === "Y") {
                try {
                    const existingDefault = await medicationFrequencyService.find("defaultYN='Y'");

                    if (existingDefault.data.length > 0) {
                        const confirmed = await new Promise<boolean>((resolve) => {
                            showAlert(
                                "Confirmation",
                                `There are other entries set as default. Setting '${formState.mGenName}' as the new default will remove default status from other entries. Continue?`,
                                "warning",
                                {
                                    showConfirmButton: true,
                                    showCancelButton: true,
                                    confirmButtonText: "Yes",
                                    cancelButtonText: "No",
                                    onConfirm: () => resolve(true),
                                    onCancel: () => resolve(false),
                                }
                            );
                        });

                        if (!confirmed) {
                            return;
                        }
                        const updatedRecords = existingDefault.data.map((record: MedicationFrequencyDto) => ({
                            ...record,
                            defaultYN: "N",
                        }));

                        await Promise.all(updatedRecords.map((record: MedicationFrequencyDto) => medicationFrequencyService.save(record)));
                    }
                    setFormState((prev) => ({
                        ...prev,
                        [name]: value,
                    }));
                } catch (error) {
                    showAlert("Error", "Failed to update default status.", "error");
                }
            } else {
                setFormState((prev) => ({
                    ...prev,
                    [name]: value,
                }));
            }
        },
        [formState.mGenName, medicationFrequencyService]
    );

    const handleSave = useCallback(async () => {
        debugger
        setIsSubmitted(true);

        if (!formState.mFrqCode || !formState.mFrqCode.trim() || !formState.mFrqName || !formState.mFrqSnomedCode) {
            showAlert("Error", "Medication Frequency code and Name are mandatory.", "error");
        }

        setLoading(true);

        try {

            await medicationFrequencyService.save({ ...formState });
            showAlert("Success", "Medication Frequency saved successfully!", "success", {
                onConfirm: handleClear,
            });
        } catch (error) {
            showAlert("Error", "An unexpected error occurred while saving.", "error");
        } finally {
            setLoading(false);
        }
    }, [formState, medicationFrequencyService, setLoading, handleClear]);


    return (
        <Paper variant="elevation" sx={{ padding: 2 }}>
            <Typography variant="h6" id="medication-form-details-header">
                MEDICATION FREQUENCY DETAILS
            </Typography>
            <Grid container spacing={2}>
                <FormField
                    type="text"
                    label="Medication Frequency Code"
                    value={formState.mFrqCode ?? ""}
                    onChange={handleInputChange}
                    name="mFrqCode"
                    ControlID="mFrqCode"
                    placeholder="Enter medication frequency code"
                    isMandatory={true}
                    size="small"
                    isSubmitted={isSubmitted}
                />
                <FormField
                    type="text"
                    label="Medication Frequency Snomed Code"
                    value={formState.mFrqSnomedCode ?? ""}
                    onChange={handleInputChange}
                    name="mFrqSnomedCode"
                    ControlID="mFrqSnomedCode"
                    placeholder="Enter medication frequency snomed code"
                    isMandatory
                    size="small"
                    isSubmitted={isSubmitted}
                />
                <FormField
                    type="text"
                    label="Medication Frequency Name"
                    value={formState.mFrqName || ""}
                    onChange={handleInputChange}
                    name="mFrqName"
                    ControlID="mFrqName"
                    placeholder="Enter medication Frequency name"
                    isMandatory
                    size="small"
                    isSubmitted={isSubmitted}
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
                    type="radio"
                    label="Default"
                    value={formState.defaultYN}
                    onChange={handleInputChange}
                    name="defaultYN"
                    ControlID="defaultYN"
                    options={[
                        { label: "Yes", value: "Y" },
                        { label: "No", value: "N" },
                    ]}
                    size="small"
                    inline
                />
                <FormField
                    type="radio"
                    label="Modify"
                    value={formState.modifyYN}
                    onChange={handleInputChange}
                    name="modifyYN"
                    ControlID="modifyYN"
                    options={[
                        { label: "Yes", value: "Y" },
                        { label: "No", value: "N" },
                    ]}
                    size="small"
                    inline
                />
                <Grid item xs={12} md={3}>
                    <FormField
                        type="switch"
                        label={formState.rActiveYN === "Y" ? "Active" : "Inactive"}
                        value={formState.rActiveYN}
                        checked={formState.rActiveYN === "Y"}
                        onChange={(event) =>
                            setFormState((prev) => ({
                                ...prev,
                                rActiveYN: event.target.checked ? "Y" : "N",
                            }))
                        }
                        name="rActiveYN"
                        ControlID="rActiveYN"
                        size="medium"
                    />
                </Grid>
            </Grid>
            <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
        </Paper >
    );
};
export default MedicationFrequencyDetails;
