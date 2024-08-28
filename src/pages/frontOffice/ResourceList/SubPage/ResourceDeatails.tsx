import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import TextArea from "../../../../components/TextArea/TextArea";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices/ResourceListServices";
import { ResourceListData } from "../../../../interfaces/FrontOffice/ResourceListData";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { useLoading } from "../../../../context/LoadingContext";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";

const ResourceDetails: React.FC<{ editData?: ResourceListData }> = ({ editData }) => {

  const [formState, setFormState] = useState({
    isSubmitted: false,
    rLCode: "",
    rLName: "",
    rNotes: "",
    rActiveYN: "Y",
    rLValidateYN: "N",
    rLOtYN: "N"
  });

  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { compID, compCode, compName, userID, userName } = store.getState().userDetails;

  useEffect(() => {
    if (editData) {
      setFormState({
        isSubmitted: false,
        rLCode: editData.rLCode || "",
        rLName: editData.rLName || "",
        rNotes: editData.rNotes || "",
        rActiveYN: editData.rActiveYN || "Y",
        rLValidateYN: editData.rLValidateYN || "N",
        rLOtYN: editData.rLOtYN || "N"
      });
    } else {
      handleClear();
    }
  }, [editData]);

  const handleClear = useCallback(() => {
    setFormState({
      isSubmitted: false,
      rLCode: "",
      rLName: "",
      rNotes: "",
      rActiveYN: "Y",
      rLValidateYN: "N",
      rLOtYN: "N"
    });
  }, []);

  const createResourceListData = useCallback((): ResourceListData => ({
    rLID: editData ? editData.rLID : 0,
    rLCode: formState.rLCode,
    rLName: formState.rLName,
    rNotes: formState.rNotes,
    rActiveYN: formState.rActiveYN,
    compID: compID || 0,
    compCode: compCode || "",
    compName: compName || "",
    transferYN: "N",
    rCreatedID: userID || 0,
    rCreatedOn: serverDate || new Date(),
    rCreatedBy: userName || "",
    rModifiedID: userID || 0,
    rModifiedOn: serverDate || new Date(),
    rModifiedBy: userName || "",
    rLValidateYN: formState.rLValidateYN,
    rLOtYN: formState.rLOtYN

  }), [formState, editData, compID, compCode, compName, userID, userName, serverDate]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setFormState(prev => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const ResourceListData = createResourceListData();
      const result = await ResourceListService.saveResourceList(ResourceListData);
      if (result.success) {
        showAlert("Success", "Resource List saved successfully!", "success", {
          onConfirm: handleClear
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save Resource List.", "error");
      }
    } catch (error) {
      console.error("Error saving Resource List:", error);
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, rActiveYN: event.target.checked ? "Y" : "N" }));
  }, []);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="resource-details-header">
        RESOURCE DETAILS
      </Typography>
      <section>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Resource Code"
              placeholder="Enter code"
              value={formState.rLCode}
              onChange={handleInputChange}
              isSubmitted={formState.isSubmitted}
              isMandatory
              size="small"
              name="rLCode"
              ControlID="rLCode"
              aria-label="Resource Code"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Resource Name"
              placeholder="Enter description"
              value={formState.rLName}
              isSubmitted={formState.isSubmitted}
              onChange={handleInputChange}
              isMandatory
              size="small"
              name="rLName"
              ControlID="rLCode"
              aria-label="Resource Name"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextArea
              label="Remarks"
              name="rNotes"
              value={formState.rNotes}
              onChange={handleInputChange}
              placeholder="Notes"
              rows={2}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Is Validate"
              checked={formState.rLValidateYN === 'Y'}
              onChange={handleActiveToggle}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Is Operation Theatre"
              checked={formState.rLOtYN === 'Y'}
              onChange={handleActiveToggle}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label={formState.rActiveYN === 'Y' ? 'Active' : 'Hidden'}
              checked={formState.rActiveYN === 'Y'}
              onChange={handleActiveToggle}
            />
          </Grid>
        </Grid>
      </section>
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

export default ResourceDetails;