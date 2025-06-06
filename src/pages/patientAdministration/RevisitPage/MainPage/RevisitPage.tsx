import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, SelectChangeEvent, Paper, Avatar, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AccountBalance as InsuranceIcon,
  MedicalServices as VisitIcon,
  HourglassEmpty as WaitingIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  LocalHospital as HospitalIcon,
  Person as PhysicianIcon,
} from "@mui/icons-material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { OPVisitDto, DateFilterType } from "@/interfaces/PatientAdministration/revisitFormData";
import { useAlert } from "@/providers/AlertProvider";
import { useLoading } from "@/hooks/Common/useLoading";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { ContactMastService } from "@/services/NotGenericPaternServices/ContactMastService";
import { RevisitService } from "@/services/PatientAdministrationServices/RevisitService/RevisitService";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { useAppSelector } from "@/store/hooks";
import { PatientSearch } from "../../CommonPage/Patient/PatientSearch/PatientSearch";
import { PatientDemographics } from "../../CommonPage/Patient/PatientDemographics/PatientDemographics";
import PatientVisitHistoryDialog from "../Form/RevisitForm";
import WaitingPatientSearch from "../../CommonPage/AdvanceSearch/WaitingPatientSearch";
import { useRevisit } from "../hooks/useRevisitForm";
import PatientInsuranceManagement from "../../RegistrationPage/Components/PatientInsuranceManagement";

const schema = z.object({
  opVID: z.number().default(0),
  pChartID: z.number().default(0),
  pChartCode: z.string().default(""),
  pVisitDate: z.date().default(new Date()),
  patOPIP: z.string().default("O"),
  attendingPhysicianId: z.union([z.number(), z.string()]).default(0),
  attendingPhysicianSpecialtyId: z.number().default(0),
  attendingPhysicianName: z.string().default(""),
  attendingPhysicianSpecialty: z.string().default(""),
  primaryReferralSourceId: z.number().default(0),
  primaryReferralSourceName: z.string().default(""),
  primaryPhysicianId: z.number().default(0),
  primaryPhysicianName: z.string().default(""),
  pVisitStatus: z.string().default("W"),
  pVisitType: z.enum(["H", "P"]).default("P"),
  pVisitTypeText: z.string().default(""),
  rActiveYN: z.string().default("Y"),
  rNotes: z.string().default(""),
  pTypeID: z.number().default(0),
  pTypeCode: z.string().default(""),
  pTypeName: z.string().default(""),
  crossConsultation: z.enum(["Y", "N"]).default("N"),
  deptID: z.number().default(0),
  deptName: z.string().default(""),
  opNumber: z.string().default(""),
  pChartCompID: z.number().default(0),
  refFacultyID: z.number().default(0),
  refFaculty: z.string().default(""),
  secondaryReferralSourceId: z.number().default(0),
  secondaryReferralSourceName: z.string().default(""),
  oldPChartID: z.number().default(0),
  transferYN: z.string().default("N"),
});

type RevisitFormData = z.infer<typeof schema>;

const RevisitPage: React.FC = () => {
  const userInfo = useAppSelector((state) => state.auth);
  const compID = userInfo.compID!;
  const { setLoading } = useLoading();
  const { visitList, isLoading, error, fetchVisitList, saveVisit } = useRevisit();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showWaitingPatientSearch, setShowWaitingPatientSearch] = useState(false);
  const [selectedPChartID, setSelectedPChartID] = useState<number>(0);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [availableAttendingPhysicians, setAvailableAttendingPhysicians] = useState<DropdownOption[]>([]);
  const [primaryIntroducingSource] = useState<DropdownOption[]>([]);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(0);
  const [showStats, setShowStats] = useState(true);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false);
  const dropdownValues = useDropdownValues(["pic", "department"]);

  const defaultValues: RevisitFormData = {
    opVID: 0,
    pChartID: 0,
    pChartCode: "",
    pVisitDate: new Date(),
    patOPIP: "O",
    attendingPhysicianId: 0,
    attendingPhysicianName: "",
    attendingPhysicianSpecialtyId: 0,
    attendingPhysicianSpecialty: "",
    primaryReferralSourceId: 0,
    primaryReferralSourceName: "",
    primaryPhysicianId: 0,
    primaryPhysicianName: "",
    pVisitStatus: "W",
    pVisitType: "P",
    pVisitTypeText: "",
    rActiveYN: "Y",
    rNotes: "",
    pTypeID: 0,
    pTypeCode: "",
    pTypeName: "",
    crossConsultation: "N",
    deptID: 0,
    deptName: "",
    opNumber: "",
    pChartCompID: 0,
    refFacultyID: 0,
    refFaculty: "",
    secondaryReferralSourceId: 0,
    secondaryReferralSourceName: "",
    oldPChartID: 0,
    transferYN: "N",
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { isDirty, isValid, errors },
  } = useForm<RevisitFormData>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "onChange",
    criteriaMode: "firstError",
    shouldFocusError: true,
  });

  const watchedVisitType = watch("pVisitType");
  const watchedPChartCode = watch("pChartCode");

  const stats = useMemo(() => {
    if (!visitList.length) {
      return {
        totalVisits: 0,
        waitingVisits: 0,
        completedVisits: 0,
        cancelledVisits: 0,
        hospitalVisits: 0,
        physicianVisits: 0,
      };
    }

    const waitingCount = visitList.filter((v) => v.pVisitStatus === "W").length;
    const completedCount = visitList.filter((v) => v.pVisitStatus === "C").length;
    const cancelledCount = visitList.filter((v) => v.pVisitStatus === "X").length;
    const hospitalCount = visitList.filter((v) => v.pVisitType === "H").length;
    const physicianCount = visitList.filter((v) => v.pVisitType === "P").length;

    return {
      totalVisits: visitList.length,
      waitingVisits: waitingCount,
      completedVisits: completedCount,
      cancelledVisits: cancelledCount,
      hospitalVisits: hospitalCount,
      physicianVisits: physicianCount,
    };
  }, [visitList]);

  const DepartmentDropdownValues = useMemo(() => {
    if (!dropdownValues.department) return [];
    return dropdownValues.department.filter((item: any) => item.rActiveYN === "Y" && item.isUnitYN === "Y");
  }, [dropdownValues.department]);

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <VisitIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalVisits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Visits
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #ff9800" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                <WaitingIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.waitingVisits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Waiting
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #4caf50" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#4caf50", width: 40, height: 40 }}>
                <CompletedIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {stats.completedVisits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #f44336" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#f44336", width: 40, height: 40 }}>
                <CancelledIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.cancelledVisits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cancelled
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #2196f3" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
                <HospitalIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.hospitalVisits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hospital
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2 }}>
        <Card sx={{ borderLeft: "3px solid #9c27b0" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#9c27b0", width: 40, height: 40 }}>
                <PhysicianIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {stats.physicianVisits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Physician
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  useEffect(() => {
    if (selectedPatient) {
      handlePatientSelect(selectedPatient);
    }
  }, [selectedPatient]);

  const handlePatientSelect = useCallback(
    async (patientResult: PatientSearchResult) => {
      try {
        setLoading(true);
        const pChartID = patientResult.pChartID;

        if (pChartID) {
          setSelectedPChartID(pChartID);
          setValue("pChartID", pChartID, { shouldValidate: true, shouldDirty: true });
          setValue("pChartCode", patientResult.pChartCode, { shouldValidate: true, shouldDirty: true });

          const [availablePhysicians, lastVisitResult] = await Promise.all([
            ContactMastService.fetchAvailableAttendingPhysicians(pChartID),
            RevisitService.getLastVisitDetailsByPChartID(pChartID),
          ]);

          const savedPhysicianId = lastVisitResult?.data?.AttendingPhysicianId;
          const savedPhysicianSpecialtyId = lastVisitResult?.data?.AttendingPhysicianSpecialtyId;
          const filteredPhysicians = availablePhysicians.filter((physician) => physician.value !== `${savedPhysicianId}-${savedPhysicianSpecialtyId}`);

          setAvailableAttendingPhysicians(
            filteredPhysicians.map((item) => ({
              value: item.value.toString(),
              label: item.label,
            }))
          );

          if (lastVisitResult && lastVisitResult.success && lastVisitResult.data) {
            const isSavedPhysicianAvailable = availablePhysicians.some((physician) => physician.value === `${savedPhysicianId}-${savedPhysicianSpecialtyId}`);
            setValue("attendingPhysicianId", isSavedPhysicianAvailable ? savedPhysicianId : 0, { shouldDirty: true });
            setValue("attendingPhysicianSpecialtyId", isSavedPhysicianAvailable ? savedPhysicianSpecialtyId : 0, { shouldDirty: true });
            setValue("deptID", lastVisitResult.data.deptID || 0, { shouldDirty: true });
            setValue("pTypeID", lastVisitResult.data.pTypeID || 0, { shouldDirty: true });
            setValue("primaryReferralSourceId", lastVisitResult.data.primaryReferralSourceId || 0, { shouldDirty: true });
            if (isSavedPhysicianAvailable) {
              const savedPhysician = availablePhysicians.find((physician) => physician.value === `${savedPhysicianId}-${savedPhysicianSpecialtyId}`);
              if (savedPhysician) {
                setValue("attendingPhysicianName", savedPhysician.label.split("|")[0]?.trim() || "", { shouldDirty: true });
                setValue("attendingPhysicianSpecialty", savedPhysician.label.split("|")[1]?.trim() || "", { shouldDirty: true });
              }
            }

            const selectedDept = dropdownValues.department?.find((dept) => dept.value === lastVisitResult.data.deptID);
            if (selectedDept) {
              setValue("deptName", selectedDept.label, { shouldDirty: true });
            }

            const selectedPaymentSource = dropdownValues.pic?.find((pic) => pic.value === lastVisitResult.data.pTypeID);
            if (selectedPaymentSource) {
              setValue("pTypeName", selectedPaymentSource.label, { shouldDirty: true });
              setValue("pTypeCode", selectedPaymentSource.value?.toString() || "", { shouldDirty: true });
            }

            const selectedReferralSource = primaryIntroducingSource.find((ref) => ref.value === lastVisitResult.data.primaryReferralSourceId?.toString());
            if (selectedReferralSource) {
              setValue("primaryReferralSourceName", selectedReferralSource.label, { shouldDirty: true });
            }
          }
          await trigger();
        }
      } catch (error) {
        showAlert("Error", "Failed to load patient data", "error");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setValue, dropdownValues.department, dropdownValues.pic, primaryIntroducingSource, trigger]
  );

  const handleAdvancedPatientSelect = useCallback(
    async (selectedSuggestion: string) => {
      if (!selectedSuggestion) return;

      try {
        setLoading(true);

        const parts = selectedSuggestion.split("|");
        const pChartCode = parts[0]?.trim();
        const fullName = parts[1]?.trim() || "";

        const pChartIDMatch = selectedSuggestion.match(/\((\d+)\)/);
        const pChartID = pChartIDMatch ? parseInt(pChartIDMatch[1], 10) : 0;

        if (pChartCode && pChartID) {
          const patientResult: PatientSearchResult = {
            pChartID,
            pChartCode,
            fullName,
          };
          setSelectedPatient(patientResult);
          setSelectedPChartID(pChartID);
          setValue("attendingPhysicianId", 0, { shouldValidate: true, shouldDirty: true });
          setValue("attendingPhysicianSpecialtyId", 0, { shouldValidate: true, shouldDirty: true });
          setValue("attendingPhysicianName", "", { shouldValidate: true, shouldDirty: true });
          setValue("attendingPhysicianSpecialty", "", { shouldValidate: true, shouldDirty: true });
          await handlePatientSelect(patientResult);
        }
      } catch (error) {
        showAlert("Error", "Failed to load patient from waiting search", "error");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setValue, handlePatientSelect, showAlert]
  );

  const handlePhysicianChange = useCallback(
    async (event: any) => {
      const selectedValue = event.value || event.target?.value;
      const selectedLabel = event.label;

      if (!selectedValue || selectedValue === "" || selectedValue === "0" || selectedValue === "0-0") {
        setValue("attendingPhysicianId", 0, { shouldValidate: true, shouldDirty: true });
        setValue("attendingPhysicianSpecialtyId", 0, { shouldValidate: true, shouldDirty: true });
        setValue("attendingPhysicianName", "", { shouldValidate: true, shouldDirty: true });
        setValue("attendingPhysicianSpecialty", "", { shouldValidate: true, shouldDirty: true });
        await trigger("attendingPhysicianId");
        return;
      }

      if (typeof selectedValue === "string" && selectedValue.includes("-")) {
        const parts = selectedValue.split("-");
        if (parts.length !== 2) {
          setFormError("Invalid physician selection format");
          return;
        }

        const [conIDStr, cdIDStr] = parts;
        const conID = parseInt(conIDStr, 10);
        const cdID = parseInt(cdIDStr, 10);

        if (isNaN(conID) || isNaN(cdID) || conID === 0) {
          setFormError("Invalid physician selection values");
          return;
        }

        let physicianName = "";
        let physicianSpecialty = "";

        if (selectedLabel) {
          const labelParts = selectedLabel.split("|");
          physicianName = labelParts[0]?.trim() || "";
          physicianSpecialty = labelParts[1]?.trim() || "Unknown Specialty";
        } else {
          const selectedPhysician = availableAttendingPhysicians.find((physician) => physician.value === selectedValue);
          if (selectedPhysician) {
            const labelParts = selectedPhysician.label.split("|");
            physicianName = labelParts[0]?.trim() || "";
            physicianSpecialty = labelParts[1]?.trim() || "Unknown Specialty";
          }
        }
        setValue("attendingPhysicianId", selectedValue, { shouldValidate: true, shouldDirty: true });
        setValue("attendingPhysicianSpecialtyId", cdID, { shouldValidate: true, shouldDirty: true });
        setValue("attendingPhysicianName", physicianName, { shouldValidate: true, shouldDirty: true });
        setValue("attendingPhysicianSpecialty", physicianSpecialty, { shouldValidate: true, shouldDirty: true });
        setFormError(null);
        await trigger(["attendingPhysicianId", "attendingPhysicianSpecialtyId"]);
      } else {
        setFormError("Unexpected physician selection format");
      }
    },
    [setValue, trigger, availableAttendingPhysicians, setFormError]
  );

  const handleWaitingSearch = useCallback(() => {
    setShowWaitingPatientSearch(true);
  }, []);

  const handleRadioButtonChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValue("pVisitType", value as "H" | "P", { shouldValidate: true, shouldDirty: true });
      setValue("pVisitTypeText", event.target.labels ? event.target.labels[0].textContent || "" : "");

      if (value === "P" && selectedPChartID) {
        try {
          const availablePhysicians = await ContactMastService.fetchAvailableAttendingPhysicians(selectedPChartID);
          setAvailableAttendingPhysicians(
            availablePhysicians.map((item) => ({
              value: item.value.toString(),
              label: item.label,
            }))
          );
        } catch (error) {}
      }
      if (value === "H") {
        setValue("attendingPhysicianId", 0, { shouldDirty: true });
        setValue("attendingPhysicianName", "", { shouldDirty: true });
        setValue("attendingPhysicianSpecialtyId", 0, { shouldDirty: true });
        setValue("attendingPhysicianSpecialty", "", { shouldDirty: true });
      } else {
        setValue("deptID", 0, { shouldDirty: true });
        setValue("deptName", "", { shouldDirty: true });
      }

      await trigger();
    },
    [selectedPChartID, setValue, trigger]
  );

  const handleDropdownChange = useCallback(
    async (fieldName: keyof RevisitFormData, value: string | number, options?: DropdownOption[], additionalFields?: Record<string, any>) => {
      setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });
      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, val]) => {
          setValue(key as keyof RevisitFormData, val, { shouldDirty: true });
        });
      }
      await trigger();
    },
    [setValue, trigger]
  );

  const extractPhysicianId = (attendingPhysicianId: string | number): number => {
    if (typeof attendingPhysicianId === "number") {
      return attendingPhysicianId;
    }
    if (typeof attendingPhysicianId === "string") {
      if (attendingPhysicianId.includes("-")) {
        const [conIDStr] = attendingPhysicianId.split("-");
        const physicianId = parseInt(conIDStr, 10);
        return isNaN(physicianId) ? 0 : physicianId;
      }
      const physicianId = parseInt(attendingPhysicianId, 10);
      return isNaN(physicianId) ? 0 : physicianId;
    }

    return 0;
  };

  const onSubmit = async (data: RevisitFormData) => {
    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);
      const physicianId = extractPhysicianId(data.attendingPhysicianId);

      if (!data.pChartID || data.pChartID === 0) {
        setFormError("Patient selection is required");
        return;
      }

      if (!data.pTypeID || data.pTypeID === 0) {
        setFormError("Payment Source is required");
        return;
      }

      if (!data.primaryReferralSourceId || data.primaryReferralSourceId === 0) {
        setFormError("Primary Introducing Source is required");
        return;
      }

      if (data.pVisitType === "H" && (!data.deptID || data.deptID === 0)) {
        setFormError("Department is required for hospital visits");
        return;
      }

      if (data.pVisitType === "P" && physicianId === 0) {
        setFormError("Attending Physician is required for physician visits");
        return;
      }
      const visitData: OPVisitDto = {
        ...data,
        attendingPhysicianId: physicianId,
        opVID: data.opVID || 0,
        pChartID: data.pChartID,
        oldPChartID: data.oldPChartID || 0,
        attendingPhysicianSpecialtyId: data.attendingPhysicianSpecialtyId || 0,
        primaryReferralSourceId: data.primaryReferralSourceId || 0,
        primaryPhysicianId: data.primaryPhysicianId || 0,
        pTypeID: data.pTypeID || 0,
        deptID: data.deptID || 0,
        pChartCompID: data.pChartCompID || 0,
        refFacultyID: data.refFacultyID || 0,
        secondaryReferralSourceId: data.secondaryReferralSourceId || 0,
        pChartCode: data.pChartCode || "",
        patOPIP: data.patOPIP || "O",
        pVisitStatus: data.pVisitStatus || "W",
        pVisitType: data.pVisitType,
        pVisitTypeText: data.pVisitTypeText || "",
        rActiveYN: data.rActiveYN || "Y",
        rNotes: data.rNotes || "",
        pTypeCode: data.pTypeCode || "",
        pTypeName: data.pTypeName || "",
        crossConsultation: data.crossConsultation || "N",
        deptName: data.deptName || "",
        opNumber: data.opNumber || "",
        refFaculty: data.refFaculty || "",
        primaryReferralSourceName: data.primaryReferralSourceName || "",
        primaryPhysicianName: data.primaryPhysicianName || "",
        secondaryReferralSourceName: data.secondaryReferralSourceName || "",
        transferYN: data.transferYN || "N",
        attendingPhysicianName: data.attendingPhysicianName || "",
        attendingPhysicianSpecialty: data.attendingPhysicianSpecialty || "",
        pVisitDate: data.pVisitDate,
        compID: compID,
        compName: userInfo.compName || "",
        compCode: userInfo.compCode || "",
      };

      const response = await saveVisit(visitData);

      if (response.success) {
        showAlert("Success", "Visit created successfully", "success");
        performReset();
        fetchVisitList(DateFilterType.Today, null, null);
      } else {
        throw new Error(response.errorMessage || "Failed to save visit");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save visit";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const performReset = () => {
    reset(defaultValues);
    setFormError(null);
    setSelectedPChartID(0);
    setSelectedPatient(null);
    setAvailableAttendingPhysicians([]);
    setClearSearchTrigger((prev) => prev + 1);
  };

  const handleReset = () => {
    if (isDirty) {
      setShowResetConfirmation(true);
    } else {
      performReset();
    }
  };

  const handleResetConfirm = () => {
    performReset();
    setShowResetConfirmation(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirmation(false);
  };

  const handleRefresh = useCallback(() => {
    fetchVisitList(DateFilterType.Today, null, null);
  }, [fetchVisitList]);

  const handleOpenHistoryDialog = useCallback(() => {
    setIsHistoryDialogOpen(true);
  }, []);

  const handleCloseHistoryDialog = useCallback(
    (refreshData?: boolean) => {
      setIsHistoryDialogOpen(false);
      if (refreshData) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  const handleOpenInsuranceDialog = useCallback(() => {
    if (!selectedPChartID) {
      showAlert("Warning", "Please select a patient first", "warning");
      return;
    }
    setIsInsuranceDialogOpen(true);
  }, [selectedPChartID]);

  const handleCloseInsuranceDialog = useCallback((refreshData?: boolean) => {
    setIsInsuranceDialogOpen(false);
  }, []);

  const isHospitalVisit = watchedVisitType === "H";
  const isPhysicianVisit = watchedVisitType === "P";

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading data: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Create New Visit
        </Typography>
        <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
      </Box>

      {/* Statistics Dashboard */}
      {showStats && renderStatsDashboard()}

      {/* Action Buttons */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Quick Actions
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <SmartButton text="Refresh" icon={RefreshIcon} onClick={handleRefresh} color="info" variant="outlined" size="small" disabled={isLoading} />
              <SmartButton text="Waiting Search" icon={SearchIcon} onClick={handleWaitingSearch} color="warning" variant="contained" size="small" />
              <SmartButton text="Visit History" onClick={handleOpenHistoryDialog} color="primary" variant="contained" size="small" />
              <SmartButton
                text="Insurance"
                icon={InsuranceIcon}
                onClick={handleOpenInsuranceDialog}
                color="secondary"
                variant="contained"
                size="small"
                disabled={!selectedPChartID}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Form */}
      <Paper sx={{ p: 2 }}>
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            mt: 2,
            mb: 2,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "4px",
            },
          }}
        >
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <FormField name="rActiveYN" control={control} label="Active" type="switch" size="small" />
                </Box>
              </Box>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Patient Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <PatientSearch onPatientSelect={setSelectedPatient} clearTrigger={clearSearchTrigger} placeholder="Enter name, UHID or phone number" />
                    </Grid>
                  </Grid>

                  {selectedPChartID > 0 && (
                    <Box mt={2}>
                      <PatientDemographics pChartID={selectedPChartID} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Visit Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="pTypeID"
                        control={control}
                        label="Payment Source [PIC]"
                        type="select"
                        required
                        size="small"
                        fullWidth
                        options={dropdownValues.pic || []}
                        onChange={(event: SelectChangeEvent<string>) => {
                          const selectedValue = Number(event.target.value);
                          const selectedOption = dropdownValues.pic?.find((option) => Number(option.value) === selectedValue);

                          handleDropdownChange("pTypeID", selectedValue, dropdownValues.pic, {
                            pTypeName: selectedOption?.label || "",
                            pTypeCode: selectedOption?.value?.toString() || "",
                          });
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField name="pVisitDate" control={control} label="Visit Date" type="datepicker" required size="small" fullWidth />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="pVisitType"
                        control={control}
                        label="Visit To"
                        type="radio"
                        required
                        options={[
                          { value: "H", label: "Hospital" },
                          { value: "P", label: "Physician" },
                        ]}
                        onChange={handleRadioButtonChange}
                      />
                    </Grid>

                    {isHospitalVisit && (
                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField
                          name="deptID"
                          control={control}
                          label="Department"
                          type="select"
                          required
                          size="small"
                          fullWidth
                          options={DepartmentDropdownValues}
                          onChange={(event: SelectChangeEvent<string>) => {
                            const selectedValue = Number(event.target.value);
                            const selectedOption = DepartmentDropdownValues?.find((option) => Number(option.value) === selectedValue);

                            handleDropdownChange("deptID", selectedValue, DepartmentDropdownValues, {
                              deptName: selectedOption?.label || "",
                            });
                          }}
                        />
                      </Grid>
                    )}

                    {isPhysicianVisit && (
                      <Grid size={{ sm: 12, md: 6 }}>
                        <FormField
                          name="attendingPhysicianId"
                          control={control}
                          label="Attending Physician"
                          type="select"
                          required
                          size="small"
                          fullWidth
                          options={availableAttendingPhysicians}
                          onChange={handlePhysicianChange}
                          helperText={errors.attendingPhysicianId?.message}
                        />
                      </Grid>
                    )}

                    <Grid size={{ sm: 12, md: 6 }}>
                      <FormField
                        name="primaryReferralSourceId"
                        control={control}
                        label="Primary Introducing Source"
                        type="select"
                        required
                        size="small"
                        fullWidth
                        options={primaryIntroducingSource}
                        onChange={(event: SelectChangeEvent<string>) => {
                          const selectedValue = Number(event.target.value);
                          const selectedOption = primaryIntroducingSource?.find((option) => Number(option.value) === selectedValue);

                          handleDropdownChange("primaryReferralSourceId", selectedValue, primaryIntroducingSource, {
                            primaryReferralSourceName: selectedOption?.label || "",
                          });
                        }}
                      />
                    </Grid>

                    <Grid size={{ sm: 12 }}>
                      <FormField
                        name="rNotes"
                        control={control}
                        label="Notes"
                        type="textarea"
                        size="small"
                        fullWidth
                        rows={3}
                        placeholder="Enter any additional notes about this visit"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSaving || !isDirty} />
                <SmartButton
                  text="Create Visit"
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
                  onClick={handleSubmit(onSubmit)}
                  asynchronous={true}
                  showLoadingIndicator={true}
                  loadingText="Creating..."
                  successText="Created!"
                  disabled={isSaving || !isDirty || !isValid}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Dialogs */}
      {isHistoryDialogOpen && <PatientVisitHistoryDialog open={isHistoryDialogOpen} onClose={handleCloseHistoryDialog} />}

      {selectedPChartID > 0 && (
        <PatientInsuranceManagement
          open={isInsuranceDialogOpen}
          onClose={handleCloseInsuranceDialog}
          pChartID={selectedPChartID}
          patientName={selectedPatient?.fullName || "Selected Patient"}
        />
      )}

      <WaitingPatientSearch
        userInfo={userInfo}
        show={showWaitingPatientSearch}
        handleClose={() => setShowWaitingPatientSearch(false)}
        onPatientSelect={handleAdvancedPatientSelect}
      />

      <ConfirmationDialog
        open={showResetConfirmation}
        onClose={handleResetCancel}
        onConfirm={handleResetConfirm}
        title="Reset Form"
        message="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmText="Reset"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
      />
    </Box>
  );
};

export default RevisitPage;
