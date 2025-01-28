// src/pages/inventoryManagement/MedicationListPage/SubPage/MedicationListDetails.tsx
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import FormField from "@/components/FormField/FormField";
import { useLoading } from "@/context/LoadingContext";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import useDropdownChange from "@/hooks/useDropdownChange";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import { useAppSelector } from "@/store/hooks";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

interface MedicationListDetailsProps {
  selectedData?: MedicationListDto;
}

const MedicationListDetails: React.FC<MedicationListDetailsProps> = ({ selectedData }) => {
  const { compID, compCode, compName } = useAppSelector((state) => state.auth);
  const [formState, setFormState] = useState<MedicationListDto>({
    mlID: 0,
    mlCode: "",
    mGrpID: 0,
    mfID: 0,
    mfName: "",
    medText: "",
    medText1: "",
    mGenID: 0,
    mGenCode: "",
    mGenName: "",
    productID: null,
    calcQtyYN: "N",
    rActiveYN: "Y",
    compID: compID ?? 0,
    compCode: compCode ?? "",
    compName: compName ?? "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { setLoading } = useLoading();
  const { handleDropdownChange } = useDropdownChange(setFormState);

  const medicationListService = useMemo(() => createEntityService<MedicationListDto>("MedicationList", "clinicalManagementURL"), []);

  const dropdownValues = useDropdownValues(["medicationForm", "medicationGeneric"]);

  useEffect(() => {
    if (selectedData) {
      setFormState(selectedData);
    } else {
      handleClear();
    }
  }, [selectedData]);

  const handleClear = useCallback(async () => {
    setLoading(true);
    try {
      const nextCode = await medicationListService.getNextCode("MED", 3);
      setFormState({
        mlID: 0,
        mlCode: nextCode.data,
        mGrpID: 0,
        mfID: 0,
        mfName: "",
        medText: "",
        medText1: "",
        mGenID: 0,
        mGenCode: "",
        mGenName: "",
        productID: null,
        calcQtyYN: "N",
        rActiveYN: "Y",
        compID: compID ?? 0,
        compCode: compCode ?? "",
        compName: compName ?? "",
      });
      setIsSubmitted(false);
    } catch (error) {
      showAlert("Error", "Failed to fetch the next Medication Code.", "error");
    } finally {
      setLoading(false);
    }
  }, [compID, compCode, compName, medicationListService]);

  useEffect(() => {
    if (!selectedData) {
      handleClear();
    }
  }, [handleClear, selectedData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSubmitted(true);
    if (!formState.mlCode.trim() || !formState.medText) {
      showAlert("Error", "Medication Code and Text are mandatory.", "error");
      return;
    }

    setLoading(true);

    try {
      await medicationListService.save(formState);
      showAlert("Success", "Medication List saved successfully!", "success", {
        onConfirm: handleClear,
      });
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  }, [formState, medicationListService, setLoading, handleClear]);

  const handleActiveToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      rActiveYN: event.target.checked ? "Y" : "N",
    }));
  }, []);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="medication-list-details-header">
        MEDICATION LIST DETAILS
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Medication Code"
          value={formState.mlCode}
          onChange={handleInputChange}
          name="mlCode"
          ControlID="mlCode"
          placeholder="Enter medication code"
          isMandatory={true}
          size="small"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="text"
          label="Medication Name"
          value={formState.medText}
          onChange={handleInputChange}
          name="medText"
          ControlID="medText"
          placeholder="Enter medication Name"
          isMandatory
          size="small"
          isSubmitted={isSubmitted}
        />
        <FormField
          type="select"
          label="Medication Form"
          value={formState.mfID.toString()}
          onChange={handleDropdownChange(["mfID"], ["mfName"], dropdownValues.medicationForm)}
          name="mfID"
          ControlID="mfID"
          options={dropdownValues.medicationForm}
          size="small"
        />
        <FormField
          type="select"
          label="Generic Name"
          value={formState.mGenID.toString()}
          onChange={handleDropdownChange(["mGenID"], ["mGenName"], dropdownValues.medicationGeneric)}
          name="mGenID"
          ControlID="mGenID"
          options={dropdownValues.medicationGeneric}
          size="small"
        />
        <FormField
          type="switch"
          label={formState.calcQtyYN === "Y" ? "Calculate Quantity" : "Do Not Calculate Quantity"}
          value={formState.calcQtyYN}
          checked={formState.calcQtyYN === "Y"}
          onChange={(e) => setFormState((prev) => ({ ...prev, calcQtyYN: e.target.checked ? "Y" : "N" }))}
          name="calcQtyYN"
          ControlID="calcQtyYN"
          size="medium"
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

      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default MedicationListDetails;
