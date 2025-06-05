// src/pages/patientAdministration/DischargePage/Components/DischargeFormDialog.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Grid, Typography, Paper, Chip, Avatar, Alert, Accordion, AccordionSummary, AccordionDetails, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Person as PatientIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as DoctorIcon,
  ExitToApp as DischargeIcon,
  Assignment as NotesIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { formatDt, calculateDaysBetween } from "@/utils/Common/dateUtils";

// Enhanced discharge schema with comprehensive validation
const dischargeSchema = z.object({
  dischgID: z.number().default(0),
  pChartID: z.number().min(1, "Patient chart ID is required"),
  admitID: z.number().min(1, "Admission ID is required"),
  dischgDate: z.date().default(new Date()),
  dischgTime: z.date().default(new Date()),
  dischgStatus: z.string().min(1, "Discharge status is required"),
  dischgPhyID: z.number().min(1, "Discharging physician is required"),
  dischgPhyName: z.string().min(1, "Discharging physician name is required"),
  releaseBedYN: z.enum(["Y", "N"]).default("Y"),
  authorisedBy: z.string().optional().default(""),
  deliveryType: z.string().optional().default(""),
  dischargeCode: z.string().min(1, "Discharge code is required"),
  dischgSumYN: z.enum(["Y", "N"]).default("N"),
  facultyID: z.number().optional().default(0),
  faculty: z.string().optional().default(""),
  dischgType: z.string().min(1, "Discharge type is required"),
  defineStatus: z.string().optional().default(""),
  defineSituation: z.string().optional().default(""),
  situation: z.string().optional().default(""),
  rNotes: z.string().max(1000, "Notes must not exceed 1000 characters").optional().default(""),
  // Patient information (read-only)
  pChartCode: z.string().default(""),
  pTitle: z.string().default(""),
  pfName: z.string().default(""),
  pmName: z.string().default(""),
  plName: z.string().default(""),
});

type DischargeFormData = z.infer<typeof dischargeSchema>;

interface DischargeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dischargeData: IpDischargeDto) => Promise<void>;
  patient: PatientSearchResult | null;
  currentAdmission: AdmissionDto | null;
  existingDischarge?: IpDischargeDto | null;
}

const DischargeFormDialog: React.FC<DischargeFormDialogProps> = ({ open, onClose, onSubmit, patient, currentAdmission, existingDischarge }) => {
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [notesAccordionExpanded, setNotesAccordionExpanded] = useState(false);

  const isEditMode = !!existingDischarge;
  const serverDate = useServerDate();

  // Load dropdown values
  const {
    dischargeStatus = [],
    dischargeSituation = [],
    deliveryType = [],
    attendingPhy = [],
    dischargeType = [],
  } = useDropdownValues(["dischargeStatus", "dischargeSituation", "deliveryType", "attendingPhy", "dischargeType"]);

  // Form setup with comprehensive validation
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<DischargeFormData>({
    resolver: zodResolver(dischargeSchema),
    mode: "onChange",
    defaultValues: {
      dischgID: 0,
      pChartID: 0,
      admitID: 0,
      dischgDate: serverDate,
      dischgTime: serverDate,
      dischgStatus: "",
      dischgPhyID: 0,
      dischgPhyName: "",
      releaseBedYN: "Y",
      authorisedBy: "",
      deliveryType: "",
      dischargeCode: "",
      dischgSumYN: "N",
      facultyID: 0,
      faculty: "",
      dischgType: "DISCHARGED",
      defineStatus: "",
      defineSituation: "",
      situation: "",
      rNotes: "",
      pChartCode: "",
      pTitle: "",
      pfName: "",
      pmName: "",
      plName: "",
    },
  });

  // Watch form values
  const watchedDischargeStatus = watch("dischgStatus");
  const watchedDeliveryType = watch("deliveryType");
  const watchedReleaseBedYN = watch("releaseBedYN");

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && currentAdmission && patient && !isInitialized) {
      initializeForm();
      setIsInitialized(true);
    } else if (!open) {
      setIsInitialized(false);
    }
  }, [open, currentAdmission, patient, existingDischarge, isInitialized]);

  // Initialize form with admission and discharge data
  const initializeForm = useCallback(async () => {
    if (!currentAdmission || !patient) return;

    const admission = currentAdmission.ipAdmissionDto;

    if (isEditMode && existingDischarge) {
      // Populate with existing discharge data
      reset({
        dischgID: existingDischarge.dischgID,
        pChartID: existingDischarge.pChartID,
        admitID: existingDischarge.admitID,
        dischgDate: new Date(existingDischarge.dischgDate),
        dischgTime: new Date(existingDischarge.dischgTime),
        dischgStatus: existingDischarge.dischgStatus,
        dischgPhyID: existingDischarge.dischgPhyID || 0,
        dischgPhyName: existingDischarge.dischgPhyName || "",
        releaseBedYN: existingDischarge.releaseBedYN,
        authorisedBy: existingDischarge.authorisedBy || "",
        deliveryType: existingDischarge.deliveryType || "",
        dischargeCode: existingDischarge.dischargeCode || "",
        dischgSumYN: existingDischarge.dischgSumYN,
        facultyID: existingDischarge.facultyID || 0,
        faculty: existingDischarge.faculty || "",
        dischgType: existingDischarge.dischgType || "DISCHARGED",
        defineStatus: existingDischarge.defineStatus || "",
        defineSituation: existingDischarge.defineSituation || "",
        situation: existingDischarge.situation || "",
        rNotes: existingDischarge.rNotes || "",
        pChartCode: existingDischarge.pChartCode || admission.pChartCode,
        pTitle: existingDischarge.pTitle || admission.pTitle,
        pfName: existingDischarge.pfName || admission.pfName,
        pmName: existingDischarge.pmName || admission.pmName,
        plName: existingDischarge.plName || admission.plName,
      });
    } else {
      // Initialize new discharge
      reset({
        dischgID: 0,
        pChartID: admission.pChartID,
        admitID: admission.admitID,
        dischgDate: serverDate,
        dischgTime: serverDate,
        dischgStatus: "",
        dischgPhyID: 0,
        dischgPhyName: "",
        releaseBedYN: "Y",
        authorisedBy: "",
        deliveryType: "",
        dischargeCode: "",
        dischgSumYN: "N",
        facultyID: 0,
        faculty: "",
        dischgType: "DISCHARGED",
        defineStatus: "",
        defineSituation: "",
        situation: "",
        rNotes: "",
        pChartCode: admission.pChartCode,
        pTitle: admission.pTitle,
        pfName: admission.pfName,
        pmName: admission.pmName,
        plName: admission.plName,
      });

      // Generate discharge code for new discharge
      if (!isEditMode) {
        await generateDischargeCode();
      }
    }
  }, [currentAdmission, patient, existingDischarge, isEditMode, reset, serverDate]);

  // Generate discharge code
  const generateDischargeCode = useCallback(async () => {
    if (isEditMode) return;

    try {
      setIsGeneratingCode(true);
      // Generate a simple discharge code
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const dischargeCode = `DSC${timestamp}${random}`;

      setValue("dischargeCode", dischargeCode, { shouldValidate: true });
    } catch (error) {
      console.error("Error generating discharge code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [isEditMode, setValue]);

  // Handle discharge status change
  const handleDischargeStatusChange = useCallback(
    (value: any) => {
      const selectedOption = dischargeStatus.find((option) => option.value === value.value);
      if (selectedOption) {
        setValue("dischgStatus", selectedOption.label, { shouldValidate: true });
      }
    },
    [dischargeStatus, setValue]
  );

  // Handle discharging physician change
  const handleDischargingPhysicianChange = useCallback(
    (value: any) => {
      const selectedOption = attendingPhy.find((option) => option.value === value.value);
      if (selectedOption) {
        setValue("dischgPhyID", Number(value.value.split("-")[0]), { shouldValidate: true });
        setValue("dischgPhyName", selectedOption.label, { shouldValidate: true });
      }
    },
    [attendingPhy, setValue]
  );

  // Handle delivery type change
  const handleDeliveryTypeChange = useCallback(
    (value: any) => {
      const selectedOption = deliveryType.find((option) => option.value === value.value);
      if (selectedOption) {
        setValue("deliveryType", selectedOption.value as string, { shouldValidate: true });
      }
    },
    [deliveryType, setValue]
  );

  // Handle situation change
  const handleSituationChange = useCallback(
    (value: any) => {
      const selectedOption = dischargeSituation.find((option) => option.value === value.value);
      if (selectedOption) {
        setValue("situation", selectedOption.value as string, { shouldValidate: true });
      }
    },
    [dischargeSituation, setValue]
  );

  // Form submission handler
  const handleFormSubmit = async (data: DischargeFormData) => {
    try {
      const dischargeDto: IpDischargeDto = {
        dischgID: data.dischgID,
        pChartID: data.pChartID,
        admitID: data.admitID,
        dischgDate: data.dischgDate,
        dischgTime: data.dischgTime,
        dischgStatus: data.dischgStatus,
        dischgPhyID: data.dischgPhyID,
        dischgPhyName: data.dischgPhyName,
        releaseBedYN: data.releaseBedYN,
        authorisedBy: data.authorisedBy,
        deliveryType: data.deliveryType,
        dischargeCode: data.dischargeCode,
        dischgSumYN: data.dischgSumYN,
        facultyID: data.facultyID,
        faculty: data.faculty,
        dischgType: data.dischgType,
        pChartCode: data.pChartCode,
        pTitle: data.pTitle,
        pfName: data.pfName,
        pmName: data.pmName,
        plName: data.plName,
        defineStatus: data.defineStatus,
        defineSituation: data.defineSituation,
        situation: data.situation,
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: data.rNotes,
      };

      await onSubmit(dischargeDto);
    } catch (error) {
      console.error("Error submitting discharge:", error);
      throw error;
    }
  };

  // Clear form handler
  const handleClear = () => {
    if (isEditMode) {
      initializeForm();
    } else {
      reset();
    }
  };

  // Close dialog handler
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Get current admission details for display
  const admissionInfo = useMemo(() => {
    if (!currentAdmission) return null;

    const admission = currentAdmission.ipAdmissionDto;
    const details = currentAdmission.ipAdmissionDetailsDto;
    const bedDetails = currentAdmission.wrBedDetailsDto;

    const patientName = `${admission.pTitle} ${admission.pfName} ${admission.pmName || ""} ${admission.plName}`.trim();
    const admissionDuration = calculateDaysBetween(new Date(admission.admitDate), new Date());

    return {
      patientName,
      admitCode: admission.admitCode,
      admitDate: new Date(admission.admitDate),
      admissionDuration,
      currentBed: bedDetails.bedName,
      currentRoom: details.rName,
      currentDepartment: admission.deptName,
      attendingPhysician: admission.attendingPhysicianName,
      caseType: admission.caseTypeName,
      patientType: admission.pTypeName,
    };
  }, [currentAdmission]);

  const dialogActions = (
    <Stack direction="row" spacing={1}>
      <CustomButton
        variant="outlined"
        text={isEditMode ? "Reset" : "Clear"}
        icon={ClearIcon}
        onClick={handleClear}
        disabled={isSubmitting || !isDirty}
        color="inherit"
        size="small"
      />
      <CustomButton variant="outlined" text="Cancel" onClick={handleClose} disabled={isSubmitting} size="small" />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update Discharge" : "Process Discharge"}
        icon={DischargeIcon}
        onAsyncClick={handleSubmit(handleFormSubmit)}
        asynchronous
        disabled={!isValid || !isDirty}
        color="primary"
        loadingText={isEditMode ? "Updating..." : "Processing..."}
        successText={isEditMode ? "Updated!" : "Discharged!"}
        size="small"
      />
    </Stack>
  );

  if (!patient || !currentAdmission) {
    return null;
  }

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={isEditMode ? "Update Discharge Information" : "Patient Discharge"}
      maxWidth="lg"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ p: 1.5 }}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={1.5}>
            {/* Current Admission Information */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 1.5, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 28, height: 28 }}>
                    <PatientIcon fontSize="small" />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="600">
                      {admissionInfo?.patientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      UHID: {patient.pChartCode} | Admission: {admissionInfo?.admitCode}
                    </Typography>
                  </Box>
                </Box>

                {admissionInfo && (
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="caption">
                        <strong>Admitted:</strong> {formatDt(admissionInfo.admitDate)} ({admissionInfo.admissionDuration} day{admissionInfo.admissionDuration !== 1 ? "s" : ""})
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="caption">
                        <strong>Location:</strong> {admissionInfo.currentRoom} - {admissionInfo.currentBed}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="caption">
                        <strong>Department:</strong> {admissionInfo.currentDepartment}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>

            {/* Discharge Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DischargeIcon fontSize="small" />
                Discharge Details
              </Typography>
            </Grid>

            {/* Basic Discharge Information - 4 columns */}
            <Grid size={{ xs: 12, md: 3 }}>
              <EnhancedFormField
                name="dischargeCode"
                control={control}
                type="text"
                label="Discharge Code"
                required
                disabled
                size="small"
                helperText={isEditMode ? "Cannot be changed" : isGeneratingCode ? "Generating..." : "Auto-generated"}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <EnhancedFormField name="dischgDate" control={control} type="datetimepicker" label="Discharge Date" required size="small" />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <EnhancedFormField
                name="dischgStatus"
                control={control}
                type="select"
                label="Discharge Status"
                required
                size="small"
                options={dischargeStatus}
                onChange={handleDischargeStatusChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <EnhancedFormField name="dischgType" control={control} type="select" label="Discharge Type" required size="small" options={dischargeType} />
            </Grid>

            {/* Medical Information - 3 columns */}
            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField
                name="dischgPhyName"
                control={control}
                type="select"
                label="Discharging Physician"
                required
                size="small"
                options={attendingPhy}
                onChange={handleDischargingPhysicianChange}
                adornment={<DoctorIcon />}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField
                name="deliveryType"
                control={control}
                type="select"
                label="Delivery Type"
                size="small"
                options={deliveryType}
                onChange={handleDeliveryTypeChange}
                helperText="Applicable for delivery cases"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField
                name="situation"
                control={control}
                type="select"
                label="Discharge Situation"
                size="small"
                options={dischargeSituation}
                onChange={handleSituationChange}
                helperText="Patient's condition at discharge"
              />
            </Grid>

            {/* Administrative Options - 3 columns */}
            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField name="releaseBedYN" control={control} type="switch" label="Release Bed" size="small" />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField name="dischgSumYN" control={control} type="switch" label="Discharge Summary Required" size="small" />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <EnhancedFormField name="authorisedBy" control={control} type="text" label="Authorized By" size="small" helperText="Person authorizing discharge" />
            </Grid>

            {/* Additional Notes Section */}
            <Grid size={{ xs: 12 }}>
              <Accordion
                expanded={notesAccordionExpanded}
                onChange={() => setNotesAccordionExpanded(!notesAccordionExpanded)}
                sx={{ border: "1px solid", borderColor: "grey.300" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ py: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <NotesIcon fontSize="small" />
                    <Typography variant="subtitle2">Additional Information & Notes</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1.5 }}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField
                        name="rNotes"
                        control={control}
                        type="textarea"
                        label="Discharge Notes"
                        size="small"
                        rows={3}
                        placeholder="Additional discharge notes, instructions, or observations..."
                        helperText="Optional discharge notes and instructions"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Discharge Confirmation */}
            {watchedDischargeStatus && watchedReleaseBedYN === "Y" && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Discharge Confirmation:</strong> {admissionInfo?.patientName} will be discharged from{" "}
                    <strong>
                      {admissionInfo?.currentRoom} ({admissionInfo?.currentBed})
                    </strong>{" "}
                    with status <strong>{watchedDischargeStatus}</strong>. The bed will be released for new admissions.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </form>
      </Box>
    </GenericDialog>
  );
};

export default DischargeFormDialog;
