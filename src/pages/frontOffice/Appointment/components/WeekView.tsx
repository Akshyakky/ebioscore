// src/pages/frontOffice/Appointment/components/WeekView.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { HospWorkHoursDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import React from "react";
import { TimeSlot } from "../types";
import { calculateAppointmentLayout } from "../utils/appointmentUtils";
import { AppointmentCard } from "./AppointmentCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface WeekViewProps {
  currentDate: Date;
  timeSlots: TimeSlot[];
  appointments: AppointBookingDto[];
  workHours: HospWorkHoursDto[];
  currentTime: Date;
  getWeekDates: (date: Date) => Date[];
  onSlotDoubleClick: (date: Date, hour: number, minute: number) => void;
  onAppointmentClick: (appointment: AppointBookingDto) => void;
  onElapsedSlotConfirmation: (date: Date, hour: number, minute: number) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  timeSlots,
  appointments,
  workHours,
  currentTime,
  getWeekDates,
  onSlotDoubleClick,
  onAppointmentClick,
  onElapsedSlotConfirmation,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const weekDates = getWeekDates(currentDate);

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

  const getSlotStyles = (date: Date, hour: number, minute: number) => {
    const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
    const isElapsed = isTimeSlotElapsed(date, hour, minute);

    let backgroundColor = "transparent";
    let opacity = 1;
    let cursor = "default";

    if (!withinWorkingHours) {
      backgroundColor = isDarkMode ? (isElapsed ? theme.palette.grey[800] : theme.palette.grey[900]) : isElapsed ? "#eeeeee" : "#f5f5f5";
      opacity = 0.5;
      cursor = "not-allowed";
    } else if (isElapsed) {
      backgroundColor = isDarkMode ? theme.palette.grey[700] : "#f0f0f0";
      cursor = "pointer";
    } else {
      cursor = "pointer";
    }

    return {
      height: 30,
      borderBottom: `1px solid ${theme.palette.divider}`,
      borderRight: `1px solid ${theme.palette.divider}`,
      backgroundColor,
      opacity,
      cursor,
      padding: theme.spacing(0.25),
      position: "relative" as const,
      userSelect: "none" as const,
    };
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.abDate);
      return aptDate.getDate() === date.getDate() && aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();
    });
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

  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
    const isElapsed = isTimeSlotElapsed(date, hour, minute);
    const slotAppointments = getAppointmentsForSlot(date, hour, minute);

    if (withinWorkingHours && isElapsed && slotAppointments.length === 0) {
      onElapsedSlotConfirmation(date, hour, minute);
    }
  };

  const handleSlotDoubleClick = (date: Date, hour: number, minute: number) => {
    const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
    const slotAppointments = getAppointmentsForSlot(date, hour, minute);

    if (withinWorkingHours && slotAppointments.length === 0) {
      onSlotDoubleClick(date, hour, minute);
    }
  };

  const getDayWorkHours = (date: Date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const dayWorkHours = workHours.filter((wh) => wh.daysDesc.toUpperCase() === dayName && wh.rActiveYN === "Y");

    if (dayWorkHours.length === 0) {
      return "Closed";
    }

    const startTime = new Date(dayWorkHours[0].startTime);
    const endTime = new Date(dayWorkHours[0].endTime);
    return `${startTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${endTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  };

  // Calculate week range for header
  const getWeekRange = () => {
    const startDate = weekDates[0];
    const endDate = weekDates[6];

    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString("en-US", { month: "long" })} ${startDate.getDate()} - ${endDate.getDate()}, ${startDate.getFullYear()}`;
    } else {
      return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}, ${endDate.getFullYear()}`;
    }
  };

  const getTotalAppointmentsForWeek = () => {
    return weekDates.reduce((total, date) => {
      return total + getAppointmentsForDate(date).length;
    }, 0);
  };

  return (
    <Box>
      {/* Week View Header */}
      <Paper
        variant="outlined"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: isDarkMode ? theme.palette.background.paper : "white",
          borderBottom: `2px solid ${theme.palette.divider}`,
          marginBottom: 1,
        }}
      ></Paper>

      {/* Day Headers */}
      <Paper
        variant="outlined"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 25,
          backgroundColor: isDarkMode ? theme.palette.background.paper : "white",
          borderBottom: `1px solid ${theme.palette.divider}`,
          marginBottom: 0.5,
        }}
      >
        <Grid container spacing={0.5}>
          <Grid size={1.5}>
            <Box
              sx={{
                padding: 1,
                textAlign: "center",
                backgroundColor: isDarkMode ? theme.palette.grey[800] : theme.palette.grey[100],
                borderRight: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight="bold">
                TIME
              </Typography>
            </Box>
          </Grid>

          {weekDates.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const workHours = getDayWorkHours(date);

            return (
              <Grid size={1.5} key={index}>
                <Box
                  sx={{
                    padding: 1,
                    textAlign: "center",
                    backgroundColor: isToday ? (isDarkMode ? theme.palette.primary.dark : theme.palette.primary.light) : isDarkMode ? theme.palette.background.paper : "white",
                    borderRight: index < weekDates.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                    borderLeft: index === 0 ? `1px solid ${theme.palette.divider}` : "none",
                    minHeight: 60,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" fontWeight="bold" color={isToday ? "primary.contrastText" : "text.primary"} sx={{ fontSize: "0.7rem", lineHeight: 1.2 }}>
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color={isToday ? "primary.contrastText" : "text.primary"} sx={{ fontSize: "1rem", lineHeight: 1.2, margin: 0 }}>
                    {date.getDate()}
                  </Typography>
                  <Typography variant="caption" color={isToday ? "primary.contrastText" : "text.secondary"} sx={{ fontSize: "0.55rem", lineHeight: 1, marginTop: 0.25 }}>
                    {workHours}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Week View Content */}
      <Grid container spacing={0.5}>
        <Grid size={1.5}>
          {timeSlots.map((slot) => (
            <Box
              key={slot.time}
              style={{
                height: 30,
                display: "flex",
                alignItems: "center",
                borderBottom: `1px solid ${theme.palette.divider}`,
                padding: theme.spacing(0, 0.5),
                backgroundColor: isDarkMode ? theme.palette.background.paper : "transparent",
              }}
            >
              <Typography variant="caption" color="text.secondary" style={{ fontSize: "0.6rem" }}>
                {slot.time}
              </Typography>
            </Box>
          ))}
        </Grid>

        {weekDates.map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date);
          const appointmentLayout = calculateAppointmentLayout(date, dayAppointments);

          return (
            <Grid size={1.5} key={index} style={{ position: "relative" }}>
              <CurrentTimeIndicator date={date} height={30} timeSlots={timeSlots} currentTime={currentTime} />

              {timeSlots.map((slot) => {
                const slotAppointments = getAppointmentsForSlot(date, slot.hour, slot.minute);
                const withinWorkingHours = isWithinWorkingHours(date, slot.hour, slot.minute);
                const isElapsed = isTimeSlotElapsed(date, slot.hour, slot.minute);
                const slotStyles = getSlotStyles(date, slot.hour, slot.minute);

                return (
                  <Box
                    key={`${index}-${slot.time}`}
                    style={slotStyles}
                    onClick={() => handleSlotClick(date, slot.hour, slot.minute)}
                    onDoubleClick={() => handleSlotDoubleClick(date, slot.hour, slot.minute)}
                    sx={{
                      "&:hover":
                        withinWorkingHours && slotAppointments.length === 0
                          ? {
                              backgroundColor: isDarkMode ? (isElapsed ? theme.palette.grey[600] : theme.palette.grey[700]) : isElapsed ? "#f5f5f5" : "#f0f0f0",
                              "& .slot-hint": { opacity: 1 },
                            }
                          : {},
                    }}
                  >
                    {withinWorkingHours && slotAppointments.length === 0 && (
                      <Typography
                        variant="caption"
                        className="slot-hint"
                        color={isDarkMode ? "text.secondary" : "text.secondary"}
                        style={{
                          fontSize: "0.5rem",
                          opacity: 0,
                          transition: "opacity 0.2s",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          pointerEvents: "none",
                          fontStyle: "italic",
                          textAlign: "center",
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                          fontWeight: isDarkMode ? 500 : "normal",
                        }}
                      >
                        {isElapsed ? "Click" : "2x Click"}
                      </Typography>
                    )}

                    {slotAppointments.map((appointment) => {
                      const appointmentStart = new Date(appointment.abTime);
                      const appointmentStartMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
                      const slotStartMinutes = slot.hour * 60 + slot.minute;
                      const nextSlotStartMinutes = slotStartMinutes + 15;

                      if (appointmentStartMinutes >= slotStartMinutes && appointmentStartMinutes < nextSlotStartMinutes) {
                        const slotHeight = 30;
                        const durationInSlots = appointment.abDuration / 15;
                        const appointmentHeight = Math.max(durationInSlots * slotHeight - 1, appointment.abDuration <= 15 ? 16 : 20);

                        const minuteOffset = appointmentStartMinutes - slotStartMinutes;
                        const topOffset = (minuteOffset / 15) * slotHeight;

                        const layoutInfo = appointmentLayout.find((layout) => layout.appointment.abID === appointment.abID);
                        const column = layoutInfo?.column || 0;
                        const totalColumns = layoutInfo?.totalColumns || 1;

                        return (
                          <Box
                            key={appointment.abID}
                            style={{
                              position: "absolute",
                              top: `${topOffset}px`,
                              left: "2px",
                              right: "2px",
                              height: `${appointmentHeight}px`,
                              zIndex: 15,
                            }}
                          >
                            <AppointmentCard
                              appointment={appointment}
                              showDetails={appointment.abDuration > 15}
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
          );
        })}
      </Grid>
    </Box>
  );
};
