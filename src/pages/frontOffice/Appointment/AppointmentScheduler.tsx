// src/pages/frontOffice/Appointment/AppointmentScheduler.tsx
import { Alert, Box, CircularProgress, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";

// Component imports
import ConfirmationDialog from "../../../components/Dialog/ConfirmationDialog";
import { AppointmentDetailsDialog } from "./components/AppointmentDetailsDialog";
import { DayView } from "./components/DayView";
import { MonthView } from "./components/MonthView";
import { SchedulerStatistics } from "./components/SchedulerStatistics";
import { TimeLegend } from "./components/TimeLegend";
import { WeekView } from "./components/WeekView";

// Hooks and utilities
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useAlert } from "@/providers/AlertProvider";
import { useSchedulerData } from "./hooks/useSchedulerData";
import { useTimeSlots } from "./hooks/useTimeSlots";

// Types
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import BookingDialog from "./components/BookingDialog";
import { SchedulerHeader } from "./components/SchedulerHeader";

const AppointmentScheduler: React.FC = () => {
  const { showAlert } = useAlert();

  // Core state management for scheduler functionality
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointBookingDto | null>(null);
  const [bookingMode, setBookingMode] = useState("physician");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedResource, setSelectedResource] = useState("");

  // Enhanced state for elapsed slot confirmation workflow
  const [showElapsedConfirmation, setShowElapsedConfirmation] = useState(false);
  const [pendingElapsedSlot, setPendingElapsedSlot] = useState<{
    date: Date;
    hour: number;
    minute: number;
  } | null>(null);

  // Custom hooks for comprehensive data management and API integration
  const {
    appointments,
    breaks,
    workHours,
    isLoading,
    error,
    isTimeWithinWorkingHours,
    refreshData,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    fetchAppointments,
    fetchAppointmentsByProvider,
    fetchAppointmentsByResource,
  } = useSchedulerData();

  const timeSlots = useTimeSlots();

  // Load dropdown values for provider and resource selection
  const { appointmentConsultants = [], roomList = [] } = useDropdownValues(["appointmentConsultants", "roomList"]);

  // Transform dropdown data to standardized format for component consumption
  const providers = useMemo(() => {
    return appointmentConsultants.map((consultant) => ({
      value: Number(consultant.value),
      label: consultant.label,
      type: "physician",
    }));
  }, [appointmentConsultants]);

  const resources = useMemo(() => {
    return roomList.map((room) => ({
      value: Number(room.value),
      label: room.label,
      type: "room",
    }));
  }, [roomList]);

  // Initialize booking form with default values
  const initialBookingForm: AppointBookingDto = {
    abID: 0,
    abFName: "",
    hplID: 0,
    providerName: "",
    rlID: 0,
    rlName: "",
    abDuration: 30,
    abDurDesc: "30 minutes",
    abDate: new Date(),
    abTime: new Date(),
    abPType: "OP",
    abStatus: "Scheduled",
    patRegisterYN: "Y",
    otBookNo: 0,
    patOPIP: "O",
    abEndTime: new Date(),
  };

  const [bookingForm, setBookingForm] = useState<AppointBookingDto>(initialBookingForm);

  // Validation function to check if required selections are made
  const validateBookingRequirements = useCallback((): { isValid: boolean; message: string } => {
    if (bookingMode === "physician" && !selectedProvider) {
      return {
        isValid: false,
        message: "Please select a provider before booking an appointment in Physician mode. Use the Provider dropdown in the header to make your selection.",
      };
    }

    if (bookingMode === "resource" && !selectedResource) {
      return {
        isValid: false,
        message: "Please select a resource before booking an appointment in Resource mode. Use the Resource dropdown in the header to make your selection.",
      };
    }

    return { isValid: true, message: "" };
  }, [bookingMode, selectedProvider, selectedResource]);

  // Check if booking is allowed based on current selections
  const isBookingAllowed = useMemo(() => {
    return validateBookingRequirements().isValid;
  }, [validateBookingRequirements]);

  // Real-time clock updates for current time indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute for optimal performance
    return () => clearInterval(timer);
  }, []);

  // Enhanced booking mode change handler to clear inactive selections
  const handleBookingModeChange = useCallback((mode: string) => {
    setBookingMode(mode);

    // Clear the non-active selection when switching modes
    if (mode === "physician") {
      setSelectedResource("");
    } else if (mode === "resource") {
      setSelectedProvider("");
    }
  }, []);

  // Enhanced provider change handler
  const handleProviderChange = useCallback(
    (provider: string) => {
      setSelectedProvider(provider);
      // Ensure resource is cleared when provider is selected
      if (provider && selectedResource) {
        setSelectedResource("");
      }
    },
    [selectedResource]
  );

  // Enhanced resource change handler
  const handleResourceChange = useCallback(
    (resource: string) => {
      setSelectedResource(resource);
      // Ensure provider is cleared when resource is selected
      if (resource && selectedProvider) {
        setSelectedProvider("");
      }
    },
    [selectedProvider]
  );

  // Date navigation utility functions
  const getWeekDates = useCallback((date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + i);
      week.push(weekDate);
    }
    return week;
  }, []);

  // Enhanced data fetching based on view mode and filter changes with complete resource support
  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);

      // Adjust date range based on current view mode
      if (viewMode === "week") {
        const weekDates = getWeekDates(currentDate);
        startDate.setTime(weekDates[0].getTime());
        endDate.setTime(weekDates[6].getTime());
      } else if (viewMode === "month") {
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1, 0);
      }

      // Fetch data based on booking mode and selected filter with comprehensive resource support
      if (bookingMode === "physician" && selectedProvider) {
        await fetchAppointmentsByProvider(Number(selectedProvider), startDate, endDate);
      } else if (bookingMode === "resource" && selectedResource) {
        await fetchAppointmentsByResource(Number(selectedResource), startDate, endDate);
      } else {
        await fetchAppointments(startDate, endDate);
      }
    };

    fetchData();
  }, [currentDate, viewMode, bookingMode, selectedProvider, selectedResource, fetchAppointments, fetchAppointmentsByProvider, fetchAppointmentsByResource, getWeekDates]);

  const getMonthDates = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    const dayOfWeek = firstDay.getDay();
    const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysBack);

    const endDayOfWeek = lastDay.getDay();
    const daysForward = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    endDate.setDate(lastDay.getDate() + daysForward);

    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

  // Filter appointments based on current view parameters and selected filters
  const filteredAppointments = React.useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.abDate);

      // Apply date range filtering based on current view mode
      let dateInRange = false;
      if (viewMode === "day") {
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
        dateInRange = aptDateOnly.getTime() === currentDateOnly.getTime();
      } else if (viewMode === "week") {
        const weekDates = getWeekDates(currentDate);
        dateInRange = weekDates.some((date) => {
          const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
          return dateOnly.getTime() === aptDateOnly.getTime();
        });
      } else if (viewMode === "month") {
        dateInRange = aptDate.getMonth() === currentDate.getMonth() && aptDate.getFullYear() === currentDate.getFullYear();
      }

      // Apply unified provider/resource filtering based on booking mode
      let filterMatch = true;
      if (bookingMode === "physician" && selectedProvider !== "") {
        filterMatch = apt.hplID.toString() === selectedProvider;
      } else if (bookingMode === "resource" && selectedResource !== "") {
        filterMatch = apt.rlID.toString() === selectedResource;
      }

      return dateInRange && filterMatch;
    });
  }, [appointments, currentDate, viewMode, bookingMode, selectedProvider, selectedResource, getWeekDates]);

  // Navigation handlers for date movement and view changes
  const handleNavigateDate = (direction: "prev" | "next" | "today") => {
    const newDate = new Date(currentDate);

    switch (direction) {
      case "prev":
        if (viewMode === "day") {
          newDate.setDate(newDate.getDate() - 1);
        } else if (viewMode === "week") {
          newDate.setDate(newDate.getDate() - 7);
        } else {
          newDate.setMonth(newDate.getMonth() - 1);
        }
        break;
      case "next":
        if (viewMode === "day") {
          newDate.setDate(newDate.getDate() + 1);
        } else if (viewMode === "week") {
          newDate.setDate(newDate.getDate() + 7);
        } else {
          newDate.setMonth(newDate.getMonth() + 1);
        }
        break;
      case "today":
        return setCurrentDate(new Date());
    }

    setCurrentDate(newDate);
  };

  // Enhanced appointment booking workflow with comprehensive validation
  const handleSlotDoubleClick = async (date: Date, hour: number, minute: number) => {
    // Validate booking requirements first
    const validation = validateBookingRequirements();
    if (!validation.isValid) {
      showAlert("Selection Required", validation.message, "warning");
      return;
    }

    // Pre-populate booking form with selected time slot information
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hour, minute, 0, 0);

    const endDateTime = new Date(selectedDateTime.getTime() + 30 * 60000); // Default 30-minute duration

    setBookingForm((prev) => ({
      ...prev,
      abDate: date,
      abTime: selectedDateTime,
      abEndTime: endDateTime,
      hplID: bookingMode === "physician" && selectedProvider ? Number(selectedProvider) : 0,
      rlID: bookingMode === "resource" && selectedResource ? Number(selectedResource) : 0,
    }));

    setShowBookingDialog(true);
  };

  // Handle elapsed time slot confirmation workflow
  const handleElapsedSlotConfirmation = (date: Date, hour: number, minute: number) => {
    // Validate elapsed slot is within working hours before allowing confirmation
    if (!isTimeWithinWorkingHours(date, hour, minute)) {
      return;
    }

    setPendingElapsedSlot({ date, hour, minute });
    setShowElapsedConfirmation(true);
  };

  const handleElapsedSlotConfirmed = () => {
    if (pendingElapsedSlot) {
      // Validate booking requirements first
      const validation = validateBookingRequirements();
      if (!validation.isValid) {
        showAlert("Selection Required", validation.message, "warning");
        setPendingElapsedSlot(null);
        setShowElapsedConfirmation(false);
        return;
      }

      handleSlotDoubleClick(pendingElapsedSlot.date, pendingElapsedSlot.hour, pendingElapsedSlot.minute);
    }
    setPendingElapsedSlot(null);
    setShowElapsedConfirmation(false);
  };

  const handleElapsedSlotCancelled = () => {
    setPendingElapsedSlot(null);
    setShowElapsedConfirmation(false);
  };

  // Comprehensive appointment management with proper error handling
  const handleBookingSubmit = async (bookingData: AppointBookingDto) => {
    try {
      let result;

      if (bookingData.abID && bookingData.abID > 0) {
        // Update existing appointment workflow
        result = await updateAppointment(bookingData);
      } else {
        // Create new appointment workflow
        result = await createAppointment(bookingData);
      }

      if (result.success) {
        const actionText = bookingData.abID ? "updated" : "created";
        showAlert("Success", `Appointment ${actionText} successfully`, "success");
        setShowBookingDialog(false);
        setBookingForm(initialBookingForm);
      } else {
        showAlert("Error", result.errorMessage || "Failed to save appointment", "error");
      }
    } catch (error) {
      console.error("Error submitting appointment:", error);
      showAlert("Error", "An unexpected error occurred while saving the appointment", "error");
    }
  };

  // Enhanced appointment update handler for drag and drop
  const handleAppointmentUpdate = useCallback(
    async (appointmentData: AppointBookingDto) => {
      try {
        const result = await updateAppointment(appointmentData);
        return {
          success: result.success,
          errorMessage: result.errorMessage,
        };
      } catch (error) {
        console.error("Error updating appointment:", error);
        return {
          success: false,
          errorMessage: error instanceof Error ? error.message : "Failed to update appointment",
        };
      }
    },
    [updateAppointment]
  );

  // Alternative booking entry point for filter button usage with validation
  const handleSlotClick = () => {
    // Validate booking requirements first
    const validation = validateBookingRequirements();
    if (!validation.isValid) {
      showAlert("Selection Required", validation.message, "warning");
      return;
    }

    setBookingForm({
      ...initialBookingForm,
      hplID: bookingMode === "physician" && selectedProvider ? Number(selectedProvider) : 0,
      rlID: bookingMode === "resource" && selectedResource ? Number(selectedResource) : 0,
    });
    setShowBookingDialog(true);
  };

  // Appointment interaction handlers
  const handleAppointmentClick = (appointment: AppointBookingDto) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentEdit = (appointment: AppointBookingDto) => {
    setBookingForm(appointment);
    setSelectedAppointment(null);
    setShowBookingDialog(true);
  };

  const handleAppointmentCancel = async (appointment: AppointBookingDto) => {
    try {
      const cancelReason = "Cancelled by user"; // Could be enhanced with user input dialog
      const result = await cancelAppointment(appointment.abID, cancelReason);

      if (result.success) {
        showAlert("Success", "Appointment cancelled successfully", "success");
        setSelectedAppointment(null);
      } else {
        showAlert("Error", result.errorMessage || "Failed to cancel appointment", "error");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      showAlert("Error", "An unexpected error occurred while cancelling the appointment", "error");
    }
  };

  // Enhanced view rendering with comprehensive data integration
  const renderCurrentView = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
          <Typography variant="body2" component="span" marginLeft={2}>
            Loading scheduler data...
          </Typography>
        </Box>
      );
    }

    // Common properties shared across all view modes
    const commonProps = {
      currentDate,
      timeSlots,
      appointments: filteredAppointments,
      breaks,
      workHours,
      currentTime,
      onAppointmentClick: handleAppointmentClick,
    };

    switch (viewMode) {
      case "day":
        return (
          <DayView
            {...commonProps}
            onSlotDoubleClick={handleSlotDoubleClick}
            onElapsedSlotConfirmation={handleElapsedSlotConfirmation}
            onAppointmentUpdate={handleAppointmentUpdate}
            selectedProvider={bookingMode === "physician" ? selectedProvider : undefined}
          />
        );
      case "week":
        return <WeekView {...commonProps} getWeekDates={getWeekDates} onSlotDoubleClick={handleSlotDoubleClick} onElapsedSlotConfirmation={handleElapsedSlotConfirmation} />;
      case "month":
        return (
          <MonthView
            currentDate={currentDate}
            appointments={filteredAppointments}
            getMonthDates={getMonthDates}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        );
      default:
        return (
          <DayView
            {...commonProps}
            onSlotDoubleClick={handleSlotDoubleClick}
            onElapsedSlotConfirmation={handleElapsedSlotConfirmation}
            onAppointmentUpdate={handleAppointmentUpdate}
            selectedProvider={bookingMode === "physician" ? selectedProvider : undefined}
          />
        );
    }
  };

  // Error handling with retry functionality
  if (error) {
    return (
      <Box padding={1}>
        <Alert severity="error" action={<button onClick={refreshData}>Retry</button>}>
          Failed to load scheduler data: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "112vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: 1,
      }}
    >
      {/* Comprehensive scheduler header with unified navigation and filtering */}
      <Box sx={{ flexShrink: 0, marginBottom: 1 }}>
        <SchedulerHeader
          currentDate={currentDate}
          viewMode={viewMode}
          bookingMode={bookingMode}
          selectedProvider={selectedProvider}
          selectedResource={selectedResource}
          onDateChange={setCurrentDate}
          onViewModeChange={setViewMode}
          onNavigate={handleNavigateDate}
          onBookingModeChange={handleBookingModeChange}
          onProviderChange={handleProviderChange}
          onResourceChange={handleResourceChange}
          onBookingClick={handleSlotClick}
          providers={providers}
          resources={resources}
          getWeekDates={getWeekDates}
          isBookingAllowed={isBookingAllowed}
        />
      </Box>

      {/* Main scheduler view container with proper scrolling */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              padding: 1,
              "&::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#c4c4c4",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "#a8a8a8",
                },
              },
              "&::-webkit-scrollbar-corner": {
                backgroundColor: "#f1f1f1",
              },
            }}
          >
            {renderCurrentView()}
          </Box>
        </Paper>
      </Box>

      {/* Footer components with fixed positioning */}
      <Box sx={{ flexShrink: 0, marginTop: 1 }}>
        {/* Visual legend for time slot indicators */}
        <TimeLegend />

        {/* Scheduler statistics dashboard */}
        <SchedulerStatistics appointments={filteredAppointments} breaks={breaks} />
      </Box>

      {/* Appointment booking dialog */}
      <BookingDialog
        open={showBookingDialog}
        bookingForm={bookingForm}
        providers={providers}
        resources={resources}
        onClose={() => {
          setShowBookingDialog(false);
          setBookingForm(initialBookingForm);
        }}
        onSubmit={handleBookingSubmit}
        onFormChange={setBookingForm}
      />

      {/* Appointment details view dialog */}
      <AppointmentDetailsDialog appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onEdit={handleAppointmentEdit} onCancel={handleAppointmentCancel} />

      {/* Elapsed time slot confirmation dialog */}
      <ConfirmationDialog
        open={showElapsedConfirmation}
        onClose={handleElapsedSlotCancelled}
        onConfirm={handleElapsedSlotConfirmed}
        title="Book Past Time Slot"
        message="You are attempting to book an appointment for a time that has already passed. This may require special approval or documentation. Do you want to proceed with this booking?"
        confirmText="Yes, Book Anyway"
        cancelText="Cancel"
        type="warning"
        maxWidth="sm"
        disableBackdropClick={true}
      />
    </Box>
  );
};

export default AppointmentScheduler;
