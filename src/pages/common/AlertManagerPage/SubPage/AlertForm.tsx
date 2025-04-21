// src/pages/common/AlertManagerPage/SubPage/AlertForm.tsx
import React, { useState, useCallback, useEffect } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import FormField from "@/components/FormField/FormField";
import CustomButton from "@/components/Button/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import { AlertDto } from "@/interfaces/Common/AlertManager";

interface AlertFormProps {
  onAddAlert: (description: string) => void;
  editMode: boolean;
  editingAlert: AlertDto | null;
  onUpdateAlert: (description: string) => void;
  onCancelEdit: () => void;
  pChartID: number;
}

const AlertForm: React.FC<AlertFormProps> = ({ onAddAlert, editMode, editingAlert, onUpdateAlert, onCancelEdit, pChartID }) => {
  const [alertDescription, setAlertDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form when switching between add/edit modes
  useEffect(() => {
    if (editMode && editingAlert) {
      setAlertDescription(editingAlert.alertDescription);
    } else if (!editMode) {
      setAlertDescription("");
    }
    setIsSubmitted(false);
  }, [editMode, editingAlert]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAlertDescription(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);

    if (!alertDescription.trim()) {
      return;
    }

    if (editMode) {
      onUpdateAlert(alertDescription);
    } else {
      onAddAlert(alertDescription);
    }

    setAlertDescription("");
    setIsSubmitted(false);
  }, [alertDescription, editMode, onAddAlert, onUpdateAlert]);

  const isFormValid = pChartID > 0 && alertDescription.trim().length > 0;

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: "background.default" }}>
      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
        {editMode ? "Update Alert" : "Add New Alert"}
      </Typography>

      <Grid container spacing={2}>
        <FormField
          type="textarea"
          label="Alert Message"
          value={alertDescription}
          onChange={handleInputChange}
          isSubmitted={isSubmitted}
          name="alertDescription"
          ControlID="alertDescription"
          placeholder="Enter alert message..."
          maxLength={4000}
          isMandatory
          errorMessage={isSubmitted && !alertDescription.trim() ? "Alert message is required" : ""}
          rows={4}
        />
      </Grid>

      <Grid container spacing={2} mt={1}>
        <Grid item>
          <CustomButton
            variant="contained"
            color={editMode ? "success" : "primary"}
            text={editMode ? "Update Alert" : "Add Alert"}
            onClick={handleSubmit}
            icon={AddIcon}
            disabled={!isFormValid}
          />
        </Grid>

        {editMode && (
          <Grid item>
            <CustomButton variant="outlined" color="secondary" text="Cancel" onClick={onCancelEdit} />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default React.memo(AlertForm);
