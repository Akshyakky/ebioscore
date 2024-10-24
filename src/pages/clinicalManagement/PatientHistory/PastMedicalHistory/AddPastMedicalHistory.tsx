// src/pages/clinicalManagement/PatientHistory/PastMedicalHistory/AddPastMedicalHistory.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import CustomButton from "../../../../components/Button/CustomButton";
import { OPIPHistPMHDto } from "../../../../interfaces/ClinicalManagement/OPIPHistPMHDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { showAlert } from "../../../../utils/Common/showAlert";
import { useLoading } from "../../../../context/LoadingContext";
import { getDefaultFormDate } from "../../../../utils/Common/dateUtils";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";

interface AddPastMedicalHistoryProps {
  pchartId: number;
  opipNo: number;
  opipCaseNo: number;
  onHistoryChange: (historyData: any) => void;
  showImmediateSave: boolean;
  pastMedicalData: OPIPHistPMHDto;
}

const AddPastMedicalHistory: React.FC<AddPastMedicalHistoryProps> = ({ pchartId, opipNo, opipCaseNo, onHistoryChange, showImmediateSave, pastMedicalData }) => {
  const getInitialState = useCallback(
    (): OPIPHistPMHDto => ({
      opippmhId: 0,
      opipNo,
      opvId: 0,
      pchartId,
      opipCaseNo,
      patOpipYn: "I",
      opippmhDate: getDefaultFormDate(),
      opippmhDesc: "",
      opippmhNotes: "",
      oldPchartId: 0,
    }),
    [pchartId, opipNo, opipCaseNo]
  );

  const [pmhData, setPmhData] = useState<OPIPHistPMHDto>(pastMedicalData || getInitialState());
  const { setLoading } = useLoading();
  const pmhService = createEntityService<OPIPHistPMHDto>("OPIPHistPMH", "clinicalManagementURL");
  const theme = useTheme();

  const loadPastMedicalHistory = useCallback(async () => {
    if (pchartId) {
      setLoading(true);
      try {
        const response = await pmhService.find(`pchartId=${pchartId}`);
        if (response.data && response.data.length > 0) {
          setPmhData(response.data[0]);
        } else {
          setPmhData(getInitialState());
        }
      } catch (error) {
        console.error("Error loading past medical history:", error);
        showAlert("Error", "Failed to load past medical history.", "error");
        setPmhData(getInitialState());
      } finally {
        setLoading(false);
      }
    }
  }, [pchartId, pmhService, getInitialState]);

  useEffect(() => {
    loadPastMedicalHistory();
  }, [loadPastMedicalHistory]);

  useEffect(() => {
    onHistoryChange(pmhData);
  }, [pmhData, onHistoryChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPmhData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    if (date) {
      setPmhData((prev) => ({ ...prev, opippmhDate: date }));
    }
  }, []);

  const handleSave = async () => {
    if (!pmhData.opippmhDesc.trim()) {
      showAlert("Warning", "Please enter a description before saving.", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await pmhService.save(pmhData);
      if (response.success) {
        showAlert("Success", "Past Medical History saved successfully!", "success");
        if (pmhData.opippmhId === 0) {
          setPmhData(getInitialState());
        }
      } else {
        showAlert("Error", response.errorMessage || "Failed to save past medical history.", "error");
      }
    } catch (error) {
      console.error("Error saving past medical history:", error);
      showAlert("Error", "Failed to save past medical history.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ color: theme.palette.text.primary }}>
      <Typography variant="h6" gutterBottom>
        Past Medical History
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="datepicker"
          label="Date"
          value={pmhData.opippmhDate}
          onChange={handleDateChange}
          name="opippmhDate"
          ControlID="opippmhDate"
          size="small"
          maxDate={new Date()}
        />
        <FormField
          type="textarea"
          label="Description"
          value={pmhData.opippmhDesc}
          onChange={handleInputChange}
          name="opippmhDesc"
          ControlID="opippmhDesc"
          size="small"
          rows={4}
          isMandatory
        />
        <FormField
          type="textarea"
          label="Notes"
          value={pmhData.opippmhNotes || ""}
          onChange={handleInputChange}
          name="opippmhNotes"
          ControlID="opippmhNotes"
          size="small"
          rows={4}
        />
        {showImmediateSave && (
          <Grid item xs={12}>
            <CustomButton
              variant="contained"
              color="success"
              onClick={handleSave}
              text={`${pmhData.opippmhId === 0 ? "Save" : "Update"} Past Medical History`}
              icon={pmhData.opippmhId === 0 ? SaveIcon : EditIcon}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AddPastMedicalHistory;
