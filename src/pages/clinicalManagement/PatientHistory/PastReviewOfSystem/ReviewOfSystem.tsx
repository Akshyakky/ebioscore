//src/pages/clinicalManagement/PastReviewOfSystem/ReviewOfSystem.tsx
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/FormField/FormField";
import { useLoading } from "@/hooks/Common/useLoading";
import { OPIPHistROSDto } from "@/interfaces/ClinicalManagement/OPIPHistROSDto";
import { useAlert } from "@/providers/AlertProvider";
import { Box, Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import ClearIcon from "@mui/icons-material/Clear";
import { reviewOfSystemService } from "@/services/ClinicalManagementServices/clinicalManagementService";

interface ReviewOfSystemProps {
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
  historyList: OPIPHistROSDto[];
  onHistoryChange: (history: OPIPHistROSDto[]) => void;
}

export const ReviewOfSystem: React.FC<ReviewOfSystemProps> = ({ pChartID, opipNo, opipCaseNo, historyList, onHistoryChange }) => {
  const initialFormState: OPIPHistROSDto = {
    opipRosID: 0,
    opipNo: opipNo,
    opvID: 0,
    pChartID: pChartID,
    opipCaseNo: opipCaseNo,
    patOpip: "I",
    opipRosDate: new Date(),
    opipRosDesc: "",
    opipRosNotes: "",
    oldPChartID: 0,
    rActiveYN: "Y",
    transferYN: "N",
    rNotes: "",
  };

  const [formState, setFormState] = useState<OPIPHistROSDto>(initialFormState);
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();

  const resetForm = useCallback(() => {
    setFormState({
      ...initialFormState,
      opipRosDate: new Date(),
    });
  }, [initialFormState]);

  const handleDelete = useCallback(
    async (item: OPIPHistROSDto) => {
      if (!item) return;

      // Handle unsaved records
      if (item.opipRosID === 0) {
        const updatedList = historyList.filter((history) => history.opipRosDate !== item.opipRosDate || history.opipRosDesc !== item.opipRosDesc);
        onHistoryChange(updatedList);
        return;
      }

      // Handle saved records
      const confirmed = await showAlert("Confirm Delete", "Are you sure you want to delete this review of system record?", "warning", true);

      if (confirmed) {
        setLoading(true);
        try {
          await reviewOfSystemService.updateActiveStatus(item.opipRosID, false);
          const updatedList = historyList.filter((history) => history.opipRosID !== item.opipRosID);
          onHistoryChange(updatedList);
          showAlert("Success", "Record deleted successfully", "success");
        } catch (error) {
          console.error("Delete error:", error);
          showAlert("Error", "Failed to delete record", "error");
        } finally {
          setLoading(false);
        }
      }
    },
    [historyList, onHistoryChange, reviewOfSystemService, setLoading]
  );

  const columns: Column<OPIPHistROSDto>[] = useMemo(
    () => [
      {
        key: "opipRosDate",
        header: "Date",
        visible: true,
        type: "date",
        width: 120,
        formatter: (value: Date) => new Date(value).toLocaleDateString(),
      },
      {
        key: "opipRosDesc",
        header: "System Review",
        visible: true,
        width: 300,
      },
      {
        key: "opipRosNotes",
        header: "Additional Notes",
        visible: true,
        width: 250,
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 100,
        render: (item: OPIPHistROSDto) => (
          <Tooltip title="Delete Record">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
              size="small"
              color="error"
              aria-label="delete review"
            >
              <Delete />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [handleDelete]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    setFormState((prev) => ({ ...prev, opipRosDate: date || new Date() }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formState.opipRosDesc.trim()) {
      showAlert("Warning", "Please enter the system review details", "warning");
      return false;
    }
    return true;
  }, [formState.opipRosDesc]);

  const handleAdd = useCallback(() => {
    if (!validateForm()) return;

    const updatedHistory = [...historyList, formState];
    onHistoryChange(updatedHistory);
    resetForm();
  }, [formState, historyList, onHistoryChange, resetForm, validateForm]);

  return (
    <Box>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <HealthAndSafetyIcon color="primary" sx={{ mr: 1 }} />
          <AssignmentIndIcon color="primary" sx={{ mr: 1 }} />
          <MonitorHeartIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Review of Systems
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <FormField type="datepicker" label="Date" value={formState.opipRosDate} onChange={handleDateChange} name="opipRosDate" ControlID="opipRosDate" size="small" isMandatory />
          <FormField
            type="textarea"
            label="Review of System Description"
            value={formState.opipRosDesc}
            onChange={handleInputChange}
            name="opipRosDesc"
            ControlID="opipRosDesc"
            placeholder="Enter system review details"
            rows={3}
            isMandatory
          />
          <FormField
            type="textarea"
            label="Additional Notes"
            value={formState.opipRosNotes || ""}
            onChange={handleInputChange}
            name="opipRosNotes"
            ControlID="opipRosNotes"
            placeholder="Enter any additional notes or observations"
          />
          <Grid size={{ md: 9 }}>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <CustomButton
                variant="outlined"
                icon={ClearIcon}
                text="Clear"
                onClick={resetForm}
                color="secondary"
                sx={{
                  minWidth: 100,
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette.error.light,
                    color: "white",
                  },
                }}
              />
              <CustomButton variant="contained" icon={Add} text="Add Review" onClick={handleAdd} color="primary" sx={{ minWidth: 160, ml: 2 }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ md: 9 }}>
          <CustomGrid columns={columns} data={historyList} maxHeight="400px" minHeight="200px" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(ReviewOfSystem);
