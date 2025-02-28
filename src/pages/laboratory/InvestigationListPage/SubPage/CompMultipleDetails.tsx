import React, { useState, ChangeEvent, useEffect, useCallback } from "react";
import { Box, Grid, Typography, Button, IconButton, Grow, CircularProgress } from "@mui/material";
import { Edit, Trash2 } from "lucide-react";
import FormField from "@/components/FormField/FormField";
import { showAlert } from "@/utils/Common/showAlert";
import { LCompMultipleDto } from "@/interfaces/Laboratory/LInvMastDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";

interface CompMultipleDetailsProps {
  compName: string;
  compOID?: number;
  invID?: number;
  compID?: number;
  compCode?: string;
  onUpdateCompMultiple: (multipleData: LCompMultipleDto) => void;
}

interface MultipleValue {
  cmID: number;
  value: string;
  invID?: number;
}

const CompMultipleDetails: React.FC<CompMultipleDetailsProps> = ({ compName, compOID, invID, compID, compCode, onUpdateCompMultiple }) => {
  const [multipleSelectionState, setMultipleSelectionState] = useState({
    newValue: "",
    valuesList: [] as MultipleValue[],
    editIndex: null as number | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchMultipleChoiceValues = async () => {
    if (!invID || !compOID) return;
    setIsLoading(true);
    try {
      const response = await investigationlistService.getById(invID);
      if (response.success && response.data) {
        const componentMultiples = response.data.lCompMultipleDtos?.filter((multiple: LCompMultipleDto) => multiple.compOID === compOID && multiple.rActiveYN === "Y");
        if (componentMultiples?.length > 0) {
          const values = componentMultiples.map((v: LCompMultipleDto) => ({
            cmID: v.cmID,
            value: v.cmValues || "",
            invID: v.invID,
          }));
          setMultipleSelectionState((prev) => ({
            ...prev,
            valuesList: values,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching multiple choice values:", error);
      showAlert("error", "Failed to load multiple choice values", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMultipleChoiceValues();
  }, [compOID, invID]);

  const handleMultipleSelectionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setMultipleSelectionState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddValue = () => {
    debugger;
    if (multipleSelectionState.newValue.trim() === "") {
      showAlert("error", "Please enter a valid value", "error");
      return;
    }

    const editIndex = multipleSelectionState.editIndex ?? -1;
    const existingValue = editIndex >= 0 ? multipleSelectionState.valuesList[editIndex] : null;

    const updateData: LCompMultipleDto = {
      cmID: existingValue?.cmID || 0,
      cmValues: multipleSelectionState.newValue,
      compOID: compOID || 0,
      invID: invID,
      rActiveYN: "Y",
      compID: compID || 1,
      compCode: compCode || "",
      compName: compName,
      transferYN: "N",
      rModifiedOn: new Date(),
      rCreatedOn: existingValue?.cmID ? undefined : new Date(),
    };

    setMultipleSelectionState((prev) => ({
      ...prev,
      valuesList:
        editIndex >= 0
          ? prev.valuesList.map((val, idx) => (idx === editIndex ? { ...val, value: multipleSelectionState.newValue } : val))
          : [...prev.valuesList, { cmID: updateData.cmID, value: multipleSelectionState.newValue, invID }],
      newValue: "",
      editIndex: null,
    }));

    onUpdateCompMultiple(updateData);
  };

  const handleEditValue = (index: number) => {
    debugger;
    const valueToEdit = multipleSelectionState.valuesList[index];
    setMultipleSelectionState((prev) => ({
      ...prev,
      newValue: valueToEdit.value,
      editIndex: index,
    }));
  };

  const handleRemoveValue = (index: number) => {
    const valueToRemove = multipleSelectionState.valuesList[index];
    if (valueToRemove.cmID !== 0) {
      onUpdateCompMultiple({
        cmID: valueToRemove.cmID,
        cmValues: valueToRemove.value,
        compOID: compOID || 0,
        invID: invID,
        rActiveYN: "N",
        compID: 1,
        compCode: "",
        compName: compName,
        transferYN: "N",
        rNotes: "",
      });
    }

    setMultipleSelectionState((prev) => ({
      ...prev,
      valuesList: prev.valuesList.filter((_, i) => i !== index),
    }));
  };

  return (
    <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: "#f5f5f5", boxShadow: 1 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Multiple Values
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormField type="text" label="New Value" name="newValue" value={multipleSelectionState.newValue} onChange={handleMultipleSelectionChange} ControlID="newValue" />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button variant="contained" color="primary" onClick={handleAddValue} sx={{ mt: 1 }}>
              {multipleSelectionState.editIndex !== null ? "Update Value" : "Add Value"}
            </Button>
          </Grid>

          {multipleSelectionState.valuesList.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">Saved Values:</Typography>
              {multipleSelectionState.valuesList.map((item, index) => (
                <Grow in key={index} timeout={500}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "white",
                      p: 1,
                      mb: 1,
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Typography>{item.value}</Typography>
                    <Box>
                      <IconButton onClick={() => handleEditValue(index)} size="small" color="primary">
                        <Edit size={18} />
                      </IconButton>
                      <IconButton onClick={() => handleRemoveValue(index)} size="small" color="error">
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </Box>
                </Grow>
              ))}
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default CompMultipleDetails;
