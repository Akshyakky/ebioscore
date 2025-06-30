import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { OPIPHistObstetricsDto } from "@/interfaces/ClinicalManagement/OPIPHistObstetricsDto";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as CancelIcon, PregnantWoman as ObstetricsIcon, Save as SaveIcon } from "@mui/icons-material";
import { Box, Card, CardContent, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const obstetricsHistorySchema = z.object({
  opipOBID: z.number().default(0),
  opipNo: z.number(),
  opvID: z.number().default(0),
  pChartID: z.number(),
  opipCaseNo: z.number().default(0),
  patOPIP: z.string().length(1).default("I"),
  opipDate: z.date(),
  pOTName: z.string().optional().nullable(),
  obDesc: z.string().optional().nullable(),
  obDate: z.date().optional().nullable(),
  foetalAgeWeek: z.number().optional().nullable(),
  foetalAgeDay: z.number().optional().nullable(),
  pSRoucename: z.string().optional().nullable(),
  deliveryName: z.string().optional().nullable(),
  bStatusName: z.string().optional().nullable(),
  bGender: z.string().optional().nullable(),
  bBirthWeight: z.number().optional().nullable(),
  feedName: z.string().optional().nullable(),
  labHours: z.number().optional().nullable(),
  labourName: z.string().optional().nullable(),
  paediatricianID: z.number().optional().nullable(),
  paediatricianName: z.string().optional().nullable(),
  aTName: z.string().optional().nullable(),
  bComments: z.string().optional().nullable(),
  complication: z.string().optional().nullable(),
  presentCondition: z.string().optional().nullable(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

type ObstetricsHistoryFormData = z.infer<typeof obstetricsHistorySchema>;

interface ObstetricsHistoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OPIPHistObstetricsDto) => Promise<void>;
  admission: any;
  existingHistory?: OPIPHistObstetricsDto;
  viewOnly?: boolean;
}

export const ObstetricsHistoryForm: React.FC<ObstetricsHistoryFormProps> = ({ open, onClose, onSubmit, admission, existingHistory, viewOnly = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  const serverDate = useServerDate();
  const isEditMode = !!existingHistory;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<ObstetricsHistoryFormData>({
    resolver: zodResolver(obstetricsHistorySchema),
    mode: "onChange",
  });
  const { pregnancyOutcome, pregInfoSource, pregDeliveryMethod, birthStatus, labourOnset, anesthesiaType, feeding, gender } = useDropdownValues([
    "pregnancyOutcome",
    "pregInfoSource",
    "pregDeliveryMethod",
    "birthStatus",
    "labourOnset",
    "anesthesiaType",
    "feeding",
    "gender",
  ]);
  useEffect(() => {
    if (open && admission) {
      const initialData: ObstetricsHistoryFormData = existingHistory
        ? {
            ...existingHistory,
            opipDate: new Date(existingHistory.opipDate),
            obDate: existingHistory.obDate ? new Date(existingHistory.obDate) : null,
          }
        : {
            opipOBID: 0,
            opipNo: admission.ipAdmissionDto.admitID,
            opvID: 0,
            pChartID: admission.ipAdmissionDto.pChartID,
            opipCaseNo: admission.ipAdmissionDto.oPIPCaseNo || 0,
            patOPIP: admission.ipAdmissionDto.patOpip || "I",
            opipDate: serverDate,
            rActiveYN: "Y",
            transferYN: "N",
            pOTName: null,
            obDesc: null,
            obDate: null,
            foetalAgeWeek: null,
            foetalAgeDay: null,
            pSRoucename: null,
            deliveryName: null,
            bStatusName: null,
            bGender: null,
            bBirthWeight: null,
            feedName: null,
            labHours: null,
            labourName: null,
            paediatricianID: null,
            paediatricianName: null,
            aTName: null,
            bComments: null,
            complication: null,
            presentCondition: null,
            rNotes: null,
          };

      reset(initialData);
    }
  }, [open, admission, existingHistory, reset, serverDate]);

  const onFormSubmit = async (data: ObstetricsHistoryFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data as unknown as OPIPHistObstetricsDto);
      onClose();
    } catch (error) {
      console.error("Error submitting obstetrics history:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const performReset = () => {
    if (existingHistory) {
      reset({
        ...existingHistory,
        opipDate: new Date(existingHistory.opipDate),
        obDate: existingHistory.obDate ? new Date(existingHistory.obDate) : null,
      });
    } else {
      reset();
    }
    setShowResetConfirmation(false);
  };

  const patientName = admission
    ? `${admission.ipAdmissionDto.pTitle} ${admission.ipAdmissionDto.pfName} ${admission.ipAdmissionDto.pmName || ""} ${admission.ipAdmissionDto.plName}`.trim()
    : "Patient";

  const dialogTitle = viewOnly ? "View Obstetrics History" : isEditMode ? "Edit Obstetrics History" : "Add Obstetrics History";

  return (
    <>
      <GenericDialog
        open={open}
        onClose={onClose}
        title={dialogTitle}
        maxWidth="lg"
        fullWidth
        disableBackdropClick={isSubmitting}
        disableEscapeKeyDown={isSubmitting}
        actions={
          viewOnly ? (
            <SmartButton text="Close" onClick={onClose} variant="contained" color="primary" size="small" />
          ) : (
            <Box display="flex" justifyContent="space-between" width="100%" gap={1}>
              <SmartButton text="Cancel" onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting} size="small" />
              <Box display="flex" gap={1}>
                <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSubmitting || !isDirty} size="small" />
                <SmartButton
                  text={isEditMode ? "Update" : "Save"}
                  onClick={handleSubmit(onFormSubmit)}
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  disabled={isSubmitting || !isValid}
                  asynchronous
                  showLoadingIndicator
                  loadingText={isEditMode ? "Updating..." : "Saving..."}
                  successText={isEditMode ? "Updated!" : "Saved!"}
                  size="small"
                />
              </Box>
            </Box>
          )
        }
      >
        <Box sx={{ p: 2 }}>
          {/* Patient Info Header */}
          <Paper
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "primary.50",
              border: "1px solid",
              borderColor: "primary.200",
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <ObstetricsIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" fontWeight="600">
                  {patientName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  UHID: {admission?.ipAdmissionDto.pChartCode} | Admission: {admission?.ipAdmissionDto.admitCode}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="opipDate" control={control} type="datepicker" label="Record Date" required disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="obDate" control={control} type="datepicker" label="Obstetric Date" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField
                        name="pOTName"
                        control={control}
                        type="select"
                        label="Pregnancy Outcome"
                        disabled={viewOnly}
                        size="small"
                        options={pregnancyOutcome || []}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField
                        name="pSRoucename"
                        control={control}
                        type="select"
                        label="Pregnancy information source"
                        disabled={viewOnly}
                        size="small"
                        options={pregInfoSource || []}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField name="obDesc" control={control} type="textarea" label="Description" disabled={viewOnly} rows={3} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Pregnancy Details */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Pregnancy Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="foetalAgeWeek" control={control} type="number" label="Gestational Age (Weeks)" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="foetalAgeDay" control={control} type="number" label="Gestational Age (Days)" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="pSRoucename" control={control} type="text" label="Route Name" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField
                        name="deliveryName"
                        control={control}
                        type="select"
                        label="Delivery Type"
                        disabled={viewOnly}
                        size="small"
                        options={pregDeliveryMethod || []}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Baby Details */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Baby Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="bStatusName" control={control} type="select" label="Birth Status" disabled={viewOnly} size="small" options={birthStatus || []} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="bGender" control={control} type="select" label="Sex of Baby" options={gender || []} disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="bBirthWeight" control={control} type="number" label="Birth Weight (grams)" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="feedName" control={control} type="select" label="Feeding Type" disabled={viewOnly} size="small" options={feeding || []} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Labor and Medical Team */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Labor and Medical Team
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="labHours" control={control} type="number" label="Labor Hours" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="labourName" control={control} type="select" label="Labor Onset" disabled={viewOnly} size="small" options={labourOnset || []} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="paediatricianName" control={control} type="text" label="Paediatrician Name" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <EnhancedFormField name="aTName" control={control} type="select" label="Anesthesia Type" disabled={viewOnly} size="small" options={anesthesiaType || []} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Complications and Comments */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Complications and Comments
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField name="complication" control={control} type="textarea" label="Complications" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField name="presentCondition" control={control} type="textarea" label="Present Condition" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField name="bComments" control={control} type="textarea" label="Additional Comments" disabled={viewOnly} rows={3} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <EnhancedFormField name="rActiveYN" control={control} type="switch" label="Active" disabled={viewOnly} size="small" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        onConfirm={() => {
          performReset();
        }}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
      />
    </>
  );
};
