// src/pages/clinicalManagement/patientHistory/FamilyHistory.tsx
import React, { useState, useCallback, useMemo } from "react";
import { Box, Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { OPIPHistFHDto } from "../../../../interfaces/ClinicalManagement/OPIPHistFHDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import { store } from "../../../../store/store";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import HistoryIcon from "@mui/icons-material/History";
import ClearIcon from "@mui/icons-material/Clear";

interface FamilyHistoryProps {
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
  historyList: OPIPHistFHDto[];
  onHistoryChange: (history: OPIPHistFHDto[]) => void;
}

export const FamilyHistory: React.FC<FamilyHistoryProps> = ({ pChartID, opipNo, opipCaseNo, historyList, onHistoryChange }) => {
  const { compID, compCode, compName } = store.getState().userDetails;

  const initialFormState: OPIPHistFHDto = useMemo(
    () => ({
      opipFHID: 0,
      opipNo,
      opvID: 0,
      pChartID,
      opipCaseNo,
      patOpip: "I",
      opipFHDate: new Date(),
      opipFHDesc: "",
      opipFHNotes: "",
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

  const [formState, setFormState] = useState<OPIPHistFHDto>(initialFormState);
  const { setLoading } = useLoading();

  const familyHistoryService = useMemo(() => createEntityService<OPIPHistFHDto>("OPIPHistFH", "clinicalManagementURL"), []);

  const resetForm = useCallback(() => {
    setFormState({
      ...initialFormState,
      opipFHDate: new Date(),
    });
  }, [initialFormState]);

  const handleDelete = useCallback(
    async (item: OPIPHistFHDto) => {
      if (!item) return;

      // Handle unsaved records
      if (item.opipFHID === 0) {
        const updatedList = historyList.filter((history) => history.opipFHDate !== item.opipFHDate || history.opipFHDesc !== item.opipFHDesc);
        onHistoryChange(updatedList);
        return;
      }

      // Handle saved records
      const confirmed = await showAlert("Confirm Delete", "Are you sure you want to delete this family history record?", "warning", true);

      if (confirmed) {
        setLoading(true);
        try {
          await familyHistoryService.updateActiveStatus(item.opipFHID, false);
          const updatedList = historyList.filter((history) => history.opipFHID !== item.opipFHID);
          onHistoryChange(updatedList);
          showAlert("Success", "Family history record deleted successfully", "success");
        } catch (error) {
          console.error("Delete error:", error);
          showAlert("Error", "Failed to delete family history record", "error");
        } finally {
          setLoading(false);
        }
      }
    },
    [historyList, onHistoryChange, familyHistoryService, setLoading]
  );

  const columns: Column<OPIPHistFHDto>[] = useMemo(
    () => [
      {
        key: "opipFHDate",
        header: "Record Date",
        visible: true,
        type: "date",
        width: 120,
        formatter: (value: Date) => new Date(value).toLocaleDateString(),
      },
      {
        key: "opipFHDesc",
        header: "Medical Condition",
        visible: true,
        width: 300,
      },
      {
        key: "opipFHNotes",
        header: "Additional Notes",
        visible: true,
        width: 250,
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 100,
        render: (item: OPIPHistFHDto) => (
          <Tooltip title="Delete Record">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
              size="small"
              color="error"
              aria-label="delete family history"
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
    setFormState((prev) => ({ ...prev, opipFHDate: date || new Date() }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formState.opipFHDesc.trim()) {
      showAlert("Warning", "Please enter the medical condition", "warning");
      return false;
    }
    return true;
  }, [formState.opipFHDesc]);

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
          <FamilyRestroomIcon color="primary" sx={{ mr: 1 }} />
          <MedicalInformationIcon color="primary" sx={{ mr: 1 }} />
          <HistoryIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Family Medical History
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <FormField
            type="datepicker"
            label="Record Date"
            value={formState.opipFHDate}
            onChange={handleDateChange}
            name="opipFHDate"
            ControlID="opipFHDate"
            size="small"
            isMandatory
          />
          <FormField
            type="textarea"
            label="Medical Condition"
            value={formState.opipFHDesc}
            onChange={handleInputChange}
            name="opipFHDesc"
            ControlID="opipFHDesc"
            placeholder="Enter family member's medical condition"
            rows={3}
            isMandatory
          />
          <FormField
            type="textarea"
            label="Additional Notes"
            value={formState.opipFHNotes || ""}
            onChange={handleInputChange}
            name="opipFHNotes"
            ControlID="opipFHNotes"
            placeholder="Enter any additional notes or relevant information"
            rows={3}
          />
          <Grid item md={9}>
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
              <CustomButton variant="contained" icon={Add} text="Add Family History" onClick={handleAdd} color="primary" sx={{ minWidth: 160, ml: 2 }} />
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

export default React.memo(FamilyHistory);
