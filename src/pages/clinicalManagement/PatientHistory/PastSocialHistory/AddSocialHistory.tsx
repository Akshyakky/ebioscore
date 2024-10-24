// src/pages/clinicalManagement/PatientHistory/SocialHistory/AddSocialHistory.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import CustomButton from "../../../../components/Button/CustomButton";
import { OPIPHistSHDto } from "../../../../interfaces/ClinicalManagement/OPIPHistSHDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { showAlert } from "../../../../utils/Common/showAlert";
import { useLoading } from "../../../../context/LoadingContext";
import { getDefaultFormDate } from "../../../../utils/Common/dateUtils";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";

interface AddSocialHistoryProps {
  pchartId: number;
  opipNo: number;
  opipCaseNo: number;
  onHistoryChange: (historyData: any) => void;
  showImmediateSave: boolean;
  socialHistoryData: OPIPHistSHDto;
}

const AddSocialHistory: React.FC<AddSocialHistoryProps> = ({ pchartId, opipNo, opipCaseNo, onHistoryChange, showImmediateSave, socialHistoryData }) => {
  const getInitialState = useCallback(
    (): OPIPHistSHDto => ({
      opipSHID: 0,
      opipNo,
      opvID: 0,
      pChartID: pchartId,
      opipCaseNo,
      patOpip: "I",
      opipSHDate: getDefaultFormDate(),
      opipSHDesc: "",
      opipSHNotes: "",
      oldPChartID: 0,
    }),
    [pchartId, opipNo, opipCaseNo]
  );

  const [shData, setSHData] = useState<OPIPHistSHDto>(socialHistoryData || getInitialState());
  const { setLoading } = useLoading();
  const shService = createEntityService<OPIPHistSHDto>("OPIPHistSH", "clinicalManagementURL");
  const theme = useTheme();

  const loadSocialHistory = useCallback(async () => {
    if (pchartId) {
      setLoading(true);
      try {
        const response = await shService.find(`pChartID=${pchartId}`);
        if (response.data && response.data.length > 0) {
          setSHData(response.data[0]);
        } else {
          setSHData(getInitialState());
        }
      } catch (error) {
        console.error("Error loading social history:", error);
        showAlert("Error", "Failed to load social history.", "error");
        setSHData(getInitialState());
      } finally {
        setLoading(false);
      }
    }
  }, [pchartId, shService, getInitialState]);

  useEffect(() => {
    loadSocialHistory();
  }, [loadSocialHistory]);

  useEffect(() => {
    onHistoryChange(shData);
  }, [shData, onHistoryChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSHData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setSHData((prev) => ({ ...prev, opipSHDate: date }));
    }
  }, []);

  const handleSave = async () => {
    if (!shData.opipSHDesc.trim()) {
      showAlert("Warning", "Please enter a description before saving.", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await shService.save(shData);
      if (response.success) {
        showAlert("Success", "Social History saved successfully!", "success");
        if (shData.opipSHID === 0) {
          setSHData(getInitialState());
        }
      } else {
        showAlert("Error", response.errorMessage || "Failed to save social history.", "error");
      }
    } catch (error) {
      console.error("Error saving social history:", error);
      showAlert("Error", "Failed to save social history.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ color: theme.palette.text.primary }}>
      <Typography variant="h6" gutterBottom>
        Social History
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="datepicker"
          label="Date"
          value={shData.opipSHDate}
          onChange={handleDateChange}
          name="opipSHDate"
          ControlID="opipSHDate"
          size="small"
          maxDate={new Date()}
        />
        <FormField
          type="textarea"
          label="Description"
          value={shData.opipSHDesc}
          onChange={handleInputChange}
          name="opipSHDesc"
          ControlID="opipSHDesc"
          size="small"
          rows={4}
          isMandatory
        />
        <FormField type="textarea" label="Notes" value={shData.opipSHNotes || ""} onChange={handleInputChange} name="opipSHNotes" ControlID="opipSHNotes" size="small" rows={4} />
        {showImmediateSave && (
          <Grid item xs={12}>
            <CustomButton
              variant="contained"
              color="success"
              onClick={handleSave}
              text={`${shData.opipSHID === 0 ? "Save" : "Update"} Social History`}
              icon={shData.opipSHID === 0 ? SaveIcon : EditIcon}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AddSocialHistory;
