import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import FormField from "@/components/FormField/FormField";
import { useLoading } from "@/context/LoadingContext";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";
import { useAppSelector } from "@/store/hooks";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

interface MedicationDosageDetailsProps {
  selectedData?: MedicationDosageDto;
  editData?: MedicationDosageDto;
}
const MedicationDosageDetails: React.FC<MedicationDosageDetailsProps> = ({ selectedData, editData }) => {
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [formState, setFormState] = useState<MedicationDosageDto>({
    mDId: 0,
    mDCode: "",
    mDName: "",
    modifyYN: "N",
    defaultYN: "N",
    rActiveYN: "Y",
    compID: compID ?? 0,
    compCode: compCode ?? "",
    compName: compName ?? "",
    transferYN: "Y",
    rNotes: "",
    mDSnomedCode: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setLoading } = useLoading();

  const medicationDosageService = useMemo(() => createEntityService<MedicationDosageDto>("MedicationDosage", "clinicalManagementURL"), []);

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
      const nextCode = await medicationDosageService.getNextCode("MD", 5);
      setFormState({
        mDId: 0,
        mDCode: nextCode.data || "",
        mDName: "",
        modifyYN: "N",
        defaultYN: "N",
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        transferYN: "Y",
        rNotes: "",
        mDSnomedCode: "",
      });
      setIsSubmitted(false);
    } catch (error) {
      showAlert("Error", "Failed to fetch the Medication Dosage Code.", "error");
    } finally {
      setLoading(false);
    }
  }, [compID, compCode, compName, medicationDosageService]);

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === "defaultYN" && value === "Y") {
        try {
          const existingDefault = await medicationDosageService.find("defaultYN='Y'");

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
            const updatedRecords = existingDefault.data.map((record: MedicationDosageDto) => ({
              ...record,
              defaultYN: "N",
            }));

            await Promise.all(updatedRecords.map((record: MedicationDosageDto) => medicationDosageService.save(record)));
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
    [formState.mGenName, medicationDosageService]
  );

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);

    if (!formState.mDCode || !formState.mDCode.trim() || !formState.mDName || !formState.mDSnomedCode) {
      showAlert("Error", "Medication Dosage code and Name are mandatory.", "error");
    }

    setLoading(true);

    try {
      await medicationDosageService.save({ ...formState });
      showAlert("Success", "Medication Dosage saved successfully!", "success", {
        onConfirm: handleClear,
      });
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  }, [formState, medicationDosageService, setLoading, handleClear]);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="medication-form-details-header">
        MEDICATION DOSAGE DETAILS
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Medication Dosage Code"
          value={formState.mDCode ?? ""}
          onChange={handleInputChange}
          name="mDCode"
          ControlID="mDCode"
          placeholder="Enter medication dosage code"
          isMandatory={true}
          size="small"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Medication Dosage Snomed Code"
          value={formState.mDSnomedCode ?? ""}
          onChange={handleInputChange}
          name="mDSnomedCode"
          ControlID="mDSnomedCode"
          placeholder="Enter medication dosage snomed code"
          isMandatory
          size="small"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Medication Dosage Name"
          value={formState.mDName || ""}
          onChange={handleInputChange}
          name="mDName"
          ControlID="mDName"
          placeholder="Enter medication dosage name"
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
    </Paper>
  );
};
export default MedicationDosageDetails;
