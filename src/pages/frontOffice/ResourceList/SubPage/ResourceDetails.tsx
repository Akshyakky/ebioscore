import React, { useCallback, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { ResourceListData } from "@/interfaces/frontOffice/ResourceListData";
import { useLoading } from "@/context/LoadingContext";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { useAppSelector } from "@/store/hooks";
import { resourceListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

interface ResourceDetailsProps {
  editData?: ResourceListData;
}

const ResourceDetails: React.FC<ResourceDetailsProps> = ({ editData }) => {
  const [formState, setFormState] = useState({
    isSubmitted: false,
    rLCode: "",
    rLName: "",
    rNotes: "",
    rActiveYN: "Y",
    rLValidateYN: "N",
    rLOtYN: "N",
  });

  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { compID, compCode, compName, userID, userName } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (editData) {
      setFormState({
        isSubmitted: false,
        rLCode: editData.rLCode || "",
        rLName: editData.rLName || "",
        rNotes: editData.rNotes || "",
        rActiveYN: editData.rActiveYN || "Y",
        rLValidateYN: editData.rLValidateYN || "N",
        rLOtYN: editData.rLOtYN || "N",
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
      rLOtYN: "N",
    });
  }, []);

  const createResourceListData = useCallback(
    (): ResourceListData => ({
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
      rLOtYN: formState.rLOtYN,
    }),
    [formState, editData, compID, compCode, compName, userID, userName, serverDate]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSwitchChange = useCallback(
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      setFormState((prev) => ({ ...prev, [name]: checked ? "Y" : "N" }));
    },
    []
  );

  const handleSave = async () => {
    setFormState((prev) => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const ResourceListData = createResourceListData();
      const result = await resourceListService.save(ResourceListData);
      if (result.success) {
        showAlert("Success", "Resource List saved successfully!", "success", {
          onConfirm: handleClear,
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

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="resource-details-header">
        RESOURCE DETAILS
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Resource Code"
          value={formState.rLCode}
          onChange={handleInputChange}
          name="rLCode"
          ControlID="rLCode"
          placeholder="Enter code"
          isMandatory
          isSubmitted={formState.isSubmitted}
          size="small"
        />
        <FormField
          type="text"
          label="Resource Name"
          value={formState.rLName}
          onChange={handleInputChange}
          name="rLName"
          ControlID="rLName"
          placeholder="Enter description"
          isMandatory
          isSubmitted={formState.isSubmitted}
          size="small"
          maxLength={100}
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField type="textarea" label="Remarks" value={formState.rNotes} onChange={handleInputChange} name="rNotes" ControlID="rNotes" placeholder="Notes" />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
          value={formState.rActiveYN}
          checked={formState.rActiveYN === "Y"}
          onChange={handleSwitchChange("rActiveYN")}
          name="rActiveYN"
          ControlID="rActiveYN"
        />
        <FormField
          type="switch"
          label="Is Validate"
          checked={formState.rLValidateYN === "Y"}
          value={formState.rLValidateYN}
          onChange={handleSwitchChange("rLValidateYN")}
          name="rLValidateYN"
          ControlID="rLValidateYN"
        />
        <FormField
          type="switch"
          label="Is Operation Theatre"
          checked={formState.rLOtYN === "Y"}
          value={formState.rLOtYN}
          onChange={handleSwitchChange("rLOtYN")}
          name="rLOtYN"
          ControlID="rLOtYN"
        />
      </Grid>
      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default ResourceDetails;
