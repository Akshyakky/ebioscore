// src/pages/frontOffice/Appointment/components/AppointmentCard.tsx
import { Box, Typography } from "@mui/material";
import React from "react";
import { AppointmentData } from "../types";
import { getStatusColor } from "../utils/appointmentUtils";

interface AppointmentCardProps {
  appointment: AppointmentData;
  showDetails?: boolean;
  column?: number;
  totalColumns?: number;
  onClick?: (appointment: AppointmentData) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, showDetails = true, column = 0, totalColumns = 1, onClick }) => {
  const widthPercentage = 100 / totalColumns;
  const leftPercentage = (column * 100) / totalColumns;

  const statusColor = getStatusColor(appointment.abStatus);
  const backgroundColor = statusColor === "success" ? "#e8f5e8" : statusColor === "warning" ? "#fff3e0" : statusColor === "error" ? "#ffebee" : "#e3f2fd";
  const borderColor = statusColor === "success" ? "#4caf50" : statusColor === "warning" ? "#ff9800" : statusColor === "error" ? "#f44336" : "#2196f3";

  // Enhanced styling for short appointments (15 minutes or less)
  const isShortAppointment = appointment.abDuration <= 15;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent slot click events from firing
    onClick?.(appointment);
  };

  return (
    <Box
      sx={{
        height: "100%",
        p: isShortAppointment ? 0.25 : 0.5, // Reduced padding for short appointments
        borderRadius: 1,
        cursor: "pointer",
        fontSize: isShortAppointment ? "0.65rem" : "0.75rem", // Smaller font for short appointments
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor,
        borderLeft: `3px solid ${borderColor}`,
        "&:hover": {
          backgroundColor: "action.hover",
          transform: "scale(1.02)",
          boxShadow: 2,
        },
        width: `${widthPercentage - 1}%`,
        left: `${leftPercentage}%`,
        position: "absolute",
        transition: "all 0.2s ease-in-out",
        minHeight: isShortAppointment ? "18px" : "24px", // Ensure minimum height for visibility
        zIndex: 10, // Higher z-index to ensure clickability
      }}
      onClick={handleClick}
    >
      <Typography
        variant="caption"
        fontWeight="bold"
        display="block"
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: isShortAppointment ? 1.1 : 1.2,
          fontSize: "inherit",
          mb: isShortAppointment ? 0 : 0.25,
        }}
      >
        {appointment.abFName} {appointment.abLName}
      </Typography>

      {showDetails && !isShortAppointment && (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "0.65rem",
              lineHeight: 1.1,
            }}
          >
            {appointment.providerName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: "0.6rem",
              lineHeight: 1,
            }}
          >
            {appointment.abDurDesc}
          </Typography>
        </>
      )}

      {/* For short appointments, show duration only */}
      {showDetails && isShortAppointment && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: "0.6rem",
            lineHeight: 1,
            fontWeight: "medium",
          }}
        >
          {appointment.abDurDesc}
        </Typography>
      )}
    </Box>
  );
};
