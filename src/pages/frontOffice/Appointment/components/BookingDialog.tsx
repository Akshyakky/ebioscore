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
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Enhanced schema for appointment booking with proper validation
const appointmentBookingSchema = z
  .object({
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
    abDuration: z.number().min(15, "Duration must be at least 15 minutes").default(15),
    abDurDesc: z.string().default("15 minutes"),

    // Date and time - with proper validation
    abDate: z.date().refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Appointment date cannot be in the past",
    }),
    abTime: z.date(),
    abEndTime: z.date(),

    // Patient information
    pChartID: z.number().optional().default(0),
    pChartCode: z.string().optional().default(""),
    abPType: z.string().min(1, "Patient type is required"),
    abStatus: z.string().default("Scheduled"),
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
    otBookNo: z.number().default(1),
    rActiveYN: z.string().default("Y"),
    transferYN: z.string().default("N"),
  })
  .refine(
    (data) => {
      // Validate that end time is after start time
      return data.abEndTime > data.abTime;
    },
    { message: "End time must be after start time", path: ["abEndTime"] }
  )
  .refine(
    (data) => {
      // Validate that appointment time is in 15-minute intervals
      const minutes = data.abTime.getMinutes();
      return minutes % 15 === 0;
    },
    { message: "Appointment time must be in 15-minute intervals (00, 15, 30, 45)", path: ["abTime"] }
  )
  .refine(
    (data) => {
      // Validate patient information based on registration status
      if (data.patRegisterYN === "Y") {
        return data.pChartID && data.pChartID > 0;
      } else {
        return data.abFName && data.abLName && data.appPhone1;
      }
    },
    { message: "Required patient information is missing", path: ["patRegisterYN"] }
  );

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
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

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

  // Generate 15-minute time intervals for the time selector
  const timeIntervals = useMemo(() => {
    const intervals = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        intervals.push({
          value: timeString,
          label: timeString,
          dateValue: date,
        });
      }
    }
    return intervals;
  }, []);

  // Form setup with default values
  const defaultValues: BookingFormData = useMemo(
    () => ({
      abID: existingAppointment?.abID || bookingForm.abID || 0,
      abFName: existingAppointment?.abFName || bookingForm.abFName || "",
      abLName: existingAppointment?.abLName || bookingForm.abLName || "",
      abMName: existingAppointment?.abMName || bookingForm.abMName || "",
      abTitle: existingAppointment?.abTitle || bookingForm.abTitle || "",
      hplID: existingAppointment?.hplID || bookingForm.hplID || 0,
      providerName: existingAppointment?.providerName || bookingForm.providerName || "",
      rlID: existingAppointment?.rlID || bookingForm.rlID || 0,
      rlName: existingAppointment?.rlName || bookingForm.rlName || "",
      arlID: existingAppointment?.arlID || bookingForm.arlID || 0,
      arlName: existingAppointment?.arlName || bookingForm.arlName || "",
      abDuration: existingAppointment?.abDuration || bookingForm.abDuration || 15,
      abDurDesc: existingAppointment?.abDurDesc || bookingForm.abDurDesc || "15 minutes",
      abDate: existingAppointment?.abDate ? new Date(existingAppointment.abDate) : bookingForm.abDate ? new Date(bookingForm.abDate) : serverDate,
      abTime: existingAppointment?.abTime ? new Date(existingAppointment.abTime) : bookingForm.abTime ? new Date(bookingForm.abTime) : serverDate,
      abEndTime: existingAppointment?.abEndTime ? new Date(existingAppointment.abEndTime) : bookingForm.abEndTime ? new Date(bookingForm.abEndTime) : serverDate,
      pChartID: existingAppointment?.pChartID || bookingForm.pChartID || 0,
      pChartCode: existingAppointment?.pChartCode || bookingForm.pChartCode || "",
      abPType: existingAppointment?.abPType || bookingForm.abPType || "OP",
      abStatus: existingAppointment?.abStatus || bookingForm.abStatus || "Scheduled",
      patRegisterYN:
        existingAppointment?.patRegisterYN === "Y" || existingAppointment?.patRegisterYN === "N"
          ? existingAppointment.patRegisterYN
          : bookingForm.patRegisterYN === "Y" || bookingForm.patRegisterYN === "N"
          ? bookingForm.patRegisterYN
          : "Y",
      appPhone1: existingAppointment?.appPhone1 || bookingForm.appPhone1 || "",
      appPhone2: existingAppointment?.appPhone2 || bookingForm.appPhone2 || "",
      email: existingAppointment?.email || bookingForm.email || "",
      city: existingAppointment?.city || bookingForm.city || "",
      dob: existingAppointment?.dob ? new Date(existingAppointment.dob) : bookingForm.dob ? new Date(bookingForm.dob) : undefined,
      procNotes: existingAppointment?.procNotes || bookingForm.procNotes || "",
      arlInstructions: existingAppointment?.arlInstructions || bookingForm.arlInstructions || "",
      atID: existingAppointment?.atID || bookingForm.atID || 0,
      atName: existingAppointment?.atName || bookingForm.atName || "",
      pNatID: existingAppointment?.pNatID || bookingForm.pNatID || 0,
      pNatName: existingAppointment?.pNatName || bookingForm.pNatName || "",
      patOPIP: existingAppointment?.patOPIP || bookingForm.patOPIP || "O",
      admitID: existingAppointment?.admitID || bookingForm.admitID || 0,
      wNameID: existingAppointment?.wNameID || bookingForm.wNameID || 0,
      wName: existingAppointment?.wName || bookingForm.wName || "",
      wCatID: existingAppointment?.wCatID || bookingForm.wCatID || 0,
      wCatName: existingAppointment?.wCatName || bookingForm.wCatName || "",
      roomID: existingAppointment?.roomID || bookingForm.roomID || 0,
      roomName: existingAppointment?.roomName || bookingForm.roomName || "",
      bedID: existingAppointment?.bedID || bookingForm.bedID || 0,
      bedName: existingAppointment?.bedName || bookingForm.bedName || "",
      crID: existingAppointment?.crID || bookingForm.crID || 0,
      crName: existingAppointment?.crName || bookingForm.crName || "",
      cancelReason: existingAppointment?.cancelReason || bookingForm.cancelReason || "",
      pChartCompID: existingAppointment?.pChartCompID || bookingForm.pChartCompID || 0,
      rSchdleID: existingAppointment?.rSchdleID || bookingForm.rSchdleID || 0,
      rschdleBy: existingAppointment?.rschdleBy || bookingForm.rschdleBy || "",
      pssnId: existingAppointment?.pssnId || bookingForm.pssnId || "",
      intIdPsprt: existingAppointment?.intIdPsprt || bookingForm.intIdPsprt || "",
      oldPChartID: existingAppointment?.oldPChartID || bookingForm.oldPChartID || 0,
      otBookNo: existingAppointment?.otBookNo || bookingForm.otBookNo || 1,
      rActiveYN: existingAppointment?.rActiveYN || bookingForm.rActiveYN || "Y",
      transferYN: existingAppointment?.transferYN || bookingForm.transferYN || "N",
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
  const watchedHplID = watch("hplID");
  const watchedAbDate = watch("abDate");

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
  }, [open, defaultValues, reset]);

  // Handle patient selection with enhanced error handling
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
              setValue("abTitle", patientRegisters.pTitle || "", { shouldValidate: true, shouldDirty: true });
              setValue("abFName", patientRegisters.pFName || "", { shouldValidate: true, shouldDirty: true });
              setValue("abMName", patientRegisters.pMName || "", { shouldValidate: true, shouldDirty: true });
              setValue("abLName", patientRegisters.pLName || "", { shouldValidate: true, shouldDirty: true });
              setValue("pChartCompID", patientRegisters.pChartCompID || 0, { shouldValidate: true, shouldDirty: true });

              if (patientRegisters.pDob) {
                setValue("dob", new Date(patientRegisters.pDob), { shouldValidate: true, shouldDirty: true });
              }

              setValue("pssnId", patientRegisters.pssnId || patientRegisters.pSSNId || "", { shouldValidate: true, shouldDirty: true });
              setValue("intIdPsprt", patientRegisters.intIdPsprt || patientRegisters.pIntIdPsprt || "", { shouldValidate: true, shouldDirty: true });
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
              if (patientOverview.pCountryOfOrigin) {
                const nationalityOption = nationality.find((nat) => nat.label.toLowerCase() === patientOverview.pCountryOfOrigin?.toLowerCase());
                if (nationalityOption) {
                  setValue("pNatID", Number(nationalityOption.value), { shouldValidate: true, shouldDirty: true });
                  setValue("pNatName", nationalityOption.label, { shouldValidate: true, shouldDirty: true });
                }
              }
            }
          } else {
            const errorMessage = result.errorMessage || "Failed to fetch patient details";
            showAlert("Warning", `Could not load complete patient details: ${errorMessage}`, "warning");
          }
        } catch (error) {
          console.error("Error fetching patient details:", error);
          const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
          showAlert("Error", `Failed to load patient details: ${errorMessage}`, "error");
        }
      } else {
        // Clear patient information when no patient is selected
        const fieldsToReset = [
          "pChartID",
          "pChartCode",
          "abTitle",
          "abFName",
          "abMName",
          "abLName",
          "appPhone1",
          "appPhone2",
          "city",
          "email",
          "dob",
          "pssnId",
          "intIdPsprt",
          "pNatID",
          "pNatName",
          "pChartCompID",
        ];

        fieldsToReset.forEach((field) => {
          setValue(field as keyof BookingFormData, field === "pChartID" || field === "pNatID" || field === "pChartCompID" ? 0 : ("" as any), {
            shouldValidate: true,
            shouldDirty: true,
          });
        });
      }
    },
    [setValue, nationality, showAlert]
  );

  // Enhanced form submission with proper validation and API integration
  const onFormSubmit = async (data: BookingFormData) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      // Final validation before submission
      if (data.patRegisterYN === "Y" && !data.pChartID) {
        throw new Error("Please select a registered patient");
      }

      if (data.patRegisterYN === "N" && (!data.abFName || !data.abLName || !data.appPhone1)) {
        throw new Error("Please provide patient name and contact information");
      }

      // Validate that appointment time is in 15-minute intervals
      const minutes = data.abTime.getMinutes();
      if (minutes % 15 !== 0) {
        throw new Error("Appointment time must be in 15-minute intervals (00, 15, 30, 45)");
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
        email: data.email,
        pChartCompID: data.pChartCompID,
        rSchdleID: data.rSchdleID,
        rschdleBy: data.rschdleBy,
        pssnId: data.pssnId,
        intIdPsprt: data.intIdPsprt,
        oldPChartID: data.oldPChartID,
        rActiveYN: data.rActiveYN,
        transferYN: data.transferYN,
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

  // Enhanced change handlers with proper type checking
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

  const getDurationDescription = (minutes: number): string => {
    if (minutes === 0) return "";
    if (minutes <= 15) return "15 minutes";
    if (minutes <= 30) return "30 minutes";
    if (minutes <= 45) return "45 minutes";
    if (minutes <= 60) return "1 hour";
    if (minutes <= 90) return "1.5 hours";
    if (minutes <= 120) return "2 hours";
    return `${minutes} minutes`;
  };

  const handleReasonChange = useCallback(
    (value: any) => {
      const selectedReason = reasonList.find((reason) => Number(reason.value) === Number(value.value));
      if (selectedReason) {
        // Set reason information
        setValue("arlID", Number(selectedReason.value), { shouldValidate: true, shouldDirty: true });
        setValue("arlName", selectedReason.label, { shouldValidate: true, shouldDirty: true });

        // Auto-populate duration from the selected reason
        const reasonData = selectedReason as any;
        if (reasonData.arlDuration) {
          setValue("abDuration", Number(reasonData.arlDuration), { shouldValidate: true, shouldDirty: true });

          // Set duration description
          const durationDesc = reasonData.arlDurDesc || getDurationDescription(Number(reasonData.arlDuration));
          setValue("abDurDesc", durationDesc, { shouldValidate: true, shouldDirty: true });
        }
      }
    },
    [reasonList, setValue]
  );

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

  const handleTimeChange = useCallback(
    (value: any) => {
      const selectedTime = timeIntervals.find((time) => time.value === value.value);
      if (selectedTime) {
        const newTime = new Date(watchedAbDate);
        newTime.setHours(selectedTime.dateValue.getHours(), selectedTime.dateValue.getMinutes(), 0, 0);
        setValue("abTime", newTime, { shouldValidate: true, shouldDirty: true });
      }
    },
    [timeIntervals, setValue, watchedAbDate]
  );

  const handlePatientTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue("abPType", event.target.value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  const handleRegisteredPatientToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isRegistered = event.target.checked;
      setValue("patRegisterYN", isRegistered ? "Y" : "N", { shouldValidate: true, shouldDirty: true });

      if (!isRegistered) {
        setSelectedPatient(null);
        setPatientSearchClear((prev) => prev + 1);
        setValue("pChartID", 0, { shouldValidate: true, shouldDirty: true });
        setValue("pChartCode", "", { shouldValidate: true, shouldDirty: true });
      }
    },
    [setValue]
  );

  // Clear form
  const handleClear = useCallback(() => {
    reset(defaultValues);
    setSelectedPatient(null);
    setPatientSearchClear((prev) => prev + 1);
    setFormError(null);
    onFormChange(bookingForm);
  }, [reset, defaultValues, onFormChange, bookingForm]);

  // Dialog actions with enhanced loading states
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
        disabled={!isValid || isSubmitting || isCheckingConflicts}
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
      <Box padding={2}>
        {formError && (
          <Alert severity="error" onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        {isCheckingConflicts && <Alert severity="info">Checking for appointment conflicts...</Alert>}

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Stack spacing={2}>
            {/* Patient Information Section */}
            <Accordion expanded={patientAccordionExpanded} onChange={() => setPatientAccordionExpanded(!patientAccordionExpanded)} variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: "rgba(25, 118, 210, 0.04)" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar color="primary">
                    <PatientIcon />
                  </Avatar>
                  <Typography variant="h6">Patient Information</Typography>
                  {selectedPatient && <Chip size="small" label={selectedPatient.fullName} color="primary" variant="outlined" />}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {/* Patient Type Selection */}
                  <Paper variant="outlined">
                    <Box padding={1}>
                      <FormControlLabel
                        control={<Switch checked={watchedPatRegisterYN === "Y"} onChange={handleRegisteredPatientToggle} color="primary" />}
                        label="Registered Patient"
                      />
                      <Typography variant="caption" color="text.secondary" display="block">
                        {watchedPatRegisterYN === "Y" ? "Search and select from existing patients" : "Enter new patient details for walk-in appointment"}
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Patient Search for Registered Patients */}
                  {watchedPatRegisterYN === "Y" && (
                    <PatientSearch
                      onPatientSelect={handlePatientSelect}
                      clearTrigger={patientSearchClear}
                      label="Search Patient"
                      placeholder="Search by name, UHID, or phone number"
                    />
                  )}

                  {/* Patient Details Form */}
                  <Grid container spacing={2}>
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
                          <EnhancedFormField name="email" control={control} type="email" label="Email Address" size="small" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <EnhancedFormField name="dob" control={control} type="datepicker" label="Date of Birth" size="small" />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <EnhancedFormField name="city" control={control} type="select" label="City" size="small" options={city} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <EnhancedFormField
                            name="pNatID"
                            control={control}
                            type="select"
                            label="Nationality"
                            size="small"
                            options={nationality.map((item) => ({ value: item.id, label: item.label }))}
                          />
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
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Appointment Details Section - Reordered with Reason Before Time */}
            <Accordion expanded={appointmentAccordionExpanded} onChange={() => setAppointmentAccordionExpanded(!appointmentAccordionExpanded)} variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: "rgba(46, 125, 50, 0.04)" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar style={{ backgroundColor: "#4caf50" }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Typography variant="h6">Appointment Details</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
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

                  {/* Reason for Visit - Now comes before time selection */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <EnhancedFormField name="arlID" control={control} type="select" label="Reason for Visit" size="small" options={reasonList} onChange={handleReasonChange} />
                  </Grid>

                  {/* Duration */}
                  <Grid size={{ xs: 12, sm: 6 }}>
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

                  {/* Date and Time - Time with 15-minute intervals */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <EnhancedFormField name="abDate" control={control} type="datepicker" label="Appointment Date" required size="small" />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl size="small" fullWidth required>
                      <InputLabel>Appointment Time</InputLabel>
                      <Select
                        value={watchedAbTime ? `${watchedAbTime.getHours().toString().padStart(2, "0")}:${watchedAbTime.getMinutes().toString().padStart(2, "0")}` : ""}
                        onChange={(e) => handleTimeChange({ value: e.target.value })}
                        label="Appointment Time"
                        error={!!errors.abTime}
                      >
                        {timeIntervals.map((time) => (
                          <MenuItem key={time.value} value={time.value}>
                            {time.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.abTime && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          {errors.abTime.message}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <EnhancedFormField name="abEndTime" control={control} type="timepicker" label="End Time" size="small" disabled />
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

            {/* Additional Information Section */}
            <Accordion expanded={additionalAccordionExpanded} onChange={() => setAdditionalAccordionExpanded(!additionalAccordionExpanded)} variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: "rgba(2, 136, 209, 0.04)" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar style={{ backgroundColor: "#2196f3" }}>
                    <HospitalIcon />
                  </Avatar>
                  <Typography variant="h6">Additional Information</Typography>
                  <Typography variant="caption" color="text.secondary">
                    (Optional)
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Inpatient Information */}
                  {watchedAbPType === "IP" && (
                    <>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Inpatient Details
                        </Typography>
                        <Divider />
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
                    </>
                  )}

                  {/* Additional Reference Fields */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom color="info">
                      Reference Information
                    </Typography>
                    <Divider />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <EnhancedFormField name="pssnId" control={control} type="text" label="ABHA Number" size="small" disabled={watchedPatRegisterYN === "Y" && !!selectedPatient} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <EnhancedFormField
                      name="intIdPsprt"
                      control={control}
                      type="text"
                      label="International ID/Passport"
                      size="small"
                      disabled={watchedPatRegisterYN === "Y" && !!selectedPatient}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </form>
      </Box>
    </GenericDialog>
  );
};

export default BookingDialog;
