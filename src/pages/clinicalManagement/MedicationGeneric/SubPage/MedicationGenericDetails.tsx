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
import { medicationGenericService } from "@/services/ClinicalManagementServices/clinicalManagementService";

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

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === "defaultYN" && value === "Y") {
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
    [formState.mGenName, MedicationGenericDetailsService]
  );

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
            label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
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

      <FormSaveClearButton clearText="Clear" saveText={isEditing ? "Update" : "Save"} onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default React.memo(MedicationGenericDetails);
