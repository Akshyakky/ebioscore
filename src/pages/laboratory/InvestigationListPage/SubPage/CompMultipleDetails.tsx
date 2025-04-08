import React, { useState, useEffect, useCallback, ChangeEvent, Dispatch, SetStateAction } from "react";
import { Box, Grid, Typography, IconButton, CircularProgress, Grow } from "@mui/material";
import { Edit, Trash2 } from "lucide-react";
import FormField from "@/components/FormField/FormField";
import { showAlert } from "@/utils/Common/showAlert";
import { LCompMultipleDto } from "@/interfaces/Laboratory/LInvMastDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import CustomButton from "@/components/Button/CustomButton";

interface MultipleValue {
  cmID: number;
  value: string;
  invID?: number;
}

interface CompMultipleDetailsProps {
  compName: string;
  compoID?: number;
  invID?: number;
  compID?: number;
  compCode?: string;
  onUpdateCompMultiple: (multipleData: LCompMultipleDto) => void;
  selectedValue: string;
  formComp: LCompMultipleDto;
  setFormComp: Dispatch<SetStateAction<LCompMultipleDto>>;
  existingChoices?: LCompMultipleDto[];
}

const CompMultipleDetails: React.FC<CompMultipleDetailsProps> = ({ setFormComp, compName, compoID, invID, compID, compCode, onUpdateCompMultiple, existingChoices }) => {
  const [multipleState, setMultipleState] = useState<{
    newValue: string;
    valuesList: MultipleValue[];
    editIndex: number | null;
  }>({
    newValue: "",
    valuesList: [],
    editIndex: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingChoices?.length) {
      const filtered = existingChoices.filter((ec) => ec.rActiveYN !== "N");
      const mapped = filtered.map((ec) => ({
        cmID: ec.cmID,
        value: ec.cmValues || "",
        invID: ec.invID,
      }));
      setMultipleState((prev) => ({ ...prev, valuesList: mapped }));
    }
  }, [existingChoices]);

  const fetchServerChoices = useCallback(async () => {
    if (!invID || !compoID) return;
    setIsLoading(true);
    try {
      const response = await investigationlistService.getById(invID);
      if (response.success && response.data) {
        const data = response.data.lCompMultipleDtos || [];
        const relevant = data.filter((d: LCompMultipleDto) => d.compoID === compoID && d.rActiveYN !== "N");
        const mapped = relevant.map((item: LCompMultipleDto) => ({
          cmID: item.cmID,
          value: item.cmValues || "",
          invID: item.invID,
        }));
        setMultipleState((prev) => ({ ...prev, valuesList: mapped }));
      }
    } catch (err) {
      showAlert("error", "Failed to load multiple choice values", "error");
    } finally {
      setIsLoading(false);
    }
  }, [invID, compoID]);

  useEffect(() => {
    fetchServerChoices();
  }, [fetchServerChoices]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMultipleState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddValue = () => {
    const { newValue, editIndex, valuesList } = multipleState;
    if (!newValue.trim()) {
      showAlert("warning", "Please enter a valid value.", "warning");
      return;
    }
    const isEdit = editIndex !== null && editIndex >= 0;
    const existingItem = isEdit ? valuesList[editIndex] : null;
    let updatedValues = [...valuesList];
    let newMCID = 0;
    if (isEdit && existingItem) {
      updatedValues = valuesList.map((item, idx) => (idx === editIndex ? { ...item, value: newValue.trim() } : item));
      newMCID = existingItem.cmID;
    } else {
      updatedValues.push({ cmID: 0, value: newValue.trim(), invID });
    }
    const finalItem = {
      cmID: newMCID,
      compoID: compoID || 0,
      invID,
      cmValues: newValue.trim(),
      rActiveYN: "Y",
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName,
      transferYN: "N",
      rModifiedOn: new Date(),
    };
    onUpdateCompMultiple(finalItem);
    setFormComp(finalItem);
    setMultipleState({
      newValue: "",
      valuesList: updatedValues,
      editIndex: null,
    });
  };

  const handleEditValue = (idx: number) => {
    const item = multipleState.valuesList[idx];
    setMultipleState((prev) => ({
      ...prev,
      newValue: item.value,
      editIndex: idx,
    }));
  };

  const handleRemoveValue = (idx: number) => {
    const item = multipleState.valuesList[idx];
    if (item.cmID !== 0) {
      onUpdateCompMultiple({
        cmID: item.cmID,
        cmValues: item.value,
        compoID: compoID || 0,
        invID,
        rActiveYN: "N",
        compID: compID || 0,
        compCode: compCode || "",
        compName: compName,
        transferYN: "N",
      });
    }
    setMultipleState((prev) => ({
      ...prev,
      valuesList: prev.valuesList.filter((_, i) => i !== idx),
    }));
  };

  const { newValue, valuesList, editIndex } = multipleState;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Multiple Values
      </Typography>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormField type="text" label="New Value" name="newValue" value={newValue} onChange={handleChange} ControlID="newValue" />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomButton variant="contained" color="primary" onClick={handleAddValue} sx={{ mt: 1 }}>
              {editIndex !== null ? "Update Value" : "Add Value"}
            </CustomButton>
          </Grid>
          {valuesList.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Saved Values:
              </Typography>
              {valuesList.map((item, idx) => (
                <Grow in key={idx} timeout={400}>
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
                    <Typography variant="body2">{item.value}</Typography>
                    <Box>
                      <IconButton size="small" color="primary" onClick={() => handleEditValue(idx)}>
                        <Edit size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleRemoveValue(idx)}>
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
