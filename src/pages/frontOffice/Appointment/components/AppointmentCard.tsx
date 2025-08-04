// src/pages/frontOffice/Appointment/components/AppointmentCard.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { DragIndicator, Height as ResizeIcon } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Tooltip, Typography, useTheme } from "@mui/material";
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
  // Updated condition: Only appointments shorter than 15 minutes are considered "short"
  const isShortAppointment = appointment.abDuration < 15;
  const isMediumAppointment = appointment.abDuration >= 15 && appointment.abDuration <= 30;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && !isResizing) {
      onClick?.(appointment);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();

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

    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.transform = "rotate(5deg)";
    dragElement.style.opacity = "0.8";
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 0, 0);

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
      minHeight: isShortAppointment ? "20px" : isMediumAppointment ? "40px" : "60px",
    };
  };

  const getContentPadding = () => {
    if (isShortAppointment) return theme.spacing(0.25);
    if (isMediumAppointment) return theme.spacing(0.5);
    return theme.spacing(0.75);
  };

  const getTypographyVariant = () => {
    if (isShortAppointment) return "caption";
    return "body2";
  };

  const getFontSize = () => {
    if (isShortAppointment) return "0.65rem";
    if (isMediumAppointment) return "0.75rem";
    return "0.8rem";
  };

  const patientFullName = `${appointment.abFName} ${appointment.abLName}`.trim();
  const appointmentTime = new Date(appointment.abTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Tooltip
      title={
        <div>
          <Typography variant="subtitle2" style={{ fontWeight: "bold" }}>
            {patientFullName}
          </Typography>
          <Typography variant="caption" display="block">
            Provider: {appointment.providerName}
          </Typography>
          <Typography variant="caption" display="block">
            Time: {appointmentTime}
          </Typography>
          <Typography variant="caption" display="block">
            Duration: {appointment.abDurDesc}
          </Typography>
          <Typography variant="caption" display="block">
            Status: {appointment.abStatus}
          </Typography>
          {appointment.procNotes && (
            <Typography variant="caption" display="block">
              Notes: {appointment.procNotes}
            </Typography>
          )}
        </div>
      }
      placement="top"
      arrow
    >
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
            padding: getContentPadding(),
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
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
            <DragIndicator fontSize="small" style={{ fontSize: "10px" }} />
          </Box>

          {/* Main Content */}
          <Box
            display="flex"
            flexDirection="column"
            height="100%"
            flex={1}
            sx={{ paddingRight: "14px" }} // Space for drag handle
          >
            {/* Patient Name - Always visible */}
            <Typography
              variant={getTypographyVariant()}
              component="div"
              fontWeight="bold"
              color={isElapsed ? "text.secondary" : "text.primary"}
              sx={{
                fontSize: getFontSize(),
                lineHeight: 1.2,
                wordBreak: "break-word",
                hyphens: "auto",
                display: "-webkit-box",
                WebkitLineClamp: isShortAppointment ? 1 : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                marginBottom: isShortAppointment ? 0 : 0.25,
              }}
              title={patientFullName}
            >
              {patientFullName}
            </Typography>

            {/* Time - Always visible for short appointments */}
            {isShortAppointment && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: "0.6rem",
                  lineHeight: 1,
                  fontWeight: "medium",
                }}
              >
                {appointmentTime}
              </Typography>
            )}

            {/* Detailed Information - Only for medium and long appointments */}
            {showDetails && !isShortAppointment && (
              <Box flex={1} display="flex" flexDirection="column">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.65rem",
                    lineHeight: 1.1,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    marginBottom: 0.25,
                  }}
                  title={appointment.providerName}
                >
                  {appointment.providerName}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.6rem",
                    lineHeight: 1,
                    marginBottom: 0.25,
                  }}
                >
                  {appointmentTime} • {appointment.abDurDesc}
                </Typography>

                {/* Resource/Room info if available */}
                {appointment.rlName && !isMediumAppointment && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.6rem",
                      lineHeight: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: 0.25,
                    }}
                    title={appointment.rlName}
                  >
                    📍 {appointment.rlName}
                  </Typography>
                )}
              </Box>
            )}

            {/* Status Chip - Always at bottom */}
            <Box marginTop="auto" display="flex" justifyContent="flex-start">
              <Chip
                label={appointment.abStatus}
                color={statusColor as any}
                size="small"
                variant={isElapsed ? "outlined" : "filled"}
                sx={{
                  fontSize: isShortAppointment ? "0.55rem" : "0.65rem",
                  height: isShortAppointment ? "16px" : "18px",
                  "& .MuiChip-label": {
                    paddingX: isShortAppointment ? 0.5 : 0.75,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Resize Handle - Now available for appointments 15 minutes and longer */}
          {appointment.abDuration >= 15 && (
            <Box
              className="resize-handle"
              onMouseDown={handleResizeMouseDown}
              sx={{
                position: "absolute",
                bottom: -2,
                left: 0,
                right: 0,
                height: 6,
                cursor: "ns-resize",
                backgroundColor: theme.palette.primary.main,
                borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                  height: 8,
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ResizeIcon
                fontSize="small"
                style={{
                  fontSize: "8px",
                  color: "white",
                  transform: "rotate(90deg)",
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Tooltip>
  );
};
