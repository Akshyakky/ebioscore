// src/frontOffice/AppointmentScheduler.tsx
import { Box, Paper } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

// Component imports
import { AppointmentDetailsDialog } from "./components/AppointmentDetailsDialog";
import { BookingDialog } from "./components/BookingDialog";
import { DayView } from "./components/DayView";
import { MonthView } from "./components/MonthView";
import { SchedulerFilters } from "./components/SchedulerFilters";
import { SchedulerHeader } from "./components/SchedulerHeader";
import { SchedulerStatistics } from "./components/SchedulerStatistics";
import { TimeLegend } from "./components/TimeLegend";
import { WeekView } from "./components/WeekView";

// Hooks and utilities
import { useSchedulerData } from "./hooks/useSchedulerData";
import { useTimeSlots } from "./hooks/useTimeSlots";

// Types
import { AppointmentData, BookingFormData } from "./types";

// Mock data for providers and resources (move to separate constants file)
const mockProviders = [
  { value: 1, label: "Dr. Smith", type: "physician" },
  { value: 2, label: "Dr. Johnson", type: "physician" },
  { value: 3, label: "Dr. Brown", type: "physician" },
];

const mockResources = [
  { value: 1, label: "Room 1", type: "room" },
  { value: 2, label: "Room 2", type: "room" },
  { value: 3, label: "X-Ray", type: "equipment" },
];

const AppointmentScheduler: React.FC = () => {
  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [isRegisteredPatient, setIsRegisteredPatient] = useState(true);
  const [bookingMode, setBookingMode] = useState("physician");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedResource, setSelectedResource] = useState("");

  // Custom hooks
  const { appointments, setAppointments, breaks, workHours } = useSchedulerData();
  const timeSlots = useTimeSlots();

  // Booking form state
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    patientSearch: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    provider: "",
    resource: "",
    appointmentDate: new Date(),
    appointmentTime: "09:00",
    duration: 30,
    notes: "",
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  // Event handlers
  const handleBookingSubmit = () => {
    console.log("Booking data:", bookingForm);
    setShowBookingDialog(false);

    // Reset form
    setBookingForm({
      patientSearch: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      provider: "",
      resource: "",
      appointmentDate: new Date(),
      appointmentTime: "09:00",
      duration: 30,
      notes: "",
    });
  };

  const handleSlotClick = () => {
    setShowBookingDialog(true);
  };

  const handleAppointmentClick = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentEdit = (appointment: AppointmentData) => {
    // Implement edit functionality
    console.log("Edit appointment:", appointment);
    setSelectedAppointment(null);
  };

  const handleAppointmentCancel = (appointment: AppointmentData) => {
    // Implement cancel functionality
    console.log("Cancel appointment:", appointment);
    setSelectedAppointment(null);
  };

  // Render the appropriate view
  const renderCurrentView = () => {
    const commonProps = {
      currentDate,
      timeSlots,
      appointments: filteredAppointments,
      workHours,
      currentTime,
      onSlotClick: handleSlotClick,
      onAppointmentClick: handleAppointmentClick,
    };

    switch (viewMode) {
      case "day":
        return <DayView {...commonProps} />;
      case "week":
        return <WeekView {...commonProps} getWeekDates={getWeekDates} />;
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
        return <DayView {...commonProps} />;
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <SchedulerHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
        onNavigate={handleNavigateDate}
        getWeekDates={getWeekDates}
      />

      {/* Filters */}
      <SchedulerFilters
        bookingMode={bookingMode}
        selectedProvider={selectedProvider}
        selectedResource={selectedResource}
        onBookingModeChange={setBookingMode}
        onProviderChange={setSelectedProvider}
        onResourceChange={setSelectedResource}
        onBookingClick={() => setShowBookingDialog(true)}
        providers={mockProviders}
        resources={mockResources}
      />

      {/* Time Legend */}
      <TimeLegend />

      {/* Main Scheduler View */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Box sx={{ height: "calc(100vh - 400px)", overflow: "auto" }}>{renderCurrentView()}</Box>
      </Paper>

      {/* Statistics */}
      <SchedulerStatistics appointments={filteredAppointments} breaks={breaks} />

      {/* Dialogs */}
      <BookingDialog
        open={showBookingDialog}
        bookingForm={bookingForm}
        isRegisteredPatient={isRegisteredPatient}
        providers={mockProviders}
        resources={mockResources}
        onClose={() => setShowBookingDialog(false)}
        onSubmit={handleBookingSubmit}
        onFormChange={setBookingForm}
        onRegisteredPatientChange={setIsRegisteredPatient}
      />

      <AppointmentDetailsDialog appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} onEdit={handleAppointmentEdit} onCancel={handleAppointmentCancel} />
    </Box>
  );
};

export default AppointmentScheduler;
