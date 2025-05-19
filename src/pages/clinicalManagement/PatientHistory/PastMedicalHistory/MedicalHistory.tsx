//src/pages/clinicalManagment/PastMedicalHistory/MedicalHistory
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/FormField/FormField";
import { useLoading } from "@/context/LoadingContext";
import { OPIPHistPMHDto } from "@/interfaces/ClinicalManagement/OPIPHistPMHDto";

import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import { Box, Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import HealingIcon from "@mui/icons-material/Healing";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import ClearIcon from "@mui/icons-material/Clear";

interface PastMedicalHistoryProps {
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
  historyList: OPIPHistPMHDto[];
  onHistoryChange: (history: OPIPHistPMHDto[]) => void;
}

export const MedicalHistory: React.FC<PastMedicalHistoryProps> = ({ pChartID, opipNo, opipCaseNo, historyList, onHistoryChange }) => {
  const [{ compID, compCode, compName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College" });
  const initialFormState: OPIPHistPMHDto = {
    opippmhId: 0,
    opipNo: opipNo,
    opvID: 0,
    pChartID: pChartID,
    opipCaseNo: opipCaseNo,
    patOpip: "I",
    opippmhDate: new Date(),
    opippmhDesc: "",
    opippmhNotes: "",
    oldPChartID: 0,
    rActiveYN: "Y",
    compID: compID ?? 0,
    compCode: compCode ?? "",
    compName: compName ?? "",
    transferYN: "N",
    rNotes: "",
  };

  const [formState, setFormState] = useState<OPIPHistPMHDto>(initialFormState);
  const { setLoading } = useLoading();

  const pastMedicalHistoryService = useMemo(() => createEntityService<OPIPHistPMHDto>("OPIPHistPMH", "clinicalManagementURL"), []);

  const resetForm = useCallback(() => {
    setFormState({
      ...initialFormState,
      opippmhDate: new Date(),
    });
  }, [initialFormState]);

  const handleDelete = useCallback(
    async (item: OPIPHistPMHDto) => {
      if (!item) return;

      // Handle unsaved records
      if (item.opippmhId === 0) {
        const updatedList = historyList.filter((history) => history.opippmhDate !== item.opippmhDate || history.opippmhDesc !== item.opippmhDesc);
        onHistoryChange(updatedList);
        return;
      }

      // Handle saved records
      const confirmed = await showAlert("Confirm Delete", "Are you sure you want to delete this medical history record?", "warning", true);

      if (confirmed) {
        setLoading(true);
        try {
          await pastMedicalHistoryService.updateActiveStatus(item.opippmhId, false);
          const updatedList = historyList.filter((history) => history.opippmhId !== item.opippmhId);
          onHistoryChange(updatedList);
          showAlert("Success", "Medical history record deleted successfully", "success");
        } catch (error) {
          console.error("Delete error:", error);
          showAlert("Error", "Failed to delete medical history record", "error");
        } finally {
          setLoading(false);
        }
      }
    },
    [historyList, onHistoryChange, pastMedicalHistoryService, setLoading]
  );

  const columns: Column<OPIPHistPMHDto>[] = useMemo(
    () => [
      {
        key: "opippmhDate",
        header: "Date",
        visible: true,
        type: "date",
        width: 120,
        formatter: (value: Date) => new Date(value).toLocaleDateString(),
      },
      {
        key: "opippmhDesc",
        header: "Medical Condition",
        visible: true,
        width: 300,
      },
      {
        key: "opippmhNotes",
        header: "Additional Notes",
        visible: true,
        width: 250,
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 100,
        render: (item: OPIPHistPMHDto) => (
          <Tooltip title="Delete Record">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
              size="small"
              color="error"
              aria-label="delete medical history"
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
    setFormState((prev) => ({ ...prev, opippmhDate: date || new Date() }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formState.opippmhDesc.trim()) {
      showAlert("Warning", "Please enter the medical condition", "warning");
      return false;
    }
    return true;
  }, [formState.opippmhDesc]);

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
          {/* <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
          <HealthAndSafetyIcon color="primary" sx={{ mr: 1 }} />
          <MedicationIcon color="primary" sx={{ mr: 1 }} /> */}
          <HealingIcon color="primary" sx={{ mr: 1 }} />
          <MonitorHeartIcon color="primary" sx={{ mr: 1 }} />
          <MedicalInformationIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Past Medical History
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <FormField type="datepicker" label="Date" value={formState.opippmhDate} onChange={handleDateChange} name="opippmhDate" ControlID="opippmhDate" size="small" isMandatory />
          <FormField
            type="textarea"
            label="Medical Condition"
            value={formState.opippmhDesc}
            onChange={handleInputChange}
            name="opippmhDesc"
            ControlID="opippmhDesc"
            placeholder="Enter medical condition details"
            rows={3}
            isMandatory
          />
          <FormField
            type="textarea"
            label="Additional Notes"
            value={formState.opippmhNotes || ""}
            onChange={handleInputChange}
            name="opippmhNotes"
            ControlID="opippmhNotes"
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
              <CustomButton
                variant="contained"
                icon={Add}
                text="Add Medical History"
                onClick={handleAdd}
                color="primary"
                sx={{
                  minWidth: 160,
                  ml: 2,
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
        <Grid size={{ md: 9 }}>
          <CustomGrid columns={columns} data={historyList} maxHeight="400px" minHeight="200px" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(MedicalHistory);
