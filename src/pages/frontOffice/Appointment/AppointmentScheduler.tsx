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

/**
 * AppointmentScheduler Component
 *
 * A comprehensive appointment scheduling interface that provides multiple view modes
 * (day, week, month) for managing healthcare appointments. The component integrates
 * with work hours, break management, and provider scheduling systems.
 *
 * Key Features:
 * - Multiple view modes (day, week, month)
 * - Real-time appointment management
 * - Work hours and break period validation
 * - Provider and resource filtering
 * - Appointment conflict detection
 * - Elapsed time slot confirmation
 */
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
    getAvailableTimeRanges,
    isWorkingDay,
    getWorkHoursStats,
    refreshData,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    checkAppointmentConflicts,
    fetchAppointments,
    fetchAppointmentsByProvider,
  } = useSchedulerData();

  const timeSlots = useTimeSlots();

  // Load dropdown values for provider and resource selection
  const { appointmentConsultants = [], roomList = [], isLoading: dropdownLoading } = useDropdownValues(["appointmentConsultants", "roomList"]);

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

  // Real-time clock updates for current time indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute for optimal performance
    return () => clearInterval(timer);
  }, []);

  // Data fetching based on view mode and filter changes
  useEffect(() => {
    const fetchData = async () => {
      if (selectedProvider) {
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

        await fetchAppointmentsByProvider(Number(selectedProvider), startDate, endDate);
      } else {
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);

        if (viewMode === "week") {
          const weekDates = getWeekDates(currentDate);
          startDate.setTime(weekDates[0].getTime());
          endDate.setTime(weekDates[6].getTime());
        } else if (viewMode === "month") {
          startDate.setDate(1);
          endDate.setMonth(endDate.getMonth() + 1, 0);
        }

        await fetchAppointments(startDate, endDate);
      }
    };

    fetchData();
  }, [currentDate, viewMode, selectedProvider, fetchAppointments, fetchAppointmentsByProvider]);

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

      // Apply provider and resource filtering
      const providerMatch = selectedProvider === "" || apt.hplID.toString() === selectedProvider;
      const resourceMatch = selectedResource === "" || apt.rlID.toString() === selectedResource;

      return dateInRange && providerMatch && resourceMatch;
    });
  }, [appointments, currentDate, viewMode, selectedProvider, selectedResource, getWeekDates]);

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
    // Pre-populate booking form with selected time slot information
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hour, minute, 0, 0);

    setBookingForm((prev) => ({
      ...prev,
      abDate: date,
      abTime: selectedDateTime,
      abEndTime: new Date(selectedDateTime.getTime() + 30 * 60000), // Default 30-minute duration
      hplID: selectedProvider ? Number(selectedProvider) : 0,
      rlID: selectedResource ? Number(selectedResource) : 0,
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

  // Alternative booking entry point for filter button usage
  const handleSlotClick = () => {
    setBookingForm(initialBookingForm);
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
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
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
        return <DayView {...commonProps} onSlotDoubleClick={handleSlotDoubleClick} onElapsedSlotConfirmation={handleElapsedSlotConfirmation} />;
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
        return <DayView {...commonProps} onSlotDoubleClick={handleSlotDoubleClick} onElapsedSlotConfirmation={handleElapsedSlotConfirmation} />;
    }
  };

  // Generate work hours statistics for display
  const workHoursStats = getWorkHoursStats();

  // Error handling with retry functionality
  if (error) {
    return (
      <Box sx={{ p: 1 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <button onClick={refreshData} style={{ marginLeft: 8 }}>
              Retry
            </button>
          }
        >
          Failed to load scheduler data: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {/* Comprehensive scheduler header with navigation and filtering */}
      <SchedulerHeader
        currentDate={currentDate}
        viewMode={viewMode}
        bookingMode={bookingMode}
        selectedProvider={selectedProvider}
        selectedResource={selectedResource}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
        onNavigate={handleNavigateDate}
        onBookingModeChange={setBookingMode}
        onProviderChange={setSelectedProvider}
        onResourceChange={setSelectedResource}
        onBookingClick={() => setShowBookingDialog(true)}
        providers={providers}
        resources={resources}
        getWeekDates={getWeekDates}
      />

      {/* Main scheduler view container */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Box sx={{ height: "calc(100vh - 300px)", overflow: "auto" }}>{renderCurrentView()}</Box>
      </Paper>

      {/* Visual legend for time slot indicators */}
      <TimeLegend />

      {/* Scheduler statistics dashboard */}
      <SchedulerStatistics appointments={filteredAppointments} breaks={breaks} />

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
