import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import TextArea from "../../../../components/TextArea/TextArea";
import { notifySuccess, notifyError } from "../../../../utils/Common/toastManager";
import { ResourceListService } from "../../../../services/frontOffice/ResourceListServices";
import { ResourceListData } from "../../../../interfaces/frontOffice/ResourceListData";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";

interface ResourceDetailsProps {
  resource: ResourceListData | null;
  onSave: (resource: ResourceListData) => void;
  onClear: () => void;
  isEditMode: boolean;
}

const ResourceDetails: React.FC<ResourceDetailsProps> = ({
  resource,
  onSave,
  onClear,
  isEditMode,
}) => {
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resourceData, setResourceData] = useState<ResourceListData>({
    rLID: resource?.rLID || 0,
    rLCode: resource?.rLCode || "",
    rLName: resource?.rLName || "",
    rNotes: resource?.rNotes || "",
    rLValidateYN: resource?.rLValidateYN || 'N', 
    transferYN: resource?.transferYN || 'N',
    rLOtYN: resource?.rLOtYN || 'N',
    rActiveYN: resource?.rActiveYN || 'N',
    rCreatedBy: resource?.rCreatedBy || "",
    rModifiedBy: resource?.rModifiedBy || "",
    rCreatedOn: resource?.rCreatedOn || new Date(),
    rModifiedOn: resource?.rModifiedOn || new Date(),
    rCreatedID: resource?.rCreatedID || 0,
    rModifiedID: resource?.rModifiedID || 0,
  });
  const [activeLabel, setActiveLabel] = useState(resourceData.rActiveYN === 'Y' ? 'Active' : 'Hidden');

  useEffect(() => {
    if (resource) {
      setResourceData({
        rLID: resource.rLID,
        rLCode: resource.rLCode || "",
        rLName: resource.rLName || "",
        rNotes: resource.rNotes || "",
        rLValidateYN: resource.rLValidateYN || 'N',
        transferYN: resource?.transferYN || 'N',
        rLOtYN: resource.rLOtYN || 'N',
        rActiveYN: resource.rActiveYN || 'N',
        rCreatedBy: resource.rCreatedBy || "",
        rModifiedBy: resource.rModifiedBy || "",
        rCreatedOn: resource.rCreatedOn || new Date(),
        rModifiedOn: resource.rModifiedOn || new Date(),
        rCreatedID: resource.rCreatedID || 0,
        rModifiedID: resource.rModifiedID || 0,
      });
      setActiveLabel(resource.rActiveYN === 'Y' ? 'Active' : 'Hidden');
    }
  }, [resource]);

  const handleSave = async () => {
    setIsSubmitted(true);

    if (!resourceData.rLCode || !resourceData.rLName) {
      notifyError("Resource Code and Resource Name are required fields.");
      return;
    }

    try {
      const result = await ResourceListService.saveResourceList(token!, resourceData);
      if (result.success) {
        notifySuccess("Resource saved successfully");
        onSave(resourceData);
        setResourceData({
          rLID: 0,
          rLCode: "",
          rLName: "",
          rNotes: "",
          rLValidateYN: 'N',
          rLOtYN: 'N',
          rActiveYN: 'N',
          rCreatedBy: "",
          rModifiedBy: "",
          rCreatedOn: new Date(),
          rModifiedOn: new Date(),
          rCreatedID: 0,
          rModifiedID: 0,
          transferYN: 'N',
        });
        onClear();
      } else {
        notifyError(result.errorMessage || "An unknown error occurred.");
      }
    } catch (error) {
      notifyError("An error occurred while saving the resource.");
    }
  };

  const handleActiveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isActive = e.target.checked;
    setResourceData({ ...resourceData, rActiveYN: isActive ? 'Y' : 'N' });
    setActiveLabel(isActive ? 'Active' : 'Hidden');
  };

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
              value={resourceData.rLCode}
              onChange={(e) => setResourceData({ ...resourceData, rLCode: e.target.value })}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              name="rLCode"
              ControlID=""
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Resource Name"
              placeholder="Enter description"
              value={resourceData.rLName}
              onChange={(e) => setResourceData({ ...resourceData, rLName: e.target.value })}
              size="small"
              isSubmitted={isSubmitted}
              name="rLName"
              ControlID=""
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextArea
              label="Remarks"
              name="rNotes"
              value={resourceData.rNotes}
              onChange={(e) => setResourceData({ ...resourceData, rNotes: e.target.value })}
              placeholder="Notes"
              rows={2}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Is Validate"
              checked={resourceData.rLValidateYN === 'Y'}
              onChange={(e) => setResourceData({ ...resourceData, rLValidateYN: e.target.checked ? 'Y' : 'N'})}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Is Operation Theatre"
              checked={resourceData.rLOtYN === 'Y'}
              onChange={(e) => setResourceData({ ...resourceData, rLOtYN: e.target.checked ? 'Y' : 'N'})}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
          <CustomSwitch
              label={activeLabel}
              checked={resourceData.rActiveYN === 'Y'}
              onChange={handleActiveToggle}
            />
          </Grid>
        </Grid>
      </section>
      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={onClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
    </Paper>
  );
};

export default ResourceDetails;
