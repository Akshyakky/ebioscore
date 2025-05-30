// src/pages/patientAdministration/AdmissionPage/Components/AdmissionFormDialog.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Grid, Typography, Divider, Alert, Paper, Chip, Avatar } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save as SaveIcon, Clear as ClearIcon, Person as PatientIcon, Hotel as BedIcon, LocalHospital as AdmissionIcon, CalendarToday as CalendarIcon } from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import BedSelectionDialog from "@/pages/hospitalAdministration/ManageBeds/BedSelection/BedSelectionDialog";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { AdmissionDto, IPAdmissionDto, IPAdmissionDetailsDto, WrBedDetailsDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { WrBedDto, RoomListDto, RoomGroupDto } from "@/interfaces/HospitalAdministration/Room-BedSetUpDto";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useBedSelection } from "@/pages/hospitalAdministration/ManageBeds/hooks/useBedSelection";
import { useServerDate } from "@/hooks/Common/useServerDate";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";

// Validation schema for admission form
const admissionSchema = z.object({
  // Patient information (read-only)
  pChartID: z.number().min(1, "Patient is required"),
  pChartCode: z.string().min(1, "Patient chart code is required"),

  // Admission basic information
  admitCode: z.string().min(1, "Admission code is required"),
  admitDate: z.date().default(new Date()),
  caseTypeCode: z.string().min(1, "Case type is required"),
  caseTypeName: z.string().default(""),
  admissionType: z.string().min(1, "Admission type is required"),

  // Medical information
  attendingPhysicianId: z.number().min(1, "Attending physician is required"),
  attendingPhysicianName: z.string().default(""),
  primaryPhysicianId: z.number().optional(),
  primaryPhysicianName: z.string().optional().default(""),
  primaryReferralSourceId: z.number().optional(),
  primaryReferralSourceName: z.string().optional().default(""),

  // Department and location
  deptID: z.number().min(1, "Department is required"),
  deptName: z.string().default(""),
  dulId: z.number().optional().default(0),

  // Bed assignment
  bedID: z.number().min(1, "Bed assignment is required"),
  bedName: z.string().default(""),
  rlID: z.number().min(1, "Room is required"),
  rName: z.string().default(""),
  wCatID: z.number().optional(),
  wCatName: z.string().optional().default(""),

  // Patient type and payment
  pTypeID: z.number().min(1, "Patient type is required"),
  pTypeName: z.string().default(""),

  // Insurance and additional information
  insuranceYN: z.enum(["Y", "N"]).default("N"),
  deliveryCaseYN: z.enum(["Y", "N"]).default("N"),
  provDiagnosisYN: z.enum(["Y", "N"]).default("N"),
  dischargeAdviceYN: z.enum(["Y", "N"]).default("N"),

  // Instructions and notes
  nurseIns: z.string().optional().default(""),
  clerkIns: z.string().optional().default(""),
  patientIns: z.string().optional().default(""),

  // Additional fields
  advisedVisitNo: z.number().default(1),
  visitGesy: z.string().optional().default(""),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

interface AdmissionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (admission: AdmissionDto) => Promise<void>;
  patient: PatientSearchResult | null;
  existingAdmission?: any; // For editing existing admission
}

const AdmissionFormDialog: React.FC<AdmissionFormDialogProps> = ({ open, onClose, onSubmit, patient, existingAdmission }) => {
  const [selectedBed, setSelectedBed] = useState<WrBedDto | null>(null);
  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);
  const [admitCode, setAdmitCode] = useState<string>("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const isEditMode = !!existingAdmission;
  const serverDate = useServerDate();

  // Load dropdown values
  const {
    caseType = [],
    admissionType = [],
    attendingPhy = [],
    primaryIntroducingSource = [],
    department = [],
    unit = [],
    payment = [],
    bedCategory = [],
  } = useDropdownValues(["caseType", "admissionType", "attendingPhy", "primaryIntroducingSource", "department", "unit", "payment", "bedCategory"]);

  // Load bed data
  const {
    beds,
    rooms,
    roomGroups,
    loading: bedLoading,
  } = useBedSelection({
    filters: { availableOnly: true },
  });

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
    mode: "onChange",
    defaultValues: {
      pChartID: patient?.pChartID || 0,
      pChartCode: patient?.pChartCode || "",
      admitCode: "",
      admitDate: serverDate,
      caseTypeCode: "",
      caseTypeName: "",
      admissionType: "",
      attendingPhysicianId: 0,
      attendingPhysicianName: "",
      primaryPhysicianId: 0,
      primaryPhysicianName: "",
      primaryReferralSourceId: 0,
      primaryReferralSourceName: "",
      deptID: 0,
      deptName: "",
      dulId: 0,
      bedID: 0,
      bedName: "",
      rlID: 0,
      rName: "",
      wCatID: 0,
      wCatName: "",
      pTypeID: 0,
      pTypeName: "",
      insuranceYN: "N",
      deliveryCaseYN: "N",
      provDiagnosisYN: "N",
      dischargeAdviceYN: "N",
      nurseIns: "",
      clerkIns: "",
      patientIns: "",
      advisedVisitNo: 1,
      visitGesy: "",
    },
  });

  // Watch form values
  const watchedDeptID = watch("deptID");
  const watchedBedID = watch("bedID");

  // Generate admission code on form open
  useEffect(() => {
    if (open && !isEditMode) {
      generateAdmissionCode();
    }
  }, [open, isEditMode]);

  // Reset form when patient changes
  useEffect(() => {
    if (open && patient) {
      reset({
        pChartID: patient.pChartID,
        pChartCode: patient.pChartCode,
        admitCode: admitCode,
        admitDate: serverDate,
        // Reset other fields to defaults
      });
    }
  }, [open, patient, admitCode, serverDate, reset]);

  // Generate admission code
  const generateAdmissionCode = useCallback(async () => {
    try {
      setIsGeneratingCode(true);
      const result = await extendedAdmissionService.generateAdmitCode();
      if (result.success && result.data) {
        setAdmitCode(result.data);
        setValue("admitCode", result.data, { shouldValidate: true });
      }
    } catch (error) {
      console.error("Error generating admission code:", error);
    } finally {
      setIsGeneratingCode(false);
    }
  }, [setValue]);

  // Handle bed selection
  const handleBedSelect = useCallback(
    (bed: WrBedDto) => {
      setSelectedBed(bed);
      setValue("bedID", bed.bedID, { shouldValidate: true });
      setValue("bedName", bed.bedName, { shouldValidate: true });
      setValue("rlID", bed.rlID, { shouldValidate: true });
      setValue("rName", bed.roomList?.rName || "", { shouldValidate: true });
      setValue("wCatID", bed.wbCatID || 0, { shouldValidate: true });
      setValue("wCatName", bed.wbCatName || "", { shouldValidate: true });

      // Set department from room group
      if (bed.roomList?.roomGroup) {
        setValue("deptID", bed.roomList.roomGroup.deptID || 0, { shouldValidate: true });
        setValue("deptName", bed.roomList.roomGroup.deptName || "", { shouldValidate: true });
      }

      setIsBedSelectionOpen(false);
    },
    [setValue]
  );

  // Handle dropdown changes
  const handleCaseTypeChange = useCallback(
    (value: any) => {
      const selectedOption = caseType.find((option) => option.value === value);
      if (selectedOption) {
        setValue("caseTypeCode", selectedOption.value as string, { shouldValidate: true });
        setValue("caseTypeName", selectedOption.label, { shouldValidate: true });
      }
    },
    [caseType, setValue]
  );

  const handleAttendingPhysicianChange = useCallback(
    (value: any) => {
      const selectedOption = attendingPhy.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("attendingPhysicianId", Number(value), { shouldValidate: true });
        setValue("attendingPhysicianName", selectedOption.label, { shouldValidate: true });
      }
    },
    [attendingPhy, setValue]
  );

  const handlePatientTypeChange = useCallback(
    (value: any) => {
      const selectedOption = payment.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("pTypeID", Number(value), { shouldValidate: true });
        setValue("pTypeName", selectedOption.label, { shouldValidate: true });
      }
    },
    [payment, setValue]
  );

  // Form submission
  const onFormSubmit = async (data: AdmissionFormData) => {
    try {
      // Construct admission DTO
      const ipAdmissionDto: IPAdmissionDto = {
        admitID: existingAdmission?.ipAdmissionDto?.admitID || 0,
        admitCode: data.admitCode,
        pChartID: data.pChartID,
        pChartCode: data.pChartCode,
        oPIPCaseNo: 0,
        opipNo: 0,
        patOPIP: "",
        admitDate: data.admitDate,
        admitStatus: "ADMITTED",
        provDiagnosisYN: data.provDiagnosisYN,
        insuranceYN: data.insuranceYN,
        ipStatus: "ADMITTED",
        dischargeAdviceYN: data.dischargeAdviceYN,
        nurseIns: data.nurseIns,
        clerkIns: data.clerkIns,
        pTitle: "",
        patientIns: data.patientIns,
        acApprovedBy: "",
        acApprovedId: 0,
        acReason: "",
        caseTypeCode: data.caseTypeCode,
        caseTypeName: data.caseTypeName,
        deliveryCaseYN: data.deliveryCaseYN,
        deptID: data.deptID,
        deptName: data.deptName,
        pChartCompId: 0,
        pfName: "",
        plName: "",
        pmName: "",
        oldPChartID: 0,
        visitGesy: data.visitGesy || "",
        dulId: data.dulId || 0,
        advisedVisitNo: data.advisedVisitNo,
        pTypeID: data.pTypeID,
        pTypeName: data.pTypeName,
        patNokID: 0,
        attendingPhysicianId: data.attendingPhysicianId,
        attendingPhysicianName: data.attendingPhysicianName,
        primaryPhysicianId: data.primaryPhysicianId,
        primaryPhysicianName: data.primaryPhysicianName,
        primaryReferralSourceId: data.primaryReferralSourceId,
        primaryReferralSourceName: data.primaryReferralSourceName,
        rActiveYN: "Y",
        transferYN: "N",
        rCreatedBy: "System",
        rCreatedDate: new Date(),
        rModifiedBy: "System",
        rModifiedDate: new Date(),
        rNotes: "",
      };

      const ipAdmissionDetailsDto: IPAdmissionDetailsDto = {
        adID: existingAdmission?.ipAdmissionDetailsDto?.adID || 0,
        pChartID: data.pChartID,
        admitID: existingAdmission?.ipAdmissionDto?.admitID || 0,
        wCatID: data.wCatID || 0,
        wCatCode: "",
        wCatName: data.wCatName || "",
        wNameID: 0,
        wNameCode: "",
        wName: "",
        rlID: data.rlID,
        rlCode: "",
        rName: data.rName,
        bedID: data.bedID,
        bedName: data.bedName,
        bStatus: "OCCUPIED",
        transFromDate: data.admitDate,
        transToDate: undefined,
        plannedProc: "",
        admissionType: data.admissionType,
        patientStatus: "ADMITTED",
        advPhyID: data.attendingPhysicianId,
        advPhyName: data.attendingPhysicianName,
        treatPhyID: data.attendingPhysicianId,
        treatPhyName: data.attendingPhysicianName,
        facID: 0,
        facName: "",
        bStatusValue: "OCCUPIED",
        patientStatusValue: "ADMITTED",
        admitCode: data.admitCode,
        pChartCode: data.pChartCode,
        pChartIDCompID: 0,
        roomLocation: data.rName,
        treatingPhySpecialty: "",
        treatingSpecialtyID: 0,
        oldPChartID: 0,
        rActiveYN: "Y",
        transferYN: "N",
        rCreatedBy: "System",
        rCreatedDate: new Date(),
        rModifiedBy: "System",
        rModifiedDate: new Date(),
        rNotes: "",
      };

      const wrBedDetailsDto: WrBedDetailsDto = {
        bedDetID: existingAdmission?.wrBedDetailsDto?.bedDetID || 0,
        bedID: data.bedID,
        bedName: data.bedName,
        bedStatusValue: "OCCUPIED",
        bedDeptID: data.deptID,
        rlID: data.rlID,
        rName: data.rName,
        rGrpID: selectedBed?.roomList?.roomGroup?.rGrpID || 0,
        rGrpName: selectedBed?.roomList?.roomGroup?.rGrpName || "",
        pChartID: data.pChartID,
        pChartCode: data.pChartCode,
        pTitle: "",
        pfName: "",
        patDeptID: data.deptID,
        adID: existingAdmission?.ipAdmissionDetailsDto?.adID || 0,
        admitID: existingAdmission?.ipAdmissionDto?.admitID || 0,
        admitDate: data.admitDate,
        tin: data.admitDate,
        tout: undefined,
        dischgID: 0,
        dischgDate: undefined,
        transactionType: "ADMISSION",
        isChildYN: "N",
        isBoApplicableYN: "N",
        oldPChartID: 0,
        rActiveYN: "Y",
        transferYN: "N",
        rCreatedBy: "System",
        rCreatedDate: new Date(),
        rModifiedBy: "System",
        rModifiedDate: new Date(),
        rNotes: "",
      };

      const admissionDto: AdmissionDto = {
        ipAdmissionDto,
        ipAdmissionDetailsDto,
        wrBedDetailsDto,
      };

      await onSubmit(admissionDto);
    } catch (error) {
      console.error("Error submitting admission:", error);
      throw error;
    }
  };

  // Clear form
  const handleClear = () => {
    reset();
    setSelectedBed(null);
    setAdmitCode("");
  };

  // Dialog actions
  const dialogActions = (
    <>
      <CustomButton variant="outlined" text="Clear" icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || !isDirty} color="inherit" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update Admission" : "Admit Patient"}
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={!isValid || !isDirty}
        color="primary"
        loadingText={isEditMode ? "Updating..." : "Admitting..."}
        successText={isEditMode ? "Updated!" : "Admitted!"}
      />
    </>
  );

  return (
    <>
      <GenericDialog
        open={open}
        onClose={onClose}
        title={isEditMode ? "Edit Admission" : "New Patient Admission"}
        maxWidth="xl"
        fullWidth
        disableBackdropClick={isSubmitting}
        disableEscapeKeyDown={isSubmitting}
        actions={dialogActions}
      >
        <Box sx={{ p: 2 }}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <Grid container spacing={3}>
              {/* Patient Information Section */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
                  <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PatientIcon />
                    Patient Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <EnhancedFormField name="pChartCode" control={control} type="text" label="Patient UHID" required disabled size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      {patient && (
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                            <PatientIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body1" fontWeight="medium">
                            {patient.fullName}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Admission Details Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AdmissionIcon />
                  Admission Details
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField
                  name="admitCode"
                  control={control}
                  type="text"
                  label="Admission Code"
                  required
                  disabled
                  size="small"
                  helperText={isGeneratingCode ? "Generating code..." : "Auto-generated admission code"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="admitDate" control={control} type="datepicker" label="Admission Date" required size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="caseTypeCode" control={control} type="select" label="Case Type" required size="small" options={caseType} onChange={handleCaseTypeChange} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField name="admissionType" control={control} type="select" label="Admission Type" required size="small" options={admissionType} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="pTypeID"
                  control={control}
                  type="select"
                  label="Patient Type / Payment Source"
                  required
                  size="small"
                  options={payment}
                  onChange={handlePatientTypeChange}
                />
              </Grid>

              {/* Medical Team Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Medical Team
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField
                  name="attendingPhysicianId"
                  control={control}
                  type="select"
                  label="Attending Physician"
                  required
                  size="small"
                  options={attendingPhy}
                  onChange={handleAttendingPhysicianChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <EnhancedFormField name="primaryReferralSourceId" control={control} type="select" label="Primary Referral Source" size="small" options={primaryIntroducingSource} />
              </Grid>

              {/* Bed Assignment Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BedIcon />
                  Bed Assignment
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="subtitle1">Selected Bed:</Typography>
                  {selectedBed ? (
                    <Chip
                      icon={<BedIcon />}
                      label={`${selectedBed.bedName} (${selectedBed.roomList?.rName || "Unknown Room"})`}
                      color="primary"
                      onDelete={() => {
                        setSelectedBed(null);
                        setValue("bedID", 0);
                        setValue("bedName", "");
                        setValue("rlID", 0);
                        setValue("rName", "");
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No bed selected
                    </Typography>
                  )}
                </Box>
                <CustomButton variant="outlined" text="Select Bed" icon={BedIcon} onClick={() => setIsBedSelectionOpen(true)} disabled={isSubmitting} />
                {errors.bedID && (
                  <Typography variant="caption" color="error.main" sx={{ mt: 1, display: "block" }}>
                    {errors.bedID.message}
                  </Typography>
                )}
              </Grid>

              {/* Additional Options Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Additional Options
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="insuranceYN" control={control} type="switch" label="Has Insurance" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="deliveryCaseYN" control={control} type="switch" label="Delivery Case" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="provDiagnosisYN" control={control} type="switch" label="Provisional Diagnosis" size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="dischargeAdviceYN" control={control} type="switch" label="Discharge Advice" size="small" />
              </Grid>

              {/* Instructions Section */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Instructions
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="nurseIns" control={control} type="textarea" label="Nurse Instructions" size="small" rows={3} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="clerkIns" control={control} type="textarea" label="Clerk Instructions" size="small" rows={3} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="patientIns" control={control} type="textarea" label="Patient Instructions" size="small" rows={3} />
              </Grid>
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
        title="Select Bed for Admission"
        filters={{ availableOnly: true }}
        allowOccupied={false}
      />
    </>
  );
};

export default AdmissionFormDialog;
