import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import {
  Add as AddIcon,
  Block,
  Cancel as CancelIcon,
  CheckCircle,
  Edit as EditIcon,
  Event as EventIcon,
  NavigateBefore,
  NavigateNext,
  AccessTime as TimeIcon,
  Today,
  ViewDay,
  ViewModule,
  ViewWeek,
  Warning,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

// Mock data and interfaces
interface AppointmentData {
  abID: number;
  abFName: string;
  abLName?: string;
  abMName?: string;
  hplID: number;
  providerName: string;
  rlID: number;
  rlName: string;
  arlID?: number;
  arlName?: string;
  abDuration: number;
  abDurDesc: string;
  abDate: Date;
  abTime: Date;
  abEndTime: Date;
  pChartID?: number;
  pChartCode?: string;
  abPType: string;
  abStatus: string;
  appPhone1?: string;
  appPhone2?: string;
  patRegisterYN: string;
  cancelReason?: string;
  procNotes?: string;
}

interface BreakData {
  bLID: number;
  bLName: string;
  bLStartTime: Date;
  bLEndTime: Date;
  bLStartDate: Date;
  bLEndDate: Date;
  hPLID: number;
  assignedName: string;
  isPhyResYN: string;
  rActiveYN: string;
}

interface WorkHoursData {
  hwrkID: number;
  langType: string;
  daysDesc: string;
  startTime: Date | null;
  endTime: Date | null;
  wkHoliday: string;
  rActiveYN: string;
}

// Form interfaces
interface DateSelectionForm {
  selectedDate: Date;
}

interface BookingForm {
  patientSearch: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  provider: number | string;
  resource: number | string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number;
  notes: string;
}

interface FilterForm {
  bookingMode: "physician" | "resource";
  selectedProvider: number | string;
  selectedResource: number | string;
}

// Mock data with more appointments for different dates
const mockAppointments: AppointmentData[] = [
  {
    abID: 1,
    abFName: "John",
    abLName: "Doe",
    hplID: 1,
    providerName: "Dr. Smith",
    rlID: 1,
    rlName: "Room 1",
    abDuration: 30,
    abDurDesc: "30m",
    abDate: new Date(2025, 6, 22),
    abTime: new Date(2025, 6, 22, 9, 0),
    abEndTime: new Date(2025, 6, 22, 9, 30),
    pChartID: 123,
    pChartCode: "P001",
    abPType: "OP",
    abStatus: "Scheduled",
    patRegisterYN: "Y",
    procNotes: "Regular checkup",
  },
  {
    abID: 2,
    abFName: "Jane",
    abLName: "Smith",
    hplID: 1,
    providerName: "Dr. Smith",
    rlID: 2,
    rlName: "Room 2",
    abDuration: 45,
    abDurDesc: "45m",
    abDate: new Date(2025, 6, 22),
    abTime: new Date(2025, 6, 22, 10, 0),
    abEndTime: new Date(2025, 6, 22, 10, 45),
    pChartID: 124,
    pChartCode: "P002",
    abPType: "OP",
    abStatus: "Confirmed",
    patRegisterYN: "Y",
    procNotes: "Follow-up",
  },
  {
    abID: 3,
    abFName: "Bob",
    abLName: "Wilson",
    hplID: 2,
    providerName: "Dr. Johnson",
    rlID: 1,
    rlName: "Room 1",
    abDuration: 15,
    abDurDesc: "15m",
    abDate: new Date(2025, 6, 23),
    abTime: new Date(2025, 6, 23, 14, 15),
    abEndTime: new Date(2025, 6, 23, 14, 30),
    pChartID: 125,
    pChartCode: "P003",
    abPType: "OP",
    abStatus: "Confirmed",
    patRegisterYN: "Y",
    procNotes: "Quick consultation",
  },
  {
    abID: 4,
    abFName: "Alice",
    abLName: "Brown",
    hplID: 1,
    providerName: "Dr. Smith",
    rlID: 1,
    rlName: "Room 1",
    abDuration: 60,
    abDurDesc: "1h",
    abDate: new Date(2025, 6, 24),
    abTime: new Date(2025, 6, 24, 11, 0),
    abEndTime: new Date(2025, 6, 24, 12, 0),
    pChartID: 126,
    pChartCode: "P004",
    abPType: "OP",
    abStatus: "Scheduled",
    patRegisterYN: "Y",
    procNotes: "Comprehensive exam",
  },
];

const mockBreaks: BreakData[] = [
  {
    bLID: 1,
    bLName: "Lunch",
    bLStartTime: new Date(2025, 6, 22, 12, 0),
    bLEndTime: new Date(2025, 6, 22, 13, 0),
    bLStartDate: new Date(2025, 6, 22),
    bLEndDate: new Date(2025, 6, 22),
    hPLID: 1,
    assignedName: "Dr. Smith",
    isPhyResYN: "Y",
    rActiveYN: "Y",
  },
];

const mockWorkHours: WorkHoursData[] = [
  {
    hwrkID: 1,
    langType: "EN",
    daysDesc: "MONDAY",
    startTime: new Date(2025, 6, 22, 8, 0),
    endTime: new Date(2025, 6, 22, 17, 0),
    wkHoliday: "N",
    rActiveYN: "Y",
  },
  {
    hwrkID: 2,
    langType: "EN",
    daysDesc: "TUESDAY",
    startTime: new Date(2025, 6, 22, 8, 0),
    endTime: new Date(2025, 6, 22, 17, 0),
    wkHoliday: "N",
    rActiveYN: "Y",
  },
  {
    hwrkID: 3,
    langType: "EN",
    daysDesc: "WEDNESDAY",
    startTime: new Date(2025, 6, 22, 8, 0),
    endTime: new Date(2025, 6, 22, 17, 0),
    wkHoliday: "N",
    rActiveYN: "Y",
  },
  {
    hwrkID: 4,
    langType: "EN",
    daysDesc: "THURSDAY",
    startTime: new Date(2025, 6, 22, 8, 0),
    endTime: new Date(2025, 6, 22, 17, 0),
    wkHoliday: "N",
    rActiveYN: "Y",
  },
  {
    hwrkID: 5,
    langType: "EN",
    daysDesc: "FRIDAY",
    startTime: new Date(2025, 6, 22, 8, 0),
    endTime: new Date(2025, 6, 22, 17, 0),
    wkHoliday: "N",
    rActiveYN: "Y",
  },
];

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

const durationOptions = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

const bookingModeOptions = [
  { value: "physician", label: "Physician" },
  { value: "resource", label: "Resource" },
];

// Simple FormField component since we don't have the actual import
const SimpleFormField = ({ name, control, type, label, options, required, ...props }) => {
  return <FormField name={name} control={control} type={type} label={label} options={options} required={required} {...props} />;
};

const AppointmentScheduler = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>(mockAppointments);
  const [breaks, setBreaks] = useState<BreakData[]>(mockBreaks);
  const [workHours, setWorkHours] = useState<WorkHoursData[]>(mockWorkHours);
  const [isRegisteredPatient, setIsRegisteredPatient] = useState(true);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Form controls using useForm
  const dateControl = useForm<DateSelectionForm>({
    defaultValues: {
      selectedDate: currentDate,
    },
  });

  const filterControl = useForm<FilterForm>({
    defaultValues: {
      bookingMode: "physician",
      selectedProvider: "",
      selectedResource: "",
    },
  });

  const bookingControl = useForm<BookingForm>({
    defaultValues: {
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
    },
  });

  const filterValues = filterControl.watch();

  // Generate 15-minute time slots for a full 24-hour day
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
          hour,
          minute,
        });
      }
    }
    return slots;
  }, []);

  // Get week dates
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

  // Get month dates
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

  // Filter appointments for current view
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.abDate);

      if (viewMode === "day") {
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
        return aptDateOnly.getTime() === currentDateOnly.getTime();
      } else if (viewMode === "week") {
        const weekDates = getWeekDates(currentDate);
        return weekDates.some((date) => {
          const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
          return dateOnly.getTime() === aptDateOnly.getTime();
        });
      } else if (viewMode === "month") {
        return aptDate.getMonth() === currentDate.getMonth() && aptDate.getFullYear() === currentDate.getFullYear();
      }

      return (
        (filterValues.selectedProvider === "" || apt.hplID === filterValues.selectedProvider) &&
        (filterValues.selectedResource === "" || apt.rlID === filterValues.selectedResource)
      );
    });
  }, [appointments, currentDate, viewMode, filterValues.selectedProvider, filterValues.selectedResource, getWeekDates]);

  // Get appointments for specific date and time slot
  const getAppointmentsForSlot = useCallback(
    (date: Date, hour: number, minute: number) => {
      return filteredAppointments.filter((apt) => {
        const aptDate = new Date(apt.abDate);
        const aptTime = new Date(apt.abTime);
        const aptEndTime = new Date(apt.abEndTime);

        const dateMatches = aptDate.getDate() === date.getDate() && aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();

        if (!dateMatches) return false;

        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        return slotTime >= aptTime && slotTime < aptEndTime;
      });
    },
    [filteredAppointments]
  );

  // Get appointments for a specific date (month view)
  const getAppointmentsForDate = useCallback(
    (date: Date) => {
      return filteredAppointments.filter((apt) => {
        const aptDate = new Date(apt.abDate);
        return aptDate.getDate() === date.getDate() && aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();
      });
    },
    [filteredAppointments]
  );

  // Check if time slot is within working hours
  const isWithinWorkingHours = useCallback(
    (date: Date, hour: number, minute: number) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      const workHour = workHours.find((wh) => wh.daysDesc === dayName && wh.rActiveYN === "Y");

      if (!workHour || !workHour.startTime || !workHour.endTime) return false;

      const startHour = new Date(workHour.startTime).getHours();
      const startMinute = new Date(workHour.startTime).getMinutes();
      const endHour = new Date(workHour.endTime).getHours();
      const endMinute = new Date(workHour.endTime).getMinutes();

      const slotMinutes = hour * 60 + minute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    },
    [workHours]
  );

  // Navigation functions
  const navigateDate = (direction: "prev" | "next" | "today") => {
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
    dateControl.setValue("selectedDate", newDate);
  };

  // Handle date selection from date picker
  const handleDateSelection = (selectedDate: Date | null) => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  };

  // Handle booking form submission
  const handleBookingSubmit = (data: BookingForm) => {
    console.log("Booking data:", data);
    setShowBookingDialog(false);
    bookingControl.reset();
  };

  // Appointment status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "info";
      case "Confirmed":
        return "success";
      case "InProgress":
        return "warning";
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      case "NoShow":
        return "error";
      default:
        return "default";
    }
  };

  // Compact appointment card
  const renderCompactAppointmentCard = (appointment: AppointmentData, showDetails = true) => {
    const now = currentTime.getTime();
    const start = new Date(appointment.abTime).getTime();
    const end = new Date(appointment.abEndTime).getTime();
    const isElapsed = now > start && now < end;
    const elapsedTimePercentage = isElapsed ? ((now - start) / (end - start)) * 100 : 0;

    return (
      <Box
        key={appointment.abID}
        sx={{
          mb: 0.25,
          p: 0.5,
          borderRadius: 1,
          cursor: "pointer",
          fontSize: "0.75rem",
          backgroundColor:
            getStatusColor(appointment.abStatus) === "success"
              ? "#e8f5e8"
              : getStatusColor(appointment.abStatus) === "warning"
              ? "#fff3e0"
              : getStatusColor(appointment.abStatus) === "error"
              ? "#ffebee"
              : "#e3f2fd",
          borderLeft: `3px solid ${
            getStatusColor(appointment.abStatus) === "success"
              ? "#4caf50"
              : getStatusColor(appointment.abStatus) === "warning"
              ? "#ff9800"
              : getStatusColor(appointment.abStatus) === "error"
              ? "#f44336"
              : "#2196f3"
          }`,
          "&:hover": { backgroundColor: "action.hover" },
          position: "relative",
        }}
        onClick={() => setSelectedAppointment(appointment)}
      >
        {isElapsed && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${elapsedTimePercentage}%`,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              borderRadius: "4px 0 0 4px",
            }}
          />
        )}
        <Typography variant="caption" fontWeight="bold" display="block">
          {appointment.abFName} {appointment.abLName}
        </Typography>
        {showDetails && (
          <>
            <Typography variant="caption" color="text.secondary" display="block">
              {appointment.providerName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {appointment.abDurDesc}
            </Typography>
          </>
        )}
      </Box>
    );
  };

  // Current time indicator line
  const CurrentTimeIndicator = ({ date, height, ...props }) => {
    const isToday = date.toDateString() === new Date().toDateString();
    if (!isToday) return null;

    const topPosition = ((currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60)) * (timeSlots.length * height);

    return (
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "2px",
          backgroundColor: "red",
          top: `${topPosition}px`,
          zIndex: 2,
          ...props.sx,
        }}
      >
        <Box sx={{ position: "absolute", left: -6, top: -3, width: 8, height: 8, borderRadius: "50%", backgroundColor: "red" }} />
      </Box>
    );
  };

  // Render Day View
  const renderDayView = () => (
    <Grid container spacing={1}>
      <Grid size={{ xs: 2 }}>
        <Box sx={{ position: "sticky", top: 0, background: "white", zIndex: 1, py: 0.5 }}>
          <Typography variant="subtitle2" align="center" sx={{ fontSize: "0.8rem" }}>
            Time
          </Typography>
        </Box>
        {timeSlots.map((slot) => (
          <Box key={slot.time} sx={{ height: 40, display: "flex", alignItems: "center", borderBottom: 1, borderColor: "divider", px: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              {slot.time}
            </Typography>
          </Box>
        ))}
      </Grid>

      <Grid size={{ xs: 10 }} sx={{ position: "relative" }}>
        <CurrentTimeIndicator date={currentDate} height={40} />
        <Box sx={{ position: "sticky", top: 0, background: "white", zIndex: 1, py: 0.5 }}>
          <Typography variant="subtitle2" align="center" sx={{ fontSize: "0.8rem" }}>
            {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </Typography>
        </Box>

        {timeSlots.map((slot) => {
          const slotAppointments = getAppointmentsForSlot(currentDate, slot.hour, slot.minute);
          const withinWorkingHours = isWithinWorkingHours(currentDate, slot.hour, slot.minute);

          return (
            <Box
              key={slot.time}
              sx={{
                height: 40,
                borderBottom: 1,
                borderColor: "divider",
                backgroundColor: !withinWorkingHours ? "#f5f5f5" : "transparent",
                p: 0.5,
                cursor: withinWorkingHours ? "pointer" : "not-allowed",
                "&:hover": withinWorkingHours ? { backgroundColor: "#f0f0f0" } : {},
              }}
              onClick={() => withinWorkingHours && setShowBookingDialog(true)}
            >
              {!withinWorkingHours && (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%", color: "text.disabled" }}>
                  <Block fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" sx={{ fontSize: "0.6rem" }}>
                    Outside hours
                  </Typography>
                </Box>
              )}
              {slotAppointments.map((appointment) => renderCompactAppointmentCard(appointment))}
            </Box>
          );
        })}
      </Grid>
    </Grid>
  );

  // Render Week View
  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);

    return (
      <Grid container spacing={0.5}>
        <Grid size={{ xs: 1.5 }}>
          <Box sx={{ position: "sticky", top: 0, background: "white", zIndex: 1, py: 0.5 }}>
            <Typography variant="caption" align="center" sx={{ fontSize: "0.7rem" }}>
              Time
            </Typography>
          </Box>
          {timeSlots.map((slot) => (
            <Box key={slot.time} sx={{ height: 30, display: "flex", alignItems: "center", borderBottom: 1, borderColor: "divider", px: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                {slot.time}
              </Typography>
            </Box>
          ))}
        </Grid>

        {weekDates.map((date, index) => (
          <Grid size={{ xs: 1.5 }} key={index} sx={{ position: "relative" }}>
            <CurrentTimeIndicator date={date} height={30} />
            <Box sx={{ position: "sticky", top: 0, background: "white", zIndex: 1, py: 0.5, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="caption" align="center" sx={{ fontSize: "0.7rem", fontWeight: "bold" }}>
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </Typography>
              <Typography variant="caption" align="center" sx={{ fontSize: "0.6rem", color: "text.secondary", display: "block" }}>
                {date.getDate()}
              </Typography>
            </Box>

            {timeSlots.map((slot) => {
              const slotAppointments = getAppointmentsForSlot(date, slot.hour, slot.minute);
              const withinWorkingHours = isWithinWorkingHours(date, slot.hour, slot.minute);

              return (
                <Box
                  key={`${index}-${slot.time}`}
                  sx={{
                    height: 30,
                    borderBottom: 1,
                    borderRight: index < weekDates.length - 1 ? 1 : 0,
                    borderColor: "divider",
                    backgroundColor: !withinWorkingHours ? "#f9f9f9" : "transparent",
                    p: 0.25,
                    cursor: withinWorkingHours ? "pointer" : "not-allowed",
                    "&:hover": withinWorkingHours ? { backgroundColor: "#f0f0f0" } : {},
                  }}
                  onClick={() => withinWorkingHours && setShowBookingDialog(true)}
                >
                  {slotAppointments.map((appointment) => renderCompactAppointmentCard(appointment, false))}
                </Box>
              );
            })}
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const weeks = [];
    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7));
    }

    return (
      <Box>
        <Grid container spacing={0.5} sx={{ mb: 1 }}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <Grid size={{ xs: 12 / 7 }} key={day}>
              <Typography variant="subtitle2" align="center" sx={{ fontSize: "0.8rem", fontWeight: "bold", py: 0.5 }}>
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {weeks.map((week, weekIndex) => (
          <Grid container spacing={0.5} key={weekIndex} sx={{ mb: 0.5 }}>
            {week.map((date, dayIndex) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <Grid size={{ xs: 12 / 7 }} key={dayIndex}>
                  <Paper
                    sx={{
                      height: 100,
                      p: 0.5,
                      backgroundColor: !isCurrentMonth ? "#f5f5f5" : isToday ? "#e3f2fd" : "white",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f0f0f0" },
                      overflow: "hidden",
                    }}
                    onClick={() => setShowBookingDialog(true)}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: isToday ? "bold" : "normal",
                        color: !isCurrentMonth ? "text.disabled" : "text.primary",
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      {date.getDate()}
                    </Typography>

                    <Box sx={{ maxHeight: 70, overflow: "hidden" }}>
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <Box
                          key={appointment.abID}
                          sx={{
                            mb: 0.25,
                            p: 0.25,
                            borderRadius: 0.5,
                            fontSize: "0.6rem",
                            backgroundColor:
                              getStatusColor(appointment.abStatus) === "success"
                                ? "#4caf50"
                                : getStatusColor(appointment.abStatus) === "warning"
                                ? "#ff9800"
                                : getStatusColor(appointment.abStatus) === "error"
                                ? "#f44336"
                                : "#2196f3",
                            color: "white",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(appointment);
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "white" }}>
                            {new Date(appointment.abTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {appointment.abFName}
                          </Typography>
                        </Box>
                      ))}
                      {dayAppointments.length > 3 && (
                        <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "text.secondary" }}>
                          +{dayAppointments.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Enhanced Header with Date Selection */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" component="h1" sx={{ fontSize: "1.1rem", mb: 0.5 }}>
              Appointment Scheduler
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {viewMode === "month"
                ? currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : viewMode === "week"
                ? `Week of ${getWeekDates(currentDate)[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" alignItems="center">
              <Box sx={{ minWidth: 140 }}>
                <FormField
                  name="selectedDate"
                  control={dateControl.control}
                  type="datepicker"
                  label=""
                  fullWidth
                  variant="outlined"
                  size="small"
                  defaultValue={currentDate}
                  onChange={handleDateSelection}
                  placeholder="Select date"
                />
              </Box>

              <Button variant="outlined" startIcon={<Today />} onClick={() => navigateDate("today")} size="small" sx={{ minWidth: "auto", px: 1 }}>
                Today
              </Button>

              <IconButton onClick={() => navigateDate("prev")} size="small">
                <NavigateBefore />
              </IconButton>

              <IconButton onClick={() => navigateDate("next")} size="small">
                <NavigateNext />
              </IconButton>

              <Tabs value={viewMode} onChange={(_, value) => setViewMode(value)} variant="scrollable">
                <Tab icon={<ViewDay />} value="day" label="Day" sx={{ minWidth: "auto", px: 1 }} />
                <Tab icon={<ViewWeek />} value="week" label="Week" sx={{ minWidth: "auto", px: 1 }} />
                <Tab icon={<ViewModule />} value="month" label="Month" sx={{ minWidth: "auto", px: 1 }} />
              </Tabs>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Filters using FormField */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid size={{ xs: 6, sm: 3 }}>
            <FormField name="bookingMode" control={filterControl.control} type="select" label="Mode" options={bookingModeOptions} size="small" fullWidth />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <FormField
              name="selectedProvider"
              control={filterControl.control}
              type="select"
              label="Provider"
              options={[{ value: "", label: "All Providers" }, ...mockProviders]}
              size="small"
              fullWidth
              clearable
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <FormField
              name="selectedResource"
              control={filterControl.control}
              type="select"
              label="Resource"
              options={[{ value: "", label: "All Resources" }, ...mockResources]}
              size="small"
              fullWidth
              clearable
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowBookingDialog(true)} fullWidth size="small" sx={{ fontSize: "0.8rem" }}>
              Book
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Scheduler Views */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Box sx={{ height: "calc(100vh - 300px)", overflow: "auto" }}>
          {viewMode === "day" && renderDayView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "month" && renderMonthView()}
        </Box>
      </Paper>

      {/* Compact Statistics */}
      <Paper sx={{ p: 1 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: "0.9rem" }}>
          Today's Statistics
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 3 }}>
            <Card sx={{ textAlign: "center", p: 1 }}>
              <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 0.5, width: 32, height: 32 }}>
                <EventIcon fontSize="small" />
              </Avatar>
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                {filteredAppointments.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                Total
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <Card sx={{ textAlign: "center", p: 1 }}>
              <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 0.5, width: 32, height: 32 }}>
                <CheckCircle fontSize="small" />
              </Avatar>
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                {filteredAppointments.filter((apt) => apt.abStatus === "Confirmed").length}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                Confirmed
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <Card sx={{ textAlign: "center", p: 1 }}>
              <Avatar sx={{ bgcolor: "warning.main", mx: "auto", mb: 0.5, width: 32, height: 32 }}>
                <Warning fontSize="small" />
              </Avatar>
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                {filteredAppointments.filter((apt) => apt.abStatus === "Scheduled").length}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                Pending
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <Card sx={{ textAlign: "center", p: 1 }}>
              <Avatar sx={{ bgcolor: "info.main", mx: "auto", mb: 0.5, width: 32, height: 32 }}>
                <TimeIcon fontSize="small" />
              </Avatar>
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                {breaks.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                Breaks
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Booking Dialog using FormField */}
      <Dialog open={showBookingDialog} onClose={() => setShowBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "1rem" }}>
            Book Appointment
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {filterValues.bookingMode === "physician" ? "Physician" : "Resource"} Booking
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box component="form" onSubmit={bookingControl.handleSubmit(handleBookingSubmit)}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Switch checked={isRegisteredPatient} onChange={(e) => setIsRegisteredPatient(e.target.checked)} size="small" />}
                  label={<Typography sx={{ fontSize: "0.8rem" }}>Registered Patient</Typography>}
                />
              </Grid>

              {isRegisteredPatient ? (
                <Grid size={{ xs: 12 }}>
                  <FormField name="patientSearch" control={bookingControl.control} type="text" label="Search Patient" placeholder="Enter name or ID" size="small" fullWidth />
                </Grid>
              ) : (
                <>
                  <Grid size={{ xs: 6 }}>
                    <FormField name="firstName" control={bookingControl.control} type="text" label="First Name" required size="small" fullWidth />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormField name="lastName" control={bookingControl.control} type="text" label="Last Name" size="small" fullWidth />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormField name="phone" control={bookingControl.control} type="tel" label="Phone" required size="small" fullWidth />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <FormField name="email" control={bookingControl.control} type="email" label="Email" size="small" fullWidth />
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 6 }}>
                <FormField name="provider" control={bookingControl.control} type="select" label="Provider" options={mockProviders} required size="small" fullWidth />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <FormField name="resource" control={bookingControl.control} type="select" label="Resource" options={mockResources} required size="small" fullWidth />
              </Grid>

              <Grid size={{ xs: 4 }}>
                <FormField name="appointmentDate" control={bookingControl.control} type="datepicker" label="Date" required size="small" fullWidth />
              </Grid>

              <Grid size={{ xs: 4 }}>
                <FormField name="appointmentTime" control={bookingControl.control} type="timepicker" label="Time" required size="small" fullWidth />
              </Grid>

              <Grid size={{ xs: 4 }}>
                <FormField name="duration" control={bookingControl.control} type="select" label="Duration" options={durationOptions} required size="small" fullWidth />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormField name="notes" control={bookingControl.control} type="textarea" label="Notes" rows={2} size="small" fullWidth />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={() => setShowBookingDialog(false)} size="small">
            Cancel
          </Button>
          <Button variant="contained" onClick={bookingControl.handleSubmit(handleBookingSubmit)} size="small">
            Book
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment} onClose={() => setSelectedAppointment(null)} maxWidth="xs" fullWidth>
        {selectedAppointment && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Appointment Details
              </Typography>
              <Chip label={selectedAppointment.abStatus} color={getStatusColor(selectedAppointment.abStatus) as any} size="small" />
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                    {selectedAppointment.abFName} {selectedAppointment.abLName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedAppointment.pChartCode}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Provider
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {selectedAppointment.providerName}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Resource
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {selectedAppointment.rlName}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {new Date(selectedAppointment.abDate).toLocaleDateString()}
                    {" at "}
                    {new Date(selectedAppointment.abTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {selectedAppointment.abDurDesc}
                  </Typography>
                </Grid>

                {selectedAppointment.procNotes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {selectedAppointment.procNotes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ pt: 1 }}>
              <Button startIcon={<EditIcon />} size="small">
                Edit
              </Button>
              <Button startIcon={<CancelIcon />} color="warning" size="small">
                Cancel
              </Button>
              <Button onClick={() => setSelectedAppointment(null)} size="small">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AppointmentScheduler;
