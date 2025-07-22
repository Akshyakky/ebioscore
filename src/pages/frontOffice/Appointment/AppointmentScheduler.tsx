import {
  Add as AddIcon,
  Block,
  Business as BusinessIcon,
  Cancel as CancelIcon,
  CheckCircle,
  Edit as EditIcon,
  Event as EventIcon,
  NavigateBefore,
  NavigateNext,
  Person as PersonIcon,
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
  CardContent,
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
import { useCallback, useMemo, useState } from "react";

// Mock data and interfaces based on your existing DTOs
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

// Mock data
const mockAppointments: AppointmentData[] = [
  {
    abID: 1,
    abFName: "John",
    abLName: "Doe",
    hplID: 1,
    providerName: "Dr. Smith",
    rlID: 1,
    rlName: "Consultation Room 1",
    abDuration: 30,
    abDurDesc: "30 minutes",
    abDate: new Date(2025, 7, 22),
    abTime: new Date(2025, 7, 22, 9, 0),
    abEndTime: new Date(2025, 7, 22, 9, 30),
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
    rlName: "Consultation Room 2",
    abDuration: 45,
    abDurDesc: "45 minutes",
    abDate: new Date(2025, 7, 22),
    abTime: new Date(2025, 7, 22, 10, 0),
    abEndTime: new Date(2025, 7, 22, 10, 45),
    pChartID: 124,
    pChartCode: "P002",
    abPType: "OP",
    abStatus: "Confirmed",
    patRegisterYN: "Y",
    procNotes: "Follow-up consultation",
  },
];

const mockBreaks: BreakData[] = [
  {
    bLID: 1,
    bLName: "Lunch Break",
    bLStartTime: new Date(2025, 7, 22, 12, 0),
    bLEndTime: new Date(2025, 7, 22, 13, 0),
    bLStartDate: new Date(2025, 7, 22),
    bLEndDate: new Date(2025, 7, 22),
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
    startTime: new Date(2025, 7, 22, 8, 0),
    endTime: new Date(2025, 7, 22, 17, 0),
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
  { value: 1, label: "Consultation Room 1", type: "room" },
  { value: 2, label: "Consultation Room 2", type: "room" },
  { value: 3, label: "X-Ray Machine", type: "equipment" },
];

const AppointmentScheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day"); // 'day', 'week', 'month'
  const [selectedProvider, setSelectedProvider] = useState<number | "">("");
  const [selectedResource, setSelectedResource] = useState<number | "">("");
  const [bookingMode, setBookingMode] = useState<"physician" | "resource">("physician");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>(mockAppointments);
  const [breaks, setBreaks] = useState<BreakData[]>(mockBreaks);
  const [workHours, setWorkHours] = useState<WorkHoursData[]>(mockWorkHours);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [isRegisteredPatient, setIsRegisteredPatient] = useState(true);

  // Time slots generation
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
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

  // Filter appointments for current view
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.abDate);
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());

      if (viewMode === "day") {
        return (
          aptDateOnly.getTime() === currentDateOnly.getTime() &&
          (selectedProvider === "" || apt.hplID === selectedProvider) &&
          (selectedResource === "" || apt.rlID === selectedResource)
        );
      }
      return true;
    });
  }, [appointments, currentDate, viewMode, selectedProvider, selectedResource]);

  // Get appointments for a specific time slot
  const getAppointmentsForSlot = useCallback(
    (hour: number, minute: number) => {
      return filteredAppointments.filter((apt) => {
        const aptTime = new Date(apt.abTime);
        const aptEndTime = new Date(apt.abEndTime);
        const slotTime = new Date(currentDate);
        slotTime.setHours(hour, minute, 0, 0);

        return slotTime >= aptTime && slotTime < aptEndTime;
      });
    },
    [filteredAppointments, currentDate]
  );

  // Get breaks for a specific time slot
  const getBreaksForSlot = useCallback(
    (hour: number, minute: number) => {
      return breaks.filter((brk) => {
        const brkStartTime = new Date(brk.bLStartTime);
        const brkEndTime = new Date(brk.bLEndTime);
        const slotTime = new Date(currentDate);
        slotTime.setHours(hour, minute, 0, 0);

        return slotTime >= brkStartTime && slotTime < brkEndTime && (selectedProvider === "" || brk.hPLID === selectedProvider);
      });
    },
    [breaks, currentDate, selectedProvider]
  );

  // Check if time slot is within working hours
  const isWithinWorkingHours = useCallback(
    (hour: number, minute: number) => {
      const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
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
    [workHours, currentDate]
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

  // Appointment booking handler
  const handleBookAppointment = (timeSlot?: { hour: number; minute: number }) => {
    setSelectedAppointment(null);
    setShowBookingDialog(true);
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

  // Render appointment card
  const renderAppointmentCard = (appointment: AppointmentData) => (
    <Card
      key={appointment.abID}
      sx={{
        mb: 0.5,
        cursor: "pointer",
        "&:hover": { elevation: 4 },
        borderLeft: `4px solid ${
          getStatusColor(appointment.abStatus) === "success"
            ? "#4caf50"
            : getStatusColor(appointment.abStatus) === "warning"
            ? "#ff9800"
            : getStatusColor(appointment.abStatus) === "error"
            ? "#f44336"
            : "#2196f3"
        }`,
      }}
      onClick={() => setSelectedAppointment(appointment)}
    >
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
        <Typography variant="body2" fontWeight="bold">
          {appointment.abFName} {appointment.abLName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {appointment.providerName} • {appointment.rlName}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
          <Chip size="small" label={appointment.abStatus} color={getStatusColor(appointment.abStatus) as any} />
          <Typography variant="caption">{appointment.abDurDesc}</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Render break card
  const renderBreakCard = (breakData: BreakData) => (
    <Card
      key={breakData.bLID}
      sx={{
        mb: 0.5,
        backgroundColor: "#fff3e0",
        borderLeft: "4px solid #ff9800",
      }}
    >
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
        <Typography variant="body2" fontWeight="bold">
          {breakData.bLName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {breakData.assignedName}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Appointment Scheduler
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
              <Button variant="outlined" startIcon={<Today />} onClick={() => navigateDate("today")} size="small">
                Today
              </Button>

              <IconButton onClick={() => navigateDate("prev")} size="small">
                <NavigateBefore />
              </IconButton>

              <IconButton onClick={() => navigateDate("next")} size="small">
                <NavigateNext />
              </IconButton>

              <Tabs value={viewMode} onChange={(_, value) => setViewMode(value)}>
                <Tab icon={<ViewDay />} value="day" label="Day" />
                <Tab icon={<ViewWeek />} value="week" label="Week" />
                <Tab icon={<ViewModule />} value="month" label="Month" />
              </Tabs>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Booking Mode</InputLabel>
              <Select value={bookingMode} label="Booking Mode" onChange={(e) => setBookingMode(e.target.value as "physician" | "resource")}>
                <MenuItem value="physician">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    Physician Booking
                  </Box>
                </MenuItem>
                <MenuItem value="resource">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BusinessIcon fontSize="small" />
                    Resource Booking
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Provider</InputLabel>
              <Select value={selectedProvider} label="Provider" onChange={(e) => setSelectedProvider(e.target.value)}>
                <MenuItem value="">All Providers</MenuItem>
                {mockProviders.map((provider) => (
                  <MenuItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Resource</InputLabel>
              <Select value={selectedResource} label="Resource" onChange={(e) => setSelectedResource(e.target.value)}>
                <MenuItem value="">All Resources</MenuItem>
                {mockResources.map((resource) => (
                  <MenuItem key={resource.value} value={resource.value}>
                    {resource.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleBookAppointment()} fullWidth>
                Book Appointment
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Scheduler Grid */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ height: "calc(100vh - 400px)", overflow: "auto" }}>
          <Grid container>
            {/* Time column */}
            <Grid size={{ xs: 2 }}>
              <Box sx={{ position: "sticky", top: 0, background: "white", zIndex: 1, pb: 1 }}>
                <Typography variant="h6" align="center">
                  Time
                </Typography>
              </Box>
              {timeSlots
                .filter((_, index) => index % 4 === 0)
                .map((slot) => (
                  <Box key={slot.time} sx={{ height: 80, display: "flex", alignItems: "center", borderBottom: 1, borderColor: "divider" }}>
                    <Typography variant="body2" color="text.secondary">
                      {slot.time}
                    </Typography>
                  </Box>
                ))}
            </Grid>

            {/* Schedule column */}
            <Grid size={{ xs: 10 }}>
              <Box sx={{ position: "sticky", top: 0, background: "white", zIndex: 1, pb: 1 }}>
                <Typography variant="h6" align="center">
                  Schedule ({bookingMode === "physician" ? "Physician" : "Resource"} View)
                </Typography>
              </Box>

              {timeSlots
                .filter((_, index) => index % 4 === 0)
                .map((slot) => {
                  const slotAppointments = getAppointmentsForSlot(slot.hour, slot.minute);
                  const slotBreaks = getBreaksForSlot(slot.hour, slot.minute);
                  const withinWorkingHours = isWithinWorkingHours(slot.hour, slot.minute);

                  return (
                    <Box
                      key={slot.time}
                      sx={{
                        height: 80,
                        borderBottom: 1,
                        borderColor: "divider",
                        backgroundColor: !withinWorkingHours ? "#f5f5f5" : "transparent",
                        p: 1,
                        cursor: withinWorkingHours ? "pointer" : "not-allowed",
                        "&:hover": withinWorkingHours ? { backgroundColor: "#f0f0f0" } : {},
                      }}
                      onClick={() => withinWorkingHours && handleBookAppointment({ hour: slot.hour, minute: slot.minute })}
                    >
                      {!withinWorkingHours && (
                        <Box sx={{ display: "flex", alignItems: "center", height: "100%", color: "text.disabled" }}>
                          <Block fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="caption">Outside working hours</Typography>
                        </Box>
                      )}

                      {slotBreaks.map((breakData) => renderBreakCard(breakData))}
                      {slotAppointments.map((appointment) => renderAppointmentCard(appointment))}
                    </Box>
                  );
                })}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Statistics Panel */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Today's Statistics
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mb: 1 }}>
                <EventIcon />
              </Avatar>
              <Typography variant="h4">{filteredAppointments.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Appointments
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Avatar sx={{ bgcolor: "success.main", mx: "auto", mb: 1 }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h4">{filteredAppointments.filter((apt) => apt.abStatus === "Confirmed").length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Confirmed
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Avatar sx={{ bgcolor: "warning.main", mx: "auto", mb: 1 }}>
                <Warning />
              </Avatar>
              <Typography variant="h4">{filteredAppointments.filter((apt) => apt.abStatus === "Scheduled").length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Avatar sx={{ bgcolor: "info.main", mx: "auto", mb: 1 }}>
                <TimeIcon />
              </Avatar>
              <Typography variant="h4">{breaks.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Breaks
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onClose={() => setShowBookingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Book New Appointment
          <Typography variant="body2" color="text.secondary">
            {bookingMode === "physician" ? "Physician" : "Resource"} Booking
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel control={<Switch checked={isRegisteredPatient} onChange={(e) => setIsRegisteredPatient(e.target.checked)} />} label="Registered Patient" />
            </Grid>

            {isRegisteredPatient ? (
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Search Patient" placeholder="Enter patient name or ID" variant="outlined" size="small" />
              </Grid>
            ) : (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="First Name" variant="outlined" size="small" required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Last Name" variant="outlined" size="small" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Phone Number" variant="outlined" size="small" required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Email" type="email" variant="outlined" size="small" />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Provider</InputLabel>
                <Select label="Provider" required>
                  {mockProviders.map((provider) => (
                    <MenuItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Resource</InputLabel>
                <Select label="Resource" required>
                  {mockResources.map((resource) => (
                    <MenuItem key={resource.value} value={resource.value}>
                      {resource.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Date" type="date" variant="outlined" size="small" InputLabelProps={{ shrink: true }} required />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Time" type="time" variant="outlined" size="small" InputLabelProps={{ shrink: true }} required />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Duration</InputLabel>
                <Select label="Duration" required>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Patient Type</InputLabel>
                <Select label="Patient Type" required>
                  <MenuItem value="OP">Outpatient</MenuItem>
                  <MenuItem value="IP">Inpatient</MenuItem>
                  <MenuItem value="ER">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Procedure Notes" multiline rows={3} variant="outlined" size="small" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookingDialog(false)}>Cancel</Button>
          <Button variant="contained">Book Appointment</Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog open={!!selectedAppointment} onClose={() => setSelectedAppointment(null)} maxWidth="sm" fullWidth>
        {selectedAppointment && (
          <>
            <DialogTitle>
              Appointment Details
              <Chip label={selectedAppointment.abStatus} color={getStatusColor(selectedAppointment.abStatus) as any} size="small" sx={{ ml: 2 }} />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6">
                    {selectedAppointment.abFName} {selectedAppointment.abLName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAppointment.patRegisterYN === "Y" ? "Registered Patient" : "Walk-in Patient"}
                    {selectedAppointment.pChartCode && ` • ${selectedAppointment.pChartCode}`}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Provider</Typography>
                  <Typography variant="body2">{selectedAppointment.providerName}</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Resource</Typography>
                  <Typography variant="body2">{selectedAppointment.rlName}</Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Date & Time</Typography>
                  <Typography variant="body2">
                    {new Date(selectedAppointment.abDate).toLocaleDateString()}
                    {" at "}
                    {new Date(selectedAppointment.abTime).toLocaleTimeString()}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Duration</Typography>
                  <Typography variant="body2">{selectedAppointment.abDurDesc}</Typography>
                </Grid>

                {selectedAppointment.appPhone1 && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2">Phone</Typography>
                    <Typography variant="body2">{selectedAppointment.appPhone1}</Typography>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2">Patient Type</Typography>
                  <Typography variant="body2">{selectedAppointment.abPType}</Typography>
                </Grid>

                {selectedAppointment.procNotes && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2">Notes</Typography>
                    <Typography variant="body2">{selectedAppointment.procNotes}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button startIcon={<EditIcon />}>Edit</Button>
              <Button startIcon={<CancelIcon />} color="warning">
                Cancel
              </Button>
              <Button onClick={() => setSelectedAppointment(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AppointmentScheduler;
