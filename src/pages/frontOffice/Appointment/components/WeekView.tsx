// src/pages/frontOffice/Appointment/components/WeekView.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { HospWorkHoursDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useRef } from "react";
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
  shouldScrollToTime?: boolean; // New prop to trigger scrolling
  scrollTrigger?: number; // New prop to trigger scroll on value change
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
  shouldScrollToTime = true,
  scrollTrigger = 0,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const weekDates = getWeekDates(currentDate);

  // Ref for the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll functionality
  const getScrollPosition = useCallback(() => {
    const isCurrentWeek = weekDates.some((date) => date.toDateString() === new Date().toDateString());
    const slotHeight = 30; // Height of each 15-minute slot in pixels

    if (isCurrentWeek && shouldScrollToTime) {
      // Scroll to current time
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = Math.floor(now.getMinutes() / 15) * 15; // Round to nearest 15-minute interval
      const totalMinutesFromMidnight = currentHour * 60 + currentMinute;
      const slotIndex = totalMinutesFromMidnight / 15;

      // Add some offset to show context before current time
      const offsetSlots = 2; // Show 30 minutes before current time
      const targetSlotIndex = Math.max(0, slotIndex - offsetSlots);

      return targetSlotIndex * slotHeight;
    } else {
      // Scroll to start of work hours for the first working day of the week
      const firstWorkingDay = weekDates.find((date) => {
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
        return workHours.some((wh) => wh.daysDesc.toUpperCase() === dayName && wh.rActiveYN === "Y" && wh.startTime);
      });

      if (firstWorkingDay) {
        const dayName = firstWorkingDay.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
        const dayWorkHours = workHours.find((wh) => wh.daysDesc.toUpperCase() === dayName && wh.rActiveYN === "Y" && wh.startTime);

        if (dayWorkHours && dayWorkHours.startTime) {
          const startTime = new Date(dayWorkHours.startTime);
          const startHour = startTime.getHours();
          const startMinute = Math.floor(startTime.getMinutes() / 15) * 15;
          const totalMinutesFromMidnight = startHour * 60 + startMinute;
          const slotIndex = totalMinutesFromMidnight / 15;

          // Add small offset to show some context before work starts
          const offsetSlots = 1;
          const targetSlotIndex = Math.max(0, slotIndex - offsetSlots);

          return targetSlotIndex * slotHeight;
        }
      }
    }

    // Default: scroll to 8 AM if no work hours defined
    const defaultStartHour = 8;
    const defaultSlotIndex = (defaultStartHour * 60) / 15;
    return defaultSlotIndex * slotHeight;
  }, [weekDates, workHours, shouldScrollToTime]);

  const scrollToPosition = useCallback((position: number, smooth: boolean = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: position,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Auto-scroll effect - triggered on date change, provider change, or scroll trigger
  useEffect(() => {
    if (shouldScrollToTime && scrollContainerRef.current) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        const scrollPosition = getScrollPosition();
        scrollToPosition(scrollPosition, true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentDate, shouldScrollToTime, getScrollPosition, scrollToPosition, scrollTrigger]);

  // Initial scroll on mount
  useEffect(() => {
    if (shouldScrollToTime && scrollContainerRef.current) {
      // Initial scroll without animation for immediate positioning
      const timer = setTimeout(() => {
        const scrollPosition = getScrollPosition();
        scrollToPosition(scrollPosition, false);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, []);

  const isWithinWorkingHours = useCallback(
    (date: Date, hour: number, minute: number) => {
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
    },
    [workHours]
  );

  const isTimeSlotElapsed = useCallback(
    (date: Date, hour: number, minute: number) => {
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);
      return slotDate < currentTime;
    },
    [currentTime]
  );

  const getSlotStyles = useCallback(
    (date: Date, hour: number, minute: number) => {
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
    },
    [isWithinWorkingHours, isTimeSlotElapsed, theme, isDarkMode]
  );

  const getAppointmentsForDate = useCallback(
    (date: Date) => {
      return appointments.filter((apt) => {
        const aptDate = new Date(apt.abDate);
        return aptDate.getDate() === date.getDate() && aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();
      });
    },
    [appointments]
  );

  const getAppointmentsForSlot = useCallback(
    (date: Date, hour: number, minute: number) => {
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
    },
    [appointments]
  );

  const handleSlotClick = useCallback(
    (date: Date, hour: number, minute: number) => {
      const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
      const isElapsed = isTimeSlotElapsed(date, hour, minute);
      const slotAppointments = getAppointmentsForSlot(date, hour, minute);

      if (withinWorkingHours && isElapsed && slotAppointments.length === 0) {
        onElapsedSlotConfirmation(date, hour, minute);
      }
    },
    [isWithinWorkingHours, isTimeSlotElapsed, getAppointmentsForSlot, onElapsedSlotConfirmation]
  );

  const handleSlotDoubleClick = useCallback(
    (date: Date, hour: number, minute: number) => {
      const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
      const slotAppointments = getAppointmentsForSlot(date, hour, minute);

      if (withinWorkingHours && slotAppointments.length === 0) {
        onSlotDoubleClick(date, hour, minute);
      }
    },
    [isWithinWorkingHours, getAppointmentsForSlot, onSlotDoubleClick]
  );

  const getDayWorkHours = useCallback(
    (date: Date) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      const dayWorkHours = workHours.filter((wh) => wh.daysDesc.toUpperCase() === dayName && wh.rActiveYN === "Y");

      if (dayWorkHours.length === 0) {
        return "Closed";
      }

      const startTime = new Date(dayWorkHours[0].startTime);
      const endTime = new Date(dayWorkHours[0].endTime);
      return `${startTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${endTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    },
    [workHours]
  );

  return (
    <Box>
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
      <Box
        ref={scrollContainerRef}
        sx={{
          maxHeight: "calc(100vh - 350px)", // Adjust based on your layout
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c4c4c4",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "#a8a8a8",
            },
          },
        }}
      >
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
    </Box>
  );
};
