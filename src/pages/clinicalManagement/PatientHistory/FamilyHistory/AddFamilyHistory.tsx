// src/pages/clinicalManagement/PatientHistory/FamilyHistory/AddFamilyHistory.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import CustomButton from "../../../../components/Button/CustomButton";
import { OPIPHistFHDto } from "../../../../interfaces/ClinicalManagement/OPIPHistFHDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { showAlert } from "../../../../utils/Common/showAlert";
import { useLoading } from "../../../../context/LoadingContext";
import { getCurrentDateTime, getDefaultFormDate } from "../../../../utils/Common/dateUtils";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";

interface AddFamilyHistoryProps {
  pchartId: number;
  opipNo: number;
  opipCaseNo: number;
  onHistoryChange: (historyData: any) => void;
  showImmediateSave: boolean;
  familyHistoryData: OPIPHistFHDto;
}

const AddFamilyHistory: React.FC<AddFamilyHistoryProps> = ({ pchartId, opipNo, opipCaseNo, onHistoryChange, showImmediateSave, familyHistoryData }) => {
  const getInitialState = useCallback(
    (): OPIPHistFHDto => ({
      opipFHID: 0,
      opipNo,
      opvID: 0,
      pChartID: pchartId,
      opipCaseNo,
      patOpip: "I",
      opipFHDate: getCurrentDateTime(),
      opipFHDesc: "",
      opipFHNotes: "",
      oldPChartID: 0,
    }),
    [pchartId, opipNo, opipCaseNo]
  );

  const [fhData, setFHData] = useState<OPIPHistFHDto>(familyHistoryData || getInitialState());
  const { setLoading } = useLoading();
  const fhService = createEntityService<OPIPHistFHDto>("OPIPHistFH", "clinicalManagementURL");
  const theme = useTheme();

  const loadFamilyHistory = useCallback(async () => {
    if (pchartId) {
      setLoading(true);
      try {
        const response = await fhService.find(`pChartID=${pchartId}`);
        if (response.data && response.data.length > 0) {
          setFHData(response.data[0]);
        } else {
          setFHData(getInitialState());
        }
      } catch (error) {
        console.error("Error loading family history:", error);
        showAlert("Error", "Failed to load family history.", "error");
        setFHData(getInitialState());
      } finally {
        setLoading(false);
      }
    }
  }, [pchartId, fhService, getInitialState]);

  useEffect(() => {
    loadFamilyHistory();
  }, [loadFamilyHistory]);

  useEffect(() => {
    onHistoryChange(fhData);
  }, [fhData, onHistoryChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFHData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setFHData((prev) => ({ ...prev, opipFHDate: date }));
    }
  }, []);

  const handleSave = async () => {
    if (!fhData.opipFHDesc) {
      showAlert("Warning", "Please enter a description before saving.", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await fhService.save(fhData);
      if (response.success) {
        showAlert("Success", "Family History saved successfully!", "success");
        if (fhData.opipFHID === 0) {
          setFHData(getInitialState());
        }
      } else {
        showAlert("Error", response.errorMessage || "Failed to save family history.", "error");
      }
    } catch (error) {
      console.error("Error saving family history:", error);
      showAlert("Error", "Failed to save family history.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ color: theme.palette.text.primary }}>
      <Typography variant="h6" gutterBottom>
        Family History
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="datepicker"
          label="Date"
          value={fhData.opipFHDate}
          onChange={handleDateChange}
          name="opipFHDate"
          ControlID="opipFHDate"
          size="small"
          maxDate={new Date()}
        />
        <FormField
          type="textarea"
          label="Description"
          value={fhData.opipFHDesc}
          onChange={handleInputChange}
          name="opipFHDesc"
          ControlID="opipFHDesc"
          size="small"
          rows={4}
          isMandatory
        />
        <FormField type="textarea" label="Notes" value={fhData.opipFHNotes || ""} onChange={handleInputChange} name="opipFHNotes" ControlID="opipFHNotes" size="small" rows={4} />
        {showImmediateSave && (
          <Grid item xs={12}>
            <CustomButton
              variant="contained"
              color="success"
              onClick={handleSave}
              text={`${fhData.opipFHID === 0 ? "Save" : "Update"} Family History`}
              icon={fhData.opipFHID === 0 ? SaveIcon : EditIcon}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AddFamilyHistory;
