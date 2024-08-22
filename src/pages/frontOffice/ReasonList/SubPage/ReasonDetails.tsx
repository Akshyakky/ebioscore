import React, { useEffect, useState } from "react";
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
import {
  notifySuccess,
  notifyError,
} from "../../../../utils/Common/toastManager";
import { ResourceListService } from "../../../../services/FrontOfficeServices/ResourceListServices";
import { ResourceListData } from "../../../../interfaces/FrontOffice/ResourceListData";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import { ReasonListService } from "../../../../services/FrontOfficeServices/ReasonListService";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { ReasonListData } from "../../../../interfaces/FrontOffice/ReasonListData";

interface ReasonDetailsProps {
  reason: ReasonListData | null;
  onSave: (reason: ReasonListData) => void;
  onClear: () => void;
  isEditMode: boolean;
}

const ReasonDetails: React.FC<ReasonDetailsProps> = ({
  reason,
  onSave,
  onClear,
  isEditMode,
}) => {
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resourceList, setResourceList] = useState<ResourceListData[]>([]);
  const [reasonData, setReasonData] = useState<ReasonListData>({
    arlID: reason?.arlID || 0,
    arlCode: reason?.arlCode || "",
    arlName: reason?.arlName || "",
    arlDuration: reason?.arlDuration || 0,
    arlDurDesc: reason?.arlDurDesc || "",
    arlColor: reason?.arlColor || 0,
    rActiveYN: reason?.rActiveYN || "N",
    rCreatedOn: reason?.rCreatedOn || new Date(),
    rCreatedID: reason?.rCreatedID || 0,
    rCreatedBy: reason?.rCreatedBy || "",
    rModifiedOn: reason?.rModifiedOn || new Date(),
    rModifiedID: reason?.rModifiedID || 0,
    rModifiedBy: reason?.rModifiedBy || "",
    rNotes: reason?.rNotes || "",
    compCode: reason?.compCode || "",
    compID: reason?.compID || 0,
    compName: reason?.compName || "",
    transferYN: reason?.transferYN || "N",
    rlName: reason?.rlName || "",
    rlID: reason?.rlID || 0, // Ensure rlID is set properly
  });
  const [activeLabel, setActiveLabel] = useState(
    reasonData.rActiveYN === "Y" ? "Active" : "Hidden"
  );

  useEffect(() => {
    const fetchResourceList = async () => {
      try {
        const result = await ResourceListService.getAllResourceLists(token!);
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
  }, [token]);

  useEffect(() => {
    if (reason) {
      setReasonData({
        arlID: reason.arlID,
        arlCode: reason.arlCode || "",
        arlName: reason.arlName || "",
        arlDuration: reason.arlDuration,
        arlDurDesc: reason.arlDurDesc || "",
        arlColor: reason.arlColor || 0,
        rActiveYN: reason.rActiveYN || "N",
        rCreatedOn: reason.rCreatedOn || new Date(),
        rCreatedID: reason.rCreatedID || 0,
        rCreatedBy: reason.rCreatedBy || "",
        rModifiedOn: reason.rModifiedOn || new Date(),
        rModifiedID: reason.rModifiedID || 0,
        rModifiedBy: reason.rModifiedBy || "",
        rNotes: reason.rNotes || "",
        compCode: reason.compCode || "",
        compID: reason.compID || 0,
        compName: reason.compName || "",
        transferYN: reason.transferYN || "N",
        rlName: reason.rlName || "",
        rlID: reason.rlID || 0,
      });
      setActiveLabel(reason.rActiveYN === "Y" ? "Active" : "Hidden");
    }
  }, [reason]);

  const handleSave = async () => {
    setIsSubmitted(true);

    if (!reasonData.arlCode || !reasonData.arlName || !reasonData.rlID) {
      notifyError("Reason Code, Name, and Resource are required fields.");
      return;
    }

    try {
      const result = await ReasonListService.saveReasonList(token!, reasonData);
      if (result.success) {
        notifySuccess("Reason saved successfully");
        onSave(reasonData);
        setReasonData({
          arlID: 0,
          arlCode: "",
          arlName: "",
          arlDuration: 0,
          arlDurDesc: "",
          arlColor: 0,
          rActiveYN: "N",
          rCreatedOn: new Date(),
          rCreatedID: 0,
          rCreatedBy: "",
          rModifiedOn: new Date(),
          rModifiedID: 0,
          rModifiedBy: "",
          rNotes: "",
          compCode: "",
          compID: 0,
          compName: "",
          transferYN: "N",
          rlName: "",
          rlID: 0,
        });
        onClear();
      } else {
        notifyError(result.errorMessage || "An unknown error occurred.");
      }
    } catch (error) {
      notifyError("An error occurred while saving the reason.");
    }
  };
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = parseInt(value);
    setReasonData({
      ...reasonData,
      arlDuration: isNaN(parsedValue) ? reasonData.arlDuration : parsedValue,
    });
  };

  const incrementDuration = () => {
    setReasonData({
      ...reasonData,
      arlDuration: reasonData.arlDuration + 1,
    });
  };

  const decrementDuration = () => {
    setReasonData({
      ...reasonData,
      arlDuration: reasonData.arlDuration > 0 ? reasonData.arlDuration - 1 : 0,
    });
  };

  const handleActiveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isActive = e.target.checked;
    setReasonData({ ...reasonData, rActiveYN: isActive ? "Y" : "N" });
    setActiveLabel(isActive ? "Active" : "Hidden");
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
              value={reasonData.arlCode}
              onChange={(e) =>
                setReasonData({ ...reasonData, arlCode: e.target.value })
              }
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              name="arlCode"
              ControlID=""
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Reason Name"
              placeholder="Enter name"
              value={reasonData.arlName}
              onChange={(e) =>
                setReasonData({ ...reasonData, arlName: e.target.value })
              }
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              name="arlName"
              ControlID=""
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Duration"
              type="number"
              placeholder="Enter duration"
              variant="outlined"
              sx={{ mt: 2 }}
              value={reasonData.arlDuration}
              onChange={handleDurationChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={incrementDuration}
                      edge="end"
                    ></IconButton>
                    <IconButton
                      onClick={decrementDuration}
                      edge="end"
                    ></IconButton>
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
              value={reasonData.rNotes}
              onChange={(e) =>
                setReasonData({ ...reasonData, rNotes: e.target.value })
              }
              placeholder="Enter instructions"
              rows={2}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              label="Resource"
              value={reasonData.rlID.toString()}
              onChange={(e) =>
                setReasonData({ ...reasonData, rlID: parseInt(e.target.value) })
              }
              options={resourceList.map((resource) => ({
                value: resource.rLID.toString(),
                label: resource.rLName,
              }))}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              name="rlID"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              checked={reasonData.rActiveYN === "Y"}
              onChange={handleActiveToggle}
              label={activeLabel}
            />
          </Grid>
        </Grid>
        <FormSaveClearButton
          clearText="Clear"
          saveText="Save"
          onClear={onClear}
          onSave={handleSave}
          clearIcon={DeleteIcon}
          saveIcon={SaveIcon}
        />
      </section>
    </Paper>
  );
};

export default ReasonDetails;
