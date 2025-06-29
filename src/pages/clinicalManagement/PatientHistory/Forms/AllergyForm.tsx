// src/pages/clinicalManagement/PatientHistory/Forms/AllergyForm.tsx
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { AllergyDto, OPIPHistAllergyDetailDto } from "@/interfaces/ClinicalManagement/AllergyDto";
import { MedicationFormDto } from "@/interfaces/ClinicalManagement/MedicationFormDto";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import { medicationFormService, medicationGenericService, medicationListService } from "@/services/ClinicalManagementServices/clinicalManagementService";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocalPharmacy as AllergyIcon, Cancel as CancelIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
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

const allergyDetailSchema = z.object({
  opipAlgDetailId: z.number().default(0),
  opipAlgId: z.number().default(0),
  mfId: z.number().min(1, "Medication form is required"),
  mfName: z.string().min(1, "Medication form name is required"),
  mlId: z.number().min(1, "Medication ID is required"),
  medText: z.string().min(1, "Medication text is required"),
  mGenId: z.number().min(1, "Generic is required"),
  mGenCode: z.string().optional().nullable(),
  mGenName: z.string().min(1, "Generic name is required"),
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});

const allergyFormSchema = z.object({
  allergyMastDto: z.object({
    opipAlgId: z.number().default(0),
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
  }),
  details: z.array(allergyDetailSchema).min(1, "At least one allergy must be added"),
});

type AllergyFormData = z.infer<typeof allergyFormSchema>;

interface AllergyFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AllergyDto) => Promise<void>;
  admission: any;
  existingAllergy?: AllergyDto;
  viewOnly?: boolean;
}

export const AllergyForm: React.FC<AllergyFormProps> = ({ open, onClose, onSubmit, admission, existingAllergy, viewOnly = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Master data states
  const [medicationForms, setMedicationForms] = useState<MedicationFormDto[]>([]);
  const [medicationGenerics, setMedicationGenerics] = useState<MedicationGenericDto[]>([]);
  const [medicationList, setMedicationList] = useState<MedicationListDto[]>([]);

  // Form states for new allergy detail
  const [selectedMedication, setSelectedMedication] = useState<MedicationListDto | null>(null);

  const serverDate = useServerDate();
  const isEditMode = !!existingAllergy;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, errors },
  } = useForm<AllergyFormData>({
    resolver: zodResolver(allergyFormSchema),
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
        const [{ data: forms }, { data: generics }, { data: medications }] = await Promise.all([
          medicationFormService.getAll(),
          medicationGenericService.getAll(),
          medicationListService.getAll(),
        ]);

        setMedicationForms(forms.filter((f) => f.rActiveYN === "Y"));
        setMedicationGenerics(generics.filter((g) => g.rActiveYN === "Y"));
        setMedicationList(medications.filter((m) => m.rActiveYN === "Y"));
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
      const initialData: AllergyFormData = existingAllergy
        ? {
            allergyMastDto: {
              opipDate: new Date(existingAllergy.allergyMastDto.opipDate),
              opipAlgId: existingAllergy.allergyMastDto.opipAlgId || 0,
              opipNo: existingAllergy.allergyMastDto.opipNo || admission.ipAdmissionDto.admitID,
              pChartID: existingAllergy.allergyMastDto.pChartID || admission.ipAdmissionDto.pChartID,
              opvID: existingAllergy.allergyMastDto.opvID || 0,
              opipCaseNo: existingAllergy.allergyMastDto.opipCaseNo || admission.ipAdmissionDto.oPIPCaseNo || 0,
              patOpip: existingAllergy.allergyMastDto.patOpip || admission.ipAdmissionDto.patOpip || "I",
              oldPChartID: existingAllergy.allergyMastDto.oldPChartID || 0,
              rNotes: existingAllergy.allergyMastDto.rNotes || null,
              rActiveYN: existingAllergy.allergyMastDto.rActiveYN || "Y",
              transferYN: existingAllergy.allergyMastDto.transferYN || "N",
            },
            details: existingAllergy.details || [],
          }
        : {
            allergyMastDto: {
              opipAlgId: 0,
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
            },
            details: [],
          };

      reset(initialData);
    }
  }, [open, admission, existingAllergy, reset, serverDate]);

  const handleMedicationSelect = (medication: MedicationListDto | null) => {
    if (!medication) return;

    setSelectedMedication(null); // Clear the selection

    // Check if this medication is already added
    if (details.some((detail) => detail.mlId === medication.mlID)) {
      return;
    }

    const form = medicationForms.find((f) => f.mFID === medication.mfID);
    const generic = medicationGenerics.find((g) => g.mGenID === medication.mGenID);

    const newDetail: OPIPHistAllergyDetailDto = {
      opipAlgDetailId: 0,
      opipAlgId: existingAllergy?.allergyMastDto.opipAlgId || 0,
      mfId: medication.mfID,
      mfName: form?.mFName || "Unknown Form",
      mlId: medication.mlID,
      medText: medication.medText,
      mGenId: medication.mGenID,
      mGenCode: generic?.mGenCode || null,
      mGenName: generic?.mGenName || "Unknown Generic",
      rActiveYN: "Y",
      transferYN: "N",
      rNotes: null,
    };

    setValue("details", [...details, newDetail], { shouldDirty: true });
  };

  const handleRemoveDetail = (index: number) => {
    const newDetails = details.filter((_, i) => i !== index);
    setValue("details", newDetails, { shouldDirty: true });
  };

  const onFormSubmit = async (data: AllergyFormData) => {
    try {
      setIsSubmitting(true);

      const submissionData: AllergyDto = {
        allergyMastDto: {
          opipAlgId: data.allergyMastDto.opipAlgId || 0,
          rActiveYN: data.allergyMastDto.rActiveYN || "Y",
          transferYN: data.allergyMastDto.transferYN || "N",
          opvID: data.allergyMastDto.opvID || 0,
          oldPChartID: data.allergyMastDto.oldPChartID || 0,
          opipDate: data.allergyMastDto.opipDate,
          opipNo: data.allergyMastDto.opipNo || admission.ipAdmissionDto.admitID,
          pChartID: data.allergyMastDto.pChartID || admission.ipAdmissionDto.pChartID,
          opipCaseNo: data.allergyMastDto.opipCaseNo || admission.ipAdmissionDto.oPIPCaseNo || 0,
          patOpip: data.allergyMastDto.patOpip || admission.ipAdmissionDto.patOpip || "I",
          rNotes: data.allergyMastDto.rNotes || "",
        },
        details: data.details.map((detail) => ({
          opipAlgDetailId: detail.opipAlgDetailId || 0,
          opipAlgId: existingAllergy?.allergyMastDto.opipAlgId || 0,
          mfId: detail.mfId,
          mfName: detail.mfName,
          mlId: detail.mlId,
          medText: detail.medText,
          mGenId: detail.mGenId,
          mGenCode: detail.mGenCode || undefined,
          mGenName: detail.mGenName,
          rActiveYN: detail.rActiveYN || "Y",
          transferYN: detail.transferYN || "N",
          rNotes: detail.rNotes || null,
        })),
      };

      await onSubmit(submissionData);

      // Reset form after successful submission
      reset({
        allergyMastDto: {
          opipAlgId: 0,
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
        },
        details: [],
      });
      onClose();
    } catch (error) {
      console.error("Error submitting allergy:", error);
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
    if (existingAllergy) {
      reset({
        allergyMastDto: {
          ...existingAllergy.allergyMastDto,
          opipDate: new Date(existingAllergy.allergyMastDto.opipDate),
        },
        details: existingAllergy.details || [],
      });
    } else {
      reset({
        allergyMastDto: {
          opipAlgId: 0,
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
        },
        details: [],
      });
    }
    setShowResetConfirmation(false);
  };

  const patientName = admission
    ? `${admission.ipAdmissionDto.pTitle} ${admission.ipAdmissionDto.pfName} ${admission.ipAdmissionDto.pmName || ""} ${admission.ipAdmissionDto.plName}`.trim()
    : "Patient";

  const dialogTitle = viewOnly ? "View Allergy" : isEditMode ? "Edit Allergy" : "Add Allergy";

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
              <AllergyIcon color="primary" />
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
                    Allergy Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="allergyMastDto.opipDate" control={control} type="datepicker" label="Date" required disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="allergyMastDto.rActiveYN" control={control} type="switch" label="Active" disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="allergyMastDto.rNotes" control={control} type="text" label="Notes" disabled={viewOnly} size="small" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Add Allergy Details Section */}
            {!viewOnly && (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Add Allergy Detail
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Autocomplete
                          options={medicationList}
                          getOptionLabel={(option) => option.medText}
                          value={selectedMedication}
                          onChange={(_, newValue) => handleMedicationSelect(newValue)}
                          size="small"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Search Medication"
                              placeholder="Type to search..."
                              error={!!errors.details?.message && details.length === 0}
                              helperText={errors.details?.message && details.length === 0 ? errors.details.message : ""}
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option.mlID === value.mlID}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Allergy Details List */}
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Allergy Details ({details.length})
                  </Typography>

                  {details.length === 0 ? (
                    <Alert severity="info">No allergies added. Please add at least one allergy.</Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Medication</TableCell>
                            <TableCell>Form</TableCell>
                            <TableCell>Generic</TableCell>
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
