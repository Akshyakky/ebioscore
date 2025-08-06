// src/frontOffice/components/MonthView.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { Box, Card, CardContent, Grid, PaletteColor, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import { getStatusColor } from "../utils/appointmentUtils";

interface MonthViewProps {
  currentDate: Date;
  appointments: AppointBookingDto[];
  getMonthDates: (date: Date) => Date[];
  onSlotClick: () => void;
  onAppointmentClick: (appointment: AppointBookingDto) => void;
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

  const getDayCardProps = (date: Date, isCurrentMonth: boolean, isToday: boolean, isPastDate: boolean) => {
    let backgroundColor = "background.paper";
    let opacity = 1;
    let cursor = "pointer";
    let border = 1;
    let borderColor = "divider";

    if (!isCurrentMonth) {
      backgroundColor = isDarkMode ? "grey.900" : "grey.100";
      opacity = 0.6;
    }

    if (isToday) {
      backgroundColor = isDarkMode ? "primary.dark" : "primary.50";
      borderColor = "primary.main";
      border = 2;
    }

    if (isPastDate) {
      backgroundColor = isDarkMode ? "grey.800" : "grey.50";
      opacity = 0.7;
      cursor = "default";
    }

    return {
      backgroundColor,
      opacity,
      cursor,
      border,
      borderColor,
      transition: "all 0.2s ease-in-out",
      "&:hover": !isPastDate
        ? {
            backgroundColor: isDarkMode ? "grey.700" : "grey.100",
            transform: "scale(1.02)",
          }
        : {},
    };
  };

  const getDayTextColor = (isCurrentMonth: boolean, isPastDate: boolean, isToday: boolean) => {
    if (!isCurrentMonth) {
      return "text.disabled";
    }

    if (isPastDate) {
      return "text.secondary";
    }

    if (isToday) {
      return isDarkMode ? "primary.light" : "primary.main";
    }

    return "text.primary";
  };

  const getAppointmentCardColor = (statusColor: string) => {
    const colors = {
      success: "success.main",
      warning: "warning.main",
      error: "error.main",
      default: "primary.main",
    };

    return colors[statusColor as keyof typeof colors] || colors.default;
  };

  return (
    <Box>
      {weeks.map((week, weekIndex) => (
        <Grid container spacing={0.5} key={weekIndex} marginBottom={0.5}>
          {week.map((date, dayIndex) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = new Date().toDateString() === date.toDateString();
            const isPastDate = date < new Date().setHours(0, 0, 0, 0);
            const cardProps = getDayCardProps(date, isCurrentMonth, isToday, isPastDate);

            return (
              <Grid size={12 / 7} key={dayIndex}>
                <Card
                  variant="outlined"
                  elevation={isDarkMode ? 2 : 1}
                  onClick={() => !isPastDate && onSlotClick()}
                  sx={{
                    ...cardProps,
                    minHeight: 100,
                    height: 100,
                  }}
                >
                  <CardContent style={{ padding: theme.spacing(0.5) }}>
                    <Typography
                      variant="caption"
                      fontWeight={isToday ? "bold" : "normal"}
                      color={getDayTextColor(isCurrentMonth, isPastDate, isToday)}
                      display="block"
                      marginBottom={0.5}
                    >
                      {date.getDate()}
                    </Typography>

                    <Stack spacing={0.25} style={{ maxHeight: 70, overflow: "hidden" }}>
                      {dayAppointments.slice(0, 3).map((appointment) => {
                        const statusColor = getStatusColor(appointment.abStatus);
                        const cardColor = getAppointmentCardColor(statusColor);

                        return (
                          <Card
                            key={appointment.abID}
                            variant="elevation"
                            style={{
                              backgroundColor: (theme.palette[cardColor.split(".")[0] as keyof typeof theme.palette] as PaletteColor)?.main as string,
                              cursor: "pointer",
                              transition: "all 0.2s ease-in-out",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick(appointment);
                            }}
                            sx={{
                              "&:hover": {
                                transform: "scale(1.02)",
                                boxShadow: 2,
                              },
                            }}
                          >
                            <CardContent style={{ padding: theme.spacing(0.25) }}>
                              <Typography variant="caption" color="white" fontWeight={isDarkMode ? 500 : "normal"} noWrap>
                                {new Date(appointment.abTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                {appointment.abFName}
                              </Typography>
                            </CardContent>
                          </Card>
                        );
                      })}
                      {dayAppointments.length > 3 && (
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          +{dayAppointments.length - 3} more
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ))}
    </Box>
  );
};
