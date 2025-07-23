// src/pages/frontOffice/Appointment/components/WeekView.tsx
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { AppointmentData, TimeSlot, WorkHoursData } from "../types";
import { calculateAppointmentLayout } from "../utils/appointmentUtils";
import { AppointmentCard } from "./AppointmentCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface WeekViewProps {
  currentDate: Date;
  timeSlots: TimeSlot[];
  appointments: AppointmentData[];
  workHours: WorkHoursData[];
  currentTime: Date;
  getWeekDates: (date: Date) => Date[];
  onSlotDoubleClick: (date: Date, hour: number, minute: number) => void;
  onAppointmentClick: (appointment: AppointmentData) => void;
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
      return isElapsed ? "#eeeeee" : "#f5f5f5";
    }

    if (isElapsed) {
      return "#f0f0f0"; // Lighter background for better appointment visibility
    }

    return "transparent";
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

    // Only handle single clicks for elapsed slots (to show confirmation)
    if (withinWorkingHours && isElapsed && slotAppointments.length === 0) {
      onElapsedSlotConfirmation(date, hour, minute);
    }
  };

  const handleSlotDoubleClick = (date: Date, hour: number, minute: number) => {
    const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
    const slotAppointments = getAppointmentsForSlot(date, hour, minute);

    // Allow double-click booking for any working hours slot without appointments
    if (withinWorkingHours && slotAppointments.length === 0) {
      onSlotDoubleClick(date, hour, minute);
    }
  };

  return (
    <Grid container spacing={0.5}>
      <Grid size={{ xs: 1.5 }}>
        {/* Fixed sticky header positioning */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 10, // Higher z-index to ensure it stays above content
            py: 0.5,
            borderBottom: 1,
            borderColor: "divider",
            mb: 0.5,
          }}
        >
          <Typography variant="caption" align="center" sx={{ fontSize: "0.7rem" }}>
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

            {/* Fixed sticky header positioning */}
            <Box
              sx={{
                position: "sticky",
                top: 0,
                background: "white",
                zIndex: 10, // Higher z-index to ensure it stays above content
                py: 0.5,
                borderBottom: 1,
                borderColor: "divider",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" align="center" sx={{ fontSize: "0.7rem", fontWeight: "bold" }}>
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
                            backgroundColor: isElapsed ? "#f5f5f5" : "#f0f0f0",
                            "& .slot-hint": { opacity: 1 },
                          }
                        : {},
                    opacity: !withinWorkingHours ? 0.5 : 1, // Removed opacity reduction for elapsed slots
                    position: "relative",
                    userSelect: "none",
                  }}
                  onClick={() => handleSlotClick(date, slot.hour, slot.minute)}
                  onDoubleClick={() => handleSlotDoubleClick(date, slot.hour, slot.minute)}
                >
                  {/* Hover hint for booking */}
                  {withinWorkingHours && slotAppointments.length === 0 && (
                    <Typography
                      variant="caption"
                      className="slot-hint"
                      sx={{
                        fontSize: "0.5rem",
                        color: "text.secondary",
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
                      // Enhanced minimum height for better visibility in week view
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
                            zIndex: 15, // Higher z-index to ensure appointments are above slot backgrounds
                          }}
                        >
                          <AppointmentCard
                            appointment={appointment}
                            showDetails={appointment.abDuration > 15} // Show details only for longer appointments in week view
                            column={column}
                            totalColumns={totalColumns}
                            onClick={onAppointmentClick}
                            isElapsed={isElapsed} // Pass elapsed state for better styling
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
