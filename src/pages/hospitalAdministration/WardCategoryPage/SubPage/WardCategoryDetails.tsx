import React, { useState, useCallback, useEffect } from "react";
import { Paper, Typography, Grid } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../context/LoadingContext";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import FormField from "../../../../components/FormField/FormField";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { WardCategoryDto } from "../../../../interfaces/HospitalAdministration/WardCategoryDto";
import { wardCategoryService } from "../../../../services/HospitalAdministrationServices/hospitalAdministrationService";

const WardCategoryDetails: React.FC<{ editData?: WardCategoryDto }> = ({ editData }) => {
  const [formState, setFormState] = useState<WardCategoryDto>({
    isSubmitted: false,
    wCatID: 0,
    wCatCode: "",
    wCatName: "",
    rNotes: "",
    rActiveYN: "Y",
    transferYN: "Y",
    compID: store.getState().userDetails.compID || 0,
    compCode: "",
    compName: "",
  });

  const { setLoading } = useLoading();
  const { compID } = store.getState().userDetails;

  useEffect(() => {
    if (editData) {
      setFormState({
        isSubmitted: false,
        wCatCode: editData.wCatCode || "",
        wCatName: editData.wCatName || "",
        rNotes: editData.rNotes || "",
        rActiveYN: editData.rActiveYN || "Y",
        transferYN: "Y",
        compID: 1,
        wCatID: editData.wCatID,
      });
    } else {
      handleClear();
    }
  }, [editData]);

  const createWardCategoryDto = useCallback(
    (): WardCategoryDto => ({
      wCatID: editData ? editData.wCatID : 0,
      wCatCode: formState.wCatCode,
      wCatName: formState.wCatName,
      rNotes: formState.rNotes,
      rActiveYN: formState.rActiveYN,
      compID: store.getState().userDetails.compID || 0,
      compCode: store.getState().userDetails.compCode || "",
      compName: store.getState().userDetails.compName || "",
      transferYN: "Y",
    }),
    [formState, editData, compID]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSave = async () => {
    setFormState((prev) => ({ ...prev, isSubmitted: true }));
    if (!formState.wCatCode.trim()) {
      showAlert("Error", "Ward Category Code is mandatory.", "error");
      return;
    }
    setLoading(true);
    try {
      debugger
      const wardCategoryDto = createWardCategoryDto();
      const result = await wardCategoryService.save(wardCategoryDto);

      if (result.success) {
        showAlert("Success", "Ward Category saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save Ward Category.", "error");
      }
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving. Please check the console for more details.", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleClear = useCallback(() => {
    setFormState({
      isSubmitted: false,
      wCatCode: "",
      wCatName: "",
      rNotes: "",
      rActiveYN: "Y",
      transferYN: "Y",
      compID: 0,
      wCatID: 0,
    });
  }, []);

  const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      rActiveYN: event.target.checked ? "Y" : "N",
    }));
  }, []);


  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="ward-category-header">
        Room - Bed  Category Details
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Ward Category Code"
          value={formState.wCatCode}
          onChange={handleInputChange}
          isSubmitted={formState.isSubmitted}
          name="wCatCode"
          ControlID="wCatCode"
          placeholder="Ward Category Code"
          maxLength={25}
          isMandatory
        />
        <FormField
          type="text"
          label="Ward Category Name"
          value={formState.wCatName}
          onChange={handleInputChange}
          isSubmitted={formState.isSubmitted}
          name="wCatName"
          ControlID="wCatName"
          placeholder="Ward Category Name"
          maxLength={50}
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="textarea"
          label="Remarks"
          value={formState.rNotes}
          onChange={handleInputChange}
          name="rNotes"
          ControlID="rNotes"
          placeholder="Remarks"
          maxLength={4000}
        />
      </Grid>
      <Grid container spacing={2}>
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

export default WardCategoryDetails;
