// src/pages/frontOffice/Appointment/components/DayView.tsx
import { Block } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { AppointmentData, TimeSlot, WorkHoursData } from "../types";
import { calculateAppointmentLayout } from "../utils/appointmentUtils";
import { AppointmentCard } from "./AppointmentCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface DayViewProps {
  currentDate: Date;
  timeSlots: TimeSlot[];
  appointments: AppointmentData[];
  workHours: WorkHoursData[];
  currentTime: Date;
  onSlotDoubleClick: (date: Date, hour: number, minute: number) => void;
  onAppointmentClick: (appointment: AppointmentData) => void;
  onElapsedSlotConfirmation: (date: Date, hour: number, minute: number) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  timeSlots,
  appointments,
  workHours,
  currentTime,
  onSlotDoubleClick,
  onAppointmentClick,
  onElapsedSlotConfirmation,
}) => {
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

  const dayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.abDate);
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
    return aptDateOnly.getTime() === currentDateOnly.getTime();
  });

  const appointmentLayout = calculateAppointmentLayout(currentDate, dayAppointments);

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
    <Grid container spacing={1}>
      <Grid size={{ xs: 1 }}>
        {/* Fixed sticky header positioning */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            zIndex: 30, // Much higher z-index to ensure it stays above all content
            py: 0.5,
            borderBottom: 2,
            borderColor: "primary.main",
            mb: 0.5,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="subtitle2" align="center" sx={{ fontSize: "0.8rem", fontWeight: "bold", color: "primary.main" }}>
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

        {/* Fixed sticky header positioning */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            zIndex: 30, // Much higher z-index to ensure it stays above all content
            py: 0.5,
            borderBottom: 2,
            borderColor: "primary.main",
            mb: 0.5,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
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
              onClick={() => handleSlotClick(currentDate, slot.hour, slot.minute)}
              onDoubleClick={() => handleSlotDoubleClick(currentDate, slot.hour, slot.minute)}
            >
              {!withinWorkingHours && !slotAppointments.length && (
                <Box sx={{ display: "flex", alignItems: "center", height: "100%", color: "text.disabled" }}>
                  <Block fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" sx={{ fontSize: "0.6rem" }}>
                    Outside hours
                  </Typography>
                </Box>
              )}

              {withinWorkingHours && slotAppointments.length === 0 && (
                <Typography
                  variant="caption"
                  className="slot-hint"
                  sx={{
                    fontSize: "0.6rem",
                    color: "text.secondary",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    fontStyle: "italic",
                  }}
                >
                  {isElapsed ? "Click for elapsed booking" : "Double-click to book"}
                </Typography>
              )}

              {slotAppointments.map((appointment) => {
                const appointmentStart = new Date(appointment.abTime);
                const appointmentStartMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
                const slotStartMinutes = slot.hour * 60 + slot.minute;
                const nextSlotStartMinutes = slotStartMinutes + 15;

                if (appointmentStartMinutes >= slotStartMinutes && appointmentStartMinutes < nextSlotStartMinutes) {
                  const slotHeight = 40;
                  const durationInSlots = appointment.abDuration / 15;
                  // Enhanced minimum height for better visibility of short appointments
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
                        zIndex: 15, // Higher z-index to ensure appointments are above slot backgrounds
                      }}
                    >
                      <AppointmentCard
                        appointment={appointment}
                        showDetails={true}
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
    </Grid>
  );
};
