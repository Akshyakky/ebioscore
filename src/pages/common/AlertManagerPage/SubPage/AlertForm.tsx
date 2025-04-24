// src/pages/common/AlertManagerPage/SubPage/AlertForm.tsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, Divider, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useForm, SubmitHandler } from "react-hook-form";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { sanitizeFormData } from "@/utils/Common/sanitizeInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface AlertFormProps {
  open: boolean;
  onClose: () => void;
  alert: AlertDto;
  isEditMode: boolean;
  onSubmit: (formData: AlertDto) => void;
  patientName: string;
}

const AlertForm: React.FC<AlertFormProps> = ({ open, onClose, alert, isEditMode, onSubmit, patientName }) => {
  // Define the schema using Zod
  const alertSchema = z.object({
    category: z.string().min(1, { message: "Category is required" }),
    alertDescription: z.string().min(1, { message: "Alert description is required" }),
    rActiveYN: z.string().min(1, { message: "Active status is required" }),
  });

  // Derive the type from the schema
  type AlertFormFields = z.infer<typeof alertSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<AlertFormFields>({
    defaultValues: alert,
    resolver: zodResolver(alertSchema),
    mode: "onChange",
  });

  const processSubmit: SubmitHandler<AlertFormFields> = (data) => {
    // Sanitize inputs and submit
    const sanitizedData = sanitizeFormData(data);
    onSubmit(sanitizedData as AlertDto);
  };

  const handleCancel = () => {
    reset();
    onClose();
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "8px" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: isEditMode ? "primary.light" : "primary.main",
            color: "white",
            py: 1.5,
          }}
        >
          <Typography variant="h6">{isEditMode ? "Edit Alert" : "Add New Alert"}</Typography>
          <IconButton size="small" onClick={handleCancel} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" sx={{ mt: 1 }}>
            {/* Patient Information Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="medium">
                Patient Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Patient Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {patientName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    UHID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {alert.pChartCode}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Alert Details Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom fontWeight="medium">
                Alert Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField name="category" control={control} label="Category" type="select" options={categories} required size="small" fullWidth />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    name="rActiveYN"
                    control={control}
                    label="Status"
                    type="select"
                    options={[
                      { value: "Y", label: "Active" },
                      { value: "N", label: "Inactive" },
                    ]}
                    required
                    size="small"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormField
                    name="alertDescription"
                    control={control}
                    label="Alert Description"
                    type="textarea"
                    rows={4}
                    required
                    size="small"
                    fullWidth
                    placeholder="Enter detailed alert description..."
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button onClick={handleCancel} variant="outlined" color="inherit" size="medium">
            Cancel
          </Button>
          <Button onClick={handleSubmit(processSubmit)} variant="contained" color="primary" size="medium" disabled={!isDirty || !isValid}>
            {isEditMode ? "Update Alert" : "Save Alert"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AlertForm;
