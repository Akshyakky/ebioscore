// src/pages/common/AlertManagerPage/SubPage/AlertForm.tsx
import React from "react";
import { Box, Typography, Grid, Divider } from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Changed to match FormField
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomButton from "@/components/Button/CustomButton";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { sanitizeFormData } from "@/utils/Common/sanitizeInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";

interface AlertFormProps {
  open: boolean;
  onClose: () => void;
  alert: AlertDto;
  isEditMode: boolean;
  onSubmit: (formData: AlertDto) => void;
  patientName: string;
}

const AlertForm: React.FC<AlertFormProps> = ({ open, onClose, alert, isEditMode, onSubmit, patientName }) => {
  // Define the schema using Zod, matching backend validator
  const alertSchema = z.object({
    category: z.string().min(1, { message: "Category is required" }),
    alertDescription: z.string().min(1, { message: "Alert description is required" }).max(4000, { message: "Alert description cannot exceed 4000 characters" }),
    rActiveYN: z.enum(["Y", "N"], { message: "Active status must be Y or N" }),
    oPIPDate: z.date({ message: "Date is required" }),
  });

  // Derive the type from the schema
  type AlertFormFields = z.infer<typeof alertSchema>;

  // Ensure we have a valid Date object for the default value
  const getInitialDate = () => {
    if (!alert.oPIPDate) return new Date();

    // Handle different input formats
    if (alert.oPIPDate instanceof Date) return alert.oPIPDate;

    try {
      // Try to convert string to Date
      const dateObj = new Date(alert.oPIPDate);
      return isNaN(dateObj.getTime()) ? new Date() : dateObj;
    } catch (e) {
      console.error("Error parsing date:", e);
      return new Date();
    }
  };

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
    reset,
  } = useForm<AlertFormFields>({
    defaultValues: {
      category: alert.category || "",
      alertDescription: alert.alertDescription || "",
      rActiveYN: alert.rActiveYN || "Y",
      oPIPDate: getInitialDate(),
    },
    resolver: zodResolver(alertSchema),
    mode: "onChange",
  });

  const processSubmit: SubmitHandler<AlertFormFields> = (data) => {
    // Sanitize inputs and merge with existing alert data
    const sanitizedData = sanitizeFormData(data);
    const updatedAlert: AlertDto = {
      ...alert,
      ...sanitizedData,
      // Ensure oPIPDate is properly converted to Date
      oPIPDate: data.oPIPDate instanceof Date ? data.oPIPDate : new Date(data.oPIPDate),
    };
    onSubmit(updatedAlert);
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

  // Define dialog actions
  const dialogActions = (
    <>
      <CustomButton variant="outlined" text="Cancel" onClick={handleCancel} color="inherit" size="medium" />
      <CustomButton
        variant="contained"
        text={isEditMode ? "Update Alert" : "Save Alert"}
        onClick={handleSubmit(processSubmit)}
        color="primary"
        size="medium"
        disabled={!isDirty || !isValid}
      />
    </>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <GenericDialog
        open={open}
        onClose={handleCancel}
        title={isEditMode ? "Edit Alert" : "Add New Alert"}
        maxWidth="md"
        fullWidth
        showCloseButton
        actions={dialogActions}
        disableBackdropClick
        titleSx={{
          bgcolor: isEditMode ? "primary.light" : "primary.main",
          color: "white",
        }}
      >
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField name="oPIPDate" control={control} label="Alert Date" type="datepicker" required size="small" fullWidth />
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
      </GenericDialog>
    </LocalizationProvider>
  );
};

export default AlertForm;
