import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import FormField from "@/components/FormField/FormField";
import { useLoading } from "@/context/LoadingContext";
import useDropdownChange from "@/hooks/useDropdownChange";
import { OTProcedureListDto } from "@/interfaces/ClinicalManagement/ProcedureListDto";
import { useAppSelector } from "@/store/hooks";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

interface ProcedureListDetailsProps {
  selectedData?: OTProcedureListDto;
}
const ProcedureListDetails: React.FC<ProcedureListDetailsProps> = ({ selectedData }) => {
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [formState, setFormState] = useState<OTProcedureListDto>(() => ({
    procedureID: 0,
    procedureName: "",
    procedureNameLong: "",
    procedureCode: "",
    chargeID: 0,
    procType: "",
    rActiveYN: "Y",
    compID: compID ?? 0,
    compCode: compCode ?? "",
    compName: compName ?? "",
    rNotes: "",
    transferYN: "N",
  }));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { setLoading } = useLoading();
  const { handleDropdownChange } = useDropdownChange(setFormState);

  const procedureDetailService = useMemo(() => createEntityService<OTProcedureListDto>("ProcedureList", "clinicalManagementURL"), []);

  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await procedureDetailService.getNextCode("PROC", 5);
      setFormState({
        procedureID: 0,
        procedureName: "",
        procedureCode: nextCode.data,
        procedureNameLong: "",
        chargeID: 0,
        procType: "",
        icddNameGreek: "",
        rActiveYN: "Y",
        compID: compID || 0,
        compCode: compCode || "",
        compName: compName || "",
        rNotes: "",
        transferYN: "N",
      });
      setIsSubmitted(false);
      setIsEditing(false);
    } catch (error) {
      showAlert("Error", "Failed to fetch the next Procedure Code.", "error");
    } finally {
      setLoading(false);
    }
  }, [compID, compCode, compName, procedureDetailService]);

  useEffect(() => {
    if (selectedData) {
      setFormState(selectedData);
      setIsEditing(true);
    } else {
      handleClear();
    }
  }, [selectedData, handleClear]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    if (!formState.procedureCode || !formState.procedureName) {
      showAlert("Error", "Procedure Code and Name are mandatory.", "error");
      return;
    }

    setLoading(true);

    try {
      await procedureDetailService.save(formState);
      showAlert("Success", `Procedure Detail ${isEditing ? "updated" : "saved"} successfully!`, "success", {
        onConfirm: handleClear,
      });
    } catch (error) {
      showAlert("Error", `An unexpected error occurred while ${isEditing ? "updating" : "saving"}.`, "error");
    } finally {
      setLoading(false);
    }
  }, [formState, handleClear, procedureDetailService, isEditing]);

  const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      rActiveYN: event.target.checked ? "Y" : "N",
    }));
  }, []);

  const handleCustomToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      icddCustYN: event.target.checked ? "Y" : "N",
    }));
  }, []);

  const radioOptions = useMemo(
    () => [
      { value: "HOSP", label: "Hospital" },
      { value: "DR", label: "Doctor" },
    ],
    []
  );

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="procedure-details-header">
        PROCEDURE DETAILS
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Procedure Code"
          value={formState.procedureCode}
          onChange={handleInputChange}
          name="procedureCode"
          ControlID="procCode"
          placeholder="Enter Procedure code"
          isMandatory={true}
          size="small"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Procedure Name"
          value={formState.procedureName}
          onChange={handleInputChange}
          name="procedureName"
          ControlID="procName"
          placeholder="Enter Procedure name"
          isMandatory={true}
          size="small"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Procedure Long Name"
          value={formState.procedureNameLong}
          onChange={handleInputChange}
          name="procedureNameLong"
          ControlID="procLongName"
          placeholder="Enter Procedure Long Name"
          size="small"
        />
        <FormField
          type="select"
          label="Procedure Type"
          name="procType"
          ControlID="procType"
          value={formState.procType}
          options={radioOptions}
          size="small"
          isMandatory={true}
          onChange={handleDropdownChange(["procType"], [""], radioOptions)}
          isSubmitted={isSubmitted}
        />
        <FormField
          type="textarea"
          label="Notes"
          value={formState.rNotes || ""}
          onChange={handleInputChange}
          name="rNotes"
          ControlID="rNotes"
          placeholder="Notes"
          maxLength={4000}
        />
        <FormField
          type="switch"
          label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
          value={formState.rActiveYN}
          checked={formState.rActiveYN === "Y"}
          onChange={handleActiveToggle}
          name="rActiveYN"
          ControlID="rActiveYN"
          size="medium"
        />
      </Grid>

      <FormSaveClearButton clearText="Clear" saveText={isEditing ? "Update" : "Save"} onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default React.memo(ProcedureListDetails);
