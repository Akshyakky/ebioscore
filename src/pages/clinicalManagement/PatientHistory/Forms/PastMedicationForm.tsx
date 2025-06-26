// src/pages/clinicalManagement/PatientHistory/Forms/PastMedicationForm.tsx

import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";
import { MedicationFormDto } from "@/interfaces/ClinicalManagement/MedicationFormDto";
import { MedicationFrequencyDto } from "@/interfaces/ClinicalManagement/MedicationFrequencyDto";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";
import { MedicationInstructionDto } from "@/interfaces/ClinicalManagement/MedicationInstructionDto";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import { PastMedicationDetailDto, PastMedicationDto } from "@/interfaces/ClinicalManagement/PastMedicationDto";
import {
  medicationDosageService,
  medicationFormService,
  medicationFrequencyService,
  medicationGenericService,
  medicationInstructionService,
  medicationListService,
} from "@/services/ClinicalManagementServices/clinicalManagementService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cancel as CancelIcon, Delete as DeleteIcon, Medication as MedicationIcon, Save as SaveIcon } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const pastMedicationDetailSchema = z.object({
  opipPastMedDtlID: z.number().default(0),
  opipPastMedID: z.number().default(0),
  mfID: z.number().min(1, "Medication form is required"),
  mfName: z.string().min(1, "Medication form name is required"),
  mlID: z.number().min(1, "Medication is required"),
  medText: z.string().min(1, "Medication text is required"),
  mGenID: z.number().min(1, "Generic is required"),
  mGenCode: z.string().default(""),
  mGenName: z.string().min(1, "Generic name is required"),
  mdID: z.number().default(0),
  mdName: z.string().default(""),
  mFrqID: z.number().default(0),
  mFrqName: z.string().default(""),
  mInsID: z.number().default(0),
  mInsName: z.string().default(""),
  fromDate: z.date(),
  toDate: z.date(),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

const pastMedicationFormSchema = z.object({
  opipPastMedID: z.number().default(0),
  opipNo: z.number(),
  pChartID: z.number(),
  opvID: z.number().default(0),
  opipCaseNo: z.number().default(0),
  patOpip: z.string().length(1).default("I"),
  opipDate: z.date(),
  oldPChartID: z.number().default(0),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
  details: z.array(pastMedicationDetailSchema).min(1, "At least one medication must be added"),
});

type PastMedicationFormData = z.infer<typeof pastMedicationFormSchema>;

interface PastMedicationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PastMedicationDto) => Promise<void>;
  admission: any;
  existingMedication?: PastMedicationDto;
  viewOnly?: boolean;
}

export const PastMedicationForm: React.FC<PastMedicationFormProps> = ({ open, onClose, onSubmit, admission, existingMedication, viewOnly = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Master data states
  const [medicationForms, setMedicationForms] = useState<MedicationFormDto[]>([]);
  const [medicationGenerics, setMedicationGenerics] = useState<MedicationGenericDto[]>([]);
  const [medicationList, setMedicationList] = useState<MedicationListDto[]>([]);
  const [medicationDosages, setMedicationDosages] = useState<MedicationDosageDto[]>([]);
  const [medicationFrequencies, setMedicationFrequencies] = useState<MedicationFrequencyDto[]>([]);
  const [medicationInstructions, setMedicationInstructions] = useState<MedicationInstructionDto[]>([]);

  // Form states for new medication detail
  const [selectedMedication, setSelectedMedication] = useState<MedicationListDto | null>(null);
  const [selectedDosage, setSelectedDosage] = useState<MedicationDosageDto | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<MedicationFrequencyDto | null>(null);
  const [selectedInstruction, setSelectedInstruction] = useState<MedicationInstructionDto | null>(null);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  const serverDate = useServerDate();
  const isEditMode = !!existingMedication;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, errors },
  } = useForm<PastMedicationFormData>({
    resolver: zodResolver(pastMedicationFormSchema),
    mode: "onChange",
    defaultValues: {
      details: [],
    },
  });

  const details = watch("details", []);

  // Load master data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [{ data: forms }, { data: generics }, { data: medications }, { data: dosages }, { data: frequencies }, { data: instructions }] = await Promise.all([
          medicationFormService.getAll(),
          medicationGenericService.getAll(),
          medicationListService.getAll(),
          medicationDosageService.getAll(),
          medicationFrequencyService.getAll(),
          medicationInstructionService.getAll(),
        ]);

        setMedicationForms(forms.filter((f) => f.rActiveYN === "Y"));
        setMedicationGenerics(generics.filter((g) => g.rActiveYN === "Y"));
        setMedicationList(medications.filter((m) => m.rActiveYN === "Y"));
        setMedicationDosages(dosages.filter((d) => d.rActiveYN === "Y"));
        setMedicationFrequencies(frequencies.filter((f) => f.rActiveYN === "Y"));
        setMedicationInstructions(instructions.filter((i) => i.rActiveYN === "Y"));
      } catch (error) {
        console.error("Error loading master data:", error);
      }
    };

    if (open) {
      loadMasterData();
    }
  }, [open]);

  useEffect(() => {
    if (open && admission) {
      const initialData: PastMedicationFormData = existingMedication
        ? {
            ...existingMedication,
            opipDate: new Date(existingMedication.opipDate),
            details: existingMedication.details.map((d) => ({
              ...d,
              fromDate: new Date(d.fromDate),
              toDate: new Date(d.toDate),
            })),
          }
        : {
            opipPastMedID: 0,
            opipDate: serverDate,
            rActiveYN: "Y",
            pChartID: admission.ipAdmissionDto.pChartID,
            opipNo: admission.ipAdmissionDto.admitID,
            opipCaseNo: admission.ipAdmissionDto.oPIPCaseNo || 0,
            patOpip: admission.ipAdmissionDto.patOpip || "I",
            transferYN: "N",
            opvID: 0,
            oldPChartID: 0,
            rNotes: null,
            details: [],
          };

      reset(initialData);
    }
  }, [open, admission, existingMedication, reset, serverDate]);

  const handleAddMedication = () => {
    if (!selectedMedication || !selectedFrequency) return;

    const form = medicationForms.find((f) => f.mFID === selectedMedication.mfID);
    const generic = medicationGenerics.find((g) => g.mGenID === selectedMedication.mGenID);

    const newDetail: PastMedicationDetailDto = {
      opipPastMedDtlID: 0,
      opipPastMedID: existingMedication?.opipPastMedID || 0,
      mfID: selectedMedication.mfID,
      mfName: form?.mFName || "Unknown Form",
      mlID: selectedMedication.mlID,
      medText: selectedMedication.medText,
      mGenID: selectedMedication.mGenID,
      mGenCode: generic?.mGenCode || "",
      mGenName: generic?.mGenName || "Unknown Generic",
      mdID: selectedDosage?.mDID || 0,
      mdName: selectedDosage?.mDName || "",
      mFrqID: selectedFrequency.mFrqID,
      mFrqName: selectedFrequency.mFrqName,
      mInsID: selectedInstruction?.minsId || 0,
      mInsName: selectedInstruction?.minsName || "",
      fromDate: fromDate,
      toDate: toDate,
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: null,
    };

    setValue("details", [...details, newDetail], { shouldDirty: true });

    // Reset form
    setSelectedMedication(null);
    setSelectedDosage(null);
    setSelectedFrequency(null);
    setSelectedInstruction(null);
    setFromDate(new Date());
    setToDate(new Date());
  };

  const handleRemoveDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setValue("details", newDetails, { shouldDirty: true });
  };

  const onFormSubmit = async (data: PastMedicationFormData) => {
    try {
      setIsSubmitting(true);

      const submissionData: PastMedicationDto = {
        opipPastMedID: data.opipPastMedID || 0,
        opipDate: data.opipDate || serverDate,
        opipNo: data.opipNo || 0,
        opvID: data.opvID || 0,
        pChartID: data.pChartID || 0,
        opipCaseNo: data.opipCaseNo || 0,
        patOpip: data.patOpip || "I",
        oldPChartID: data.oldPChartID || 0,
        rActiveYN: data.rActiveYN || "Y",
        transferYN: data.transferYN || "N",
        rNotes: data.rNotes || "",
        details: details.map((detail) => ({
          opipPastMedDtlID: detail.opipPastMedDtlID || 0,
          opipPastMedID: data.opipPastMedID || 0,
          mfID: detail.mfID,
          mfName: detail.mfName,
          mlID: detail.mlID,
          medText: detail.medText,
          mGenID: detail.mGenID,
          mGenCode: detail.mGenCode,
          mGenName: detail.mGenName,
          mdID: detail.mdID,
          mdName: detail.mdName,
          mFrqID: detail.mFrqID,
          mFrqName: detail.mFrqName,
          mInsID: detail.mInsID,
          mInsName: detail.mInsName,
          fromDate: detail.fromDate,
          toDate: detail.toDate,
          rActiveYN: detail.rActiveYN || "Y",
          transferYN: detail.transferYN || "N",
          rNotes: detail.rNotes || "",
        })),
      };

      await onSubmit(submissionData);

      reset();
      onClose();
    } catch (error) {
      console.error("Error submitting past medication:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isDirty || details.length > 0) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const performReset = () => {
    if (existingMedication) {
      reset({
        ...existingMedication,
        opipDate: new Date(existingMedication.opipDate),
        details: existingMedication.details.map((d) => ({
          ...d,
          fromDate: new Date(d.fromDate),
          toDate: new Date(d.toDate),
        })),
      });
    } else {
      reset({
        opipPastMedID: 0,
        opipDate: serverDate,
        rActiveYN: "Y",
        pChartID: admission?.ipAdmissionDto.pChartID || 0,
        opipNo: admission?.ipAdmissionDto.admitID || 0,
        opipCaseNo: admission?.ipAdmissionDto.oPIPCaseNo || 0,
        patOpip: admission?.ipAdmissionDto.patOpip || "I",
        transferYN: "N",
        opvID: 0,
        oldPChartID: 0,
        rNotes: null,
        details: [],
      });
    }
    setShowResetConfirmation(false);
  };

  const patientName = admission
    ? `${admission.ipAdmissionDto.pTitle} ${admission.ipAdmissionDto.pfName} ${admission.ipAdmissionDto.pmName || ""} ${admission.ipAdmissionDto.plName}`.trim()
    : "Patient";

  const dialogTitle = viewOnly ? "View Past Medication" : isEditMode ? "Edit Past Medication" : "Add Past Medication";

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
                <SmartButton
                  text="Reset"
                  onClick={handleReset}
                  variant="outlined"
                  color="error"
                  icon={CancelIcon}
                  disabled={isSubmitting || (!isDirty && details.length === 0)}
                  size="small"
                />
                <SmartButton
                  text={isEditMode ? "Update" : "Save"}
                  onClick={handleSubmit(onFormSubmit)}
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  disabled={isSubmitting || details.length === 0}
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
              <MedicationIcon color="primary" />
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
            {/* Master Information */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Past Medication Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="opipDate" control={control} type="datepicker" label="Date" required disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="rActiveYN" control={control} type="switch" label="Active" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="rNotes" control={control} type="text" label="Notes" disabled={viewOnly} size="small" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Add Medication Details Section */}
            {!viewOnly && (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Add Medication Detail
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Autocomplete
                          options={medicationList}
                          getOptionLabel={(option) => option.medText}
                          value={selectedMedication}
                          onChange={(_, newValue) => setSelectedMedication(newValue)}
                          size="small"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Medication"
                              required
                              error={!!errors.details?.message && details.length === 0}
                              helperText={errors.details?.message && details.length === 0 ? errors.details.message : ""}
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option.mlID === value.mlID}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Autocomplete
                          options={medicationDosages}
                          getOptionLabel={(option) => option.mDName}
                          value={selectedDosage}
                          onChange={(_, newValue) => setSelectedDosage(newValue)}
                          size="small"
                          renderInput={(params) => <TextField {...params} label="Dosage" />}
                          isOptionEqualToValue={(option, value) => option.mDID === value.mDID}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Autocomplete
                          options={medicationFrequencies}
                          getOptionLabel={(option) => option.mFrqName}
                          value={selectedFrequency}
                          onChange={(_, newValue) => setSelectedFrequency(newValue)}
                          size="small"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Frequency"
                              required
                              error={!selectedFrequency && details.length === 0}
                              helperText={!selectedFrequency && details.length === 0 ? "Frequency is required" : ""}
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option.mFrqID === value.mFrqID}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Autocomplete
                          options={medicationInstructions}
                          getOptionLabel={(option) => option.minsName}
                          value={selectedInstruction}
                          onChange={(_, newValue) => setSelectedInstruction(newValue)}
                          size="small"
                          renderInput={(params) => <TextField {...params} label="Instruction" />}
                          isOptionEqualToValue={(option, value) => option.minsId === value.minsId}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          type="date"
                          label="From Date"
                          value={fromDate.toISOString().split("T")[0]}
                          onChange={(e) => setFromDate(new Date(e.target.value))}
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          type="date"
                          label="To Date"
                          value={toDate.toISOString().split("T")[0]}
                          onChange={(e) => setToDate(new Date(e.target.value))}
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <SmartButton
                          text="Add Medication"
                          onClick={handleAddMedication}
                          variant="contained"
                          color="primary"
                          size="small"
                          disabled={!selectedMedication || !selectedFrequency}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Medication Details List */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Medication Details ({details.length})
                  </Typography>

                  {details.length === 0 ? (
                    <Alert severity="info">No medications added. Please add at least one medication.</Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Medication</TableCell>
                            <TableCell>Form</TableCell>
                            <TableCell>Generic</TableCell>
                            <TableCell>Dosage</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Instruction</TableCell>
                            <TableCell>From Date</TableCell>
                            <TableCell>To Date</TableCell>
                            {!viewOnly && <TableCell align="center">Actions</TableCell>}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {details.map((detail, index) => (
                            <TableRow key={index}>
                              <TableCell>{detail.medText}</TableCell>
                              <TableCell>
                                <Chip label={detail.mfName} size="small" />
                              </TableCell>
                              <TableCell>
                                <Chip label={detail.mGenName} size="small" color="primary" />
                              </TableCell>
                              <TableCell>{detail.mdName || "-"}</TableCell>
                              <TableCell>{detail.mFrqName || "-"}</TableCell>
                              <TableCell>{detail.mInsName || "-"}</TableCell>
                              <TableCell>{formatDt(detail.fromDate)}</TableCell>
                              <TableCell>{formatDt(detail.toDate)}</TableCell>
                              {!viewOnly && (
                                <TableCell align="center">
                                  <IconButton size="small" color="error" onClick={() => handleRemoveDetail(index)} title="Remove">
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
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

// Helper function for formatting dates
const formatDt = (date: Date | string) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};
