// src/pages/frontOffice/Appointment/components/AppointmentCard.tsx
import { Box, Typography, useTheme } from "@mui/material";
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const widthPercentage = 100 / totalColumns;
  const leftPercentage = (column * 100) / totalColumns;
  const statusColor = getStatusColor(appointment.abStatus);

  const getBackgroundColor = () => {
    const baseColors = {
      success: isDarkMode ? "#2e7d32" : "#e8f5e8",
      warning: isDarkMode ? "#ed6c02" : "#fff3e0",
      error: isDarkMode ? "#d32f2f" : "#ffebee",
      default: isDarkMode ? "#1976d2" : "#e3f2fd",
    };

    const color = baseColors[statusColor as keyof typeof baseColors] || baseColors.default;

    if (isElapsed && isDarkMode) {
      // For elapsed appointments in dark mode, use slightly lighter variants
      const elapsedColors = {
        success: "#388e3c",
        warning: "#f57c00",
        error: "#e53935",
        default: "#1e88e5",
      };
      return elapsedColors[statusColor as keyof typeof elapsedColors] || elapsedColors.default;
    }

    if (isElapsed && !isDarkMode) {
      // For elapsed appointments in light mode, use slightly more saturated colors
      const elapsedColors = {
        success: "#c8e6c9",
        warning: "#ffe0b2",
        error: "#ffcdd2",
        default: "#e1f5fe",
      };
      return elapsedColors[statusColor as keyof typeof elapsedColors] || elapsedColors.default;
    }

    return color;
  };

  const getBorderColor = () => {
    const borderColors = {
      success: isDarkMode ? "#4caf50" : "#4caf50",
      warning: isDarkMode ? "#ff9800" : "#ff9800",
      error: isDarkMode ? "#f44336" : "#f44336",
      default: isDarkMode ? "#2196f3" : "#2196f3",
    };
    return borderColors[statusColor as keyof typeof borderColors] || borderColors.default;
  };

  const getTextColor = () => {
    if (isDarkMode) {
      return isElapsed ? "#ffffff" : "#ffffff";
    } else {
      return isElapsed ? "#1a1a1a" : "inherit";
    }
  };

  const getSecondaryTextColor = () => {
    if (isDarkMode) {
      return isElapsed ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.7)";
    } else {
      return isElapsed ? "#424242" : "text.secondary";
    }
  };

  const backgroundColor = getBackgroundColor();
  const borderColor = getBorderColor();
  const textColor = getTextColor();
  const secondaryTextColor = getSecondaryTextColor();

  const isShortAppointment = appointment.abDuration <= 15;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(appointment);
  };

  return (
    <Box
      sx={{
        height: "100%",
        p: isShortAppointment ? 0.25 : 0.5,
        borderRadius: 1,
        cursor: "pointer",
        fontSize: isShortAppointment ? "0.65rem" : "0.75rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor,
        borderLeft: `3px solid ${borderColor}`,
        boxShadow: isDarkMode ? (isElapsed ? "0 3px 6px rgba(0,0,0,0.4)" : "0 2px 4px rgba(0,0,0,0.3)") : isElapsed ? "0 2px 4px rgba(0,0,0,0.2)" : "0 1px 2px rgba(0,0,0,0.1)",
        "&:hover": {
          backgroundColor: isDarkMode ? (isElapsed ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)") : isElapsed ? "rgba(255,255,255,0.9)" : "action.hover",
          transform: "scale(1.02)",
          boxShadow: isDarkMode ? "0 4px 8px rgba(0,0,0,0.5)" : isElapsed ? "0 4px 8px rgba(0,0,0,0.3)" : 2,
        },
        width: `${widthPercentage - 1}%`,
        left: `${leftPercentage}%`,
        position: "absolute",
        transition: "all 0.2s ease-in-out",
        minHeight: isShortAppointment ? "18px" : "24px",
        zIndex: 20,
        color: textColor,
        fontWeight: isDarkMode ? "500" : isElapsed ? "500" : "normal",
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
          color: textColor,
          textShadow: isDarkMode ? "0 1px 2px rgba(0,0,0,0.3)" : isElapsed ? "0 1px 1px rgba(255,255,255,0.8)" : "none",
        }}
      >
        {appointment.abFName} {appointment.abLName}
      </Typography>

      {showDetails && !isShortAppointment && (
        <>
          <Typography
            variant="caption"
            display="block"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "0.65rem",
              lineHeight: 1.1,
              color: secondaryTextColor,
              textShadow: isDarkMode ? "0 1px 2px rgba(0,0,0,0.3)" : isElapsed ? "0 1px 1px rgba(255,255,255,0.8)" : "none",
            }}
          >
            {appointment.providerName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.6rem",
              lineHeight: 1,
              color: secondaryTextColor,
              textShadow: isDarkMode ? "0 1px 2px rgba(0,0,0,0.3)" : isElapsed ? "0 1px 1px rgba(255,255,255,0.8)" : "none",
            }}
          >
            {appointment.abDurDesc}
          </Typography>
        </>
      )}

      {showDetails && isShortAppointment && (
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.6rem",
            lineHeight: 1,
            fontWeight: "medium",
            color: secondaryTextColor,
            textShadow: isDarkMode ? "0 1px 2px rgba(0,0,0,0.3)" : isElapsed ? "0 1px 1px rgba(255,255,255,0.8)" : "none",
          }}
        >
          {appointment.abDurDesc}
        </Typography>
      )}
    </Box>
  );
};
