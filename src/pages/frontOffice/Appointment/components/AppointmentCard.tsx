// src/pages/frontOffice/Appointment/components/AppointmentCard.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { DragIndicator } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Typography, useTheme } from "@mui/material";
import React from "react";
import { getStatusColor } from "../utils/appointmentUtils";

interface AppointmentCardProps {
  appointment: AppointBookingDto;
  showDetails?: boolean;
  column?: number;
  totalColumns?: number;
  isElapsed?: boolean;
  isDragging?: boolean;
  onClick?: (appointment: AppointBookingDto) => void;
  onDragStart?: (appointment: AppointBookingDto, event: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showDetails = true,
  column = 0,
  totalColumns = 1,
  isElapsed = false,
  isDragging = false,
  onClick,
  onDragStart,
  onDragEnd,
}) => {
  const theme = useTheme();
  const statusColor = getStatusColor(appointment.abStatus);
  const isShortAppointment = appointment.abDuration <= 15;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(appointment);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();

    // Set drag data
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        appointmentId: appointment.abID,
        duration: appointment.abDuration,
        patientName: `${appointment.abFName} ${appointment.abLName}`,
        providerName: appointment.providerName,
        originalTime: appointment.abTime,
        originalDate: appointment.abDate,
      })
    );

    e.dataTransfer.effectAllowed = "move";

    // Create custom drag image
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.transform = "rotate(5deg)";
    dragElement.style.opacity = "0.8";
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 0, 0);

    // Clean up drag image after drag starts
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);

    onDragStart?.(appointment, e);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    onDragEnd?.();
  };

  return (
    <Card
      draggable
      variant={isElapsed ? "outlined" : "elevation"}
      elevation={isElapsed ? 0 : isDragging ? 4 : 2}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        height: "100%",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.5 : isElapsed ? 0.8 : 1,
        position: "absolute",
        width: `${100 / totalColumns - 1}%`,
        left: `${(column * 100) / totalColumns}%`,
        zIndex: isDragging ? 30 : 20,
        transition: isDragging ? "none" : "all 0.2s ease-in-out",
        transform: isDragging ? "rotate(5deg) scale(1.05)" : "none",
        border: isDragging ? `2px solid ${theme.palette.primary.main}` : undefined,
      }}
      sx={{
        "&:hover": !isDragging
          ? {
              transform: "scale(1.02)",
              boxShadow: theme.shadows[4],
              "& .drag-handle": {
                opacity: 1,
              },
            }
          : {},
        "& .drag-handle": {
          opacity: 0,
          transition: "opacity 0.2s ease-in-out",
        },
      }}
    >
      <CardContent
        style={{
          padding: isShortAppointment ? 2 : 4,
          paddingBottom: isShortAppointment ? 2 : 4,
          minHeight: isShortAppointment ? 18 : 24,
          position: "relative",
        }}
      >
        {/* Drag Handle */}
        <Box
          className="drag-handle"
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
            color: "text.secondary",
            cursor: "grab",
          }}
        >
          <DragIndicator fontSize="small" style={{ fontSize: "12px" }} />
        </Box>

        <Box display="flex" flexDirection="column" height="100%">
          <Typography
            variant="caption"
            component="div"
            fontWeight="bold"
            color={isElapsed ? "text.secondary" : "text.primary"}
            noWrap
            style={{ paddingRight: "16px" }} // Space for drag handle
          >
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
            <Chip
              label={appointment.abStatus}
              color={statusColor as any}
              size="small"
              variant={isElapsed ? "outlined" : "filled"}
              style={{ fontSize: "0.65rem", height: "18px" }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
