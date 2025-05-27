import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Box, Grid, Typography, Divider, Card, CardContent, Alert, SelectChangeEvent, Paper, IconButton, Chip, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save as SaveIcon, Cancel as CancelIcon, Search as SearchIcon, Refresh as RefreshIcon, AccountBalance as InsuranceIcon } from "@mui/icons-material";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { OPVisitDto, DateFilterType } from "@/interfaces/PatientAdministration/revisitFormData";
import { useAlert } from "@/providers/AlertProvider";
import { useLoading } from "@/hooks/Common/useLoading";

import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { RevisitService } from "@/services/PatientAdministrationServices/RevisitService/RevisitService";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";

import { useAppSelector } from "@/store/hooks";
import { PatientSearchContext } from "@/context/PatientSearchContext";
import { useContext } from "react";
import { usePatientAutocomplete } from "@/hooks/PatientAdminstration/usePatientAutocomplete";
import { PatientSearch } from "../../CommonPage/Patient/PatientSearch/PatientSearch";
import { PatientDemographics } from "../../CommonPage/Patient/PatientDemographics/PatientDemographics";

import WaitingPatientSearch from "../../CommonPage/AdvanceSearch/WaitingPatientSearch";
import { useRevisit } from "../../RevisitPage/hooks/useRevisitForm";
import PatientVisitHistoryDialog from "../../RevisitPage/Form/RevisitForm";
import InsuranceManagementDialog from "../Form/InsuranceGrid";
import { ContactMastService } from "@/services/NotGenericPaternServices/ContactMastService";

// Schema definition for form validation
const schema = z.object({
  opVID: z.number().default(0),
  pChartID: z.number().optional().default(0),
  pChartCode: z.string().optional().default(""),
  pVisitDate: z.date().default(new Date()),
  patOPIP: z.string().default("O"),
  attendingPhysicianId: z.number().optional().default(0),
  attendingPhysicianName: z.string().optional().default(""),
  attendingPhysicianSpecialtyId: z.number().optional().default(0),
  attendingPhysicianSpecialty: z.string().optional().default(""),
  primaryReferralSourceId: z.number().optional().default(0),
  primaryReferralSourceName: z.string().optional().default(""),
  primaryPhysicianId: z.number().optional().default(0),
  primaryPhysicianName: z.string().optional().default(""),
  pVisitStatus: z.string().default("W"),
  pVisitType: z.enum(["H", "P"]).default("P"),
  pVisitTypeText: z.string().optional().default(""),
  rActiveYN: z.string().default("Y"),
  rNotes: z.string().optional().default(""),
  pTypeID: z.number().optional().default(0),
  pTypeCode: z.string().optional().default(""),
  pTypeName: z.string().optional().default(""),
  crossConsultation: z.enum(["Y", "N"]).optional().default("N"),
  deptID: z.number().optional().default(0),
  deptName: z.string().optional().default(""),
  opNumber: z.string().optional().default(""),
  pChartCompID: z.number().optional().default(0),
  refFacultyID: z.number().optional().default(0),
  refFaculty: z.string().optional().default(""),
  secondaryReferralSourceId: z.number().optional().default(0),
  secondaryReferralSourceName: z.string().optional().default(""),
  oldPChartID: z.number().default(0),
  transferYN: z.string().optional().default("N"),
});

type RevisitFormData = z.infer<typeof schema>;

const RevisitPage: React.FC = () => {
  // User and context information
  const userInfo = useAppSelector((state) => state.auth);
  const { setLoading } = useLoading();
  const { showAlert } = useAlert();
  const { performSearch } = useContext(PatientSearchContext);
  const { fetchPatientSuggestions } = usePatientAutocomplete();
  const { visitList, isLoading, error, fetchVisitList, deleteVisit, cancelVisit, saveVisit } = useRevisit();

  // Form state
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showWaitingPatientSearch, setShowWaitingPatientSearch] = useState(false);
  const [selectedPChartID, setSelectedPChartID] = useState<number>(0);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [availableAttendingPhysicians, setAvailableAttendingPhysicians] = useState<DropdownOption[]>([]);
  const [primaryIntroducingSource, setPrimaryIntroducingSource] = useState<DropdownOption[]>([]);
  const [clearSearchTrigger, setClearSearchTrigger] = useState(0);
  const [showStats, setShowStats] = useState(false);

  // Patient history dialog state
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  // Insurance management dialog state
  const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false);

  // Dropdowns and refs
  const dropdownValues = useDropdownValues(["pic", "department"]);

  // Form setup
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
  const watchedPChartID = watch("pChartID");
  const watchedPChartCode = watch("pChartCode");

  // Statistics calculation
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

  // Department dropdown filtering
  const DepartmentDropdownValues = useMemo(() => {
    if (!dropdownValues.department) return [];
    return dropdownValues.department.filter((item: any) => item.rActiveYN === "Y" && item.isUnitYN === "Y");
  }, [dropdownValues.department]);

  // Load dropdown values

  // Statistics dashboard component
  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Total Visits</Typography>
          <Typography variant="h4">{stats.totalVisits}</Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Waiting</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.waitingVisits}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Completed</Typography>
          <Typography variant="h4" color="success.main">
            {stats.completedVisits}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Cancelled</Typography>
          <Typography variant="h4" color="error.main">
            {stats.cancelledVisits}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Hospital</Typography>
          <Typography variant="h4" color="info.main">
            {stats.hospitalVisits}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Physician</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.physicianVisits}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  // Initial load
  // useEffect(() => {
  //   document.title = "Patient Revisit Management";
  //   loadDropdownValues();
  //   fetchVisitList(DateFilterType.Today, null, null);
  // }, [loadDropdownValues, fetchVisitList]);

  // Handle patient selection when selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      handlePatientSelect(selectedPatient);
    }
  }, [selectedPatient]);

  // Patient selection handler
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

            // Set form values with last visit data
            setValue("attendingPhysicianId", isSavedPhysicianAvailable ? savedPhysicianId : 0, { shouldDirty: true });
            setValue("attendingPhysicianSpecialtyId", isSavedPhysicianAvailable ? savedPhysicianSpecialtyId : 0, { shouldDirty: true });
            setValue("deptID", lastVisitResult.data.deptID || 0, { shouldDirty: true });
            setValue("pTypeID", lastVisitResult.data.pTypeID || 0, { shouldDirty: true });
            setValue("primaryReferralSourceId", lastVisitResult.data.primaryReferralSourceId || 0, { shouldDirty: true });

            // Set physician names if available
            if (isSavedPhysicianAvailable) {
              const savedPhysician = availablePhysicians.find((physician) => physician.value === `${savedPhysicianId}-${savedPhysicianSpecialtyId}`);
              if (savedPhysician) {
                setValue("attendingPhysicianName", savedPhysician.label.split("|")[0]?.trim() || "", { shouldDirty: true });
                setValue("attendingPhysicianSpecialty", savedPhysician.label.split("|")[1]?.trim() || "", { shouldDirty: true });
              }
            }

            // Set department and payment source names
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

          // Trigger form validation
          await trigger();
        }
      } catch (error) {
        console.error("Error selecting patient:", error);
        showAlert("Error", "Failed to load patient data", "error");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setValue, dropdownValues.department, dropdownValues.pic, primaryIntroducingSource, trigger]
  );

  // Advanced patient search handler
  const handleAdvancedPatientSelect = useCallback(async (selectedSuggestion: string) => {
    if (!selectedSuggestion) return;

    const parts = selectedSuggestion.split("|");
    const pChartCode = parts[0]?.trim();
    const fullName = parts[1]?.trim() || "";

    // Extract pChartID from the suggestion
    const pChartIDMatch = selectedSuggestion.match(/\((\d+)\)/);
    const pChartID = pChartIDMatch ? parseInt(pChartIDMatch[1], 10) : 0;

    if (pChartCode && pChartID) {
      const patientResult: PatientSearchResult = {
        pChartID,
        pChartCode,
        fullName,
      };
      setSelectedPatient(patientResult);
    }
  }, []);

  // Waiting search handler
  const handleWaitingSearch = useCallback(() => {
    setShowWaitingPatientSearch(true);
  }, []);

  // Visit type radio button change handler
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
        } catch (error) {
          console.error("Error loading physicians:", error);
        }
      }

      // Clear department/physician fields when switching visit type
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

  // Dropdown change handler
  const handleDropdownChange = useCallback(
    async (fieldName: keyof RevisitFormData, value: string | number, options?: DropdownOption[], additionalFields?: Record<string, any>) => {
      setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });

      // Set additional related fields based on the dropdown selection
      if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, val]) => {
          setValue(key as keyof RevisitFormData, val, { shouldDirty: true });
        });
      }

      await trigger();
    },
    [setValue, trigger]
  );

  // Form submission handler
  const onSubmit = async (data: RevisitFormData) => {
    setFormError(null);

    try {
      setIsSaving(true);
      setLoading(true);

      // Validate required fields based on visit type
      if (data.pVisitType === "H" && (!data.deptID || data.deptID === 0)) {
        setFormError("Department is required for hospital visits");
        return;
      }

      if (data.pVisitType === "P" && (!data.attendingPhysicianId || data.attendingPhysicianId === 0)) {
        setFormError("Attending Physician is required for physician visits");
        return;
      }

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

      const response = await saveVisit(data as OPVisitDto);

      if (response.success) {
        showAlert("Success", "Visit created successfully", "success");
        performReset();
        fetchVisitList(DateFilterType.Today, null, null);
      } else {
        throw new Error(response.errorMessage || "Failed to save visit");
      }
    } catch (error) {
      console.error("Error saving visit:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save visit";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  // Form reset handler
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

  // Refresh handler
  const handleRefresh = useCallback(() => {
    fetchVisitList(DateFilterType.Today, null, null);
  }, [fetchVisitList]);

  // Open history dialog
  const handleOpenHistoryDialog = useCallback(() => {
    setIsHistoryDialogOpen(true);
  }, []);

  // Close history dialog
  const handleCloseHistoryDialog = useCallback(
    (refreshData?: boolean) => {
      setIsHistoryDialogOpen(false);
      if (refreshData) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  // Insurance dialog handlers
  const handleOpenInsuranceDialog = useCallback(() => {
    if (!selectedPChartID) {
      showAlert("Warning", "Please select a patient first", "warning");
      return;
    }
    setIsInsuranceDialogOpen(true);
  }, [selectedPChartID]);

  const handleCloseInsuranceDialog = useCallback((refreshData?: boolean) => {
    setIsInsuranceDialogOpen(false);
    // Optional: You can add any additional logic here if needed when insurance dialog closes
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
      {/* Header with Stats Toggle and View History Button */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
        <Box sx={{ display: "flex", gap: 2 }}>
          <SmartButton text="Refresh" icon={RefreshIcon} onClick={handleRefresh} color="info" variant="outlined" size="small" disabled={isLoading} />
          <SmartButton text="View Visit History" onClick={handleOpenHistoryDialog} color="primary" variant="contained" size="small" />
          <SmartButton
            text="Manage Insurance"
            icon={InsuranceIcon}
            onClick={handleOpenInsuranceDialog}
            color="secondary"
            variant="contained"
            size="small"
            disabled={!selectedPChartID}
          />
        </Box>
      </Box>

      {/* Statistics Dashboard */}
      {showStats && renderStatsDashboard()}

      {/* Main Content */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create New Visit
        </Typography>

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
            {/* Action Buttons */}
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                <Box display="flex" gap={1}>
                  <SmartButton text="Waiting Search" icon={SearchIcon} onClick={handleWaitingSearch} variant="outlined" size="small" />
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <FormField name="rActiveYN" control={control} label="Active" type="switch" size="small" />
                </Box>
              </Box>
            </Grid>

            {/* Patient Information */}
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

            {/* Visit Details */}
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
                          onChange={(event: SelectChangeEvent<string>) => {
                            const selectedValue = event.target.value;
                            if (selectedValue && selectedValue !== "0-0") {
                              const [conID, cdID] = selectedValue.split("-");
                              const selectedPhysician = availableAttendingPhysicians.find((physician) => physician.value === selectedValue);

                              handleDropdownChange("attendingPhysicianId", Number(conID), availableAttendingPhysicians, {
                                attendingPhysicianSpecialtyId: Number(cdID),
                                attendingPhysicianName: selectedPhysician?.label.split("|")[0]?.trim() || "",
                                attendingPhysicianSpecialty: selectedPhysician?.label.split("|")[1]?.trim() || "Unknown Specialty",
                              });
                            } else {
                              handleDropdownChange("attendingPhysicianId", 0, availableAttendingPhysicians, {
                                attendingPhysicianSpecialtyId: 0,
                                attendingPhysicianName: "",
                                attendingPhysicianSpecialty: "",
                              });
                            }
                          }}
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

            {/* Form Action Buttons */}
            <Grid size={{ sm: 12 }}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <SmartButton text="Reset" onClick={handleReset} variant="outlined" color="error" icon={CancelIcon} disabled={isSaving || !isDirty} />
                <SmartButton
                  text="Create Visit"
                  variant="contained"
                  color="primary"
                  icon={SaveIcon}
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

      {/* Patient Visit History Dialog */}
      {isHistoryDialogOpen && <PatientVisitHistoryDialog open={isHistoryDialogOpen} onClose={handleCloseHistoryDialog} />}

      {/* Insurance Management Dialog */}
      {isInsuranceDialogOpen && selectedPChartID > 0 && (
        <InsuranceManagementDialog
          open={isInsuranceDialogOpen}
          onClose={handleCloseInsuranceDialog}
          pChartID={selectedPChartID}
          pChartCode={watchedPChartCode}
          patientName={selectedPatient?.fullName}
          title="Patient Insurance Management"
          readOnly={false}
          showSaveAll={false}
        />
      )}

      {/* Waiting Patient Search Dialog */}
      <WaitingPatientSearch
        userInfo={userInfo}
        show={showWaitingPatientSearch}
        handleClose={() => setShowWaitingPatientSearch(false)}
        onPatientSelect={handleAdvancedPatientSelect}
      />

      {/* Confirmation Dialog for Form Reset */}
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
