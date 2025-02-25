import React, { useState, ChangeEvent, useEffect } from "react";
import { Box, Grid, Typography, Button, IconButton, RadioGroup, FormControlLabel, Radio, Grow, Fade, CircularProgress } from "@mui/material";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import FormField from "@/components/FormField/FormField";
import { showAlert } from "@/utils/Common/showAlert";
import { LCompMultipleDto } from "@/interfaces/Laboratory/LInvMastDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";

interface CompMultipleDetailsProps {
  compName: string;
  compOID?: number;
  invID?: number;
  selectedValue?: string;
  onUpdateCompMultiple: (multipleData: LCompMultipleDto) => void;
}

const CompMultipleDetails: React.FC<CompMultipleDetailsProps> = ({ compName, compOID, invID, selectedValue, onUpdateCompMultiple }) => {
  const [multipleSelectionState, setMultipleSelectionState] = useState({
    newValue: "",
    defaultValue: selectedValue || "",
    selectedValue: selectedValue || "",
    valuesList: [] as string[],
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
          const values = componentMultiples.map((v: LCompMultipleDto) => v.cmValues).filter((value: string | undefined): value is string => value !== undefined);
          const defaultValue = componentMultiples.find((v: LCompMultipleDto) => v.defaultYN === "Y")?.cmValues || "";

          setMultipleSelectionState((prev) => ({
            ...prev,
            valuesList: values,
            defaultValue: defaultValue,
            selectedValue: defaultValue,
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
    if (multipleSelectionState.newValue.trim() === "") {
      showAlert("error", "Please enter a valid value", "error");
      return;
    }

    const updatedValues =
      multipleSelectionState.editIndex !== null
        ? multipleSelectionState.valuesList.map((val, idx) => (idx === multipleSelectionState.editIndex ? multipleSelectionState.newValue : val))
        : [...multipleSelectionState.valuesList, multipleSelectionState.newValue];

    setMultipleSelectionState((prev) => ({
      ...prev,
      valuesList: updatedValues,
      newValue: "",
      editIndex: null,
      defaultValue: updatedValues.length === 1 ? multipleSelectionState.newValue : prev.defaultValue,
    }));

    onUpdateCompMultiple({
      cmID: 0,
      cmValues: multipleSelectionState.newValue,
      compOID: compOID || 0,
      defaultYN: updatedValues.length === 1 ? "Y" : "N",
      rActiveYN: "Y",
      compID: 1,
      compCode: "",
      compName: compName,
      transferYN: "N",
      rNotes: "",
      rModifiedID: 0,
      rModifiedBy: "",
      rCreatedID: 0,
      rCreatedBy: "",
      rCreatedOn: new Date(),
      rModifiedOn: new Date(),
    });
  };

  const handleEditValue = (index: number) => {
    setMultipleSelectionState((prev) => ({
      ...prev,
      newValue: prev.valuesList[index],
      editIndex: index,
    }));
  };

  const handleRemoveValue = (index: number) => {
    setMultipleSelectionState((prev) => ({
      ...prev,
      valuesList: prev.valuesList.filter((_, i) => i !== index),
    }));
  };

  const handleSetDefault = (value: string) => {
    setMultipleSelectionState((prev) => ({ ...prev, defaultValue: value }));

    onUpdateCompMultiple({
      cmID: 0,
      cmValues: value,
      compOID: compOID || 0,
      defaultYN: "Y",
      rActiveYN: "Y",
      compID: 1,
      compCode: "",
      compName: compName,
      transferYN: "N",
      rNotes: "",
      rModifiedID: 0,
      rModifiedBy: "",
      rCreatedID: 0,
      rCreatedBy: "",
      rCreatedOn: new Date(),
      rModifiedOn: new Date(),
    });
  };

  return (
    <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: "#f5f5f5", boxShadow: 1 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Selection Type (Alpha Numeric)
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
              {multipleSelectionState.valuesList.map((value, index) => (
                <Grow in key={index} timeout={500}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "white", p: 1, mb: 1, borderRadius: 2, boxShadow: 1 }}>
                    <Typography>{value}</Typography>
                    <Box>
                      <IconButton onClick={() => handleEditValue(index)} size="small" color="primary">
                        <Edit size={18} />
                      </IconButton>
                      <IconButton onClick={() => handleRemoveValue(index)} size="small" color="error">
                        <Trash2 size={18} />
                      </IconButton>
                      <IconButton onClick={() => handleSetDefault(value)} size="small" color="success">
                        <CheckCircle size={18} />
                      </IconButton>
                    </Box>
                  </Box>
                </Grow>
              ))}
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle1">Select a Value:</Typography>
            <Fade in timeout={500}>
              <RadioGroup
                name="selectedValue"
                value={multipleSelectionState.selectedValue}
                onChange={handleMultipleSelectionChange}
                sx={{ display: "flex", flexDirection: "row", gap: 2 }}
              >
                {multipleSelectionState.valuesList.map((value) => (
                  <FormControlLabel key={value} value={value} control={<Radio />} label={value} />
                ))}
              </RadioGroup>
            </Fade>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CompMultipleDetails;
