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

// Schema remains the same
const admissionSchema = z.object({
  pChartID: z.number().min(1, "Patient is required"),
  pChartCode: z.string().min(1, "Patient chart code is required"),
  admitCode: z.string().min(1, "Admission code is required"),
  admitDate: z.date().default(new Date()),
  caseTypeCode: z.string().min(1, "Case type is required"),
  caseTypeName: z.string().default(""),
  admissionType: z.string().min(1, "Admission type is required"),
  rNotes: z.string().min(1, "Reason for admission is required"),
  attendingPhysicianId: z.coerce.number().min(1, "Attending physician is required"),
  attendingPhysicianName: z.string().default(""),
  primaryPhysicianId: z.number().optional(),
  primaryPhysicianName: z.string().optional().default(""),
  primaryReferralSourceId: z.number().optional(),
  primaryReferralSourceName: z.string().optional().default(""),
  deptID: z.number().min(1, "Department is required"),
  deptName: z.string().default(""),
  dulId: z.number().min(1, "Unit is required"),
  unitName: z.string().default(""),
  bedID: z.number().min(1, "Bed assignment is required"),
  bedName: z.string().default(""),
  rlID: z.number().min(1, "Room is required"),
  rName: z.string().default(""),
  wCatID: z.number().optional(),
  wCatName: z.string().optional().default(""),
  pTypeID: z.number().min(1, "PIC is required"),
  pTypeName: z.string().default(""),
  insuranceYN: z.enum(["Y", "N"]).default("N"),
  deliveryCaseYN: z.enum(["Y", "N"]).default("N"),
  provDiagnosisYN: z.enum(["Y", "N"]).default("N"),
  dischargeAdviceYN: z.enum(["Y", "N"]).default("N"),
  nurseIns: z.string().optional().default(""),
  clerkIns: z.string().optional().default(""),
  patientIns: z.string().optional().default(""),
  advisedVisitNo: z.number().default(1),
  visitGesy: z.string().optional().default(""),
  // Add patient name fields to schema
  pTitle: z.string().default(""),
  pfName: z.string().default(""),
  plName: z.string().default(""),
  pmName: z.string().default(""),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

interface AdmissionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (admission: AdmissionDto) => Promise<void>;
  patient: PatientSearchResult | null;
  existingAdmission?: any;
}

const AdmissionFormDialog: React.FC<AdmissionFormDialogProps> = ({ open, onClose, onSubmit, patient, existingAdmission }) => {
  const [selectedBed, setSelectedBed] = useState<WrBedDto | null>(null);
  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);
  const [admitCode, setAdmitCode] = useState<string>("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

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
    pic = [],
    bedCategory = [],
  } = useDropdownValues(["caseType", "admissionType", "attendingPhy", "primaryIntroducingSource", "department", "unit", "pic", "bedCategory"]);

  // Load bed data
  const {
    beds,
    rooms,
    roomGroups,
    loading: bedLoading,
  } = useBedSelection({
    filters: { availableOnly: true },
  });

  // Form setup with default values
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
      rNotes: "",
      attendingPhysicianId: 0,
      attendingPhysicianName: "",
      primaryPhysicianId: 0,
      primaryPhysicianName: "",
      primaryReferralSourceId: 0,
      primaryReferralSourceName: "",
      deptID: 0,
      deptName: "",
      dulId: 0,
      unitName: "",
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
      pTitle: "",
      pfName: "",
      plName: "",
      pmName: "",
    },
  });

  // Watch form values
  const watchedDeptID = watch("deptID");
  const watchedDulId = watch("dulId");
  const watchedBedID = watch("bedID");

  // Load patient data when patient is selected
  useEffect(() => {
    if (open && patient && !isEditMode) {
      loadPatientData();
    }
  }, [open, patient, isEditMode]);

  // Load patient data including name fields
  const loadPatientData = useCallback(async () => {
    if (!patient) return;

    try {
      const statusResult = await extendedAdmissionService.getPatientAdmissionStatus(patient.pChartID);

      if (statusResult.success && statusResult.data?.patientData) {
        const patRegister = statusResult.data.patientData.patRegisters;
        setPatientData(patRegister);

        // Set patient name fields in form
        setValue("pTitle", patRegister.pTitle || "", { shouldValidate: true });
        setValue("pfName", patRegister.pFName || "", { shouldValidate: true });
        setValue("plName", patRegister.pLName || "", { shouldValidate: true });
        setValue("pmName", patRegister.pMName || "", { shouldValidate: true });
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
    }
  }, [patient, setValue]);

  useEffect(() => {
    if (open && !isEditMode) {
      generateAdmissionCode();
    }
  }, [open, isEditMode]);

  useEffect(() => {
    if (open && patient) {
      reset({
        pChartID: patient.pChartID,
        pChartCode: patient.pChartCode,
        admitCode: admitCode,
        admitDate: serverDate,
        // Reset patient name fields - they will be set by loadPatientData
        pTitle: "",
        pfName: "",
        plName: "",
        pmName: "",
      });
    }
  }, [open, patient, admitCode, serverDate, reset]);

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

  const handleBedSelect = useCallback(
    (bed: WrBedDto) => {
      setSelectedBed(bed);
      setValue("bedID", bed.bedID, { shouldValidate: true });
      setValue("bedName", bed.bedName, { shouldValidate: true });
      setValue("rlID", bed.rlID, { shouldValidate: true });
      setValue("rName", bed.roomList?.rName || "", { shouldValidate: true });
      setValue("wCatID", bed.wbCatID || 0, { shouldValidate: true });
      setValue("wCatName", bed.wbCatName || "", { shouldValidate: true });

      if (bed.roomList?.roomGroup) {
        setValue("deptID", bed.roomList.roomGroup.deptID || 0, { shouldValidate: true });
        setValue("deptName", bed.roomList.roomGroup.deptName || "", { shouldValidate: true });
      }

      setIsBedSelectionOpen(false);
    },
    [setValue]
  );

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

  const handleDepartmentChange = useCallback(
    (value: any) => {
      const selectedOption = department.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("deptID", Number(value), { shouldValidate: true });
        setValue("deptName", selectedOption.label, { shouldValidate: true });
        setValue("dulId", 0, { shouldValidate: true });
        setValue("unitName", "", { shouldValidate: true });
      }
    },
    [department, setValue]
  );

  const handleUnitChange = useCallback(
    (value: any) => {
      const selectedOption = unit.find((option) => Number(option.value) === Number(value));
      if (selectedOption) {
        setValue("dulId", Number(value), { shouldValidate: true });
        setValue("unitName", selectedOption.label, { shouldValidate: true });
      }
    },
    [unit, setValue]
  );

  const handleAttendingPhysicianChange = useCallback(
    (value: any) => {
      const selectedOption = attendingPhy.find((option) => option.value === value.value);
      if (selectedOption) {
        setValue("attendingPhysicianId", Number(value.value.split("-")[0]), { shouldValidate: true });
        setValue("attendingPhysicianName", selectedOption.label, { shouldValidate: true });
        // setValue("treatingSpecialtyID", Number(value.value.split("-")[1]), { shouldValidate: true });
        // setValue("treatingPhySpecialty", selectedOption.label.split("|")[1], { shouldValidate: true });
      }
    },
    [attendingPhy, setValue]
  );

  const handlePICChange = useCallback(
    (value: any) => {
      const selectedOption = pic.find((option) => Number(option.value) === Number(value.value));
      if (selectedOption) {
        setValue("pTypeID", Number(selectedOption.value), { shouldValidate: true });
        setValue("pTypeName", selectedOption.label, { shouldValidate: true });
      }
    },
    [pic, setValue]
  );

  // Form submission with proper patient name fields
  const onFormSubmit = async (data: AdmissionFormData) => {
    try {
      const ipAdmissionDto: IPAdmissionDto = {
        admitID: existingAdmission?.ipAdmissionDto?.admitID || 0,
        admitCode: data.admitCode,
        pChartID: data.pChartID,
        pChartCode: data.pChartCode,
        oPIPCaseNo: 0,
        opipNo: 0,
        patOPIP: "I",
        admitDate: data.admitDate,
        admitStatus: "ADMITTED",
        provDiagnosisYN: data.provDiagnosisYN,
        insuranceYN: data.insuranceYN,
        ipStatus: "ADMITTED",
        dischargeAdviceYN: data.dischargeAdviceYN,
        nurseIns: data.nurseIns,
        clerkIns: data.clerkIns,
        pTitle: data.pTitle, // Properly assigned from patient data
        patientIns: data.patientIns,
        acApprovedBy: "",
        acApprovedId: 0,
        acReason: data.rNotes,
        caseTypeCode: data.caseTypeCode,
        caseTypeName: data.caseTypeName,
        deliveryCaseYN: data.deliveryCaseYN,
        deptID: data.deptID,
        deptName: data.deptName,
        pChartCompId: 0,
        pfName: data.pfName, // Properly assigned from patient data
        plName: data.plName, // Properly assigned from patient data
        pmName: data.pmName, // Properly assigned from patient data
        oldPChartID: 0,
        visitGesy: data.visitGesy || "",
        dulId: data.dulId,
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
        bStatusValue: "OCCUP",
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
        rNotes: "",
      };

      const wrBedDetailsDto: WrBedDetailsDto = {
        bedDetID: existingAdmission?.wrBedDetailsDto?.bedDetID || 0,
        bedID: data.bedID,
        bedName: data.bedName,
        bedStatusValue: "OCCUP",
        bedDeptID: data.deptID,
        rlID: data.rlID,
        rName: data.rName,
        rGrpID: selectedBed?.roomList?.roomGroup?.rGrpID || 0,
        rGrpName: selectedBed?.roomList?.roomGroup?.rGrpName || "",
        pChartID: data.pChartID,
        pChartCode: data.pChartCode,
        pTitle: data.pTitle, // Properly assigned from patient data
        pfName: data.pfName, // Properly assigned from patient data
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

  const handleClear = () => {
    reset();
    setSelectedBed(null);
    setAdmitCode("");
    setPatientData(null);
  };

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
        <Box sx={{ p: 1.5 }}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <Grid container spacing={1.5}>
              {/* Patient Information Header */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 1.5, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 28, height: 28 }}>
                      <PatientIcon fontSize="small" />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="600">
                        {patient?.fullName || "Patient Information"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        UHID: {patient?.pChartCode}
                        {patientData && (
                          <>
                            {" | "}
                            {[patientData.pTitle, patientData.pFName, patientData.pMName, patientData.pLName].filter(Boolean).join(" ")}
                          </>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Rest of the form remains the same as in the original */}
              {/* Admission Details - Single Row */}
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="admitCode"
                  control={control}
                  type="text"
                  label="Admission Code"
                  required
                  disabled
                  size="small"
                  helperText={isGeneratingCode ? "Generating..." : "Auto-generated"}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="admitDate" control={control} type="datetimepicker" label="Admission Date & Time" required size="small" />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="caseTypeCode" control={control} type="select" label="Case Type" required size="small" options={caseType} onChange={handleCaseTypeChange} />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="admissionType" control={control} type="select" label="Admission Type" required size="small" options={admissionType} />
              </Grid>

              {/* Payment and Reason - Single Row */}
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="pTypeID" control={control} type="select" label="Payment Source" required size="small" options={pic} onChange={handlePICChange} />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <EnhancedFormField
                  name="rNotes"
                  control={control}
                  type="textarea"
                  label="Reason for Admission"
                  required
                  size="small"
                  rows={2}
                  placeholder="Describe the reason for admission..."
                />
              </Grid>

              {/* Department and Medical Team - Two Rows Compact */}
              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="deptID" control={control} type="select" label="Department" required size="small" options={department} onChange={handleDepartmentChange} />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="dulId"
                  control={control}
                  type="select"
                  label="Unit"
                  required
                  size="small"
                  options={unit}
                  onChange={handleUnitChange}
                  disabled={!watchedDeptID}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField
                  name="attendingPhysicianName"
                  control={control}
                  type="select"
                  label="Attending Physician"
                  required
                  size="small"
                  options={attendingPhy}
                  onChange={handleAttendingPhysicianChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <EnhancedFormField name="primaryReferralSourceId" control={control} type="select" label="Referral Source" size="small" options={primaryIntroducingSource} />
              </Grid>

              {/* Bed Assignment */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 1.5, backgroundColor: "grey.50", borderRadius: 1, border: "1px solid", borderColor: "grey.300" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BedIcon fontSize="small" />
                      Bed Assignment
                    </Typography>
                    <CustomButton variant="outlined" text="Select Bed" size="small" onClick={() => setIsBedSelectionOpen(true)} disabled={isSubmitting} />
                  </Box>
                  {selectedBed ? (
                    <Chip
                      icon={<BedIcon />}
                      label={`${selectedBed.bedName} (${selectedBed.roomList?.rName || "Unknown Room"})`}
                      color="primary"
                      size="small"
                      onDelete={() => {
                        setSelectedBed(null);
                        setValue("bedID", 0);
                        setValue("bedName", "");
                        setValue("rlID", 0);
                        setValue("rName", "");
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No bed selected
                    </Typography>
                  )}
                  {errors.bedID && (
                    <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: "block" }}>
                      {errors.bedID.message}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Additional Options - Single Row */}
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

              {/* Instructions - Single Row */}
              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="nurseIns" control={control} type="textarea" label="Nurse Instructions" size="small" rows={2} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="clerkIns" control={control} type="textarea" label="Clerk Instructions" size="small" rows={2} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <EnhancedFormField name="patientIns" control={control} type="textarea" label="Patient Instructions" size="small" rows={2} />
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
