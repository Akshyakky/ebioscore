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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

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
    abID: 5,
    abFName: "Akshay",
    abLName: "Kumar",
    hplID: 1,
    providerName: "Dr. Smith",
    rlID: 2,
    rlName: "Room 2",
    abDuration: 45,
    abDurDesc: "45m",
    abDate: new Date(2025, 6, 22),
    abTime: new Date(2025, 6, 22, 9, 0),
    abEndTime: new Date(2025, 6, 22, 9, 45),
    pChartID: 124,
    pChartCode: "P002",
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
    pChartID: 125,
    pChartCode: "P003",
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
    pChartID: 126,
    pChartCode: "P004",
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
    pChartID: 127,
    pChartCode: "P005",
    abPType: "OP",
    abStatus: "Scheduled",
    patRegisterYN: "Y",
    procNotes: "Comprehensive exam",
  },
  {
    abID: 6,
    abFName: "Lakshmi",
    abLName: "M",
    hplID: 1,
    providerName: "Dr. Smith",
    rlID: 1,
    rlName: "Room 1",
    abDuration: 45,
    abDurDesc: "45m",
    abDate: new Date(2025, 6, 24),
    abTime: new Date(2025, 6, 24, 11, 0),
    abEndTime: new Date(2025, 6, 24, 11, 45),
    pChartID: 128,
    pChartCode: "P006",
    abPType: "OP",
    abStatus: "Scheduled",
    patRegisterYN: "Y",
    procNotes: "Comprehensive exam",
  },
  // Adding more overlapping appointments for testing
  {
    abID: 7,
    abFName: "Sarah",
    abLName: "Connor",
    hplID: 1,
    providerName: "Dr. Smith",
    rlID: 3,
    rlName: "Room 3",
    abDuration: 30,
    abDurDesc: "30m",
    abDate: new Date(2025, 6, 22),
    abTime: new Date(2025, 6, 22, 9, 0),
    abEndTime: new Date(2025, 6, 22, 9, 30),
    pChartID: 129,
    pChartCode: "P007",
    abPType: "OP",
    abStatus: "Confirmed",
    patRegisterYN: "Y",
    procNotes: "Consultation",
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
  const [bookingMode, setBookingMode] = useState("physician");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedResource, setSelectedResource] = useState("");

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
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

  // Check if a time slot has elapsed (is in the past)
  const isTimeSlotElapsed = useCallback(
    (date: Date, hour: number, minute: number) => {
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);
      return slotDate < currentTime;
    },
    [currentTime]
  );

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

      return (selectedProvider === "" || apt.hplID.toString() === selectedProvider) && (selectedResource === "" || apt.rlID.toString() === selectedResource);
    });
  }, [appointments, currentDate, viewMode, selectedProvider, selectedResource, getWeekDates]);

  // Get overlapping appointments for a specific time range
  const getOverlappingAppointments = useCallback(
    (date: Date, startTime: Date, endTime: Date) => {
      return filteredAppointments.filter((apt) => {
        const aptDate = new Date(apt.abDate);
        const aptStartTime = new Date(apt.abTime);
        const aptEndTime = new Date(apt.abEndTime);

        const dateMatches = aptDate.getDate() === date.getDate() && aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();

        if (!dateMatches) return false;

        // Check if appointments overlap
        return aptStartTime < endTime && aptEndTime > startTime;
      });
    },
    [filteredAppointments]
  );

  // Calculate appointment positioning to prevent overlaps
  const calculateAppointmentLayout = useCallback((date: Date, appointments: AppointmentData[]) => {
    const sortedAppointments = [...appointments].sort((a, b) => new Date(a.abTime).getTime() - new Date(b.abTime).getTime());
    const layout: Array<{ appointment: AppointmentData; column: number; totalColumns: number }> = [];
    const columns: Array<{ endTime: Date; appointments: AppointmentData[] }> = [];

    sortedAppointments.forEach((appointment) => {
      const startTime = new Date(appointment.abTime);
      const endTime = new Date(appointment.abEndTime);

      // Find available column
      let columnIndex = columns.findIndex((col) => col.endTime <= startTime);

      if (columnIndex === -1) {
        // Create new column
        columnIndex = columns.length;
        columns.push({ endTime, appointments: [appointment] });
      } else {
        // Use existing column
        columns[columnIndex].endTime = endTime;
        columns[columnIndex].appointments.push(appointment);
      }

      layout.push({
        appointment,
        column: columnIndex,
        totalColumns: Math.max(
          columns.length,
          layout.reduce((max, item) => Math.max(max, item.totalColumns), 1)
        ),
      });
    });

    // Update totalColumns for all items
    layout.forEach((item) => {
      item.totalColumns = columns.length;
    });

    return layout;
  }, []);

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

  // Get background color for time slot based on status
  const getSlotBackgroundColor = useCallback(
    (date: Date, hour: number, minute: number) => {
      const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
      const isElapsed = isTimeSlotElapsed(date, hour, minute);

      if (!withinWorkingHours) {
        return isElapsed ? "#eeeeee" : "#f5f5f5";
      }

      if (isElapsed) {
        return "#e8e8e8";
      }

      return "transparent";
    },
    [isWithinWorkingHours, isTimeSlotElapsed]
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
  };

  // Handle booking form submission
  const handleBookingSubmit = () => {
    console.log("Booking data:", bookingForm);
    setShowBookingDialog(false);
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
  const renderCompactAppointmentCard = (appointment: AppointmentData, showDetails = true, column = 0, totalColumns = 1) => {
    const widthPercentage = 100 / totalColumns;
    const leftPercentage = (column * 100) / totalColumns;

    return (
      <Box
        key={appointment.abID}
        sx={{
          height: "100%",
          p: 0.5,
          borderRadius: 1,
          cursor: "pointer",
          fontSize: "0.75rem",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
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
          width: `${widthPercentage - 1}%`,
          left: `${leftPercentage}%`,
          position: "absolute",
        }}
        onClick={() => setSelectedAppointment(appointment)}
      >
        <Typography variant="caption" fontWeight="bold" display="block" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {appointment.abFName} {appointment.abLName}
        </Typography>
        {showDetails && (
          <>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

  // Render Day View with fixed overlapping
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);
    const appointmentLayout = calculateAppointmentLayout(currentDate, dayAppointments);

    return (
      <Grid container spacing={1}>
        <Grid size={{ xs: 1 }}>
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

        <Grid size={{ xs: 11 }} sx={{ position: "relative" }}>
          <CurrentTimeIndicator date={currentDate} height={40} />
          <Box sx={{ position: "sticky", top: 0, background: "white", zIndex: 1, py: 0.5 }}>
            <Typography variant="subtitle2" align="center" sx={{ fontSize: "0.8rem" }}>
              {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </Typography>
          </Box>

          {timeSlots.map((slot) => {
            const slotAppointments = getAppointmentsForSlot(currentDate, slot.hour, slot.minute);
            const withinWorkingHours = isWithinWorkingHours(currentDate, slot.hour, slot.minute);
            const isElapsed = isTimeSlotElapsed(currentDate, slot.hour, slot.minute);
            const backgroundColor = getSlotBackgroundColor(currentDate, slot.hour, slot.minute);

            return (
              <Box
                key={slot.time}
                sx={{
                  height: 40,
                  borderBottom: 1,
                  borderColor: "divider",
                  backgroundColor,
                  p: 0.5,
                  cursor: withinWorkingHours && !isElapsed ? "pointer" : "not-allowed",
                  "&:hover": withinWorkingHours && !isElapsed ? { backgroundColor: "#f0f0f0" } : {},
                  opacity: isElapsed ? 0.7 : 1,
                  position: "relative",
                }}
                onClick={() => withinWorkingHours && !isElapsed && setShowBookingDialog(true)}
              >
                {!withinWorkingHours && !slotAppointments.length && (
                  <Box sx={{ display: "flex", alignItems: "center", height: "100%", color: "text.disabled" }}>
                    <Block fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" sx={{ fontSize: "0.6rem" }}>
                      Outside hours
                    </Typography>
                  </Box>
                )}
                {isElapsed && withinWorkingHours && slotAppointments.length === 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", height: "100%", color: "text.disabled" }}>
                    <Typography variant="caption" sx={{ fontSize: "0.6rem", fontStyle: "italic" }}>
                      Elapsed
                    </Typography>
                  </Box>
                )}
                {slotAppointments.map((appointment) => {
                  const appointmentStart = new Date(appointment.abTime);
                  const appointmentStartMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
                  const slotStartMinutes = slot.hour * 60 + slot.minute;
                  const nextSlotStartMinutes = slotStartMinutes + 15;

                  // Only render the appointment in the slot where it begins
                  if (appointmentStartMinutes >= slotStartMinutes && appointmentStartMinutes < nextSlotStartMinutes) {
                    const slotHeight = 40;
                    const durationInSlots = appointment.abDuration / 15;
                    const appointmentHeight = durationInSlots * slotHeight - 2;

                    const minuteOffset = appointmentStartMinutes - slotStartMinutes;
                    const topOffset = (minuteOffset / 15) * slotHeight;

                    const layoutInfo = appointmentLayout.find((layout) => layout.appointment.abID === appointment.abID);
                    const column = layoutInfo?.column || 0;
                    const totalColumns = layoutInfo?.totalColumns || 1;

                    return (
                      <Box
                        key={appointment.abID}
                        sx={{
                          position: "absolute",
                          top: `${topOffset}px`,
                          left: "4px",
                          right: "4px",
                          height: `${appointmentHeight}px`,
                          zIndex: 1,
                        }}
                      >
                        {renderCompactAppointmentCard(appointment, true, column, totalColumns)}
                      </Box>
                    );
                  }
                  return null;
                })}
              </Box>
            );
          })}
        </Grid>
      </Grid>
    );
  };

  // Render Week View with fixed overlapping
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

        {weekDates.map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date);
          const appointmentLayout = calculateAppointmentLayout(date, dayAppointments);

          return (
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
                const isElapsed = isTimeSlotElapsed(date, slot.hour, slot.minute);
                const backgroundColor = getSlotBackgroundColor(date, slot.hour, slot.minute);

                return (
                  <Box
                    key={`${index}-${slot.time}`}
                    sx={{
                      height: 30,
                      borderBottom: 1,
                      borderRight: index < weekDates.length - 1 ? 1 : 0,
                      borderColor: "divider",
                      backgroundColor,
                      p: 0.25,
                      cursor: withinWorkingHours && !isElapsed ? "pointer" : "not-allowed",
                      "&:hover": withinWorkingHours && !isElapsed ? { backgroundColor: "#f0f0f0" } : {},
                      opacity: isElapsed ? 0.7 : 1,
                      position: "relative",
                    }}
                    onClick={() => withinWorkingHours && !isElapsed && setShowBookingDialog(true)}
                  >
                    {slotAppointments.map((appointment) => {
                      const appointmentStart = new Date(appointment.abTime);
                      const appointmentStartMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
                      const slotStartMinutes = slot.hour * 60 + slot.minute;
                      const nextSlotStartMinutes = slotStartMinutes + 15;

                      if (appointmentStartMinutes >= slotStartMinutes && appointmentStartMinutes < nextSlotStartMinutes) {
                        const slotHeight = 30;
                        const durationInSlots = appointment.abDuration / 15;
                        const appointmentHeight = durationInSlots * slotHeight - 1;

                        const minuteOffset = appointmentStartMinutes - slotStartMinutes;
                        const topOffset = (minuteOffset / 15) * slotHeight;

                        const layoutInfo = appointmentLayout.find((layout) => layout.appointment.abID === appointment.abID);
                        const column = layoutInfo?.column || 0;
                        const totalColumns = layoutInfo?.totalColumns || 1;

                        return (
                          <Box
                            key={appointment.abID}
                            sx={{
                              position: "absolute",
                              top: `${topOffset}px`,
                              left: "2px",
                              right: "2px",
                              height: `${appointmentHeight}px`,
                              zIndex: 1,
                            }}
                          >
                            {renderCompactAppointmentCard(appointment, false, column, totalColumns)}
                          </Box>
                        );
                      }
                      return null;
                    })}
                  </Box>
                );
              })}
            </Grid>
          );
        })}
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
              const isPastDate = date < new Date().setHours(0, 0, 0, 0);

              return (
                <Grid size={{ xs: 12 / 7 }} key={dayIndex}>
                  <Paper
                    sx={{
                      height: 100,
                      p: 0.5,
                      backgroundColor: !isCurrentMonth ? "#f5f5f5" : isPastDate ? "#eeeeee" : isToday ? "#e3f2fd" : "white",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f0f0f0" },
                      overflow: "hidden",
                      opacity: isPastDate ? 0.7 : 1,
                    }}
                    onClick={() => !isPastDate && setShowBookingDialog(true)}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: isToday ? "bold" : "normal",
                        color: !isCurrentMonth ? "text.disabled" : isPastDate ? "text.secondary" : "text.primary",
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
      {/* Header with Date Selection */}
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
              <TextField
                type="date"
                size="small"
                value={currentDate.toISOString().split("T")[0]}
                onChange={(e) => setCurrentDate(new Date(e.target.value))}
                sx={{ minWidth: 140 }}
              />

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

      {/* Filters */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid size={{ xs: 6, sm: 3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Mode</InputLabel>
              <Select value={bookingMode} onChange={(e) => setBookingMode(e.target.value)} label="Mode">
                {bookingModeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} label="Provider">
                <MenuItem value="">All Providers</MenuItem>
                {mockProviders.map((provider) => (
                  <MenuItem key={provider.value} value={provider.value.toString()}>
                    {provider.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Resource</InputLabel>
              <Select value={selectedResource} onChange={(e) => setSelectedResource(e.target.value)} label="Resource">
                <MenuItem value="">All Resources</MenuItem>
                {mockResources.map((resource) => (
                  <MenuItem key={resource.value} value={resource.value.toString()}>
                    {resource.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowBookingDialog(true)} fullWidth size="small" sx={{ fontSize: "0.8rem" }}>
              Book
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Time Legend */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", mb: 0.5, display: "block" }}>
          Time Slot Legend:
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: "transparent", border: "1px solid #ddd" }} />
            <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
              Future
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: "#e8e8e8", border: "1px solid #ddd" }} />
            <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
              Elapsed
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: "#f5f5f5", border: "1px solid #ddd" }} />
            <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
              Outside Hours
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 16, height: 2, backgroundColor: "red" }} />
            <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
              Current Time
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Scheduler Views */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Box sx={{ height: "calc(100vh - 400px)", overflow: "auto" }}>
          {viewMode === "day" && renderDayView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "month" && renderMonthView()}
        </Box>
      </Paper>

      {/* Statistics */}
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

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onClose={() => setShowBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "1rem" }}>
            Book Appointment
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {bookingMode === "physician" ? "Physician" : "Resource"} Booking
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={isRegisteredPatient} onChange={(e) => setIsRegisteredPatient(e.target.checked)} size="small" />}
                label={<Typography sx={{ fontSize: "0.8rem" }}>Registered Patient</Typography>}
              />
            </Grid>

            {isRegisteredPatient ? (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Patient"
                  placeholder="Enter name or ID"
                  value={bookingForm.patientSearch}
                  onChange={(e) => setBookingForm({ ...bookingForm, patientSearch: e.target.value })}
                />
              </Grid>
            ) : (
              <>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="First Name"
                    required
                    value={bookingForm.firstName}
                    onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth size="small" label="Last Name" value={bookingForm.lastName} onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth size="small" label="Phone" required value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Provider</InputLabel>
                <Select value={bookingForm.provider} onChange={(e) => setBookingForm({ ...bookingForm, provider: e.target.value })} label="Provider">
                  {mockProviders.map((provider) => (
                    <MenuItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Resource</InputLabel>
                <Select value={bookingForm.resource} onChange={(e) => setBookingForm({ ...bookingForm, resource: e.target.value })} label="Resource">
                  {mockResources.map((resource) => (
                    <MenuItem key={resource.value} value={resource.value}>
                      {resource.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Date"
                type="date"
                required
                value={bookingForm.appointmentDate.toISOString().split("T")[0]}
                onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Time"
                type="time"
                required
                value={bookingForm.appointmentTime}
                onChange={(e) => setBookingForm({ ...bookingForm, appointmentTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Duration</InputLabel>
                <Select value={bookingForm.duration} onChange={(e) => setBookingForm({ ...bookingForm, duration: Number(e.target.value) })} label="Duration">
                  {durationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="Notes"
                multiline
                rows={2}
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={() => setShowBookingDialog(false)} size="small">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleBookingSubmit} size="small">
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
