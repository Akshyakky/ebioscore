import { Paper, Typography, Grid } from "@mui/material";
import { useState, useCallback, useEffect } from "react";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { PatientInvoiceCodeService } from "../../../../services/BillingServices/PatientInvoiceService";
import { BPatTypeDto } from "../../../../interfaces/Billing/BPatTypeDto";
import { useLoading } from "../../../../context/LoadingContext";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import FormField from "../../../../components/FormField/FormField";

const PatientInvoiceCodeDetails: React.FC<{ editData?: BPatTypeDto }> = ({
  editData,
}) => {
  const [formState, setFormState] = useState({
    isSubmitted: false,
    pTypeCode: "",
    pTypeName: "",
    rNotes: "",
    rActiveYN: "Y",
  });

  const { setLoading } = useLoading();
  const serverDate = useServerDate();

  const { compID, compCode, compName, userID, userName } =
    store.getState().userDetails;

  // Use useEffect to update formState when editData changes
  useEffect(() => {
    if (editData) {
      setFormState({
        isSubmitted: false,
        pTypeCode: editData.pTypeCode || "",
        pTypeName: editData.pTypeName || "",
        rNotes: editData.rNotes || "",
        rActiveYN: editData.rActiveYN || "Y",
      });
    } else {
      handleClear(); // Clear the form if editData is not present
    }
  }, [editData]);

  const createBPatTypeDto = useCallback(
    (): BPatTypeDto => ({
      pTypeID: editData ? editData.pTypeID : 0,
      pTypeCode: formState.pTypeCode,
      pTypeName: formState.pTypeName,
      rNotes: formState.rNotes,
      rActiveYN: formState.rActiveYN,
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      isInsuranceYN: "N",
      transferYN: "N",
      rCreatedID: userID || 0,
      rCreatedOn: serverDate || new Date(),
      rCreatedBy: userName || "",
      rModifiedID: userID || 0,
      rModifiedOn: serverDate || new Date(),
      rModifiedBy: userName || "",
    }),
    [
      formState,
      editData,
      compID,
      compCode,
      compName,
      userID,
      userName,
      serverDate,
    ]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSave = async () => {
    setFormState((prev) => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const bPatTypeDto = createBPatTypeDto();
      const result = await PatientInvoiceCodeService.saveBPatType(bPatTypeDto);
      if (result.success) {
        showAlert(
          "Success",
          "Patient Invoice Code saved successfully!",
          "success",
          {
            onConfirm: handleClear,
          }
        );
      } else {
        showAlert(
          "Error",
          result.errorMessage || "Failed to save Patient Invoice Code.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving Patient Invoice Code:", error);
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormState({
      isSubmitted: false,
      pTypeCode: "",
      pTypeName: "",
      rNotes: "",
      rActiveYN: "Y",
    });
  }, []);

  const handleActiveToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        rActiveYN: event.target.checked ? "Y" : "N",
      }));
    },
    []
  );

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="patient-invoice-code-header">
        Patient Invoice Code List
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Patient Invoice Code"
          value={formState.pTypeCode}
          onChange={handleInputChange}
          isSubmitted={formState.isSubmitted}
          name="pTypeCode"
          ControlID="pTypeCode"
          placeholder="Patient Invoice Code"
        />
        <FormField
          type="text"
          label="Patient Invoice Name"
          value={formState.pTypeName}
          onChange={handleInputChange}
          isSubmitted={formState.isSubmitted}
          name="pTypeName"
          ControlID="pTypeName"
          placeholder="Patient Invoice Name"
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="textarea"
          label="Remarks"
          value={formState.rNotes}
          onChange={handleInputChange}
          name="rNotes"
          ControlID="rNotes"
          placeholder="Remarks"
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label={formState.rActiveYN === "Y" ? "Active" : "Hidden"}
          value={formState.rActiveYN}
          checked={formState.rActiveYN === "Y"}
          onChange={handleActiveToggle}
          name="rActiveYN"
          ControlID="rActiveYN"
        />
      </Grid>
      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
    </Paper >
  );
};

export default PatientInvoiceCodeDetails;
