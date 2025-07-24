// src/pages/frontOffice/Appointment/components/WeekView.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { HospWorkHoursDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { Box, Grid, Typography, useTheme } from "@mui/material";
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
  };

  const isTimeSlotElapsed = (date: Date, hour: number, minute: number) => {
    const slotDate = new Date(date);
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate < currentTime;
  };

  const getSlotBackgroundColor = (date: Date, hour: number, minute: number) => {
    const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
    const isElapsed = isTimeSlotElapsed(date, hour, minute);

    if (!withinWorkingHours) {
      return isDarkMode ? (isElapsed ? theme.palette.grey[800] : theme.palette.grey[900]) : isElapsed ? "#eeeeee" : "#f5f5f5";
    }

    if (isElapsed) {
      return isDarkMode ? theme.palette.grey[700] : "#f0f0f0";
    }

    return "transparent";
  };

  const getHoverBackgroundColor = (date: Date, hour: number, minute: number) => {
    const isElapsed = isTimeSlotElapsed(date, hour, minute);

    if (isDarkMode) {
      return isElapsed ? theme.palette.grey[600] : theme.palette.grey[700];
    } else {
      return isElapsed ? "#f5f5f5" : "#f0f0f0";
    }
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

  return (
    <Grid container spacing={0.5}>
      <Grid size={{ xs: 1.5 }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            background: isDarkMode ? theme.palette.background.paper : "white",
            zIndex: 10,
            py: 0.5,
            borderBottom: 1,
            borderColor: "divider",
            mb: 0.5,
            boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="caption"
            align="center"
            sx={{
              fontSize: "0.7rem",
              color: theme.palette.text.primary,
            }}
          >
            Time
          </Typography>
        </Box>
        {timeSlots.map((slot) => (
          <Box
            key={slot.time}
            sx={{
              height: 30,
              display: "flex",
              alignItems: "center",
              borderBottom: 1,
              borderColor: "divider",
              px: 0.5,
              backgroundColor: isDarkMode ? theme.palette.background.paper : "transparent",
            }}
          >
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
            <CurrentTimeIndicator date={date} height={30} timeSlots={timeSlots} currentTime={currentTime} />

            <Box
              sx={{
                position: "sticky",
                top: 0,
                background: isDarkMode ? theme.palette.background.paper : "white",
                zIndex: 10,
                py: 0.5,
                borderBottom: 1,
                borderColor: "divider",
                mb: 0.5,
                boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="caption"
                align="center"
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  color: theme.palette.text.primary,
                }}
              >
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </Typography>
              <Typography
                variant="caption"
                align="center"
                sx={{
                  fontSize: "0.6rem",
                  color: "text.secondary",
                  display: "block",
                }}
              >
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
                    cursor: withinWorkingHours ? (slotAppointments.length > 0 ? "default" : "pointer") : "not-allowed",
                    "&:hover":
                      withinWorkingHours && slotAppointments.length === 0
                        ? {
                            backgroundColor: getHoverBackgroundColor(date, slot.hour, slot.minute),
                            "& .slot-hint": { opacity: 1 },
                          }
                        : {},
                    opacity: !withinWorkingHours ? 0.5 : 1,
                    position: "relative",
                    userSelect: "none",
                  }}
                  onClick={() => handleSlotClick(date, slot.hour, slot.minute)}
                  onDoubleClick={() => handleSlotDoubleClick(date, slot.hour, slot.minute)}
                >
                  {withinWorkingHours && slotAppointments.length === 0 && (
                    <Typography
                      variant="caption"
                      className="slot-hint"
                      sx={{
                        fontSize: "0.5rem",
                        color: isDarkMode ? theme.palette.text.secondary : "text.secondary",
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
                        fontWeight: isDarkMode ? "500" : "normal",
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
                          sx={{
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
  );
};
