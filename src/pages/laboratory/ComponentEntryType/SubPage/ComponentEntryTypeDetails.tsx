import React, { useCallback, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useLoading } from "@/context/LoadingContext";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { useAppSelector } from "@/store/hooks";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, SelectChangeEvent, Typography } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import { LComponentEntryTypeDto } from "@/interfaces/Laboratory/LInvMastDto";
import { componentEntryTypeService } from "@/services/Laboratory/LaboratoryService";
// import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

const ComponentEntryTypeDetails: React.FC<{ editData?: LComponentEntryTypeDto }> = ({ editData }) => {
  // const dropdownValues = useDropdownValues(["language"]);

  const [formState, setFormState] = useState({
    isSubmitted: false,
    lCentID: 0,
    lCentName: "",
    lCentDesc: "",
    lCentType: "",
    langType: "",
    rActiveYN: "Y",
    compID: 0,
    compCode: "",
    compName: "",
    transferYN: "N",
    rNotes: "",
  });

  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);

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
        compID: editData.compID || 0,
        compCode: editData.compCode || "",
        compName: editData.compName || "",
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
      compID: 0,
      compCode: "",
      compName: "",
      transferYN: "N",
      rNotes: "",
    });
  }, []);

  const createComponentEntryTypeData = useCallback((): LComponentEntryTypeDto => {
    // const selectedLanguage = dropdownValues.language?.find((lang) => lang.value === formState.langType);

    return {
      lCentID: formState.lCentID,
      lCentName: formState.lCentName,
      lCentDesc: formState.lCentDesc,
      lCentType: formState.lCentType,
      langType: "English", // Ensure the label is saved
      rActiveYN: formState.rActiveYN,
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: formState.transferYN,
      rNotes: formState.rNotes,
      rCreatedID: userID || 0,
      rCreatedOn: serverDate || new Date(),
      rCreatedBy: userName || "",
      rModifiedID: userID || 0,
      rModifiedOn: serverDate || new Date(),
      rModifiedBy: userName || "",
    };
  }, [formState, compID, compCode, compName, userID, userName, serverDate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setFormState((prev) => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const componentEntryTypeData = createComponentEntryTypeData();
      console.log("Payload being sent:", componentEntryTypeData); // Debugging the payload

      const result = await componentEntryTypeService.save(componentEntryTypeData);
      if (result.success) {
        showAlert("Success", "Component Entry Type saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save Component Entry Type.", "error");
      }
    } catch (error) {
      console.error("Error saving Component Entry Type:", error);
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
        {/* <FormField
          type="select"
          label="Language Type"
          value={formState.langType || ""}
          onChange={(e) => {
            const selectedLanguage = dropdownValues.language?.find((lang) => lang.value === e.target.value);
            setFormState((prev) => ({ ...prev, langType: selectedLanguage ? selectedLanguage.label : e.target.value }));
          }}
          name="langType"
          ControlID="langType"
          options={dropdownValues.language || [{ value: "", label: "Loading..." }]}
        /> */}
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
