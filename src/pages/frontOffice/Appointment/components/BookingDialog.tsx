// src/pages/frontOffice/Appointment/components/BookingDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import EnhancedFormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { AppointBookingDto, APPOINTMENT_STATUS_OPTIONS, DURATION_OPTIONS, PATIENT_TYPE_OPTIONS } from "@/interfaces/FrontOffice/AppointBookingDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { useAlert } from "@/providers/AlertProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarToday as CalendarIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, FormControlLabel, Grid, Paper, Stack, Switch, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Enhanced schema for appointment booking
const bookingSchema = z
  .object({
    abID: z.number().default(0),
    abFName: z.string().min(1, "First name is required"),
    abLName: z.string().optional().default(""),
    abMName: z.string().optional().default(""),
    hplID: z.number().min(1, "Provider is required"),
    providerName: z.string().default(""),
    rlID: z.number().min(1, "Resource is required"),
    rlName: z.string().default(""),
    arlID: z.number().optional().default(0),
    arlName: z.string().optional().default(""),
    abDuration: z.number().min(15, "Duration must be at least 15 minutes"),
    abDurDesc: z.string().default(""),
    abDate: z.date(),
    abTime: z.date(),
    abEndTime: z.date(),
    pChartID: z.number().optional().default(0),
    pChartCode: z.string().optional().default(""),
    abPType: z.string().min(1, "Patient type is required"),
    abStatus: z.string().min(1, "Status is required"),
    appPhone1: z.string().min(1, "Primary phone is required"),
    appPhone2: z.string().optional().default(""),
    patRegisterYN: z.enum(["Y", "N"]).default("N"),
    otBookNo: z.number().default(0),
    atID: z.number().optional().default(0),
    atName: z.string().optional().default(""),
    pNatID: z.number().optional().default(0),
    pNatName: z.string().optional().default(""),
    patOPIP: z.string().default("O"),
    admitID: z.number().optional().default(0),
    wNameID: z.number().optional().default(0),
    wName: z.string().optional().default(""),
    wCatID: z.number().optional().default(0),
    wCatName: z.string().optional().default(""),
    roomID: z.number().optional().default(0),
    roomName: z.string().optional().default(""),
    bedID: z.number().optional().default(0),
    bedName: z.string().optional().default(""),
    crID: z.number().optional().default(0),
    crName: z.string().optional().default(""),
    procNotes: z.string().optional().default(""),
    arlInstructions: z.string().optional().default(""),
    abTitle: z.string().optional().default(""),
    cancelReason: z.string().optional().default(""),
    city: z.string().optional().default(""),
    dob: z.date().optional(),
    email: z.string().email().optional().or(z.literal("")),
    pChartCompID: z.number().optional().default(0),
    rSchdleID: z.number().optional().default(0),
    rschdleBy: z.string().optional().default(""),
    pssnId: z.string().optional().default(""),
    intIdPsprt: z.string().optional().default(""),
    oldPChartID: z.number().optional().default(0),
  })
  .refine(
    (data) => {
      if (data.patRegisterYN === "Y" && data.pChartID === 0) {
        return false;
      }
      return true;
    },
    {
      message: "Patient selection is required for registered patients",
      path: ["pChartID"],
    }
  )
  .refine(
    (data) => {
      return data.abEndTime > data.abTime;
    },
    {
      message: "End time must be after start time",
      path: ["abEndTime"],
    }
  );

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingDialogProps {
  open: boolean;
  bookingForm: AppointBookingDto;
  isRegisteredPatient: boolean;
  providers: Array<{ value: number; label: string; type: string }>;
  resources: Array<{ value: number; label: string; type: string }>;
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (form: AppointBookingDto) => void;
  onRegisteredPatientChange: (isRegistered: boolean) => void;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  bookingForm,
  isRegisteredPatient,
  providers,
  resources,
  onClose,
  onSubmit,
  onFormChange,
  onRegisteredPatientChange,
}) => {
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [patientDetailsExpanded, setPatientDetailsExpanded] = useState(false);
  const [appointmentDetailsExpanded, setAppointmentDetailsExpanded] = useState(true);
  const [contactDetailsExpanded, setContactDetailsExpanded] = useState(false);

  const { showAlert } = useAlert();
  const serverDate = useServerDate();

  // Load dropdown values
  const { nationality = [], title = [], reasonList = [] } = useDropdownValues(["nationality", "title", "reasonList"]);

  // Form setup with default values
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      abID: 0,
      abFName: "",
      abLName: "",
      abMName: "",
      hplID: 0,
      providerName: "",
      rlID: 0,
      rlName: "",
      arlID: 0,
      arlName: "",
      abDuration: 30,
      abDurDesc: "30 minutes",
      abDate: serverDate,
      abTime: serverDate,
      abEndTime: dayjs(serverDate).add(30, "minute").toDate(),
      pChartID: 0,
      pChartCode: "",
      abPType: "",
      abStatus: "Scheduled",
      appPhone1: "",
      appPhone2: "",
      patRegisterYN: "N",
      otBookNo: 0,
      atID: 0,
      atName: "",
      pNatID: 0,
      pNatName: "",
      patOPIP: "O",
      admitID: 0,
      wNameID: 0,
      wName: "",
      wCatID: 0,
      wCatName: "",
      roomID: 0,
      roomName: "",
      bedID: 0,
      bedName: "",
      crID: 0,
      crName: "",
      procNotes: "",
      arlInstructions: "",
      abTitle: "",
      cancelReason: "",
      city: "",
      dob: undefined,
      email: "",
      pChartCompID: 0,
      rSchdleID: 0,
      rschdleBy: "",
      pssnId: "",
      intIdPsprt: "",
      oldPChartID: 0,
    },
  });

  // Watch form values for dynamic behavior
  const watchedDuration = watch("abDuration");
  const watchedAbTime = watch("abTime");
  const watchedPatRegisterYN = watch("patRegisterYN");

  // Auto-calculate end time when duration or start time changes
  useEffect(() => {
    if (watchedAbTime && watchedDuration) {
      const endTime = dayjs(watchedAbTime).add(watchedDuration, "minute").toDate();
      setValue("abEndTime", endTime, { shouldValidate: true });

      // Update duration description
      const durationOption = DURATION_OPTIONS.find((opt) => opt.value === watchedDuration.toString());
      setValue("abDurDesc", durationOption?.label || `${watchedDuration} minutes`, { shouldValidate: true });
    }
  }, [watchedAbTime, watchedDuration, setValue]);

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        ...bookingForm,
        patRegisterYN: isRegisteredPatient ? "Y" : "N",
      });
      setPatientDetailsExpanded(isRegisteredPatient);
      setAppointmentDetailsExpanded(true);
      setContactDetailsExpanded(!isRegisteredPatient);
    }
  }, [open, bookingForm, isRegisteredPatient, reset]);

  // Handle patient type toggle
  const handlePatientTypeToggle = useCallback(
    (checked: boolean) => {
      setValue("patRegisterYN", checked ? "Y" : "N", { shouldValidate: true });
      onRegisteredPatientChange(checked);
      setPatientDetailsExpanded(checked);
      setContactDetailsExpanded(!checked);

      if (!checked) {
        // Clear patient data for walk-in patients
        setSelectedPatient(null);
        setValue("pChartID", 0, { shouldValidate: true });
        setValue("pChartCode", "", { shouldValidate: true });
      }
    },
    [setValue, onRegisteredPatientChange]
  );

  // Handle patient selection
  const handlePatientSelect = useCallback(
    (patient: PatientSearchResult | null) => {
      setSelectedPatient(patient);

      if (patient) {
        setValue("pChartID", patient.pChartID, { shouldValidate: true });
        setValue("pChartCode", patient.pChartCode, { shouldValidate: true });

        // Extract name parts from fullName
        const nameParts = patient.fullName.split(" ");
        setValue("abFName", nameParts[0] || "", { shouldValidate: true });
        setValue("abLName", nameParts[nameParts.length - 1] || "", { shouldValidate: true });
        if (nameParts.length > 2) {
          setValue("abMName", nameParts.slice(1, -1).join(" "), { shouldValidate: true });
        }
      } else {
        setValue("pChartID", 0, { shouldValidate: true });
        setValue("pChartCode", "", { shouldValidate: true });
      }
    },
    [setValue]
  );

  // Handle provider selection
  const handleProviderChange = useCallback(
    (value: any) => {
      const selectedProvider = providers.find((provider) => provider.value === value.value);
      if (selectedProvider) {
        setValue("hplID", selectedProvider.value, { shouldValidate: true });
        setValue("providerName", selectedProvider.label, { shouldValidate: true });
      }
    },
    [providers, setValue]
  );

  // Handle resource selection
  const handleResourceChange = useCallback(
    (value: any) => {
      const selectedResource = resources.find((resource) => resource.value === value.value);
      if (selectedResource) {
        setValue("rlID", selectedResource.value, { shouldValidate: true });
        setValue("rlName", selectedResource.label, { shouldValidate: true });
      }
    },
    [resources, setValue]
  );

  // Handle reason selection
  const handleReasonChange = useCallback(
    (value: any) => {
      const selectedReason = reasonList.find((reason) => reason.value === value.value);
      if (selectedReason) {
        setValue("arlID", Number(selectedReason.value), { shouldValidate: true });
        setValue("arlName", selectedReason.label, { shouldValidate: true });
      }
    },
    [reasonList, setValue]
  );

  // Handle nationality selection
  const handleNationalityChange = useCallback(
    (value: any) => {
      const selectedNationality = nationality.find((nat) => nat.value === value.value);
      if (selectedNationality) {
        setValue("pNatID", Number(selectedNationality.value), { shouldValidate: true });
        setValue("pNatName", selectedNationality.label, { shouldValidate: true });
      }
    },
    [nationality, setValue]
  );

  // Handle title selection
  const handleTitleChange = useCallback(
    (value: any) => {
      const selectedTitle = title.find((t) => t.value === value.value);
      if (selectedTitle) {
        setValue("abTitle", selectedTitle.label, { shouldValidate: true });
      }
    },
    [title, setValue]
  );

  // Form submission
  const onFormSubmit = async (data: BookingFormData) => {
    try {
      // Update the parent form data
      onFormChange(data as AppointBookingDto);
      onSubmit();
    } catch (error) {
      console.error("Error submitting booking:", error);
      showAlert("Error", "Failed to save appointment booking", "error");
    }
  };

  const handleClear = () => {
    reset();
    setSelectedPatient(null);
  };

  const dialogActions = (
    <Stack direction="row" spacing={1}>
      <CustomButton variant="outlined" text="Clear" icon={ClearIcon} onClick={handleClear} disabled={isSubmitting || !isDirty} color="inherit" size="small" />
      <CustomButton variant="outlined" text="Cancel" onClick={onClose} disabled={isSubmitting} size="small" />
      <SmartButton
        variant="contained"
        text="Book Appointment"
        icon={SaveIcon}
        onAsyncClick={handleSubmit(onFormSubmit)}
        asynchronous
        disabled={!isValid || !isDirty}
        color="primary"
        loadingText="Booking..."
        successText="Booked!"
        size="small"
      />
    </Stack>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title="Book New Appointment"
      maxWidth="md"
      fullWidth
      disableBackdropClick={isSubmitting}
      disableEscapeKeyDown={isSubmitting}
      actions={dialogActions}
    >
      <Box sx={{ p: 1.5 }}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Grid container spacing={1.5}>
            {/* Patient Type Toggle */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 1.5, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
                <FormControlLabel
                  control={<Switch checked={watchedPatRegisterYN === "Y"} onChange={(e) => handlePatientTypeToggle(e.target.checked)} color="primary" />}
                  label={
                    <Typography variant="subtitle1" fontWeight="600">
                      Registered Patient
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  {watchedPatRegisterYN === "Y" ? "Search and select an existing patient" : "Enter walk-in patient details"}
                </Typography>
              </Paper>
            </Grid>

            {/* Patient Details Section */}
            <Grid size={{ xs: 12 }}>
              <Accordion
                expanded={patientDetailsExpanded}
                onChange={() => setPatientDetailsExpanded(!patientDetailsExpanded)}
                sx={{ border: "1px solid", borderColor: "grey.300" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ py: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="subtitle2">Patient Information</Typography>
                    {selectedPatient && <Chip size="small" label={selectedPatient.fullName} color="primary" variant="outlined" sx={{ height: 20, fontSize: "0.6rem" }} />}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1.5 }}>
                  {watchedPatRegisterYN === "Y" ? (
                    <Box>
                      <PatientSearch onPatientSelect={handlePatientSelect} placeholder="Search by name, UHID, or phone number" />
                      {errors.pChartID && (
                        <Typography variant="caption" color="error.main" sx={{ mt: 0.5, display: "block" }}>
                          {errors.pChartID.message}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField name="abTitle" control={control} type="select" label="Title" size="small" options={title} onChange={handleTitleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField name="abFName" control={control} type="text" label="First Name" required size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField name="abMName" control={control} type="text" label="Middle Name" size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <EnhancedFormField name="abLName" control={control} type="text" label="Last Name" size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <EnhancedFormField name="dob" control={control} type="datepicker" label="Date of Birth" size="small" />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <EnhancedFormField
                          name="pNatID"
                          control={control}
                          type="select"
                          label="Nationality"
                          size="small"
                          options={nationality}
                          onChange={handleNationalityChange}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <EnhancedFormField name="city" control={control} type="text" label="City" size="small" />
                      </Grid>
                    </Grid>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Appointment Details Section */}
            <Grid size={{ xs: 12 }}>
              <Accordion
                expanded={appointmentDetailsExpanded}
                onChange={() => setAppointmentDetailsExpanded(!appointmentDetailsExpanded)}
                sx={{ border: "1px solid", borderColor: "grey.300" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ py: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarIcon fontSize="small" />
                    <Typography variant="subtitle2">Appointment Details</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1.5 }}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <EnhancedFormField name="hplID" control={control} type="select" label="Provider" required size="small" options={providers} onChange={handleProviderChange} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <EnhancedFormField name="rlID" control={control} type="select" label="Resource" required size="small" options={resources} onChange={handleResourceChange} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="abDate" control={control} type="datepicker" label="Appointment Date" required size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="abTime" control={control} type="timepicker" label="Start Time" required size="small" format="HH:mm" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <EnhancedFormField name="abDuration" control={control} type="select" label="Duration" required size="small" options={DURATION_OPTIONS} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <EnhancedFormField name="abPType" control={control} type="select" label="Patient Type" required size="small" options={PATIENT_TYPE_OPTIONS} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <EnhancedFormField name="abStatus" control={control} type="select" label="Status" required size="small" options={APPOINTMENT_STATUS_OPTIONS} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField name="arlID" control={control} type="select" label="Reason for Visit" size="small" options={reasonList} onChange={handleReasonChange} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField
                        name="procNotes"
                        control={control}
                        type="textarea"
                        label="Appointment Notes"
                        size="small"
                        rows={3}
                        placeholder="Additional notes or instructions for the appointment..."
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Contact Details Section */}
            <Grid size={{ xs: 12 }}>
              <Accordion
                expanded={contactDetailsExpanded}
                onChange={() => setContactDetailsExpanded(!contactDetailsExpanded)}
                sx={{ border: "1px solid", borderColor: "grey.300" }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ py: 0.5 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ScheduleIcon fontSize="small" />
                    <Typography variant="subtitle2">Contact Information</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 1.5 }}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <EnhancedFormField name="appPhone1" control={control} type="tel" label="Primary Phone" required size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <EnhancedFormField name="appPhone2" control={control} type="tel" label="Secondary Phone" size="small" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <EnhancedFormField name="email" control={control} type="email" label="Email Address" size="small" />
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
