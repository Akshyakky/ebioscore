// src/pages/patientAdministration/WardBedTransfer/Components/BedTransferDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { WrBedDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { BedTransferRequestDto } from "@/interfaces/PatientAdministration/BedTransferRequestDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import BedSelectionDialog from "@/pages/hospitalAdministration/ManageBeds/BedSelection/BedSelectionDialog";
import { useBedSelection } from "@/pages/hospitalAdministration/ManageBeds/hooks/useBedSelection";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hotel as BedIcon, Clear as ClearIcon, MedicalServices as DoctorIcon, Person as PatientIcon, SwapHoriz as TransferIcon } from "@mui/icons-material";
import { Alert, Box, Chip, Grid, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Enhanced transfer schema with comprehensive validation
const transferSchema = z.object({
  admitID: z.number().min(1, "Admission ID is required"),
  pChartID: z.number().min(1, "Patient chart ID is required"),
  pChartCode: z.string().min(1, "Patient chart code is required"),
  // New bed details
  bedID: z.number().min(1, "Please select a bed for transfer"),
  bedName: z.string().min(1, "Bed name is required"),
  rlID: z.number().min(1, "Room ID is required"),
  rName: z.string().min(1, "Room name is required"),
  rGrpID: z.number().min(1, "Room group ID is required"),
  rGrpName: z.string().min(1, "Room group name is required"),
  // New physician details
  treatPhyID: z.number().min(1, "Please select a treating physician"),
  treatPhyName: z.string().min(1, "Treating physician name is required"),
  treatingSpecialtyID: z.number().optional().default(0),
  treatingPhySpecialty: z.string().optional().default(""),
  // Transfer details
  reasonForTransfer: z.string().min(1, "Please provide a reason for transfer").max(500, "Reason must not exceed 500 characters"),
  transferDate: z.string().min(1, "Transfer date is required"),
  rNotes: z.string().max(1000, "Notes must not exceed 1000 characters").optional().default(""),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface BedTransferDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transferData: BedTransferRequestDto) => Promise<void>;
  patient: PatientSearchResult | null;
  currentAdmission: AdmissionDto | null;
}

const BedTransferDialog: React.FC<BedTransferDialogProps> = ({ open, onClose, onSubmit, patient, currentAdmission }) => {
  const [selectedBed, setSelectedBed] = useState<WrBedDto | null>(null);
  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const serverDate = useServerDate();

  // Load dropdown values
  const { attendingPhy = [] } = useDropdownValues(["attendingPhy"]);

  // Load bed data (available beds only for transfer)
  const {
    beds,
    rooms,
    roomGroups,
    loading: bedLoading,
  } = useBedSelection({
    filters: {
      availableOnly: true,
      excludeBedIds: currentAdmission?.ipAdmissionDetailsDto?.bedID ? [currentAdmission.ipAdmissionDetailsDto.bedID] : [],
    },
  });

  // Form setup with comprehensive validation
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    mode: "onChange",
    defaultValues: {
      admitID: 0,
      pChartID: 0,
      pChartCode: "",
      bedID: 0,
      bedName: "",
      rlID: 0,
      rName: "",
      rGrpID: 0,
      rGrpName: "",
      treatPhyID: 0,
      treatPhyName: "",
      treatingSpecialtyID: 0,
      treatingPhySpecialty: "",
      reasonForTransfer: "",
      transferDate: serverDate.toISOString(),
      rNotes: "",
    },
  });

  // Watch form values
  const watchedBedID = watch("bedID");
  const watchedTreatPhyID = watch("treatPhyID");

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && currentAdmission && patient && !isInitialized) {
      initializeForm();
      setIsInitialized(true);
    } else if (!open) {
      setIsInitialized(false);
      setSelectedBed(null);
    }
  }, [open, currentAdmission, patient, isInitialized]);

  // Initialize form with current admission data
  const initializeForm = useCallback(() => {
    if (!currentAdmission || !patient) return;

    const admission = currentAdmission.ipAdmissionDto;

    reset({
      admitID: admission.admitID,
      pChartID: admission.pChartID,
      pChartCode: admission.pChartCode,
      bedID: 0,
      bedName: "",
      rlID: 0,
      rName: "",
      rGrpID: 0,
      rGrpName: "",
      treatPhyID: 0,
      treatPhyName: "",
      treatingSpecialtyID: 0,
      treatingPhySpecialty: "",
      reasonForTransfer: "",
      transferDate: serverDate.toISOString(),
      rNotes: "",
    });
  }, [currentAdmission, patient, reset, serverDate]);

  // Handle bed selection
  const handleBedSelect = useCallback(
    (bed: WrBedDto) => {
      setSelectedBed(bed);
      setValue("bedID", bed.bedID, { shouldValidate: true });
      setValue("bedName", bed.bedName, { shouldValidate: true });
      setValue("rlID", bed.rlID, { shouldValidate: true });
      setValue("rName", bed.roomList?.rName || "", { shouldValidate: true });
      setValue("rGrpID", bed.roomList?.roomGroup?.rGrpID || 0, { shouldValidate: true });
      setValue("rGrpName", bed.roomList?.roomGroup?.rGrpName || "", { shouldValidate: true });

      setIsBedSelectionOpen(false);
    },
    [setValue]
  );

  // Handle treating physician change
  const handleTreatingPhysicianChange = useCallback(
    (value: any) => {
      const selectedOption = attendingPhy.find((option) => option.value === value.value);
      if (selectedOption) {
        setValue("treatPhyID", Number(value.value.split("-")[0]), { shouldValidate: true });
        setValue("treatPhyName", selectedOption.label, { shouldValidate: true });
        setValue("treatingSpecialtyID", 0, { shouldValidate: true });
        setValue("treatingPhySpecialty", "General", { shouldValidate: true });
      }
    },
    [attendingPhy, setValue]
  );

  // Form submission handler
  const handleFormSubmit = async (data: TransferFormData) => {
    try {
      const transferRequest: BedTransferRequestDto = {
        admitID: data.admitID,
        pChartID: data.pChartID,
        pChartCode: data.pChartCode,
        bedID: data.bedID,
        bedName: data.bedName,
        rlID: data.rlID,
        rName: data.rName,
        rGrpID: data.rGrpID,
        rGrpName: data.rGrpName,
        treatPhyID: data.treatPhyID,
        treatPhyName: data.treatPhyName,
        treatingSpecialtyID: data.treatingSpecialtyID || 0,
        treatingPhySpecialty: data.treatingPhySpecialty || "",
        reasonForTransfer: data.reasonForTransfer,
        transferDate: data.transferDate,
        rNotes: data.rNotes || "",
      };

      await onSubmit(transferRequest);
    } catch (error) {
      console.error("Error submitting transfer:", error);
      throw error;
    }
  };

  // Clear form handler
  const handleClear = () => {
    initializeForm();
    setSelectedBed(null);
  };

  // Close dialog handler
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Get current admission details for display
  const currentAdmissionDetails = useMemo(() => {
    if (!currentAdmission) return null;

    const admission = currentAdmission.ipAdmissionDto;
    const details = currentAdmission.ipAdmissionDetailsDto;
    const bedDetails = currentAdmission.wrBedDetailsDto;

    return {
      patientName: `${admission.pTitle} ${admission.pfName} ${admission.pmName || ""} ${admission.plName}`.trim(),
      admitCode: admission.admitCode,
      currentBed: bedDetails.bedName,
      currentRoom: details.rName,
      currentDepartment: admission.deptName,
      attendingPhysician: admission.attendingPhysicianName,
    };
  }, [currentAdmission]);

  const dialogActions = (
    <>
      <CustomButton variant="outlined" text="Clear" icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || !isDirty} color="inherit" />
      <CustomButton variant="outlined" text="Cancel" onClick={handleClose} disabled={isSubmitting} />
      <SmartButton
        variant="contained"
        text="Process Transfer"
        icon={TransferIcon}
        onAsyncClick={handleSubmit(handleFormSubmit)}
        asynchronous
        disabled={!isValid || !isDirty}
        color="primary"
        loadingText="Processing..."
        successText="Transferred!"
      />
    </>
  );

  if (!patient || !currentAdmission) {
    return null;
  }

  return (
    <>
      <GenericDialog
        open={open}
        onClose={handleClose}
        title="Ward/Bed Transfer"
        maxWidth="lg"
        fullWidth
        disableBackdropClick={isSubmitting}
        disableEscapeKeyDown={isSubmitting}
        actions={dialogActions}
      >
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={3}>
              {/* Current Patient and Admission Information */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PatientIcon />
                    Current Admission Details
                  </Typography>

                  {currentAdmissionDetails && (
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2">
                          <strong>Patient:</strong> {currentAdmissionDetails.patientName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>UHID:</strong> {patient.pChartCode}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Admission Code:</strong> {currentAdmissionDetails.admitCode}
                        </Typography>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="body2">
                          <strong>Current Location:</strong> {currentAdmissionDetails.currentRoom}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Current Bed:</strong> {currentAdmissionDetails.currentBed}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Department:</strong> {currentAdmissionDetails.currentDepartment}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Paper>
              </Grid>

              {/* Transfer Information */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TransferIcon />
                  Transfer Details
                </Typography>
              </Grid>

              {/* New Bed Selection */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 1, border: "1px solid", borderColor: "grey.300" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BedIcon fontSize="small" />
                      Select New Bed
                    </Typography>
                    <CustomButton variant="outlined" text="Select Bed" size="small" onClick={() => setIsBedSelectionOpen(true)} disabled={isSubmitting} />
                  </Box>

                  {selectedBed ? (
                    <Box>
                      <Chip
                        icon={<BedIcon />}
                        label={`${selectedBed.bedName} (${selectedBed.roomList?.rName || "Unknown Room"})`}
                        color="success"
                        size="small"
                        onDelete={() => {
                          setSelectedBed(null);
                          setValue("bedID", 0);
                          setValue("bedName", "");
                          setValue("rlID", 0);
                          setValue("rName", "");
                          setValue("rGrpID", 0);
                          setValue("rGrpName", "");
                        }}
                      />

                      {selectedBed.roomList?.roomGroup && (
                        <Box sx={{ mt: 1, p: 1, backgroundColor: "info.50", borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            <strong>Room Group:</strong> {selectedBed.roomList.roomGroup.rGrpName} |<strong> Department:</strong> {selectedBed.roomList.roomGroup.deptName}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {bedLoading ? "Loading available beds..." : "No bed selected"}
                    </Typography>
                  )}

                  {errors.bedID && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: "block" }}>
                      {errors.bedID.message}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Treating Physician */}
              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="treatPhyName"
                  control={control}
                  type="select"
                  label="New Treating Physician"
                  required
                  size="small"
                  options={attendingPhy}
                  onChange={handleTreatingPhysicianChange}
                  helperText="Select the physician who will take over patient care"
                  adornment={<DoctorIcon />}
                />
              </Grid>

              {/* Transfer Date */}
              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="transferDate"
                  control={control}
                  type="datetimepicker"
                  label="Transfer Date & Time"
                  required
                  size="small"
                  helperText="When should the transfer be executed"
                />
              </Grid>

              {/* Reason for Transfer */}
              <Grid size={{ xs: 12 }}>
                <EnhancedFormField
                  name="reasonForTransfer"
                  control={control}
                  type="textarea"
                  label="Reason for Transfer"
                  required
                  size="small"
                  rows={3}
                  placeholder="Describe the medical or administrative reason for this transfer..."
                  helperText="Provide a clear explanation for the transfer (required for medical records)"
                />
              </Grid>

              {/* Transfer Notes */}
              <Grid size={{ xs: 12 }}>
                <EnhancedFormField
                  name="rNotes"
                  control={control}
                  type="textarea"
                  label="Transfer Notes"
                  size="small"
                  rows={3}
                  placeholder="Additional notes, special instructions, or observations..."
                  helperText="Optional additional information about the transfer"
                />
              </Grid>

              {/* Transfer Validation Alert */}
              {selectedBed && currentAdmissionDetails && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Transfer Summary:</strong> Moving {currentAdmissionDetails.patientName} from{" "}
                      <strong>
                        {currentAdmissionDetails.currentRoom} ({currentAdmissionDetails.currentBed})
                      </strong>{" "}
                      to{" "}
                      <strong>
                        {selectedBed.roomList?.rName} ({selectedBed.bedName})
                      </strong>
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </form>
        </Box>
      </GenericDialog>

      {/* Bed Selection Dialog */}
      <BedSelectionDialog
        open={isBedSelectionOpen}
        onClose={() => setIsBedSelectionOpen(false)}
        onSelect={handleBedSelect}
        beds={beds}
        rooms={rooms}
        roomGroups={roomGroups}
        title="Select Bed for Transfer"
        filters={{
          availableOnly: true,
          excludeBedIds: currentAdmission?.ipAdmissionDetailsDto?.bedID ? [currentAdmission.ipAdmissionDetailsDto.bedID] : [],
        }}
        allowOccupied={false}
      />
    </>
  );
};

export default BedTransferDialog;
