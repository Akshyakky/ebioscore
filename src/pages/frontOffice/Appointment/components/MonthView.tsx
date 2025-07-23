// src/frontOffice/components/MonthView.tsx
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import React from "react";
import { AppointmentData } from "../types";
import { getStatusColor } from "../utils/appointmentUtils";

interface MonthViewProps {
  currentDate: Date;
  appointments: AppointmentData[];
  getMonthDates: (date: Date) => Date[];
  onSlotClick: () => void;
  onAppointmentClick: (appointment: AppointmentData) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, appointments, getMonthDates, onSlotClick, onAppointmentClick }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const monthDates = getMonthDates(currentDate);
  const weeks = [];
  for (let i = 0; i < monthDates.length; i += 7) {
    weeks.push(monthDates.slice(i, i + 7));
  }

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.abDate);
      return aptDate.getDate() === date.getDate() && aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();
    });
  };

  const getDayBackgroundColor = (date: Date, isCurrentMonth: boolean, isToday: boolean, isPastDate: boolean) => {
    if (!isCurrentMonth) {
      return isDarkMode ? theme.palette.grey[900] : "#f5f5f5";
    }

    if (isToday) {
      return isDarkMode ? theme.palette.primary.dark : "#e3f2fd";
    }

    if (isPastDate) {
      return isDarkMode ? theme.palette.grey[800] : "#eeeeee";
    }

    return isDarkMode ? theme.palette.background.paper : "white";
  };

  const getHoverBackgroundColor = (isPastDate: boolean) => {
    if (isPastDate) return undefined; // No hover for past dates

    return isDarkMode ? theme.palette.grey[700] : "#f0f0f0";
  };

  const getDayTextColor = (isCurrentMonth: boolean, isPastDate: boolean, isToday: boolean) => {
    if (!isCurrentMonth) {
      return isDarkMode ? theme.palette.text.disabled : "text.disabled";
    }

    if (isPastDate) {
      return isDarkMode ? theme.palette.text.secondary : "text.secondary";
    }

    if (isToday) {
      return isDarkMode ? theme.palette.primary.light : "text.primary";
    }

    return isDarkMode ? theme.palette.text.primary : "text.primary";
  };

  const getAppointmentBackgroundColor = (statusColor: string) => {
    const appointmentColors = {
      success: isDarkMode ? "#2e7d32" : "#4caf50",
      warning: isDarkMode ? "#ed6c02" : "#ff9800",
      error: isDarkMode ? "#d32f2f" : "#f44336",
      default: isDarkMode ? "#1976d2" : "#2196f3",
    };

    return appointmentColors[statusColor as keyof typeof appointmentColors] || appointmentColors.default;
  };

  const getAppointmentTextColor = () => {
    return isDarkMode ? "#ffffff" : "white";
  };

  return (
    <Box>
      <Grid container spacing={0.5} sx={{ mb: 1 }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <Grid size={{ xs: 12 / 7 }} key={day}>
            <Typography
              variant="subtitle2"
              align="center"
              sx={{
                fontSize: "0.8rem",
                fontWeight: "bold",
                py: 0.5,
                color: theme.palette.text.primary,
                backgroundColor: isDarkMode ? theme.palette.grey[800] : theme.palette.grey[100],
                borderRadius: 1,
              }}
            >
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
                    backgroundColor: getDayBackgroundColor(date, isCurrentMonth, isToday, isPastDate),
                    cursor: isPastDate ? "default" : "pointer",
                    "&:hover": !isPastDate
                      ? {
                          backgroundColor: getHoverBackgroundColor(isPastDate),
                        }
                      : {},
                    overflow: "hidden",
                    opacity: isPastDate ? 0.7 : 1,
                    border: isDarkMode ? `1px solid ${theme.palette.grey[700]}` : "1px solid #e0e0e0",
                    boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => !isPastDate && onSlotClick()}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: isToday ? "bold" : "normal",
                      color: getDayTextColor(isCurrentMonth, isPastDate, isToday),
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {date.getDate()}
                  </Typography>

                  <Box sx={{ maxHeight: 70, overflow: "hidden" }}>
                    {dayAppointments.slice(0, 3).map((appointment) => {
                      const statusColor = getStatusColor(appointment.abStatus);
                      const backgroundColor = getAppointmentBackgroundColor(statusColor);
                      const textColor = getAppointmentTextColor();

                      return (
                        <Box
                          key={appointment.abID}
                          sx={{
                            mb: 0.25,
                            p: 0.25,
                            borderRadius: 0.5,
                            fontSize: "0.6rem",
                            backgroundColor,
                            color: textColor,
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.02)",
                              boxShadow: isDarkMode ? "0 2px 4px rgba(0,0,0,0.5)" : "0 2px 4px rgba(0,0,0,0.2)",
                            },
                            boxShadow: isDarkMode ? "0 1px 2px rgba(0,0,0,0.3)" : "0 1px 2px rgba(0,0,0,0.1)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.6rem",
                              color: textColor,
                              fontWeight: isDarkMode ? "500" : "normal",
                              textShadow: isDarkMode ? "0 1px 1px rgba(0,0,0,0.3)" : "none",
                            }}
                          >
                            {new Date(appointment.abTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            {appointment.abFName}
                          </Typography>
                        </Box>
                      );
                    })}
                    {dayAppointments.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.6rem",
                          color: isDarkMode ? theme.palette.text.secondary : "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
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
