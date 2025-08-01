// src/pages/frontOffice/Appointment/components/DayView.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { BreakDto } from "@/interfaces/FrontOffice/BreakListDto";
import { HospWorkHoursDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { Block } from "@mui/icons-material";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import React from "react";
import { TimeSlot } from "../types";
import { calculateAppointmentLayout } from "../utils/appointmentUtils";
import { calculateBreakLayout } from "../utils/breakUtils";
import { AppointmentCard } from "./AppointmentCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface DayViewProps {
  currentDate: Date;
  timeSlots: TimeSlot[];
  appointments: AppointBookingDto[];
  breaks: BreakDto[];
  workHours: HospWorkHoursDto[];
  currentTime: Date;
  selectedProvider?: string;
  onSlotDoubleClick: (date: Date, hour: number, minute: number) => void;
  onAppointmentClick: (appointment: AppointBookingDto) => void;
  onBreakClick?: (breakItem: BreakDto) => void;
  onElapsedSlotConfirmation: (date: Date, hour: number, minute: number) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  timeSlots,
  appointments,
  breaks,
  workHours,
  currentTime,
  selectedProvider,
  onSlotDoubleClick,
  onAppointmentClick,
  onBreakClick,
  onElapsedSlotConfirmation,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const isWithinWorkingHours = (date: Date, hour: number, minute: number) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const workHour = workHours.find((wh) => wh.daysDesc.toUpperCase() === dayName && wh.rActiveYN === "Y");

    if (!workHour || !workHour.startTime || !workHour.endTime) return false;

    const startHour = new Date(workHour.startTime).getHours();
    const startMinute = new Date(workHour.startTime).getMinutes();
    const endHour = new Date(workHour.endTime).getHours();
    const endMinute = new Date(workHour.endTime).getMinutes();

    const slotMinutes = hour * 60 + minute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  };

  const isTimeSlotElapsed = (date: Date, hour: number, minute: number) => {
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate < currentTime;
  };

  const isTimeSlotDuringBreak = (date: Date, hour: number, minute: number) => {
    const slotMinutes = hour * 60 + minute;

    return breaks.some((breakItem) => {
      // Check if break applies to selected provider
      if (selectedProvider && breakItem.hPLID !== parseInt(selectedProvider)) {
        return false;
      }

      // Check if slot date is within break date range
      const breakStartDate = new Date(breakItem.bLStartDate);
      const breakEndDate = new Date(breakItem.bLEndDate);

      if (date < breakStartDate || date > breakEndDate) {
        return false;
      }

      // Check if slot time is within break time range
      const breakStartTime = new Date(breakItem.bLStartTime);
      const breakEndTime = new Date(breakItem.bLEndTime);

      const breakStartMinutes = breakStartTime.getHours() * 60 + breakStartTime.getMinutes();
      const breakEndMinutes = breakEndTime.getHours() * 60 + breakEndTime.getMinutes();

      return slotMinutes >= breakStartMinutes && slotMinutes < breakEndMinutes;
    });
  };

  const getSlotBackgroundColor = (date: Date, hour: number, minute: number) => {
    const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
    const isElapsed = isTimeSlotElapsed(date, hour, minute);
    const isDuringBreak = isTimeSlotDuringBreak(date, hour, minute);

    if (!withinWorkingHours) {
      return isDarkMode ? (isElapsed ? theme.palette.grey[800] : theme.palette.grey[900]) : isElapsed ? "#eeeeee" : "#f5f5f5";
    }

    if (isDuringBreak) {
      return isDarkMode ? "#d84315" : "#ffccbc"; // Orange tint for break periods
    }

    if (isElapsed) {
      return isDarkMode ? theme.palette.grey[700] : "#f0f0f0";
    }

    return "transparent";
  };

  const getHoverBackgroundColor = (date: Date, hour: number, minute: number) => {
    const isElapsed = isTimeSlotElapsed(date, hour, minute);
    const isDuringBreak = isTimeSlotDuringBreak(date, hour, minute);

    if (isDuringBreak) {
      return isDarkMode ? "#ff5722" : "#ffab91";
    }

    if (isDarkMode) {
      return isElapsed ? theme.palette.grey[600] : theme.palette.grey[700];
    } else {
      return isElapsed ? "#f5f5f5" : "#f0f0f0";
    }
  };

  const getAppointmentsForSlot = (date: Date, hour: number, minute: number) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.abDate);
      const aptTime = new Date(apt.abTime);
      const aptEndTime = new Date(apt.abEndTime);

      const dateMatches = aptDate.getDate() === date.getDate() && aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();

      if (!dateMatches) return false;

      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);

      return slotTime >= aptTime && slotTime < aptEndTime;
    });
  };

  const getBreaksForSlot = (date: Date, hour: number, minute: number) => {
    return breaks.filter((breakItem) => {
      // Check if break applies to selected provider
      if (selectedProvider && breakItem.hPLID !== parseInt(selectedProvider)) {
        return false;
      }

      // Check if slot date is within break date range
      const breakStartDate = new Date(breakItem.bLStartDate);
      const breakEndDate = new Date(breakItem.bLEndDate);

      if (date < breakStartDate || date > breakEndDate) {
        return false;
      }

      // Check if slot time is within break time range
      const breakStartTime = new Date(breakItem.bLStartTime);
      const breakEndTime = new Date(breakItem.bLEndTime);

      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);

      return slotTime >= breakStartTime && slotTime < breakEndTime;
    });
  };

  const dayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.abDate);
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
    return aptDateOnly.getTime() === currentDateOnly.getTime();
  });

  const dayBreaks = breaks.filter((breakItem) => {
    // Filter by selected provider if specified
    if (selectedProvider && breakItem.hPLID !== parseInt(selectedProvider)) {
      return false;
    }

    const breakStartDate = new Date(breakItem.bLStartDate);
    const breakEndDate = new Date(breakItem.bLEndDate);

    return currentDate >= breakStartDate && currentDate <= breakEndDate;
  });

  const appointmentLayout = calculateAppointmentLayout(currentDate, dayAppointments);
  const breakLayout = calculateBreakLayout(currentDate, dayBreaks);

  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
    const isElapsed = isTimeSlotElapsed(date, hour, minute);
    const isDuringBreak = isTimeSlotDuringBreak(date, hour, minute);
    const slotAppointments = getAppointmentsForSlot(date, hour, minute);

    if (isDuringBreak) {
      // Don't allow booking during breaks
      return;
    }

    if (withinWorkingHours && isElapsed && slotAppointments.length === 0) {
      onElapsedSlotConfirmation(date, hour, minute);
    }
  };

  const handleSlotDoubleClick = (date: Date, hour: number, minute: number) => {
    const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
    const isDuringBreak = isTimeSlotDuringBreak(date, hour, minute);
    const slotAppointments = getAppointmentsForSlot(date, hour, minute);

    if (isDuringBreak) {
      // Don't allow booking during breaks
      return;
    }

    if (withinWorkingHours && slotAppointments.length === 0) {
      onSlotDoubleClick(date, hour, minute);
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 1 }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            background: isDarkMode
              ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[700]} 100%)`
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            zIndex: 30,
            py: 0.5,
            borderBottom: 2,
            borderColor: "primary.main",
            mb: 0.5,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          <Typography
            variant="subtitle2"
            align="center"
            sx={{
              fontSize: "0.8rem",
              fontWeight: "bold",
              color: isDarkMode ? theme.palette.primary.light : "primary.main",
            }}
          >
            Time
          </Typography>
        </Box>
        {timeSlots.map((slot) => (
          <Box
            key={slot.time}
            sx={{
              height: 40,
              display: "flex",
              alignItems: "center",
              borderBottom: 1,
              borderColor: "divider",
              px: 1,
              backgroundColor: isDarkMode ? theme.palette.background.paper : "transparent",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              {slot.time}
            </Typography>
          </Box>
        ))}
      </Grid>

      <Grid size={{ xs: 11 }} sx={{ position: "relative" }}>
        <CurrentTimeIndicator date={currentDate} height={40} timeSlots={timeSlots} currentTime={currentTime} />

        <Box
          sx={{
            position: "sticky",
            top: 0,
            background: isDarkMode
              ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[700]} 100%)`
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            zIndex: 30,
            py: 0.5,
            borderBottom: 2,
            borderColor: "primary.main",
            mb: 0.5,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          <Typography
            variant="subtitle2"
            align="center"
            sx={{
              fontSize: "0.8rem",
              color: isDarkMode ? theme.palette.primary.light : theme.palette.text.primary,
            }}
          >
            {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </Typography>
        </Box>

        {timeSlots.map((slot) => {
          const slotAppointments = getAppointmentsForSlot(currentDate, slot.hour, slot.minute);
          const slotBreaks = getBreaksForSlot(currentDate, slot.hour, slot.minute);
          const withinWorkingHours = isWithinWorkingHours(currentDate, slot.hour, slot.minute);
          const isElapsed = isTimeSlotElapsed(currentDate, slot.hour, slot.minute);
          const isDuringBreak = isTimeSlotDuringBreak(currentDate, slot.hour, slot.minute);
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
                cursor: withinWorkingHours && !isDuringBreak ? (slotAppointments.length > 0 ? "default" : "pointer") : "not-allowed",
                "&:hover":
                  withinWorkingHours && slotAppointments.length === 0
                    ? {
                        backgroundColor: getHoverBackgroundColor(currentDate, slot.hour, slot.minute),
                        "& .slot-hint": { opacity: isDuringBreak ? 0 : 1 },
                      }
                    : {},
                opacity: !withinWorkingHours ? 0.5 : 1,
                position: "relative",
                userSelect: "none",
              }}
              onClick={() => handleSlotClick(currentDate, slot.hour, slot.minute)}
              onDoubleClick={() => handleSlotDoubleClick(currentDate, slot.hour, slot.minute)}
            >
              {!withinWorkingHours && !slotAppointments.length && !slotBreaks.length && (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%", color: "text.disabled" }}>
                  <Block fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" sx={{ fontSize: "0.6rem" }}>
                    Outside hours
                  </Typography>
                </Box>
              )}

              {isDuringBreak && slotAppointments.length === 0 && (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%", color: "warning.main" }}>
                  <Typography variant="caption" sx={{ fontSize: "0.6rem" }}>
                    🚫 Break Time
                  </Typography>
                </Box>
              )}

              {withinWorkingHours && !isDuringBreak && slotAppointments.length === 0 && slotBreaks.length === 0 && (
                <Typography
                  variant="caption"
                  className="slot-hint"
                  sx={{
                    fontSize: "0.6rem",
                    color: isDarkMode ? theme.palette.text.secondary : "text.secondary",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    fontStyle: "italic",
                    fontWeight: isDarkMode ? "500" : "normal",
                  }}
                >
                  {isElapsed ? "Click for elapsed booking" : "Double-click to book"}
                </Typography>
              )}

              {/* Render Breaks */}
              {slotBreaks.map((breakItem) => {
                const breakStartTime = new Date(breakItem.bLStartTime);
                const breakStartMinutes = breakStartTime.getHours() * 60 + breakStartTime.getMinutes();
                const slotStartMinutes = slot.hour * 60 + slot.minute;
                const nextSlotStartMinutes = slotStartMinutes + 15;

                if (breakStartMinutes >= slotStartMinutes && breakStartMinutes < nextSlotStartMinutes) {
                  const slotHeight = 40;
                  const breakDuration = new Date(breakItem.bLEndTime).getTime() - new Date(breakItem.bLStartTime).getTime();
                  const durationInMinutes = breakDuration / (1000 * 60);
                  const durationInSlots = durationInMinutes / 15;
                  const breakHeight = Math.max(durationInSlots * slotHeight - 2, durationInMinutes <= 15 ? 18 : 24);

                  const minuteOffset = breakStartMinutes - slotStartMinutes;
                  const topOffset = (minuteOffset / 15) * slotHeight;

                  const layoutInfo = breakLayout.find((layout) => layout.breakItem.bLID === breakItem.bLID);
                  const column = layoutInfo?.column || 0;
                  const totalColumns = layoutInfo?.totalColumns || 1;

                  return (
                    <Box
                      key={`break-${breakItem.bLID}`}
                      sx={{
                        position: "absolute",
                        top: `${topOffset}px`,
                        left: "4px",
                        right: "4px",
                        height: `${breakHeight}px`,
                        zIndex: 10,
                      }}
                    ></Box>
                  );
                }
                return null;
              })}

              {/* Render Appointments */}
              {slotAppointments.map((appointment) => {
                const appointmentStart = new Date(appointment.abTime);
                const appointmentStartMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
                const slotStartMinutes = slot.hour * 60 + slot.minute;
                const nextSlotStartMinutes = slotStartMinutes + 15;

                if (appointmentStartMinutes >= slotStartMinutes && appointmentStartMinutes < nextSlotStartMinutes) {
                  const slotHeight = 40;
                  const durationInSlots = appointment.abDuration / 15;
                  const appointmentHeight = Math.max(durationInSlots * slotHeight - 2, appointment.abDuration <= 15 ? 18 : 24);

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
                        zIndex: 20, // Higher than breaks
                      }}
                    >
                      <AppointmentCard
                        appointment={appointment}
                        showDetails={true}
                        column={column}
                        totalColumns={totalColumns}
                        onClick={onAppointmentClick}
                        isElapsed={isElapsed}
                      />
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
