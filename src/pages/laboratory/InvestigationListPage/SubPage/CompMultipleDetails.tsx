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
  compoID?: number; // the unique ID for the component; must be updated with the new value from the backend
  invID?: number;
  onUpdateCompMultiple: (multipleData: LCompMultipleDto) => void;
  indexID: number; // <-- ADD THIS
  selectedValue: string;
  formComp: LCompMultipleDto;
  setFormComp: Dispatch<SetStateAction<LCompMultipleDto>>;
  existingChoices?: LCompMultipleDto[];
  onMultipleListChange?: (list: LCompMultipleDto[]) => void;
}

const CompMultipleDetails: React.FC<CompMultipleDetailsProps> = ({ setFormComp, compoID, invID, onUpdateCompMultiple, existingChoices, onMultipleListChange, indexID }) => {
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

  // Initialize the multiple-choice values state.
  useEffect(() => {
    const initialize = async () => {
      if (existingChoices?.length) {
        const filtered = existingChoices.filter((ec) => ec.rActiveYN !== "N");
        // Map each choice while retaining its unique cmID.
        const mapped = filtered.map((ec) => ({
          cmID: ec.cmID,
          value: ec.cmValues || "",
          invID: ec.invID,
        }));
        setMultipleState((prev) => ({ ...prev, valuesList: mapped }));
        triggerSync(mapped);
      } else {
        await fetchServerChoices();
      }
    };
    initialize();
  }, [existingChoices]);

  // Fetch the multiple-choice values from the server,
  // filtering on compOID (the field linking a multiple-choice record to its component)
  const fetchServerChoices = useCallback(async () => {
    if (!invID || !compoID) return;
    setIsLoading(true);
    try {
      const response = await investigationlistService.getById(invID);
      if (response.success && response.data) {
        const data = response.data.lCompMultipleDtos || [];
        const relevant = data.filter((d: LCompMultipleDto) => d.compOID === compoID && d.rActiveYN !== "N");
        const mapped = relevant.map((item: LCompMultipleDto) => ({
          cmID: item.cmID,
          value: item.cmValues || "",
          invID: item.invID,
        }));
        setMultipleState((prev) => ({ ...prev, valuesList: mapped }));
        triggerSync(mapped);
      }
    } catch {
      showAlert("error", "Failed to load multiple choice values", "error");
    } finally {
      setIsLoading(false);
    }
  }, [invID, compoID]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMultipleState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Syncs the local values to the parent component,
  // ensuring each item keeps its unique cmID and the correct compoID is used.
  const triggerSync = (list: MultipleValue[]) => {
    if (!onMultipleListChange) return;
    const finalList: LCompMultipleDto[] = list.map((item) => ({
      cmID: item.cmID,
      cmValues: item.value,
      compoID: compoID || 0,
      invID,
      indexID, // <-- PASS THE CORRECT INDEX ID
      rActiveYN: "Y",
      transferYN: "N",
      rModifiedOn: new Date(),
    }));
    onMultipleListChange(finalList);
  };

  const handleAddValue = () => {
    const { newValue, editIndex, valuesList } = multipleState;
    if (!newValue.trim()) {
      showAlert("warning", "Please enter a valid value.", "warning");
      return;
    }

    const isEdit = editIndex !== null && editIndex >= 0;
    let updatedValues = [...valuesList];
    let currentCMID = 0;

    if (isEdit) {
      // When editing, retain the existing cmID.
      currentCMID = valuesList[editIndex!].cmID;
      updatedValues[editIndex!] = { ...valuesList[editIndex!], value: newValue.trim() };
    } else {
      // For a new record, set cmID to 0 so the backend generates a new unique id.
      updatedValues.push({ cmID: 0, value: newValue.trim(), invID });
    }

    const finalItem: LCompMultipleDto = {
      cmID: currentCMID, // 0 for new records or existing id for edits.
      compoID: compoID || 0,
      invID,
      cmValues: newValue.trim(),
      indexID, // <-- ADD HERE TOO
      rActiveYN: "Y",
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

    triggerSync(updatedValues);
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
      // Mark the record as inactive.
      onUpdateCompMultiple({
        cmID: item.cmID,
        cmValues: item.value,
        compoID: compoID || 0,
        invID,
        rActiveYN: "N",
        transferYN: "N",
      });
    }

    const newList = multipleState.valuesList.filter((_, i) => i !== idx);
    setMultipleState((prev) => ({
      ...prev,
      valuesList: newList,
    }));

    triggerSync(newList);
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
          <Grid size={{ xs: 12, md: 6 }}>
            <FormField type="text" label="New Value" name="newValue" value={newValue} onChange={handleChange} ControlID="newValue" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomButton variant="contained" color="primary" onClick={handleAddValue} sx={{ mt: 1 }}>
              {editIndex !== null ? "Update Value" : "Add Value"}
            </CustomButton>
          </Grid>

          {valuesList.length > 0 && (
            <Grid size={{ xs: 12 }}>
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
                      p: 1,
                      mb: 1,
                      borderRadius: 2,
                      boxShadow: 10,
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
