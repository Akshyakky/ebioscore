import React, { useCallback, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { ReasonListData } from "@/interfaces/FrontOffice/ReasonListData";
import { useLoading } from "@/hooks/Common/useLoading";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";

import { reasonListService, resourceListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { notifyError } from "@/utils/Common/toastManager";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, Typography } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

const ReasonDetails: React.FC<{ editData?: ReasonListData }> = ({ editData }) => {
  const [formState, setFormState] = useState({
    isSubmitted: false,
    arlCode: "",
    arlName: "",
    rNotes: "",
    rActiveYN: "Y",
    arlDuration: 0,
    rlID: 0,
  });

  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const [{ compID, compCode, compName, userID, userName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College", userID: 0, userName: "Akshay" });
  const [resourceList, setResourceList] = useState<ResourceListData[]>([]);

  useEffect(() => {
    if (editData) {
      setFormState({
        isSubmitted: false,
        arlCode: editData.arlCode || "",
        arlName: editData.arlName || "",
        rNotes: editData.rNotes || "",
        rActiveYN: editData.rActiveYN || "Y",
        arlDuration: editData.arlDuration || 0,
        rlID: editData.rlID || 0,
      });
    } else {
      handleClear();
    }
  }, [editData]);

  const handleClear = useCallback(() => {
    setFormState({
      isSubmitted: false,
      arlCode: "",
      arlName: "",
      rNotes: "",
      rActiveYN: "Y",
      arlDuration: 0,
      rlID: 0,
    });
  }, []);

  const createReasonListData = useCallback(
    (): ReasonListData => ({
      arlID: editData ? editData.arlID : 0,
      arlCode: formState.arlCode,
      arlName: formState.arlName,
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
      arlDuration: formState.arlDuration,
      arlDurDesc: "",
      arlColor: 0,
      rlName: "",
      rlID: formState.rlID || 0,
    }),
    [formState, editData, compID, compCode, compName, userID, userName, serverDate]
  );

  useEffect(() => {
    const fetchResourceList = async () => {
      try {
        const result = await resourceListService.getAll();
        if (result.success) {
          setResourceList(result.data ?? []);
        } else {
          notifyError(result.errorMessage || "Failed to fetch resource list.");
        }
      } catch (error) {
        notifyError("An error occurred while fetching the resource list.");
      }
    };
    fetchResourceList();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setFormState((prev) => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const ReasonListData = createReasonListData();
      const result = await reasonListService.save(ReasonListData);
      if (result.success) {
        showAlert("Success", "Reason List saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save Reason List.", "error");
      }
    } catch (error) {
      console.error("Error saving Reason List:", error);
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFormState((prev) => ({ ...prev, rActiveYN: checked ? "Y" : "N" }));
  }, []);

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = value === "" ? 0 : parseInt(value);
    setFormState((prev) => ({
      ...prev,
      arlDuration: isNaN(parsedValue) ? 0 : Math.max(0, parsedValue),
    }));
  }, []);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="reason-details-header">
        REASON DETAILS
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Reason Code"
          value={formState.arlCode}
          onChange={handleInputChange}
          name="arlCode"
          ControlID="arlCode"
          placeholder="Enter code"
          isMandatory
          isSubmitted={formState.isSubmitted}
          size="small"
          maxLength={20}
        />
        <FormField
          type="text"
          label="Reason Name"
          value={formState.arlName}
          onChange={handleInputChange}
          name="arlName"
          ControlID="arlName"
          placeholder="Enter name"
          isMandatory
          isSubmitted={formState.isSubmitted}
          size="small"
          maxLength={100}
        />
        <FormField
          type="number"
          label="Duration"
          value={formState.arlDuration.toString()}
          onChange={handleDurationChange}
          name="arlDuration"
          ControlID="arlDuration"
          placeholder="Enter duration"
          size="small"
          InputProps={{
            endAdornment: (
              <Typography variant="body2" sx={{ ml: 1, fontWeight: "550", color: "#313233" }}>
                Minutes
              </Typography>
            ),
            inputProps: { min: 0 },
          }}
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="select"
          label="Resource"
          value={formState.rlID.toString()}
          onChange={(e) => setFormState((prev) => ({ ...prev, rlID: parseInt(e.target.value) }))}
          name="rlID"
          ControlID="rlID"
          options={resourceList.map((resource) => ({
            value: resource.rLID.toString(),
            label: resource.rLName,
          }))}
          isMandatory
          isSubmitted={formState.isSubmitted}
          size="small"
        />
        <FormField
          type="textarea"
          label="Instruction"
          value={formState.rNotes}
          onChange={handleInputChange}
          name="rNotes"
          ControlID="rNotes"
          placeholder="Enter instructions"
          maxLength={4000}
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

export default ReasonDetails;
