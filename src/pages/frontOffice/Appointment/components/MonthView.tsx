// src/frontOffice/components/MonthView.tsx
import { Box, Grid, Paper, Typography } from "@mui/material";
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
                    backgroundColor: !isCurrentMonth ? "#f5f5f5" : isPastDate ? "#eeeeee" : isToday ? "#e3f2fd" : "white",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f0f0f0" },
                    overflow: "hidden",
                    opacity: isPastDate ? 0.7 : 1,
                  }}
                  onClick={() => !isPastDate && onSlotClick()}
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
                    {dayAppointments.slice(0, 3).map((appointment) => {
                      const statusColor = getStatusColor(appointment.abStatus);
                      const backgroundColor = statusColor === "success" ? "#4caf50" : statusColor === "warning" ? "#ff9800" : statusColor === "error" ? "#f44336" : "#2196f3";

                      return (
                        <Box
                          key={appointment.abID}
                          sx={{
                            mb: 0.25,
                            p: 0.25,
                            borderRadius: 0.5,
                            fontSize: "0.6rem",
                            backgroundColor,
                            color: "white",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "white" }}>
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
