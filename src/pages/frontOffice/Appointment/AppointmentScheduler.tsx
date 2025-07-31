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

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointBookingDto | null>(null);
  const [bookingMode, setBookingMode] = useState("physician");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedResource, setSelectedResource] = useState("");

  // New state for elapsed slot confirmation
  const [showElapsedConfirmation, setShowElapsedConfirmation] = useState(false);
  const [pendingElapsedSlot, setPendingElapsedSlot] = useState<{
    date: Date;
    hour: number;
    minute: number;
  } | null>(null);

  // Custom hooks with API integration
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

  // Load dropdown values for providers and resources
  const { appointmentConsultants = [], roomList = [], isLoading: dropdownLoading } = useDropdownValues(["appointmentConsultants", "roomList"]);

  // Transform dropdown data to match expected format
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

  // Booking form state
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

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch appointments when date range or provider changes
  useEffect(() => {
    const fetchData = async () => {
      if (selectedProvider) {
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

  // Date navigation utilities
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

  // Filter appointments based on current view and filters
  const filteredAppointments = React.useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.abDate);

      // Filter by date range based on view mode
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

      // Filter by provider and resource
      const providerMatch = selectedProvider === "" || apt.hplID.toString() === selectedProvider;
      const resourceMatch = selectedResource === "" || apt.rlID.toString() === selectedResource;

      return dateInRange && providerMatch && resourceMatch;
    });
  }, [appointments, currentDate, viewMode, selectedProvider, selectedResource, getWeekDates]);

  // Navigation handlers
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

  // Enhanced event handlers with API integration
  const handleSlotDoubleClick = async (date: Date, hour: number, minute: number) => {
    // Check if the time slot is within working hours
    if (!isTimeWithinWorkingHours(date, hour, minute)) {
      showAlert("Warning", "This time slot is outside of working hours", "warning");
      return;
    }

    // Check for conflicts if provider is selected
    if (selectedProvider) {
      const selectedDateTime = new Date(date);
      selectedDateTime.setHours(hour, minute, 0, 0);
      const endDateTime = new Date(selectedDateTime.getTime() + 30 * 60000); // 30 minutes default

      const conflictResult = await checkAppointmentConflicts(Number(selectedProvider), date, selectedDateTime, endDateTime);

      if (conflictResult.success && conflictResult.data) {
        showAlert("Conflict", "There is already an appointment scheduled at this time for the selected provider", "warning");
        return;
      }
    }

    // Pre-populate the booking form with the selected date and time
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hour, minute, 0, 0);

    setBookingForm((prev) => ({
      ...prev,
      abDate: date,
      abTime: selectedDateTime,
      abEndTime: new Date(selectedDateTime.getTime() + 30 * 60000), // Default 30 minutes
      hplID: selectedProvider ? Number(selectedProvider) : 0,
      rlID: selectedResource ? Number(selectedResource) : 0,
    }));

    setShowBookingDialog(true);
  };

  const handleElapsedSlotConfirmation = (date: Date, hour: number, minute: number) => {
    // Only allow confirmation for elapsed slots within working hours
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

  const handleBookingSubmit = async (bookingData: AppointBookingDto) => {
    try {
      let result;

      if (bookingData.abID && bookingData.abID > 0) {
        // Update existing appointment
        result = await updateAppointment(bookingData);
      } else {
        // Create new appointment
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

  const handleSlotClick = () => {
    // This is now only used for the Book button in filters
    setBookingForm(initialBookingForm);
    setShowBookingDialog(true);
  };

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
      const cancelReason = "Cancelled by user"; // You might want to show a dialog to get the reason
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

  // Enhanced view rendering with work hours integration
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

    const commonProps = {
      currentDate,
      timeSlots,
      appointments: filteredAppointments,
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

  // Work hours statistics for display
  const workHoursStats = getWorkHoursStats();

  // Show error if there's an error
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

      {/* Work Hours Status */}
      {workHours.length > 0 && (
        <Paper sx={{ p: 1, mb: 1 }}>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Work Hours Status:
            </Typography>
            <Typography variant="caption">{workHoursStats.activeDays} working days configured</Typography>
            <Typography variant="caption">{workHoursStats.languages} languages supported</Typography>
            {!isWorkingDay(currentDate) && (
              <Alert severity="warning" sx={{ p: 0.5, fontSize: "0.75rem" }}>
                No working hours configured for {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </Alert>
            )}
          </Box>
        </Paper>
      )}

      {/* Main Scheduler View */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Box sx={{ height: "calc(100vh - 300px)", overflow: "auto" }}>{renderCurrentView()}</Box>
      </Paper>

      {/* Time Legend */}
      <TimeLegend />

      {/* Statistics */}
      <SchedulerStatistics appointments={filteredAppointments} breaks={breaks} />

      {/* Dialogs */}
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

      <AppointmentDetailsDialog appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onEdit={handleAppointmentEdit} onCancel={handleAppointmentCancel} />

      {/* Elapsed Slot Confirmation Dialog */}
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
