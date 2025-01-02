import { useCallback, useEffect, useMemo, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import { MedicationFormDto } from "../../../../interfaces/ClinicalManagement/MedicationFormDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import useDropdownValues from "../../../../hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { useAppSelector } from "@/store/hooks";
import React from "react";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { medicationFormService } from "@/services/ClinicalManagementServices/clinicalManagementService";

interface MedicationFormDetailsProps {
    selectedData?: MedicationFormDto;
}

const MedicationFormDetails: React.FC<MedicationFormDetailsProps> = ({ selectedData }) => {
    const { compID, compCode, compName } = useAppSelector((state) => state.auth);
    const [formState, setFormState] = useState<MedicationFormDto>({
        mFID: 0,
        mFCode: "",
        mFName: "",
        modifyYN: "N",
        defaultYN: "N",
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        transferYN: "N",
        rNotes: "",
        mfID: 0,
        mGenID: 0,
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { setLoading } = useLoading();
    const { handleDropdownChange } = useDropdownChange(setFormState);
    const dropdownValues = useDropdownValues(["medicationForm", "medicationGeneric"]);

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
          const nextCode = await medicationFormService.getNextCode("MED", 3);
        setFormState({
            mFID: 0, 
            mFCode: nextCode.data,
            mFName: "",
            modifyYN: "N",
            defaultYN: "N",
            rActiveYN: "Y",
            compID: compID ?? 0,
            compCode: compCode ?? "",
            compName: compName ?? "",
            transferYN: "N",
            rNotes: "",
            mfID: 0,
            mGenID: 0,
        });
    } catch (error) {
        showAlert("Error", "Failed to fetch the next Medication Code.", "error");
      } finally {
        setLoading(false);
      }
    }, [compID, compCode, compName, medicationFormService]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        setIsSubmitted(true);
        setLoading(true);
        try {
            const saveData = { ...formState, mFID: 0 }; 
            const result = await medicationFormService.save(saveData);

            if (result.success) {
                showAlert("Success", "Medication Form saved successfully!", "success", {
                    onConfirm: handleClear,
                });
            } else {
                showAlert("Error", result.errorMessage || "Failed to save the Medication Form.", "error");
            }
        } catch (error) {
            showAlert("Error", "An unexpected error occurred while saving.", "error");
        } finally {
            setLoading(false);
        }
    }, [formState, medicationFormService, handleClear, setLoading]);

    return (
        <Paper variant="elevation" sx={{ padding: 2 }}>
            <Typography variant="h6" id="medication-form-details-header">
                MEDICATION FORM DETAILS
            </Typography>
            <Grid container spacing={2}>
                <FormField
                    type="text"
                    label="Medication Form Code"
                    value={formState.mFCode ?? ""}
                    onChange={handleInputChange}
                    name="mFCode"
                    ControlID="mFCode"
                    placeholder="Enter medication form code"
                    isMandatory={true}
                    size="small"
                    isSubmitted={isSubmitted}
                />
                <FormField
                    type="select"
                    label="Medication Form"
                    value={formState.mFID?.toString() || "0"}
                    onChange={handleDropdownChange(["mFID"], ["mFName"], dropdownValues.medicationForm)}
                    name="mFID"
                    ControlID="mFID"
                    options={dropdownValues.medicationForm}
                    size="small"
                />
                <FormField
                    type="select"
                    label="Medication Generic"
                    value={formState.mGenID?.toString() || "0"}
                    onChange={handleDropdownChange(["mGenID"], ["mGenName"], dropdownValues.medicationGeneric)}
                    name="mGenID"
                    ControlID="mGenID"
                    options={dropdownValues.medicationGeneric}
                    size="small"
                />
                <FormField
                    type="radio"
                    label="Modify"
                    value={formState.modifyYN}
                    onChange={handleInputChange}
                    name="modifyYN"
                    ControlID="modifyYN"
                    options={[{ label: "Yes", value: "Y" }, { label: "No", value: "N" }]}
                    size="small"
                />
                <FormField
                    type="radio"
                    label="Default"
                    value={formState.defaultYN}
                    onChange={handleInputChange}
                    name="defaultYN"
                    ControlID="defaultYN"
                    options={[{ label: "Yes", value: "Y" }, { label: "No", value: "N" }]}
                    size="small"
                />
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
                <FormField
                    type="textarea"
                    label="Notes"
                    value={formState.rNotes || ""}
                    onChange={handleInputChange}
                    name="rNotes"
                    ControlID="rNotes"
                    size="small"
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

export default MedicationFormDetails;
