import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { InvStatusResponseDto, SampleStatusUpdateRequestDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Error as ErrorIcon, HourglassEmpty } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import React, { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

interface SampleStatusUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  investigations: InvStatusResponseDto[];
  labRegNo: number;
  serviceTypeId: number;
  onUpdate: (updates: SampleStatusUpdateRequestDto[]) => Promise<{ success: boolean; message: string }>;
  loading?: boolean;
}

const sampleStatusUpdateOptions = [
  { value: "P", label: "Pending" },
  { value: "C", label: "Collected" },
  { value: "R", label: "Rejected" },
];

// Create schema for bulk update
const bulkUpdateSchema = z
  .object({
    bulkStatus: z.string().optional(),
    bulkReason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.bulkStatus === "R" && !data.bulkReason?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Rejection reason is required when status is Rejected",
      path: ["bulkReason"],
    }
  );

// Create schema for individual investigations
const investigationUpdateSchema = z
  .object({
    investigationId: z.number(),
    investigationName: z.string(),
    investigationCode: z.string(),
    currentStatus: z.string(),
    status: z.string(),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "R" && !data.reason?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Rejection reason is required",
      path: ["reason"],
    }
  );

const formSchema = z.object({
  bulkStatus: z.string().optional(),
  bulkReason: z.string().optional(),
  investigations: z.array(investigationUpdateSchema),
});

type FormData = z.infer<typeof formSchema>;

const SampleStatusUpdateDialog: React.FC<SampleStatusUpdateDialogProps> = ({ open, onClose, investigations, labRegNo, serviceTypeId, onUpdate, loading = false }) => {
  const { showAlert } = useAlert();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      bulkStatus: "",
      bulkReason: "",
      investigations: [],
    },
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const { fields, update } = useFieldArray({
    control,
    name: "investigations",
  });

  const bulkStatus = watch("bulkStatus");
  const bulkReason = watch("bulkReason");

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && investigations.length > 0) {
      const investigationData = investigations.map((inv) => ({
        investigationId: inv.investigationId,
        investigationName: inv.investigationName,
        investigationCode: inv.investigationCode,
        currentStatus: inv.sampleStatus,
        status: inv.sampleStatus === "Pending" ? "P" : inv.sampleStatus === "Collected" ? "C" : inv.sampleStatus === "Rejected" ? "R" : "P",
        reason: "",
      }));

      reset({
        bulkStatus: "",
        bulkReason: "",
        investigations: investigationData,
      });
    }
  }, [open, investigations, reset]);

  const handleBulkStatusChange = useCallback(
    (value: string) => {
      setValue("bulkStatus", value);
      if (value !== "R") {
        setValue("bulkReason", "");
      }
    },
    [setValue]
  );

  const applyBulkUpdate = useCallback(() => {
    if (!bulkStatus) {
      showAlert("Warning", "Please select a status to apply to all investigations", "warning");
      return;
    }

    if (bulkStatus === "R" && !bulkReason?.trim()) {
      showAlert("Error", "Please provide a rejection reason for bulk rejection", "error");
      return;
    }

    fields.forEach((_, index) => {
      update(index, {
        ...fields[index],
        status: bulkStatus,
        reason: bulkStatus === "R" ? bulkReason : "",
      });
    });

    showAlert("Success", `Applied ${sampleStatusUpdateOptions.find((opt) => opt.value === bulkStatus)?.label} status to all investigations`, "success");
  }, [bulkStatus, bulkReason, fields, update, showAlert]);

  const onSubmit = async (data: FormData) => {
    const updates: SampleStatusUpdateRequestDto[] = data.investigations.map((inv) => ({
      LabRegNo: labRegNo,
      ServiceTypeID: serviceTypeId,
      InvestigationID: inv.investigationId,
      SampleCollectionStatus: inv.status as "Pending" | "Collected" | "Rejected",
      SampleCollectionDate: new Date(),
      SampleRejectionReason: inv.reason || "",
    }));

    const result = await onUpdate(updates);
    if (result.success) {
      showAlert("Success", result.message, "success");
      onClose();
    } else {
      showAlert("Error", result.message, "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "P":
        return "warning";
      case "C":
        return "success";
      case "R":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "P":
        return <HourglassEmpty />;
      case "C":
        return <CheckCircle />;
      case "R":
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Update Sample Collection Status"
      fullWidth
      showCloseButton={true}
      actions={
        <>
          <SmartButton text="Cancel" onClick={onClose} variant="outlined" size="small" disabled={loading} />
          <SmartButton
            text="Update Status"
            onClick={handleSubmit(onSubmit)}
            color="primary"
            variant="contained"
            size="small"
            disabled={loading || investigations.length === 0 || !isValid}
            loadingText="Updating..."
            asynchronous={true}
            showLoadingIndicator={true}
          />
        </>
      }
    >
      <Box component="form" noValidate sx={{ minHeight: "50vh" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Lab Reg No: {labRegNo} | Total Investigations: {investigations.length}
          </Typography>
        </Box>

        {/* Bulk Update Section */}
        {investigations.length > 1 && (
          <>
            <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
              <Typography variant="subtitle1" gutterBottom>
                Bulk Update
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField
                    name="bulkStatus"
                    control={control}
                    label="Apply Status to All"
                    type="select"
                    size="small"
                    fullWidth
                    options={sampleStatusUpdateOptions}
                    defaultText="Select Status"
                    onChange={(value: any) => handleBulkStatusChange(value.value)}
                  />
                </Grid>

                {bulkStatus === "R" && (
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <FormField
                      name="bulkReason"
                      control={control}
                      label="Rejection Reason (Applied to All)"
                      type="textarea"
                      size="small"
                      fullWidth
                      required
                      rows={2}
                      helperText={errors.bulkReason?.message}
                    />
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: bulkStatus === "R" ? 3 : 8 }}>
                  <SmartButton text="Apply to All" onClick={applyBulkUpdate} variant="contained" color="secondary" size="small" disabled={!bulkStatus || loading} />
                </Grid>
              </Grid>
            </Paper>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Individual Investigation Updates
              </Typography>
            </Divider>
          </>
        )}
        {/* Individual Investigation Updates */}
        <Stack spacing={2}>
          {fields.map((field, index) => {
            const watchedStatus = watch(`investigations.${index}.status`);
            const fieldErrors = errors.investigations?.[index];

            return (
              <Card key={field.id} variant="outlined">
                <CardContent>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {field.investigationName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Code: {field.investigationCode}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip size="small" label={`Current: ${field.currentStatus}`} color="default" />
                        <Chip
                          size="small"
                          icon={getStatusIcon(watchedStatus)}
                          label={`New: ${sampleStatusUpdateOptions.find((opt) => opt.value === watchedStatus)?.label || "Unknown"}`}
                          color={getStatusColor(watchedStatus)}
                        />
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormField
                        name={`investigations.${index}.status`}
                        control={control}
                        label="New Status"
                        type="select"
                        size="small"
                        fullWidth
                        options={sampleStatusUpdateOptions}
                        defaultText="Select Status"
                        onChange={(value: any) => {
                          update(index, {
                            ...field,
                            status: value.value,
                            reason: value.value !== "R" ? "" : field.reason,
                          });
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      {watchedStatus === "R" && (
                        <FormField
                          name={`investigations.${index}.reason`}
                          control={control}
                          label="Rejection Reason"
                          type="textarea"
                          size="small"
                          fullWidth
                          required
                          rows={2}
                          helperText={fieldErrors?.reason?.message}
                        />
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Box>
    </GenericDialog>
  );
};

export default SampleStatusUpdateDialog;
