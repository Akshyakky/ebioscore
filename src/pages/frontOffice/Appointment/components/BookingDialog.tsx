// src/pages/frontOffice/Appointment/components/BookingDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { AppointBookingDto, DURATION_OPTIONS, PATIENT_TYPE_OPTIONS } from "@/interfaces/FrontOffice/AppointBookingDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { useAlert } from "@/providers/AlertProvider";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  LocalHospital as HospitalIcon,
  Person as PatientIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Enhanced schema for appointment booking
const appointmentBookingSchema = z.object({
  // Basic appointment information
  abID: z.number().default(0),
  abFName: z.string().min(1, "First name is required"),
  abLName: z.string().min(1, "Last name is required"),
  abMName: z.string().optional().default(""),
  abTitle: z.string().optional().default(""),

  // Provider and resource information
  hplID: z.number().min(1, "Provider is required"),
  providerName: z.string().default(""),
  rlID: z.number().min(1, "Resource is required"),
  rlName: z.string().default(""),

  // Reason and duration
  arlID: z.number().optional().default(0),
  arlName: z.string().optional().default(""),
  abDuration: z.number().min(15, "Duration must be at least 15 minutes").default(30),
  abDurDesc: z.string().default("30 minutes"),

  // Date and time
  abDate: z.date(),
  abTime: z.date(),
  abEndTime: z.date(),

  // Patient information
  pChartID: z.number().optional().default(0),
  pChartCode: z.string().optional().default(""),
  abPType: z.string().min(1, "Patient type is required"),
  abStatus: z.string().default("Booked"),
  patRegisterYN: z.enum(["Y", "N"]).default("Y"),

  // Contact information (for non-registered patients)
  appPhone1: z.string().optional().default(""),
  appPhone2: z.string().optional().default(""),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  city: z.string().optional().default(""),
  dob: z.date().optional(),

  // Additional information
  procNotes: z.string().optional().default(""),
  arlInstructions: z.string().optional().default(""),

  // Insurance and billing
  atID: z.number().optional().default(0),
  atName: z.string().optional().default(""),
  pNatID: z.number().optional().default(0),
  pNatName: z.string().optional().default(""),
  patOPIP: z.string().default("O"),

  // Admission related (for inpatient appointments)
  admitID: z.number().optional().default(0),
  wNameID: z.number().optional().default(0),
  wName: z.string().optional().default(""),
  wCatID: z.number().optional().default(0),
  wCatName: z.string().optional().default(""),
  roomID: z.number().optional().default(0),
  roomName: z.string().optional().default(""),
  bedID: z.number().optional().default(0),
  bedName: z.string().optional().default(""),

  // Consultant role
  crID: z.number().optional().default(0),
  crName: z.string().optional().default(""),

  // Additional fields
  cancelReason: z.string().optional().default(""),
  pChartCompID: z.number().optional().default(0),
  rSchdleID: z.number().optional().default(0),
  rschdleBy: z.string().optional().default(""),
  pssnId: z.string().optional().default(""),
  intIdPsprt: z.string().optional().default(""),
  oldPChartID: z.number().optional().default(0),
  otBookNo: z.number().default(0),
});

type BookingFormData = z.infer<typeof appointmentBookingSchema>;

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bookingData: AppointBookingDto) => Promise<void>;
  bookingForm: AppointBookingDto;
  onFormChange: (bookingData: AppointBookingDto) => void;
  providers: Array<{ value: number; label: string; type: string }>;
  resources: Array<{ value: number; label: string; type: string }>;
  existingAppointment?: AppointBookingDto;
}

const BookingDialog: React.FC<BookingDialogProps> = ({ open, onClose, onSubmit, bookingForm, onFormChange, providers, resources, existingAppointment }) => {
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [patientSearchClear, setPatientSearchClear] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion states
  const [patientAccordionExpanded, setPatientAccordionExpanded] = useState(true);
  const [appointmentAccordionExpanded, setAppointmentAccordionExpanded] = useState(true);
  const [additionalAccordionExpanded, setAdditionalAccordionExpanded] = useState(false);

  const { showAlert } = useAlert();
  const serverDate = useServerDate();
  const isEditMode = !!existingAppointment;

  // Load dropdown values
  const {
    reasonList = [],
    attendingPhy = [],
    resourceList = [],
    title = [],
    nationality = [],
    area = [],
    city = [],
    country = [],
    consultantRole = [],
    isLoading: dropdownLoading,
  } = useDropdownValues(["reasonList", "attendingPhy", "resourceList", "title", "nationality", "area", "city", "country", "consultantRole"]);

  // Form setup with default values
  const defaultValues: BookingFormData = useMemo(
    () => ({
      abID: existingAppointment?.abID || 0,
      abFName: existingAppointment?.abFName || "",
      abLName: existingAppointment?.abLName || "",
      abMName: existingAppointment?.abMName || "",
      abTitle: existingAppointment?.abTitle || "",
      hplID: existingAppointment?.hplID || bookingForm.hplID || 0,
      providerName: existingAppointment?.providerName || bookingForm.providerName || "",
      rlID: existingAppointment?.rlID || bookingForm.rlID || 0,
      rlName: existingAppointment?.rlName || bookingForm.rlName || "",
      arlID: existingAppointment?.arlID || 0,
      arlName: existingAppointment?.arlName || "",
      abDuration: existingAppointment?.abDuration || bookingForm.abDuration || 30,
      abDurDesc: existingAppointment?.abDurDesc || bookingForm.abDurDesc || "30 minutes",
      abDate: existingAppointment?.abDate ? new Date(existingAppointment.abDate) : bookingForm.abDate ? new Date(bookingForm.abDate) : serverDate,
      abTime: existingAppointment?.abTime ? new Date(existingAppointment.abTime) : bookingForm.abTime ? new Date(bookingForm.abTime) : serverDate,
      abEndTime: existingAppointment?.abEndTime ? new Date(existingAppointment.abEndTime) : bookingForm.abEndTime ? new Date(bookingForm.abEndTime) : serverDate,
      pChartID: existingAppointment?.pChartID || 0,
      pChartCode: existingAppointment?.pChartCode || "",
      abPType: existingAppointment?.abPType || "OP",
      abStatus: existingAppointment?.abStatus || "Booked",
      patRegisterYN: existingAppointment?.patRegisterYN === "Y" || existingAppointment?.patRegisterYN === "N" ? existingAppointment.patRegisterYN : "Y",
      appPhone1: existingAppointment?.appPhone1 || "",
      appPhone2: existingAppointment?.appPhone2 || "",
      email: "",
      city: existingAppointment?.city || "",
      dob: existingAppointment?.dob ? new Date(existingAppointment.dob) : undefined,
      procNotes: existingAppointment?.procNotes || "",
      arlInstructions: existingAppointment?.arlInstructions || "",
      atID: existingAppointment?.atID || 0,
      atName: existingAppointment?.atName || "",
      pNatID: existingAppointment?.pNatID || 0,
      pNatName: existingAppointment?.pNatName || "",
      patOPIP: existingAppointment?.patOPIP || "O",
      admitID: existingAppointment?.admitID || 0,
      wNameID: existingAppointment?.wNameID || 0,
      wName: existingAppointment?.wName || "",
      wCatID: existingAppointment?.wCatID || 0,
      wCatName: existingAppointment?.wCatName || "",
      roomID: existingAppointment?.roomID || 0,
      roomName: existingAppointment?.roomName || "",
      bedID: existingAppointment?.bedID || 0,
      bedName: existingAppointment?.bedName || "",
      crID: existingAppointment?.crID || 0,
      crName: existingAppointment?.crName || "",
      cancelReason: existingAppointment?.cancelReason || "",
      pChartCompID: existingAppointment?.pChartCompID || 0,
      rSchdleID: existingAppointment?.rSchdleID || 0,
      rschdleBy: existingAppointment?.rschdleBy || "",
      pssnId: existingAppointment?.pssnId || "",
      intIdPsprt: existingAppointment?.intIdPsprt || "",
      oldPChartID: existingAppointment?.oldPChartID || 0,
      otBookNo: existingAppointment?.otBookNo || 0,
    }),
    [existingAppointment, bookingForm, serverDate]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<BookingFormData>({
    resolver: zodResolver(appointmentBookingSchema),
    mode: "onChange",
    defaultValues,
  });

  // Watch form values for calculations and updates
  const watchedDuration = watch("abDuration");
  const watchedAbTime = watch("abTime");
  const watchedPatRegisterYN = watch("patRegisterYN");
  const watchedAbPType = watch("abPType");

  // Calculate end time when duration or start time changes
  useEffect(() => {
    if (watchedAbTime && watchedDuration) {
      const endTime = new Date(watchedAbTime);
      endTime.setMinutes(endTime.getMinutes() + watchedDuration);
      setValue("abEndTime", endTime, { shouldDirty: false });
    }
  }, [watchedAbTime, watchedDuration, setValue]);

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setFormError(null);

      // Auto-expand relevant accordions
      setPatientAccordionExpanded(true);
      setAppointmentAccordionExpanded(true);
      setAdditionalAccordionExpanded(false);
    }
  }, [open, defaultValues, reset, setValue]);

  // Handle patient selection
  const handlePatientSelect = useCallback(
    async (patient: PatientSearchResult | null) => {
      setSelectedPatient(patient);

      if (patient) {
        try {
          // First set basic information immediately for responsive UI
          setValue("pChartID", patient.pChartID, { shouldValidate: true, shouldDirty: true });
          setValue("pChartCode", patient.pChartCode, { shouldValidate: true, shouldDirty: true });
          setValue("patRegisterYN", "Y", { shouldValidate: true, shouldDirty: true });

          // Fetch detailed patient information
          const result = await PatientService.getPatientDetails(patient.pChartID);

          if (result.success && result.data) {
            const patientDetails = result.data;
            const patientRegisters = patientDetails.patRegisters;
            const patientAddress = patientDetails.patAddress;
            const patientOverview = patientDetails.patOverview;

            // Update form with detailed patient information
            if (patientRegisters) {
              // Basic patient information
              setValue("abTitle", patientRegisters.pTitle || "", { shouldValidate: true, shouldDirty: true });
              setValue("abFName", patientRegisters.pFName || "", { shouldValidate: true, shouldDirty: true });
              setValue("abMName", patientRegisters.pMName || "", { shouldValidate: true, shouldDirty: true });
              setValue("abLName", patientRegisters.pLName || "", { shouldValidate: true, shouldDirty: true });
              setValue("pChartCompID", patientRegisters.pChartCompID || 0, { shouldValidate: true, shouldDirty: true });

              // Date of birth
              if (patientRegisters.pDob) {
                setValue("dob", new Date(patientRegisters.pDob), { shouldValidate: true, shouldDirty: true });
              }

              // Identity information
              setValue("intIdPsprt", patientRegisters.intIdPsprt || "", { shouldValidate: true, shouldDirty: true });
              setValue("pssnId", patientRegisters.intIdPsprt || "", { shouldValidate: true, shouldDirty: true });
            }

            // Address and contact information
            if (patientAddress) {
              setValue("appPhone1", patientAddress.pAddPhone1 || "", { shouldValidate: true, shouldDirty: true });
              setValue("appPhone2", patientAddress.pAddPhone2 || "", { shouldValidate: true, shouldDirty: true });
              setValue("city", patientAddress.pAddCity || "", { shouldValidate: true, shouldDirty: true });
              setValue("email", patientAddress.pAddEmail || "", { shouldValidate: true, shouldDirty: true });
            }

            // Additional patient overview information
            if (patientOverview) {
              // Set nationality if available (you may need to map pCountryOfOrigin to pNatID)
              // This depends on your dropdown mapping logic
              if (patientOverview.pCountryOfOrigin) {
                // You might need to find the corresponding nationality ID from your dropdown options
                const nationalityOption = nationality.find((nat) => nat.label.toLowerCase() === patientOverview.pCountryOfOrigin?.toLowerCase());
                if (nationalityOption) {
                  setValue("pNatID", Number(nationalityOption.value), { shouldValidate: true, shouldDirty: true });
                  setValue("pNatName", nationalityOption.label, { shouldValidate: true, shouldDirty: true });
                }
              }
            }

            showAlert("Success", "Patient details loaded successfully", "success");
          } else {
            const errorMessage = result.errorMessage || "Failed to fetch patient details";
            showAlert("Warning", `Could not load complete patient details: ${errorMessage}`, "warning");
          }
        } catch (error) {
          console.error("Error fetching patient details:", error);
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          showAlert("Error", `Failed to load patient details: ${errorMessage}`, "error");
        } finally {
        }
      } else {
        // Clear patient information when no patient is selected
        setValue("pChartID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("pChartCode", "", { shouldValidate: true, shouldDirty: true });
        setValue("abTitle", "", { shouldValidate: true, shouldDirty: true });
        setValue("abFName", "", { shouldValidate: true, shouldDirty: true });
        setValue("abMName", "", { shouldValidate: true, shouldDirty: true });
        setValue("abLName", "", { shouldValidate: true, shouldDirty: true });
        setValue("appPhone1", "", { shouldValidate: true, shouldDirty: true });
        setValue("appPhone2", "", { shouldValidate: true, shouldDirty: true });
        setValue("city", "", { shouldValidate: true, shouldDirty: true });
        setValue("email", "", { shouldValidate: true, shouldDirty: true });
        setValue("dob", undefined, { shouldValidate: true, shouldDirty: true });
        setValue("intIdPsprt", "", { shouldValidate: true, shouldDirty: true });
        setValue("pssnId", "", { shouldValidate: true, shouldDirty: true });
        setValue("pNatID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("pNatName", "", { shouldValidate: true, shouldDirty: true });
        setValue("pChartCompID", 0, { shouldValidate: true, shouldDirty: true });
      }
    },
    [setValue, nationality, showAlert]
  );

  // Handle provider selection
  const handleProviderChange = useCallback(
    (value: any) => {
      const selectedProvider = providers.find((provider) => Number(provider.value) === Number(value.value));
      if (selectedProvider) {
        setValue("hplID", Number(selectedProvider.value), { shouldValidate: true, shouldDirty: true });
        setValue("providerName", selectedProvider.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [providers, setValue]
  );

  // Handle resource selection
  const handleResourceChange = useCallback(
    (value: any) => {
      const selectedResource = resources.find((resource) => Number(resource.value) === Number(value.value));
      if (selectedResource) {
        setValue("rlID", Number(selectedResource.value), { shouldValidate: true, shouldDirty: true });
        setValue("rlName", selectedResource.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [resources, setValue]
  );

  // Handle reason selection
  const handleReasonChange = useCallback(
    (value: any) => {
      const selectedReason = reasonList.find((reason) => Number(reason.value) === Number(value.value));
      if (selectedReason) {
        setValue("arlID", Number(selectedReason.value), { shouldValidate: true, shouldDirty: true });
        setValue("arlName", selectedReason.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [reasonList, setValue]
  );

  // Handle duration selection
  const handleDurationChange = useCallback(
    (value: any) => {
      const selectedDuration = DURATION_OPTIONS.find((duration) => duration.value === value.value);
      if (selectedDuration) {
        setValue("abDuration", Number(selectedDuration.value), { shouldValidate: true, shouldDirty: true });
        setValue("abDurDesc", selectedDuration.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [setValue]
  );

  // Handle consultant role selection
  const handleConsultantRoleChange = useCallback(
    (value: any) => {
      const selectedRole = consultantRole.find((role) => Number(role.value) === Number(value.value));
      if (selectedRole) {
        setValue("crID", Number(selectedRole.value), { shouldValidate: true, shouldDirty: true });
        setValue("crName", selectedRole.label, { shouldValidate: true, shouldDirty: true });
      }
    },
    [consultantRole, setValue]
  );

  // Handle patient type change
  const handlePatientTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue("abPType", event.target.value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  // Handle registered patient toggle
  const handleRegisteredPatientToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isRegistered = event.target.checked;
      setValue("patRegisterYN", isRegistered ? "Y" : "N", { shouldValidate: true, shouldDirty: true });

      if (!isRegistered) {
        // Clear patient selection when switching to non-registered
        setSelectedPatient(null);
        setPatientSearchClear((prev) => prev + 1);
        setValue("pChartID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("pChartCode", "", { shouldValidate: true, shouldDirty: true });
      }
    },
    [setValue]
  );

  // Form submission
  const onFormSubmit = async (data: BookingFormData) => {
    setFormError(null);

    try {
      setIsSubmitting(true);

      // Validate required fields based on patient type
      if (data.patRegisterYN === "Y" && !data.pChartID) {
        throw new Error("Please select a registered patient");
      }

      if (data.patRegisterYN === "N" && (!data.abFName || !data.abLName || !data.appPhone1)) {
        throw new Error("Please provide patient name and contact information");
      }

      // Transform form data to AppointBookingDto
      const appointmentData: AppointBookingDto = {
        abID: data.abID,
        abFName: data.abFName,
        abLName: data.abLName,
        abMName: data.abMName,
        abTitle: data.abTitle,
        hplID: data.hplID,
        providerName: data.providerName,
        rlID: data.rlID,
        rlName: data.rlName,
        arlID: data.arlID,
        arlName: data.arlName,
        abDuration: data.abDuration,
        abDurDesc: data.abDurDesc,
        abDate: data.abDate,
        abTime: data.abTime,
        pChartID: data.pChartID,
        pChartCode: data.pChartCode,
        abPType: data.abPType,
        abStatus: data.abStatus,
        appPhone1: data.appPhone1,
        appPhone2: data.appPhone2,
        patRegisterYN: data.patRegisterYN,
        otBookNo: data.otBookNo,
        atID: data.atID,
        atName: data.atName,
        pNatID: data.pNatID,
        pNatName: data.pNatName,
        patOPIP: data.patOPIP,
        admitID: data.admitID,
        wNameID: data.wNameID,
        wName: data.wName,
        wCatID: data.wCatID,
        wCatName: data.wCatName,
        roomID: data.roomID,
        roomName: data.roomName,
        bedID: data.bedID,
        bedName: data.bedName,
        crID: data.crID,
        crName: data.crName,
        abEndTime: data.abEndTime,
        procNotes: data.procNotes,
        arlInstructions: data.arlInstructions,
        cancelReason: data.cancelReason,
        city: data.city,
        dob: data.dob,
        email: "",
        pChartCompID: data.pChartCompID,
        rSchdleID: data.rSchdleID,
        rschdleBy: data.rschdleBy,
        pssnId: data.pssnId,
        intIdPsprt: data.intIdPsprt,
        oldPChartID: data.oldPChartID,
      };

      await onSubmit(appointmentData);
    } catch (error) {
      console.error("Error submitting appointment:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to book appointment";
      setFormError(errorMessage);
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear form
  const handleClear = useCallback(() => {
    reset(defaultValues);
    setSelectedPatient(null);
    setPatientSearchClear((prev) => prev + 1);
    setFormError(null);
    onFormChange(bookingForm);
  }, [reset, defaultValues, onFormChange, bookingForm]);

  // Dialog actions
  const dialogActions = (
    <Stack direction="row" spacing={1}>
      <CustomButton variant="outlined" text="Clear" icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || !isDirty} color="inherit" size="small" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} size="small" />
      <SmartButton
        variant="contained"
        text={isEditMode ? "Update Appointment" : "Book Appointment"}
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={!isValid || isSubmitting}
        color="primary"
        loadingText={isEditMode ? "Updating..." : "Booking..."}
        successText={isEditMode ? "Updated!" : "Booked!"}
        size="small"
      />
    </Stack>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit Appointment" : "Book New Appointment"}
      maxWidth="lg"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ p: 2 }}>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Grid container spacing={2}>
            {/* Patient Information Section */}
            <Grid size={{ xs: 12 }}>
              <Accordion
                expanded={patientAccordionExpanded}
                onChange={() => setPatientAccordionExpanded(!patientAccordionExpanded)}
                sx={{ border: "1px solid", borderColor: "primary.200" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "primary.50" }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                      <PatientIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="h6">Patient Information</Typography>
                    {selectedPatient && <Chip size="small" label={selectedPatient.fullName} color="primary" variant="outlined" />}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {/* Patient Type Selection */}
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ p: 1, backgroundColor: "grey.50", borderRadius: 1 }}>
                        <FormControlLabel
                          control={<Switch checked={watchedPatRegisterYN === "Y"} onChange={handleRegisteredPatientToggle} color="primary" />}
                          label="Registered Patient"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block">
                          {watchedPatRegisterYN === "Y" ? "Search and select from existing patients" : "Enter new patient details for walk-in appointment"}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Patient Search for Registered Patients */}
                    {watchedPatRegisterYN === "Y" && (
                      <Grid size={{ xs: 12 }}>
                        <PatientSearch
                          onPatientSelect={handlePatientSelect}
                          clearTrigger={patientSearchClear}
                          label="Search Patient"
                          placeholder="Search by name, UHID, or phone number"
                        />
                      </Grid>
                    )}

                    {/* Patient Details Form */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <EnhancedFormField
                        name="abTitle"
                        control={control}
                        type="select"
                        label="Title"
                        size="small"
                        options={title}
                        disabled={watchedPatRegisterYN === "Y" && !!selectedPatient}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <EnhancedFormField
                        name="abFName"
                        control={control}
                        type="text"
                        label="First Name"
                        required
                        size="small"
                        disabled={watchedPatRegisterYN === "Y" && !!selectedPatient}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <EnhancedFormField
                        name="abMName"
                        control={control}
                        type="text"
                        label="Middle Name"
                        size="small"
                        disabled={watchedPatRegisterYN === "Y" && !!selectedPatient}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <EnhancedFormField
                        name="abLName"
                        control={control}
                        type="text"
                        label="Last Name"
                        required
                        size="small"
                        disabled={watchedPatRegisterYN === "Y" && !!selectedPatient}
                      />
                    </Grid>

                    {/* Contact Information for Non-Registered Patients */}
                    {watchedPatRegisterYN === "N" && (
                      <>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <EnhancedFormField name="appPhone1" control={control} type="tel" label="Primary Phone" required size="small" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <EnhancedFormField name="appPhone2" control={control} type="tel" label="Secondary Phone" size="small" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <EnhancedFormField name="dob" control={control} type="datepicker" label="Date of Birth" size="small" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <EnhancedFormField name="city" control={control} type="select" label="City" size="small" options={city} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <EnhancedFormField name="pNatID" control={control} type="select" label="Nationality" size="small" options={nationality} />
                        </Grid>
                      </>
                    )}

                    {/* Patient Type */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Patient Type
                      </Typography>
                      <RadioGroup value={watchedAbPType} onChange={handlePatientTypeChange} row>
                        {PATIENT_TYPE_OPTIONS.map((option) => (
                          <FormControlLabel key={option.value} value={option.value} control={<Radio size="small" />} label={option.label} />
                        ))}
                      </RadioGroup>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Appointment Details Section */}
            <Grid size={{ xs: 12 }}>
              <Accordion
                expanded={appointmentAccordionExpanded}
                onChange={() => setAppointmentAccordionExpanded(!appointmentAccordionExpanded)}
                sx={{ border: "1px solid", borderColor: "success.200" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "success.50" }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: "success.main", width: 32, height: 32 }}>
                      <ScheduleIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="h6">Appointment Details</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {/* Provider and Resource */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <EnhancedFormField name="hplID" control={control} type="select" label="Provider" required size="small" options={providers} onChange={handleProviderChange} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <EnhancedFormField
                        name="rlID"
                        control={control}
                        type="select"
                        label="Resource/Room"
                        required
                        size="small"
                        options={resources}
                        onChange={handleResourceChange}
                      />
                    </Grid>

                    {/* Date and Time */}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <EnhancedFormField name="abDate" control={control} type="datepicker" label="Appointment Date" required size="small" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <EnhancedFormField name="abTime" control={control} type="timepicker" label="Start Time" required size="small" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <EnhancedFormField
                        name="abDuration"
                        control={control}
                        type="select"
                        label="Duration"
                        required
                        size="small"
                        options={DURATION_OPTIONS}
                        onChange={handleDurationChange}
                      />
                    </Grid>

                    {/* Reason and Status */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <EnhancedFormField name="arlID" control={control} type="select" label="Reason for Visit" size="small" options={reasonList} onChange={handleReasonChange} />
                    </Grid>

                    {/* Notes */}
                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField
                        name="procNotes"
                        control={control}
                        type="textarea"
                        label="Appointment Notes"
                        size="small"
                        rows={3}
                        placeholder="Add any special instructions or notes for this appointment..."
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField
                        name="arlInstructions"
                        control={control}
                        type="textarea"
                        label="Patient Instructions"
                        size="small"
                        rows={2}
                        placeholder="Instructions for the patient..."
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Additional Information Section */}
            <Grid size={{ xs: 12 }}>
              <Accordion
                expanded={additionalAccordionExpanded}
                onChange={() => setAdditionalAccordionExpanded(!additionalAccordionExpanded)}
                sx={{ border: "1px solid", borderColor: "info.200" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "info.50" }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: "info.main", width: 32, height: 32 }}>
                      <HospitalIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="h6">Additional Information</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (Optional)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {/* Inpatient Information */}
                    {watchedAbPType === "IP" && (
                      <>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Inpatient Details
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <EnhancedFormField name="wName" control={control} type="text" label="Ward Name" size="small" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <EnhancedFormField name="roomName" control={control} type="text" label="Room Name" size="small" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <EnhancedFormField name="bedName" control={control} type="text" label="Bed Name" size="small" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <EnhancedFormField name="wCatName" control={control} type="text" label="Ward Category" size="small" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <EnhancedFormField name="admitID" control={control} type="number" label="Admission ID" size="small" inputProps={{ min: 0 }} />
                        </Grid>
                      </>
                    )}

                    {/* Additional Reference Fields */}
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" gutterBottom color="info">
                        Reference Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <EnhancedFormField name="pssnId" control={control} type="text" label="ABHA Number" size="small" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <EnhancedFormField name="intIdPsprt" control={control} type="text" label="International ID/Passport" size="small" />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </form>
      </Box>
    </GenericDialog>
  );
};

export default BookingDialog;
