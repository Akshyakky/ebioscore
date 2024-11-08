// src/pages/clinicalManagement/patientHistory/SocialHistory.tsx
import React, { useState, useCallback, useMemo } from "react";
import { Box, Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { OPIPHistSHDto } from "../../../../interfaces/ClinicalManagement/OPIPHistSHDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import { store } from "../../../../store/store";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import LifestyleIcon from "@mui/icons-material/Accessibility";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import ClearIcon from "@mui/icons-material/Clear";

interface SocialHistoryProps {
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
  historyList: OPIPHistSHDto[];
  onHistoryChange: (history: OPIPHistSHDto[]) => void;
}

export const SocialHistory: React.FC<SocialHistoryProps> = ({ pChartID, opipNo, opipCaseNo, historyList, onHistoryChange }) => {
  const { compID, compCode, compName } = store.getState().userDetails;

  const initialFormState: OPIPHistSHDto = useMemo(
    () => ({
      opipSHID: 0,
      opipNo,
      opvID: 0,
      pChartID,
      opipCaseNo,
      patOpip: "I",
      opipSHDate: new Date(),
      opipSHDesc: "",
      opipSHNotes: "",
      oldPChartID: 0,
      rActiveYN: "Y",
      compID: compID ?? 0,
      compCode: compCode ?? "",
      compName: compName ?? "",
      transferYN: "N",
      rNotes: "",
    }),
    [pChartID, opipNo, opipCaseNo, compID, compCode, compName]
  );

  const [formState, setFormState] = useState<OPIPHistSHDto>(initialFormState);
  const { setLoading } = useLoading();

  const socialHistoryService = useMemo(() => createEntityService<OPIPHistSHDto>("OPIPHistSH", "clinicalManagementURL"), []);

  const resetForm = useCallback(() => {
    setFormState({
      ...initialFormState,
      opipSHDate: new Date(),
    });
  }, [initialFormState]);

  const handleDelete = useCallback(
    async (item: OPIPHistSHDto) => {
      if (!item) return;

      // Handle unsaved records
      if (item.opipSHID === 0) {
        const updatedList = historyList.filter((history) => history.opipSHDate !== item.opipSHDate || history.opipSHDesc !== item.opipSHDesc);
        onHistoryChange(updatedList);
        return;
      }

      // Handle saved records
      const confirmed = await showAlert("Confirm Delete", "Are you sure you want to delete this social history record?", "warning", true);

      if (confirmed) {
        setLoading(true);
        try {
          await socialHistoryService.updateActiveStatus(item.opipSHID, false);
          const updatedList = historyList.filter((history) => history.opipSHID !== item.opipSHID);
          onHistoryChange(updatedList);
          showAlert("Success", "Social history record deleted successfully", "success");
        } catch (error) {
          console.error("Delete error:", error);
          showAlert("Error", "Failed to delete social history record", "error");
        } finally {
          setLoading(false);
        }
      }
    },
    [historyList, onHistoryChange, socialHistoryService, setLoading]
  );

  const columns: Column<OPIPHistSHDto>[] = useMemo(
    () => [
      {
        key: "opipSHDate",
        header: "Record Date",
        visible: true,
        type: "date",
        width: 120,
        formatter: (value: Date) => new Date(value).toLocaleDateString(),
      },
      {
        key: "opipSHDesc",
        header: "Lifestyle Factor",
        visible: true,
        width: 300,
      },
      {
        key: "opipSHNotes",
        header: "Additional Notes",
        visible: true,
        width: 250,
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 100,
        render: (item: OPIPHistSHDto) => (
          <Tooltip title="Delete Record">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
              size="small"
              color="error"
              aria-label="delete social history"
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
    setFormState((prev) => ({ ...prev, opipSHDate: date || new Date() }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formState.opipSHDesc.trim()) {
      showAlert("Warning", "Please enter the lifestyle factor or social habit", "warning");
      return false;
    }
    return true;
  }, [formState.opipSHDesc]);

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
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <GroupIcon color="primary" sx={{ mr: 1 }} />
          <LifestyleIcon color="primary" sx={{ mr: 1 }} />
          <HealthAndSafetyIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Social & Lifestyle History
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <FormField
            type="datepicker"
            label="Record Date"
            value={formState.opipSHDate}
            onChange={handleDateChange}
            name="opipSHDate"
            ControlID="opipSHDate"
            size="small"
            isMandatory
          />
          <FormField
            type="textarea"
            label="Lifestyle Factor"
            value={formState.opipSHDesc}
            onChange={handleInputChange}
            name="opipSHDesc"
            ControlID="opipSHDesc"
            placeholder="Enter lifestyle factors (e.g., smoking, alcohol, exercise habits)"
            rows={3}
            isMandatory
          />
          <FormField
            type="textarea"
            label="Additional Notes"
            value={formState.opipSHNotes || ""}
            onChange={handleInputChange}
            name="opipSHNotes"
            ControlID="opipSHNotes"
            placeholder="Enter frequency, duration, or other relevant details"
            rows={3}
          />
          <Grid item md={9}>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
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
              <CustomButton
                variant="contained"
                icon={Add}
                text="Add Social History"
                onClick={handleAdd}
                color="primary"
                sx={{
                  minWidth: 160,
                  boxShadow: 2,
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        <Grid item md={9}>
          <CustomGrid columns={columns} data={historyList} maxHeight="400px" minHeight="200px" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(SocialHistory);
