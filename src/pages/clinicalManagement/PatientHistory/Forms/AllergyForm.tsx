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

// Define schemas
const allergyDetailSchema = z.object({
  opipAlgDetailId: z.number().default(0),
  opipAlgId: z.number().default(0),
  mfId: z.number().min(1, "Medication form is required"),
  mfName: z.string().min(1, "Medication form name is required"), // Added validation
  mlId: z.number().min(1, "Medication ID is required"), // Changed to number and added validation
  medText: z.string().min(1, "Medication text is required"),
  mGenId: z.number().min(1, "Generic is required"),
  mGenCode: z.string().optional().nullable(),
  mGenName: z.string().min(1, "Generic name is required"), // Added validation
  rActiveYN: z.string().default("Y"),
  transferYN: z.string().default("N"),
  rNotes: z.string().optional().nullable(),
});
const allergyFormSchema = z.object({
  opIPHistAllergyMastDto: z.object({
    opipAlgId: z.number().default(0),
    opipNo: z.number(),
    pChartID: z.number(), // Changed from pChartId
    opvID: z.number().default(0), // Changed from opvId
    opipCaseNo: z.number().default(0),
    patOpip: z.string().length(1).default("I"),
    opipDate: z.date(),
    oldPChartID: z.number().default(0), // Changed from oldPChartId
    rActiveYN: z.string().default("Y"),
    transferYN: z.string().default("N"),
    rNotes: z.string().optional().nullable(),
  }),
  allergyDetails: z.array(allergyDetailSchema).min(1, "At least one allergy must be added"),
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
  const [allergyDetails, setAllergyDetails] = useState<OPIPHistAllergyDetailDto[]>([]);

  // Master data states
  const [medicationForms, setMedicationForms] = useState<MedicationFormDto[]>([]);
  const [medicationGenerics, setMedicationGenerics] = useState<MedicationGenericDto[]>([]);
  const [medicationList, setMedicationList] = useState<MedicationListDto[]>([]);

  const serverDate = useServerDate();
  const isEditMode = !!existingAllergy;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<AllergyFormData>({
    resolver: zodResolver(allergyFormSchema),
    mode: "onChange",
  });

  // Load master data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [{ data: forms }, { data: generics }, { data: medications }] = await Promise.all([
          medicationFormService.getAll(),
          medicationGenericService.getAll(),
          medicationListService.getAll(),
        ]);

        ස: setMedicationForms(forms.filter((f) => f.rActiveYN === "Y"));
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
            opIPHistAllergyMastDto: {
              opipDate: existingAllergy.opIPHistAllergyMastDto.opipDate || serverDate,
              opipAlgId: existingAllergy.opIPHistAllergyMastDto.opipAlgId || 0,
              opipNo: existingAllergy.opIPHistAllergyMastDto.opipNo || admission.ipAdmissionDto.admitID,
              pChartID: existingAllergy.opIPHistAllergyMastDto.pChartID || admission.ipAdmissionDto.pChartID,
              opvID: existingAllergy.opIPHistAllergyMastDto.opvID || 0,
              opipCaseNo: existingAllergy.opIPHistAllergyMastDto.opipCaseNo || admission.ipAdmissionDto.oPIPCaseNo || 0,
              patOpip: admission.ipAdmissionDto.patOpip || "I",
              oldPChartID: existingAllergy.opIPHistAllergyMastDto.oldPChartID || 0,
              rNotes: existingAllergy.opIPHistAllergyMastDto.rNotes || null,
              rActiveYN: existingAllergy.opIPHistAllergyMastDto.rActiveYN || "Y",
              transferYN: existingAllergy.opIPHistAllergyMastDto.transferYN || "N",
            },
            allergyDetails: (existingAllergy.allergyDetails || []).map((detail) => ({
              ...detail,
              mlId: detail.mlId || 0,
              mfId: detail.mfId || 0,
              mGenId: detail.mGenId || 0,
              opipAlgDetailId: detail.opipAlgDetailId || 0,
              opipAlgId: detail.opipAlgId || 0,
              mfName: detail.mfName || "",
              medText: detail.medText || "",
              mGenName: detail.mGenName || "",
              rActiveYN: detail.rActiveYN || "Y",
              transferYN: detail.transferYN || "N",
              rNotes: detail.rNotes || "",
            })),
          }
        : {
            opIPHistAllergyMastDto: {
              opipAlgId: 0,
              opipDate: serverDate,
              rActiveYN: "Y",
              pChartID: admission.ipAdmissionDto.pChartID,
              opipNo: admission.ipAdmissionDto.admitID,
              opipCaseNo: admission.ipAdmissionDto.oPIPCaseNo || 0,
              patOpip: "I",
              transferYN: "N",
              opvID: 0,
              oldPChartID: 0,
              rNotes: "",
            },
            allergyDetails: [],
          };

      reset(initialData);
      setAllergyDetails((initialData?.allergyDetails as OPIPHistAllergyDetailDto[]) ?? []);
    }
  }, [open, admission, existingAllergy, reset, serverDate]);

  const handleMedicationSelect = (medication: MedicationListDto | null) => {
    if (medication) {
      const form = medicationForms.find((f) => f.mFID === medication.mfID);
      const generic = medicationGenerics.find((g) => g.mGenID === medication.mGenID);
      const newDetail: OPIPHistAllergyDetailDto = {
        opipAlgDetailId: 0,
        opipAlgId: 0,
        mfId: medication.mfID,
        mfName: form?.mFName || "Unknown Form", // Provide fallback
        mlId: medication.mlID,
        medText: medication.medText,
        mGenId: medication.mGenID,
        mGenCode: generic?.mGenCode || null,
        mGenName: generic?.mGenName || "Unknown Generic", // Provide fallback
        rActiveYN: "Y",
        transferYN: "N",
        rNotes: "",
      };

      setAllergyDetails([...allergyDetails, newDetail]);
    }
  };

  const handleRemoveDetail = (index: number) => {
    setAllergyDetails(allergyDetails.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: AllergyFormData) => {
    try {
      setIsSubmitting(true);
      const submissionData: AllergyDto = {
        opIPHistAllergyMastDto: {
          opipAlgId: data.opIPHistAllergyMastDto.opipAlgId || 0,
          opipDate: data.opIPHistAllergyMastDto.opipDate || serverDate,
          opipNo: data.opIPHistAllergyMastDto.opipNo || admission.ipAdmissionDto.admitID,
          pChartID: data.opIPHistAllergyMastDto.pChartID,
          opvID: data.opIPHistAllergyMastDto.opvID || 0,
          opipCaseNo: data.opIPHistAllergyMastDto.opipCaseNo || admission.ipAdmissionDto.oPIPCaseNo || 0,
          oldPChartID: data.opIPHistAllergyMastDto.oldPChartID || 0,
          patOpip: data.opIPHistAllergyMastDto.patOpip || "I",
          rActiveYN: data.opIPHistAllergyMastDto.rActiveYN || "Y",
          transferYN: data.opIPHistAllergyMastDto.transferYN || "N",
          rNotes: data.opIPHistAllergyMastDto.rNotes || null,
        },
        allergyDetails: allergyDetails.map((detail) => ({
          opipAlgId: data.opIPHistAllergyMastDto.opipAlgId || 0,
          opipAlgDetailId: detail.opipAlgDetailId || 0,
          mfId: detail.mfId || 0,
          mfName: detail.mfName || "",
          mlId: detail.mlId || 0,
          medText: detail.medText || "",
          mGenId: detail.mGenId || 0,
          mGenName: detail.mGenName || "",
          mGenCode: detail.mGenCode || null,
          rActiveYN: detail.rActiveYN || "Y",
          transferYN: detail.transferYN || "N",
          rNotes: detail.rNotes || null,
        })),
      };

      await onSubmit(submissionData);
      reset({
        opIPHistAllergyMastDto: {
          opipAlgId: 0,
          opipDate: serverDate,
          rActiveYN: "Y",
          pChartID: admission.ipAdmissionDto.pChartID,
          opipNo: admission.ipAdmissionDto.admitID,
          opipCaseNo: admission.ipAdmissionDto.oPIPCaseNo || 0,
          patOpip: "I",
          transferYN: "N",
          opvID: 0,
          oldPChartID: 0,
          rNotes: null,
        },
        allergyDetails: [],
      });
      setAllergyDetails([]);
      onClose();
    } catch (error) {
      console.error("Error submitting allergy:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isDirty || allergyDetails.length > 0) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const performReset = () => {
    if (existingAllergy) {
      reset({
        opIPHistAllergyMastDto: {
          ...existingAllergy.opIPHistAllergyMastDto,
          opipNo: existingAllergy.opIPHistAllergyMastDto.opipNo || admission.ipAdmissionDto.admitID,
          pChartID: existingAllergy.opIPHistAllergyMastDto.pChartID || admission.ipAdmissionDto.pChartID,
          opvID: existingAllergy.opIPHistAllergyMastDto.opvID || 0,
          opipCaseNo: existingAllergy.opIPHistAllergyMastDto.opipCaseNo || admission.ipAdmissionDto.oPIPCaseNo || 0,
          oldPChartID: existingAllergy.opIPHistAllergyMastDto.oldPChartID || 0,
          rNotes: existingAllergy.opIPHistAllergyMastDto.rNotes || null,
        },
        allergyDetails: existingAllergy.allergyDetails || [],
      });
      setAllergyDetails(existingAllergy.allergyDetails || []);
    } else {
      reset({
        opIPHistAllergyMastDto: {
          opipAlgId: 0,
          opipDate: serverDate,
          rActiveYN: "Y",
          pChartID: admission.ipAdmissionDto.pChartID,
          opipNo: admission.ipAdmissionDto.admitID,
          opipCaseNo: admission.ipAdmissionDto.oPIPCaseNo || 0,
          patOpip: "I",
          transferYN: "N",
          opvID: 0,
          oldPChartID: 0,
          rNotes: null,
        },
        allergyDetails: [],
      });
      setAllergyDetails([]);
    }
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
                  disabled={isSubmitting || (!isDirty && allergyDetails.length === 0)}
                  size="small"
                />
                <SmartButton
                  text={isEditMode ? "Update" : "Save"}
                  onClick={handleSubmit(onFormSubmit)}
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  disabled={isSubmitting || allergyDetails.length === 0}
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
                      <EnhancedFormField name="opIPHistAllergyMastDto.opipDate" control={control} type="datepicker" label="Date" required disabled={viewOnly} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="opIPHistAllergyMastDto.rActiveYN" control={control} type="switch" label="Active" disabled={viewOnly} size="small" />
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
                          onChange={(_, newValue) => handleMedicationSelect(newValue)}
                          size="small"
                          renderInput={(params) => <TextField {...params} label="Search Medication" placeholder="Type to search..." />}
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
                    Allergy Details ({allergyDetails.length})
                  </Typography>

                  {allergyDetails.length === 0 ? (
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
                          {allergyDetails.map((detail, index) => (
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
          setShowResetConfirmation(false);
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
