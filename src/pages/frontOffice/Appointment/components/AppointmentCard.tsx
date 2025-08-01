// src/pages/frontOffice/Appointment/components/AppointmentCard.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import React from "react";
import { getStatusColor } from "../utils/appointmentUtils";

interface AppointmentCardProps {
  appointment: AppointBookingDto;
  showDetails?: boolean;
  column?: number;
  totalColumns?: number;
  isElapsed?: boolean;
  onClick?: (appointment: AppointBookingDto) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, showDetails = true, column = 0, totalColumns = 1, isElapsed = false, onClick }) => {
  const statusColor = getStatusColor(appointment.abStatus);
  const isShortAppointment = appointment.abDuration <= 15;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(appointment);
  };

  return (
    <Card
      variant={isElapsed ? "outlined" : "elevation"}
      elevation={isElapsed ? 0 : 2}
      onClick={handleClick}
      style={{
        height: "100%",
        cursor: "pointer",
        opacity: isElapsed ? 0.8 : 1,
        position: "absolute",
        width: `${100 / totalColumns - 1}%`,
        left: `${(column * 100) / totalColumns}%`,
        zIndex: 20,
      }}
    >
      <CardContent
        style={{
          padding: isShortAppointment ? 2 : 4,
          paddingBottom: isShortAppointment ? 2 : 4,
          minHeight: isShortAppointment ? 18 : 24,
        }}
      >
        <Box display="flex" flexDirection="column" height="100%">
          <Typography variant="caption" component="div" fontWeight="bold" color={isElapsed ? "text.secondary" : "text.primary"} noWrap>
            {appointment.abFName} {appointment.abLName}
          </Typography>

          {showDetails && !isShortAppointment && (
            <>
              <Typography variant="caption" color="text.secondary" noWrap>
                {appointment.providerName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {appointment.abDurDesc}
              </Typography>
            </>
          )}

          {showDetails && isShortAppointment && (
            <Typography variant="caption" color="text.secondary" fontWeight="medium">
              {appointment.abDurDesc}
            </Typography>
          )}

          <Box marginTop="auto">
            <Chip label={appointment.abStatus} color={statusColor as any} size="small" variant={isElapsed ? "outlined" : "filled"} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
