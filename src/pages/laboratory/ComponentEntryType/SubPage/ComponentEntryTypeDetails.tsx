import React, { useCallback, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useLoading } from "@/hooks/Common/useLoading";
import { useAlert } from "@/providers/AlertProvider";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { LComponentEntryTypeDto } from "@/interfaces/Laboratory/LInvMastDto";
import { componentEntryTypeService } from "@/services/Laboratory/LaboratoryService";

const ComponentEntryTypeDetails: React.FC<{ editData?: LComponentEntryTypeDto }> = ({ editData }) => {
  const [formState, setFormState] = useState({
    isSubmitted: false,
    lCentID: 0,
    lCentName: "",
    lCentDesc: "",
    lCentType: "",
    langType: "",
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  });

  const { setLoading } = useLoading();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (editData) {
      setFormState({
        isSubmitted: false,
        lCentID: editData.lCentID || 0,
        lCentName: editData.lCentName || "",
        lCentDesc: editData.lCentDesc || "",
        lCentType: editData.lCentType || "",
        langType: editData.langType || "",
        rActiveYN: editData.rActiveYN || "Y",
        transferYN: editData.transferYN || "N",
        rNotes: editData.rNotes || "",
      });
    } else {
      handleClear();
    }
  }, [editData]);

  const handleClear = useCallback(() => {
    setFormState({
      isSubmitted: false,
      lCentID: 0,
      lCentName: "",
      lCentDesc: "",
      lCentType: "",
      langType: "",
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: "",
    });
  }, []);

  const createComponentEntryTypeData = useCallback((): LComponentEntryTypeDto => {
    return {
      lCentID: formState.lCentID,
      lCentName: formState.lCentName,
      lCentDesc: formState.lCentDesc,
      lCentType: formState.lCentType,
      langType: "English",
      rActiveYN: formState.rActiveYN,
      transferYN: formState.transferYN,
      rNotes: formState.rNotes,
    };
  }, [formState]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setFormState((prev) => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const componentEntryTypeData = createComponentEntryTypeData();
      const result = await componentEntryTypeService.save(componentEntryTypeData);
      if (result.success) {
        showAlert("Success", "Component Entry Type saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save Component Entry Type.", "error");
      }
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFormState((prev) => ({ ...prev, rActiveYN: checked ? "Y" : "N" }));
  }, []);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="component-entry-type-details-header">
        COMPONENT ENTRY TYPE DETAILS
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Component Center Name"
          value={formState.lCentName}
          onChange={handleInputChange}
          name="lCentName"
          ControlID="lCentName"
          placeholder="Enter center name"
          isMandatory
          isSubmitted={formState.isSubmitted}
          size="small"
        />
        <FormField
          type="text"
          label="Component Center Description"
          value={formState.lCentDesc}
          onChange={handleInputChange}
          name="lCentDesc"
          ControlID="lCentDesc"
          placeholder="Enter description"
          size="small"
        />

        <FormField
          type="text"
          label="Component Type"
          value={formState.lCentType}
          onChange={handleInputChange}
          name="lCentType"
          ControlID="lCentType"
          placeholder="Enter component type"
          size="small"
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="textarea"
          label="Notes"
          value={formState.rNotes}
          onChange={handleInputChange}
          name="rNotes"
          ControlID="rNotes"
          placeholder="Enter additional notes"
          size="small"
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
          checked={formState.rActiveYN === "Y"}
          value={formState.rActiveYN}
          onChange={handleSwitchChange}
          name="rActiveYN"
          ControlID="rActiveYN"
        />
      </Grid>
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default ComponentEntryTypeDetails;
