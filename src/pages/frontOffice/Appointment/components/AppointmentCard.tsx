// src/frontOffice/components/AppointmentCard.tsx
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

  return (
    <Box
      sx={{
        height: "100%",
        p: 0.5,
        borderRadius: 1,
        cursor: "pointer",
        fontSize: "0.75rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor,
        borderLeft: `3px solid ${borderColor}`,
        "&:hover": { backgroundColor: "action.hover" },
        width: `${widthPercentage - 1}%`,
        left: `${leftPercentage}%`,
        position: "absolute",
      }}
      onClick={() => onClick?.(appointment)}
    >
      <Typography variant="caption" fontWeight="bold" display="block" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {appointment.abFName} {appointment.abLName}
      </Typography>
      {showDetails && (
        <>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {appointment.providerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {appointment.abDurDesc}
          </Typography>
        </>
      )}
    </Box>
  );
};
