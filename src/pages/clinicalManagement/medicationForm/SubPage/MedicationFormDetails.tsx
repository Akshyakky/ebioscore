import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import { MedicationFormDto } from "../../../../interfaces/ClinicalManagement/MedicationFormDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { useAppSelector } from "@/store/hooks";

interface MedicationFormDetailsProps {
  selectedData?: MedicationFormDto;
  editData?: MedicationFormDto;
}

const MedicationFormDetails: React.FC<MedicationFormDetailsProps> = ({ selectedData, editData }) => {
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
    mFSnomedCode: "",
  });
  const [medicationForms, setMedicationForms] = useState<MedicationFormDto[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { setLoading } = useLoading();

  const medicationFormService = useMemo(() => createEntityService<MedicationFormDto>("MedicationForm", "clinicalManagementURL"), []);

  useEffect(() => {
    const fetchMedicationForms = async () => {
      setLoading(true);
      try {
        const response = await medicationFormService.getAll();
        setMedicationForms(response.data || []);
      } catch (error) {
        showAlert("Error", "Failed to fetch medication forms.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicationForms();
  }, [medicationFormService]);

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
        mFID: selectedData.mFID || 0,
      });
    } else {
      handleClear();
    }
  }, [editData, selectedData]);

  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await medicationFormService.getNextCode("MF", 3);
      setFormState({
        mFID: 0,
        mFCode: nextCode.data || "",
        mFName: "",
        modifyYN: "N",
        defaultYN: "N",
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
        transferYN: "N",
        rNotes: "",
        mFSnomedCode: "",
      });
      setIsSubmitted(false);
    } catch (error) {
      showAlert("Error", "Failed to fetch the next Medication Form Code.", "error");
    } finally {
      setLoading(false);
    }
  }, [compID, compCode, compName, medicationFormService]);

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      if (name === "defaultYN" && value === "Y") {
        // Check if there are other records with DefaultYN = "Y"
        const formsToUpdate = medicationForms.filter((form) => form.defaultYN === "Y" && form.mFID !== formState.mFID);

        if (formsToUpdate.length > 0) {
          const confirmed = await new Promise<boolean>((resolve) => {
            showAlert(
              "Confirmation",
              `There are other entries set as default. Setting '${formState.mFName}' as the new default will remove default status from other entries. Continue?`,
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
          const updatedForms = formsToUpdate.map((form) => ({
            ...form,
            defaultYN: "N",
          }));

          await Promise.all(updatedForms.map((form) => medicationFormService.save(form)));

          setMedicationForms((prev) => prev.map((form) => (formsToUpdate.some((f) => f.mFID === form.mFID) ? { ...form, defaultYN: "N" } : form)));
        }
      }
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    [formState.mFName, medicationForms, medicationFormService]
  );

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    if (!formState.mFCode || !formState.mFCode.trim() || !formState.mFSnomedCode || !formState.mFName) {
      showAlert("Error", "Medication Form Code and Name are mandatory.", "error");
      return;
    }
    setLoading(true);
    try {
      await medicationFormService.save({ ...formState });
      showAlert("Success", "Medication Form saved successfully!", "success", {
        onConfirm: handleClear,
      });
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  }, [formState, medicationFormService, setLoading, handleClear]);

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
          type="text"
          label="Medication Form Snomed Code"
          value={formState.mFSnomedCode ?? ""}
          onChange={handleInputChange}
          name="mFSnomedCode"
          ControlID="mFSnomedCode"
          placeholder="Enter medication form snomed code"
          isMandatory={true}
          size="small"
          isSubmitted={isSubmitted}
        />

        <FormField
          type="text"
          label="Medication Form Name"
          value={formState.mFName || ""}
          onChange={handleInputChange}
          name="mFName"
          ControlID="mFName"
          placeholder="Enter medication form name"
          isMandatory
          size="small"
          isSubmitted={isSubmitted}
        />
      </Grid>

      <Grid container spacing={2}>
        <FormField type="textarea" label="Notes" value={formState.rNotes || ""} onChange={handleInputChange} name="rNotes" ControlID="rNotes" size="medium" rows={4} />
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
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default MedicationFormDetails;
