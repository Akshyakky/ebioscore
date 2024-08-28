import React, { useCallback, useEffect, useState } from "react";
import {
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import TextArea from "../../../../components/TextArea/TextArea";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { ReasonListService } from "../../../../services/FrontOfficeServices/ReasonListServices/ReasonListService";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { ReasonListData } from "../../../../interfaces/FrontOffice/ReasonListData";
import { useLoading } from "../../../../context/LoadingContext";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices/ResourceListServices";
import { ResourceListData } from "../../../../interfaces/FrontOffice/ResourceListData";
import { notifyError } from "../../../../utils/Common/toastManager";

const ReasonDetails: React.FC<{ editData?: ReasonListData }> = ({ editData }) => {

  const [formState, setFormState] = useState({
    isSubmitted: false,
    arlCode: "",
    arlName: "",
    rNotes: "",
    rActiveYN: "Y",
    arlDuration: 0,
    rlID: 0

  });

  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { compID, compCode, compName, userID, userName } = store.getState().userDetails;
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
        rlID: editData.rlID || 0
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
      rlID: 0
    });
  }, []);

  const createReasonListData = useCallback((): ReasonListData => ({
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
    rlID: formState.rlID || 0
  }), [formState, editData, compID, compCode, compName, userID, userName, serverDate]);

  useEffect(() => {
    const fetchResourceList = async () => {
      try {
        const result = await ResourceListService.getAllResourceLists();
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
    setFormState(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = async () => {
    setFormState(prev => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const ReasonListData = createReasonListData();
      const result = await ReasonListService.saveReasonList(ReasonListData);
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

  const handleDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    action: "increment" | "decrement" | "change"
  ) => {
    const value = e.target.value;
    const parsedValue = value === "" ? 0 : parseInt(value);

    setFormState((prev) => ({
      ...prev,
      arlDuration: action === "increment"
        ? prev.arlDuration + 1
        : action === "decrement"
          ? Math.max(0, prev.arlDuration - 1)
          : isNaN(parsedValue)
            ? 0
            : parsedValue,
    }));
  };


  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="reason-details-header">
        REASON DETAILS
      </Typography>
      <section>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Reason Code"
              placeholder="Enter code"
              value={formState.arlCode}
              onChange={handleInputChange}
              isMandatory
              size="small"
              isSubmitted={formState.isSubmitted}
              name="arlCode"
              ControlID="arlCode"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Reason Name"
              placeholder="Enter name"
              value={formState.arlName}
              onChange={handleInputChange}
              isMandatory
              size="small"
              isSubmitted={formState.isSubmitted}
              name="arlName"
              ControlID="arlName"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Duration"
              type="number"
              placeholder="Enter duration"
              variant="outlined"
              sx={{ mt: 2 }}
              value={formState.arlDuration || ""}
              onChange={(e) => handleDurationChange(e as React.ChangeEvent<HTMLInputElement>, "change")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleDurationChange({ target: { value: "" } } as any, "increment")}
                      edge="end"
                    >
                    </IconButton>
                    <IconButton
                      onClick={() => handleDurationChange({ target: { value: "" } } as any, "decrement")}
                      edge="end"
                    >

                    </IconButton>
                    <Typography
                      variant="body2"
                      sx={{ ml: 1, fontWeight: "550", color: "#313233" }}
                    >
                      Minutes
                    </Typography>
                  </InputAdornment>
                ),
              }}
              size="small"
              inputProps={{ min: 0 }}
            />
          </Grid>

        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextArea
              label="Instruction"
              name="arlDurDesc"
              value={formState.rNotes}
              onChange={handleInputChange}
              placeholder="Enter instructions"
              rows={2}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              label="Resource"
              value={formState.rlID.toString()}
              onChange={(e) =>
                setFormState({ ...formState, rlID: parseInt(e.target.value) })
              }
              options={resourceList.map((resource) => ({
                value: resource.rLID.toString(),
                label: resource.rLName,
              }))}
              isMandatory
              size="small"
              isSubmitted={formState.isSubmitted}
              name="rlID"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              checked={formState.rActiveYN === "Y"}
              onChange={handleActiveToggle}
              label={formState.rActiveYN === 'Y' ? 'Active' : 'Hidden'}
            />
          </Grid>
        </Grid>
        <FormSaveClearButton
          clearText="Clear"
          saveText="Save"
          onClear={handleClear}
          onSave={handleSave}
          clearIcon={DeleteIcon}
          saveIcon={SaveIcon}
        />
      </section>
    </Paper>
  );
};

export default ReasonDetails;
