// src/pages/frontOffice/Appointment/components/AppointmentCard.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { DragIndicator, Height as ResizeIcon } from "@mui/icons-material";
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
  isResizing?: boolean;
  onClick?: (appointment: AppointBookingDto) => void;
  onDragStart?: (appointment: AppointBookingDto, event: React.DragEvent) => void;
  onDragEnd?: () => void;
  onResizeStart?: (appointment: AppointBookingDto, event: React.MouseEvent) => void;
  onResizeEnd?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showDetails = true,
  column = 0,
  totalColumns = 1,
  isElapsed = false,
  isDragging = false,
  isResizing = false,
  onClick,
  onDragStart,
  onDragEnd,
  onResizeStart,
  onResizeEnd,
}) => {
  const theme = useTheme();
  const statusColor = getStatusColor(appointment.abStatus);
  const isShortAppointment = appointment.abDuration <= 15;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && !isResizing) {
      onClick?.(appointment);
    }
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
        type: "move",
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

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onResizeStart?.(appointment, e);
  };

  const getCardStyles = () => {
    let transform = "none";
    let zIndex = 20;
    let boxShadow = theme.shadows[2];

    if (isDragging) {
      transform = "rotate(5deg) scale(1.05)";
      zIndex = 30;
      boxShadow = theme.shadows[8];
    } else if (isResizing) {
      zIndex = 25;
      boxShadow = theme.shadows[6];
    }

    return {
      height: "100%",
      cursor: isDragging ? "grabbing" : isResizing ? "ns-resize" : "grab",
      opacity: isDragging ? 0.5 : isElapsed ? 0.8 : 1,
      position: "absolute" as const,
      width: `${100 / totalColumns - 1}%`,
      left: `${(column * 100) / totalColumns}%`,
      zIndex,
      transition: isDragging || isResizing ? "none" : "all 0.2s ease-in-out",
      transform,
      border: isDragging || isResizing ? `2px solid ${theme.palette.primary.main}` : undefined,
      borderRadius: theme.shape.borderRadius,
      boxShadow,
    };
  };

  return (
    <Card
      draggable
      variant={isElapsed ? "outlined" : "elevation"}
      elevation={0}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={getCardStyles()}
      sx={{
        "&:hover":
          !isDragging && !isResizing
            ? {
                transform: "scale(1.02)",
                boxShadow: theme.shadows[4],
                "& .drag-handle": {
                  opacity: 1,
                },
                "& .resize-handle": {
                  opacity: 1,
                },
              }
            : {},
        "& .drag-handle": {
          opacity: 0,
          transition: "opacity 0.2s ease-in-out",
        },
        "& .resize-handle": {
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
          height: "100%",
          display: "flex",
          flexDirection: "column",
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
            zIndex: 1,
          }}
        >
          <DragIndicator fontSize="small" style={{ fontSize: "12px" }} />
        </Box>

        {/* Content */}
        <Box display="flex" flexDirection="column" height="100%" flex={1}>
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

        {/* Resize Handle - Only show for appointments longer than 15 minutes */}
        {!isShortAppointment && (
          <Box
            className="resize-handle"
            onMouseDown={handleResizeMouseDown}
            sx={{
              position: "absolute",
              bottom: -2,
              left: 0,
              right: 0,
              height: 8,
              cursor: "ns-resize",
              backgroundColor: theme.palette.primary.main,
              borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
                height: 10,
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <ResizeIcon
              fontSize="small"
              style={{
                fontSize: "10px",
                color: "white",
                transform: "rotate(90deg)",
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
