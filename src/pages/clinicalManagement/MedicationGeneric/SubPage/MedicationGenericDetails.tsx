import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import FormField from "@/components/FormField/FormField";
import { useLoading } from "@/context/LoadingContext";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";
import { medicationGenericService } from "@/services/ClinicalManagementServices/clinicalManagementService";
import { useAppSelector } from "@/store/hooks";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

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
    mSnomedCode: "",
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
  }, [compID, compCode, compName, MedicationGenericDetailsService]);

  useEffect(() => {
    if (selectedData) {
      setFormState(selectedData);
      setIsEditing(true);
    } else {
      handleClear();
    }
  }, [selectedData, handleClear]);

  // Simple handler for text fields - no async operations
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Special handler for defaultYN with its async logic
  const handleDefaultYNChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (value === "Y") {
        try {
          const existingDefault = await MedicationGenericDetailsService.find("defaultYN='Y'");

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
            const updatedRecords = existingDefault.data.map((record: MedicationGenericDto) => ({
              ...record,
              defaultYN: "N",
            }));

            await Promise.all(updatedRecords.map((record: MedicationGenericDto) => MedicationGenericDetailsService.save(record)));
          }
        } catch (error) {
          showAlert("Error", "Failed to update default status.", "error");
          return;
        }
      }

      setFormState((prev) => ({
        ...prev,
        defaultYN: value,
      }));
    },
    [formState.mGenName, MedicationGenericDetailsService]
  );

  // Simple handler for modifyYN radio buttons
  const handleModifyYNChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormState((prev) => ({
      ...prev,
      modifyYN: value,
    }));
  }, []);

  // Handler for active switch
  const handleActiveChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormState((prev) => ({
      ...prev,
      rActiveYN: checked ? "Y" : "N",
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    if (!formState.mGenCode || !formState.mGenCode.trim() || !formState.mGenName) {
      showAlert("Error", "Medication Form Code and Name are mandatory.", "error");
      return;
    }

    setLoading(true);

    try {
      await medicationGenericService.save({ ...formState });
      showAlert("Success", "Medication Form saved successfully!", "success", {
        onConfirm: handleClear,
      });
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  }, [formState, medicationGenericService, setLoading, handleClear]);

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
          onChange={handleTextChange}
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
          onChange={handleTextChange}
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
          onChange={handleTextChange}
          name="mSnomedCode"
          ControlID="snomedCode"
          placeholder="Enter Snomed code"
          isMandatory={false}
          size="small"
          isSubmitted={isSubmitted}
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField type="textarea" label="Notes" value={formState.rNotes || ""} onChange={handleTextChange} name="rNotes" ControlID="rNotes" placeholder="Notes" maxLength={4000} />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="radio"
          label="Default"
          value={formState.defaultYN}
          onChange={handleDefaultYNChange}
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
          onChange={handleModifyYNChange}
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
            label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
            value={formState.rActiveYN}
            checked={formState.rActiveYN === "Y"}
            onChange={handleActiveChange}
            name="rActiveYN"
            ControlID="rActiveYN"
            size="medium"
          />
        </Grid>
      </Grid>

      <FormSaveClearButton clearText="Clear" saveText={isEditing ? "Update" : "Save"} onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default React.memo(MedicationGenericDetails);
