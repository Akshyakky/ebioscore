import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { sanitizeFormData } from "@/utils/Common/sanitizeInput";

interface AlertFormProps {
  open: boolean;
  onClose: () => void;
  alert: AlertDto;
  isEditMode: boolean;
  onSubmit: (formData: AlertDto) => void;
  patientName: string;
}

const AlertForm: React.FC<AlertFormProps> = ({ open, onClose, alert, isEditMode, onSubmit, patientName }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AlertDto>({
    defaultValues: alert,
  });

  const processSubmit = (data: AlertDto) => {
    // Sanitize inputs and submit
    const sanitizedData = sanitizeFormData(data);
    onSubmit(sanitizedData);
  };

  // Alert categories
  const categories = [
    { value: "Allergy", label: "Allergy" },
    { value: "Medication", label: "Medication" },
    { value: "Diagnosis", label: "Diagnosis" },
    { value: "Critical", label: "Critical" },
    { value: "Billing", label: "Billing" },
    { value: "Admin", label: "Administrative" },
    { value: "Other", label: "Other" },
  ];

  // Patient types
  const patientTypes = [
    { value: "O", label: "Outpatient" },
    { value: "I", label: "Inpatient" },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? "Edit Alert" : "Add New Alert"}</DialogTitle>

        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Patient: {patientName} ({alert.pChartCode})
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField name="category" control={control} label="Category" type="select" options={categories} required size="small" />
              </Grid>

              {/* <Grid xs={12} sm={6}>
                <FormField name="patOPIPYN" control={control} label="Patient Type" type="select" options={patientTypes} required />
              </Grid>

              <Grid xs={12} sm={6}>
                <FormField name="oPIPDate" control={control} label="Alert Date" type="datepicker" required />
              </Grid>

              <Grid xs={12} sm={6}>
                <FormField name="oPIPNo" control={control} label="OP/IP Number" type="text" />
              </Grid>

              <Grid xs={12} sm={6}>
                <FormField name="oPIPCaseNo" control={control} label="Case Number" type="text" />
              </Grid> */}

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField name="alertDescription" control={control} label="Alert Description" type="textarea" rows={4} required size="small" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  name="rActiveYN"
                  control={control}
                  label="Active"
                  type="select"
                  options={[
                    { value: "Y", label: "Yes" },
                    { value: "N", label: "No" },
                  ]}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit(processSubmit)} variant="contained" color="primary">
            {isEditMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AlertForm;
