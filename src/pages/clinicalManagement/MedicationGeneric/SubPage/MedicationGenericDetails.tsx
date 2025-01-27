import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import { MedicationGenericDto } from "../../../../interfaces/ClinicalManagement/MedicationGenericDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { useAppSelector } from "@/store/hooks";

interface MedicationGenericDetailsProps {
  selectedData?: MedicationGenericDto;
}
const MedicationGenericDetails: React.FC<MedicationGenericDetailsProps> = ({ selectedData }) => {
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [formState, setFormState] = useState<MedicationGenericDto>(() => ({
    mGenID: 0,
    mGenCode: "",
    mGenName: "",
    modifyYN: "Y",
    defaultYN: "N",
    rActiveYN: "Y",
    compID: compID ?? 0,
    compCode: compCode ?? "",
    compName: compName ?? "",
    transferYN: "N",
    rNotes: "",
  }));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { setLoading } = useLoading();

  const MedicationGenericDetailsService = useMemo(() => createEntityService<MedicationGenericDto>("MedicationGeneric", "clinicalManagementURL"), []);

  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await MedicationGenericDetailsService.getNextCode("MEDG", 5);
      setFormState({
        mGenID: 0,
        mGenCode: nextCode.data,
        mGenName: "",
        modifyYN: "Y",
        defaultYN: "N",
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        rNotes: "",
        transferYN: "N",
        mSnomedCode: "",
      });
      setIsSubmitted(false);
      setIsEditing(false);
    } catch (error) {
      showAlert("Error", "Failed to fetch the next Medication Generic Code.", "error");
    } finally {
      setLoading(false);
    }
  }, [compID, compCode, compName, MedicationGenericDetails]);

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
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    if (!formState.mGenCode || !formState.mGenName) {
      showAlert("Error", "Medication Generic Code and Name are mandatory.", "error");
      return;
    }

    setLoading(true);

    try {
      let result = await MedicationGenericDetailsService.find("defaultYN='Y'");
      if (result.data.length > 0) {
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
      }
      await MedicationGenericDetailsService.save(formState);
      showAlert("Success", `Medication Generic Detail ${isEditing ? "updated" : "saved"} successfully!`, "success", {
        onConfirm: handleClear,
      });
    } catch (error) {
      showAlert("Error", `An unexpected error occurred while ${isEditing ? "updating" : "saving"}.`, "error");
    } finally {
      setLoading(false);
    }
  }, [formState, handleClear, MedicationGenericDetailsService, isEditing]);

  const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      rActiveYN: event.target.checked ? "Y" : "N",
    }));
  }, []);
  const handleDefaultToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      defaultYN: event.target.checked ? "Y" : "N",
    }));
  }, []);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="procedure-details-header">
        MEDICATION GENERIC DETAILS
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Medication Generic Code"
          value={formState.mGenCode}
          onChange={handleInputChange}
          name="mGenCode"
          ControlID="genCode"
          placeholder="Enter Medication Generic code"
          isMandatory={true}
          size="small"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Medication Generic Name"
          value={formState.mGenName}
          onChange={handleInputChange}
          name="mGenName"
          ControlID="genName"
          placeholder="Enter Medication Generic name"
          isMandatory={true}
          size="small"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Snomed Code"
          value={formState.mSnomedCode}
          onChange={handleInputChange}
          name="mSnomedCode"
          ControlID="snomedCode"
          placeholder="Enter Snomed Code"
          isMandatory={false}
          size="small"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="switch"
          label={formState.defaultYN === "Y" ? "Default" : ""}
          value={formState.defaultYN}
          checked={formState.defaultYN === "Y"}
          onChange={handleDefaultToggle}
          name="defaultYN"
          ControlID="defaultYN"
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
          label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
          value={formState.rActiveYN}
          checked={formState.rActiveYN === "Y"}
          onChange={handleActiveToggle}
          name="rActiveYN"
          ControlID="rActiveYN"
          size="medium"
        />
      </Grid>

      <FormSaveClearButton clearText="Clear" saveText={isEditing ? "Update" : "Save"} onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default React.memo(MedicationGenericDetails);
