import React, { useState, useCallback, useEffect } from "react";
import { Box, Grid, Paper } from "@mui/material";
import FormField from "../../../../components/FormField/FormField";
import CustomGrid, { Column } from "../../../../components/CustomGrid/CustomGrid";
import CustomButton from "../../../../components/Button/CustomButton";
import { OPIPHistFHDto } from "../../../../interfaces/ClinicalManagement/OPIPHistFHDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { useLoading } from "../../../../context/LoadingContext";
import Add from "@mui/icons-material/Add";
import { showAlert } from "./../../../../utils/Common/showAlert";

export const FamilyHistory: React.FC<{
  pChartID: number;
  opipNo: number;
  opipCaseNo: number;
}> = ({ pChartID, opipNo, opipCaseNo }) => {
  const [formState, setFormState] = useState<OPIPHistFHDto>({
    opipFHID: 0,
    opipNo,
    opvID: 0,
    pChartID,
    opipCaseNo,
    patOpip: "OP",
    opipFHDate: new Date(),
    opipFHDesc: "",
    opipFHNotes: "",
    oldPChartID: 0,
    rActiveYN: "Y",
  });
  const [historyList, setHistoryList] = useState<OPIPHistFHDto[]>([]);
  const { setLoading } = useLoading();
  const opipHistFHService = createEntityService<OPIPHistFHDto>("OPIPHistFH", "clinicalManagementURL");

  const columns: Column<OPIPHistFHDto>[] = [
    { key: "opipFHDate", header: "Date", visible: true, type: "date" },
    { key: "opipFHDesc", header: "Description", visible: true },
    { key: "opipFHNotes", header: "Notes", visible: true },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await opipHistFHService.find(`pChartID=${pChartID} AND opipNo=${opipNo} AND opipCaseNo=${opipCaseNo}`);
        if (response.data) {
          setHistoryList(response.data);
        }
      } catch (error) {
        showAlert("Error", "Failed to fetch family history", "error");
      } finally {
        setLoading(false);
      }
    };

    if (pChartID && opipNo && opipCaseNo) {
      fetchHistory();
    }
  }, [pChartID, opipNo, opipCaseNo]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleTextAreaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date: Date | null) => {
    setFormState((prev) => ({ ...prev, opipFHDate: date || new Date() }));
  }, []);

  const handleAdd = async () => {
    if (!formState.opipFHDesc) {
      showAlert("Warning", "Please enter description", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await opipHistFHService.save(formState);
      if (response.data) {
        setHistoryList((prev) => [...prev, response.data]);
        setFormState((prev) => ({
          ...prev,
          opipFHID: 0,
          opipFHDate: new Date(),
          opipFHDesc: "",
          opipFHNotes: "",
        }));
        showAlert("Success", "Family history added successfully", "success");
      }
    } catch (error) {
      showAlert("Error", "Failed to save family history", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <FormField type="datepicker" label="Date" value={formState.opipFHDate} onChange={handleDateChange} name="opipFHDate" ControlID="opipFHDate" size="small" isMandatory />
          <FormField type="text" label="Description" value={formState.opipFHDesc} onChange={handleInputChange} name="opipFHDesc" ControlID="opipFHDesc" size="small" isMandatory />
          <FormField type="textarea" label="Notes" value={formState.opipFHNotes || ""} onChange={handleTextAreaChange} name="opipFHNotes" ControlID="opipFHNotes" rows={3} />
          <Box
            sx={{
              mt: 2,
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <CustomButton variant="contained" icon={Add} text="Add" onClick={handleAdd} />
          </Box>
        </Grid>
      </Paper>
      <CustomGrid columns={columns} data={historyList} pagination maxHeight="400px" />
    </Box>
  );
};
