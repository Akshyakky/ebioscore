//src/pages/clinicalManagement/patientHistory/SurgicalHistory.tsx
import React, { useState, useCallback, useMemo } from "react";
import { Box, Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { OPIPHistPSHDto } from "../../../../interfaces/ClinicalManagement/OPIPHistPSHDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { useLoading } from "../../../../context/LoadingContext";
import { showAlert } from "../../../../utils/Common/showAlert";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import SurgeryIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import HealingIcon from "@mui/icons-material/Healing";
import ClearIcon from "@mui/icons-material/Clear";

interface SurgicalHistoryProps {
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
  historyList: OPIPHistPSHDto[];
  onHistoryChange: (history: OPIPHistPSHDto[]) => void;
}

export const SurgicalHistory: React.FC<SurgicalHistoryProps> = ({ pChartID, opipNo, opipCaseNo, historyList, onHistoryChange }) => {
  const [{ compID, compCode, compName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College" });
  const initialFormState: OPIPHistPSHDto = {
    opipPshID: 0,
    opipNo: opipNo,
    opvID: 0,
    pChartID: pChartID,
    opipCaseNo: opipCaseNo,
    patOpip: "I",
    opipPshDate: new Date(),
    opipPshDesc: "",
    opipPshNotes: "",
    oldPChartID: 0,
    rActiveYN: "Y",
    compID: compID ?? 0,
    compCode: compCode ?? "",
    compName: compName ?? "",
    transferYN: "N",
    rNotes: "",
  };

  const [formState, setFormState] = useState<OPIPHistPSHDto>(initialFormState);
  const { setLoading } = useLoading();

  const surgicalHistoryService = useMemo(() => createEntityService<OPIPHistPSHDto>("OPIPHistPSH", "clinicalManagementURL"), []);

  const resetForm = useCallback(() => {
    setFormState({
      ...initialFormState,
      opipPshDate: new Date(),
    });
  }, [initialFormState]);

  const handleDelete = useCallback(
    async (item: OPIPHistPSHDto) => {
      if (!item) return;

      // Handle unsaved records
      if (item.opipPshID === 0) {
        const updatedList = historyList.filter((history) => history.opipPshDate !== item.opipPshDate || history.opipPshDesc !== item.opipPshDesc);
        onHistoryChange(updatedList);
        return;
      }

      // Handle saved records
      const confirmed = await showAlert("Confirm Delete", "Are you sure you want to delete this surgical history record?", "warning", true);

      if (confirmed) {
        setLoading(true);
        try {
          await surgicalHistoryService.updateActiveStatus(item.opipPshID, false);
          const updatedList = historyList.filter((history) => history.opipPshID !== item.opipPshID);
          onHistoryChange(updatedList);
          showAlert("Success", "Surgical history record deleted successfully", "success");
        } catch (error) {
          console.error("Delete error:", error);
          showAlert("Error", "Failed to delete surgical history record", "error");
        } finally {
          setLoading(false);
        }
      }
    },
    [historyList, onHistoryChange, surgicalHistoryService, setLoading]
  );

  const columns: Column<OPIPHistPSHDto>[] = useMemo(
    () => [
      {
        key: "opipPshDate",
        header: "Surgery Date",
        visible: true,
        type: "date",
        width: 120,
        formatter: (value: Date) => new Date(value).toLocaleDateString(),
      },
      {
        key: "opipPshDesc",
        header: "Surgery Details",
        visible: true,
        width: 300,
      },
      {
        key: "opipPshNotes",
        header: "Additional Notes",
        visible: true,
        width: 250,
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 100,
        render: (item: OPIPHistPSHDto) => (
          <Tooltip title="Delete Record">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
              size="small"
              color="error"
              aria-label="delete surgical history"
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
    setFormState((prev) => ({ ...prev, opipPshDate: date || new Date() }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formState.opipPshDesc.trim()) {
      showAlert("Warning", "Please enter the surgery details", "warning");
      return false;
    }
    return true;
  }, [formState.opipPshDesc]);

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
          <SurgeryIcon color="primary" sx={{ mr: 1 }} />
          <MedicalServicesIcon color="primary" sx={{ mr: 1 }} />
          <HealingIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Past Surgical History
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <FormField
            type="datepicker"
            label="Surgery Date"
            value={formState.opipPshDate}
            onChange={handleDateChange}
            name="opipPshDate"
            ControlID="opipPshDate"
            size="small"
            isMandatory
          />
          <FormField
            type="textarea"
            label="Surgery Details"
            value={formState.opipPshDesc}
            onChange={handleInputChange}
            name="opipPshDesc"
            ControlID="opipPshDesc"
            placeholder="Enter surgery details"
            rows={3}
            isMandatory
          />
          <FormField
            type="textarea"
            label="Additional Notes"
            value={formState.opipPshNotes || ""}
            onChange={handleInputChange}
            name="opipPshNotes"
            ControlID="opipPshNotes"
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
              <CustomButton variant="contained" icon={Add} text="Add Surgical History" onClick={handleAdd} color="primary" sx={{ minWidth: 160, ml: 2 }} />
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

export default React.memo(SurgicalHistory);
