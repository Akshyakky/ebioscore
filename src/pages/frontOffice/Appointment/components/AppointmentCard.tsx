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
  isElapsed?: boolean;
  onClick?: (appointment: AppointmentData) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, showDetails = true, column = 0, totalColumns = 1, isElapsed = false, onClick }) => {
  const widthPercentage = 100 / totalColumns;
  const leftPercentage = (column * 100) / totalColumns;

  const statusColor = getStatusColor(appointment.abStatus);

  // Enhanced color scheme for better visibility, especially in elapsed slots
  const getBackgroundColor = () => {
    if (isElapsed) {
      // Enhanced contrast for elapsed appointments
      switch (statusColor) {
        case "success":
          return "#c8e6c9"; // Lighter but more visible green
        case "warning":
          return "#ffe0b2"; // Lighter but more visible orange
        case "error":
          return "#ffcdd2"; // Lighter but more visible red
        default:
          return "#e1f5fe"; // Lighter but more visible blue
      }
    } else {
      // Original colors for non-elapsed appointments
      switch (statusColor) {
        case "success":
          return "#e8f5e8";
        case "warning":
          return "#fff3e0";
        case "error":
          return "#ffebee";
        default:
          return "#e3f2fd";
      }
    }
  };

  const getBorderColor = () => {
    // Enhanced border colors for better definition
    switch (statusColor) {
      case "success":
        return "#4caf50";
      case "warning":
        return "#ff9800";
      case "error":
        return "#f44336";
      default:
        return "#2196f3";
    }
  };

  const backgroundColor = getBackgroundColor();
  const borderColor = getBorderColor();

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
        // Enhanced shadow and contrast for elapsed appointments
        boxShadow: isElapsed ? "0 2px 4px rgba(0,0,0,0.2)" : "0 1px 2px rgba(0,0,0,0.1)",
        "&:hover": {
          backgroundColor: isElapsed
            ? "rgba(255,255,255,0.9)" // White overlay for better hover contrast on elapsed
            : "action.hover",
          transform: "scale(1.02)",
          boxShadow: isElapsed ? "0 4px 8px rgba(0,0,0,0.3)" : 2,
        },
        width: `${widthPercentage - 1}%`,
        left: `${leftPercentage}%`,
        position: "absolute",
        transition: "all 0.2s ease-in-out",
        minHeight: isShortAppointment ? "18px" : "24px", // Ensure minimum height for visibility
        zIndex: 20, // Even higher z-index for appointment cards
        // Enhanced text contrast for elapsed appointments
        color: isElapsed ? "#1a1a1a" : "inherit",
        fontWeight: isElapsed ? "500" : "normal",
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
          // Enhanced text styling for elapsed appointments
          color: isElapsed ? "#1a1a1a" : "inherit",
          textShadow: isElapsed ? "0 1px 1px rgba(255,255,255,0.8)" : "none",
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
              // Enhanced contrast for elapsed appointments
              color: isElapsed ? "#424242" : "text.secondary",
              textShadow: isElapsed ? "0 1px 1px rgba(255,255,255,0.8)" : "none",
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
              // Enhanced contrast for elapsed appointments
              color: isElapsed ? "#424242" : "text.secondary",
              textShadow: isElapsed ? "0 1px 1px rgba(255,255,255,0.8)" : "none",
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
            // Enhanced contrast for elapsed appointments
            color: isElapsed ? "#424242" : "text.secondary",
            textShadow: isElapsed ? "0 1px 1px rgba(255,255,255,0.8)" : "none",
          }}
        >
          {appointment.abDurDesc}
        </Typography>
      )}
    </Box>
  );
};
