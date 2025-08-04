// src/pages/frontOffice/Appointment/components/DayView.tsx
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { BreakDto } from "@/interfaces/FrontOffice/BreakListDto";
import { HospWorkHoursDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { useAlert } from "@/providers/AlertProvider";
import { Block } from "@mui/icons-material";
import { Box, CircularProgress, Grid, Paper, Typography, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { TimeSlot } from "../types";
import { calculateAppointmentLayout } from "../utils/appointmentUtils";
import { calculateBreakLayout } from "../utils/breakUtils";
import { AppointmentCard } from "./AppointmentCard";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";

interface DragData {
  appointmentId: number;
  duration: number;
  patientName: string;
  providerName: string;
  originalTime: string;
  originalDate: string;
  type: "move" | "resize";
}

interface ResizeState {
  appointment: AppointBookingDto;
  startY: number;
  originalDuration: number;
  currentDuration: number;
  isValid: boolean;
  conflictReason?: string;
}

interface DayViewProps {
  currentDate: Date;
  timeSlots: TimeSlot[];
  appointments: AppointBookingDto[];
  breaks: BreakDto[];
  workHours: HospWorkHoursDto[];
  currentTime: Date;
  selectedProvider?: string;
  onSlotDoubleClick: (date: Date, hour: number, minute: number) => void;
  onAppointmentClick: (appointment: AppointBookingDto) => void;
  onAppointmentUpdate?: (appointment: AppointBookingDto) => Promise<{ success: boolean; errorMessage?: string }>;
  onBreakClick?: (breakItem: BreakDto) => void;
  onElapsedSlotConfirmation: (date: Date, hour: number, minute: number) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  timeSlots,
  appointments,
  breaks,
  workHours,
  currentTime,
  selectedProvider,
  onSlotDoubleClick,
  onAppointmentClick,
  onAppointmentUpdate,
  onBreakClick,
  onElapsedSlotConfirmation,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const { showAlert } = useAlert();

  // Drag and drop state
  const [draggedAppointment, setDraggedAppointment] = useState<AppointBookingDto | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ hour: number; minute: number } | null>(null);
  const [isDragValid, setIsDragValid] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Resize state
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const isWithinWorkingHours = useCallback(
    (date: Date, hour: number, minute: number) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      const workHour = workHours.find((wh) => wh.daysDesc.toUpperCase() === dayName && wh.rActiveYN === "Y");

      if (!workHour || !workHour.startTime || !workHour.endTime) return false;

      const startHour = new Date(workHour.startTime).getHours();
      const startMinute = new Date(workHour.startTime).getMinutes();
      const endHour = new Date(workHour.endTime).getHours();
      const endMinute = new Date(workHour.endTime).getMinutes();

      const slotMinutes = hour * 60 + minute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    },
    [workHours]
  );

  const isTimeSlotElapsed = useCallback(
    (date: Date, hour: number, minute: number) => {
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);
      return slotDate < currentTime;
    },
    [currentTime]
  );

  const isTimeSlotDuringBreak = useCallback(
    (date: Date, hour: number, minute: number) => {
      const slotMinutes = hour * 60 + minute;

      return breaks.some((breakItem) => {
        if (selectedProvider && breakItem.hPLID !== parseInt(selectedProvider)) {
          return false;
        }

        const breakStartDate = new Date(breakItem.bLStartDate);
        const breakEndDate = new Date(breakItem.bLEndDate);

        if (date < breakStartDate || date > breakEndDate) {
          return false;
        }

        const breakStartTime = new Date(breakItem.bLStartTime);
        const breakEndTime = new Date(breakItem.bLEndTime);

        const breakStartMinutes = breakStartTime.getHours() * 60 + breakStartTime.getMinutes();
        const breakEndMinutes = breakEndTime.getHours() * 60 + breakEndTime.getMinutes();

        return slotMinutes >= breakStartMinutes && slotMinutes < breakEndMinutes;
      });
    },
    [breaks, selectedProvider]
  );

  const getAppointmentConflicts = useCallback(
    (date: Date, startHour: number, startMinute: number, duration: number, excludeId?: number) => {
      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      return appointments.filter((apt) => {
        if (excludeId && apt.abID === excludeId) return false;

        const aptDate = new Date(apt.abDate);
        const aptStartTime = new Date(apt.abTime);
        const aptEndTime = new Date(apt.abEndTime);

        const dateMatches = aptDate.getDate() === date.getDate() && aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();

        if (!dateMatches) return false;

        // Check for time overlap
        return startTime < aptEndTime && endTime > aptStartTime;
      });
    },
    [appointments]
  );

  const validateResizeOperation = useCallback(
    (appointment: AppointBookingDto, newDuration: number) => {
      const startTime = new Date(appointment.abTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + newDuration);

      // Check minimum duration
      if (newDuration < 15) {
        return { valid: false, reason: "Minimum duration is 15 minutes" };
      }

      // Check maximum duration (8 hours)
      if (newDuration > 480) {
        return { valid: false, reason: "Maximum duration is 8 hours" };
      }

      // Check if new end time is within working hours
      if (!isWithinWorkingHours(currentDate, endTime.getHours(), endTime.getMinutes())) {
        return { valid: false, reason: "Appointment would extend beyond working hours" };
      }

      // Check if new end time conflicts with breaks
      if (isTimeSlotDuringBreak(currentDate, endTime.getHours(), endTime.getMinutes())) {
        return { valid: false, reason: "Appointment would extend into break time" };
      }

      // Check for conflicts with other appointments
      const conflicts = getAppointmentConflicts(currentDate, startTime.getHours(), startTime.getMinutes(), newDuration, appointment.abID);

      if (conflicts.length > 0) {
        return {
          valid: false,
          reason: `Would conflict with ${conflicts[0].abFName} ${conflicts[0].abLName}`,
        };
      }

      return { valid: true, reason: "" };
    },
    [currentDate, isWithinWorkingHours, isTimeSlotDuringBreak, getAppointmentConflicts]
  );

  const validateDropZone = useCallback(
    (date: Date, hour: number, minute: number, dragData: DragData) => {
      // Check if within working hours
      if (!isWithinWorkingHours(date, hour, minute)) {
        return { valid: false, reason: "Outside working hours" };
      }

      // Check if during break
      if (isTimeSlotDuringBreak(date, hour, minute)) {
        return { valid: false, reason: "During break time" };
      }

      // Check for appointment conflicts
      const conflicts = getAppointmentConflicts(date, hour, minute, dragData.duration, dragData.appointmentId);
      if (conflicts.length > 0) {
        return { valid: false, reason: `Conflicts with ${conflicts[0].abFName} ${conflicts[0].abLName}` };
      }

      // Check if appointment would extend beyond working hours
      const endTime = new Date(date);
      endTime.setHours(hour, minute + dragData.duration, 0, 0);

      if (!isWithinWorkingHours(date, endTime.getHours(), endTime.getMinutes())) {
        return { valid: false, reason: "Appointment would extend beyond working hours" };
      }

      return { valid: true, reason: "" };
    },
    [isWithinWorkingHours, isTimeSlotDuringBreak, getAppointmentConflicts]
  );

  // Resize event handlers
  const handleResizeStart = useCallback((appointment: AppointBookingDto, event: React.MouseEvent) => {
    setIsResizing(true);
    setResizeState({
      appointment,
      startY: event.clientY,
      originalDuration: appointment.abDuration,
      currentDuration: appointment.abDuration,
      isValid: true,
    });
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!resizeState || !isResizing) return;

      const deltaY = event.clientY - resizeState.startY;
      const slotHeight = 40; // Height of each 15-minute slot
      const minutesPerSlot = 15;
      const deltaMinutes = Math.round(deltaY / slotHeight) * minutesPerSlot;
      const newDuration = Math.max(15, resizeState.originalDuration + deltaMinutes);

      const validation = validateResizeOperation(resizeState.appointment, newDuration);

      setResizeState((prev) =>
        prev
          ? {
              ...prev,
              currentDuration: newDuration,
              isValid: validation.valid,
              conflictReason: validation.reason,
            }
          : null
      );
    },
    [resizeState, isResizing, validateResizeOperation]
  );

  const handleMouseUp = useCallback(async () => {
    if (!resizeState || !isResizing || !onAppointmentUpdate) {
      setIsResizing(false);
      setResizeState(null);
      return;
    }

    if (!resizeState.isValid) {
      showAlert("Invalid Resize", resizeState.conflictReason || "Cannot resize appointment", "warning");
      setIsResizing(false);
      setResizeState(null);
      return;
    }

    if (resizeState.currentDuration === resizeState.originalDuration) {
      setIsResizing(false);
      setResizeState(null);
      return;
    }

    setIsUpdating(true);

    try {
      const originalStartTime = new Date(resizeState.appointment.abTime);
      const newEndTime = new Date(originalStartTime);
      newEndTime.setMinutes(newEndTime.getMinutes() + resizeState.currentDuration);

      const updatedAppointment: AppointBookingDto = {
        ...resizeState.appointment,
        abDuration: resizeState.currentDuration,
        abDurDesc: `${resizeState.currentDuration} minutes`,
        abEndTime: newEndTime,
      };

      const result = await onAppointmentUpdate(updatedAppointment);

      if (result.success) {
        showAlert(
          "Appointment Resized",
          `${resizeState.appointment.abFName} ${resizeState.appointment.abLName}'s appointment has been resized to ${resizeState.currentDuration} minutes`,
          "success"
        );
      } else {
        showAlert("Resize Failed", result.errorMessage || "Failed to resize appointment", "error");
      }
    } catch (error) {
      console.error("Error resizing appointment:", error);
      showAlert("Error", "An unexpected error occurred while resizing the appointment", "error");
    } finally {
      setIsUpdating(false);
      setIsResizing(false);
      setResizeState(null);
    }
  }, [resizeState, isResizing, onAppointmentUpdate, showAlert]);

  // Add mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const getSlotStyles = useCallback(
    (date: Date, hour: number, minute: number) => {
      const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
      const isElapsed = isTimeSlotElapsed(date, hour, minute);
      const isDuringBreak = isTimeSlotDuringBreak(date, hour, minute);
      const isDragOver = dragOverSlot?.hour === hour && dragOverSlot?.minute === minute;

      let backgroundColor = "transparent";
      let opacity = 1;
      let cursor = "default";
      let border = `1px solid ${theme.palette.divider}`;

      if (isDragOver) {
        if (isDragValid) {
          backgroundColor = isDarkMode ? theme.palette.success.dark : theme.palette.success.light;
          border = `2px solid ${theme.palette.success.main}`;
        } else {
          backgroundColor = isDarkMode ? theme.palette.error.dark : theme.palette.error.light;
          border = `2px solid ${theme.palette.error.main}`;
        }
        opacity = 0.8;
      } else if (!withinWorkingHours) {
        backgroundColor = isDarkMode ? (isElapsed ? theme.palette.grey[800] : theme.palette.grey[900]) : isElapsed ? "#eeeeee" : "#f5f5f5";
        opacity = 0.5;
        cursor = "not-allowed";
      } else if (isDuringBreak) {
        backgroundColor = isDarkMode ? "#d84315" : "#ffccbc";
      } else if (isElapsed) {
        backgroundColor = isDarkMode ? theme.palette.grey[700] : "#f0f0f0";
        cursor = "pointer";
      } else {
        cursor = "pointer";
      }

      return {
        backgroundColor,
        opacity,
        cursor,
        border,
        borderBottom: `1px solid ${theme.palette.divider}`,
        height: 40,
        padding: theme.spacing(0.5),
        position: "relative" as const,
        userSelect: "none" as const,
        transition: "all 0.2s ease-in-out",
      };
    },
    [isWithinWorkingHours, isTimeSlotElapsed, isTimeSlotDuringBreak, dragOverSlot, isDragValid, theme, isDarkMode]
  );

  const getAppointmentsForSlot = useCallback(
    (date: Date, hour: number, minute: number) => {
      return appointments.filter((apt) => {
        const aptDate = new Date(apt.abDate);
        const aptTime = new Date(apt.abTime);
        const aptEndTime = new Date(apt.abEndTime);

        const dateMatches = aptDate.getDate() === date.getDate() && aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();

        if (!dateMatches) return false;

        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        return slotTime >= aptTime && slotTime < aptEndTime;
      });
    },
    [appointments]
  );

  const getBreaksForSlot = useCallback(
    (date: Date, hour: number, minute: number) => {
      return breaks.filter((breakItem) => {
        if (selectedProvider && breakItem.hPLID !== parseInt(selectedProvider)) {
          return false;
        }

        const breakStartDate = new Date(breakItem.bLStartDate);
        const breakEndDate = new Date(breakItem.bLEndDate);

        if (date < breakStartDate || date > breakEndDate) {
          return false;
        }

        const breakStartTime = new Date(breakItem.bLStartTime);
        const breakEndTime = new Date(breakItem.bLEndTime);

        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        return slotTime >= breakStartTime && slotTime < breakEndTime;
      });
    },
    [breaks, selectedProvider]
  );

  // Drag and Drop Handlers (existing functionality)
  const handleDragStart = useCallback((appointment: AppointBookingDto, event: React.DragEvent) => {
    setDraggedAppointment(appointment);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedAppointment(null);
    setDragOverSlot(null);
    setIsDragValid(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, date: Date, hour: number, minute: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (!draggedAppointment) return;

      const dragData: DragData = {
        appointmentId: draggedAppointment.abID,
        duration: draggedAppointment.abDuration,
        patientName: `${draggedAppointment.abFName} ${draggedAppointment.abLName}`,
        providerName: draggedAppointment.providerName,
        originalTime: draggedAppointment.abTime.toString(),
        originalDate: draggedAppointment.abDate.toString(),
        type: "move",
      };

      const validation = validateDropZone(date, hour, minute, dragData);

      setDragOverSlot({ hour, minute });
      setIsDragValid(validation.valid);

      e.dataTransfer.dropEffect = validation.valid ? "move" : "none";
    },
    [draggedAppointment, validateDropZone]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only clear if we're leaving the slot entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverSlot(null);
      setIsDragValid(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, date: Date, hour: number, minute: number) => {
      e.preventDefault();
      e.stopPropagation();

      setDragOverSlot(null);
      setIsDragValid(false);

      if (!draggedAppointment || !onAppointmentUpdate) {
        setDraggedAppointment(null);
        return;
      }

      const dragData: DragData = {
        appointmentId: draggedAppointment.abID,
        duration: draggedAppointment.abDuration,
        patientName: `${draggedAppointment.abFName} ${draggedAppointment.abLName}`,
        providerName: draggedAppointment.providerName,
        originalTime: draggedAppointment.abTime.toString(),
        originalDate: draggedAppointment.abDate.toString(),
        type: "move",
      };

      const validation = validateDropZone(date, hour, minute, dragData);

      if (!validation.valid) {
        showAlert("Invalid Drop", validation.reason, "warning");
        setDraggedAppointment(null);
        return;
      }

      setIsUpdating(true);

      try {
        // Create new appointment time
        const newDateTime = new Date(date);
        newDateTime.setHours(hour, minute, 0, 0);

        const newEndDateTime = new Date(newDateTime);
        newEndDateTime.setMinutes(newEndDateTime.getMinutes() + draggedAppointment.abDuration);

        // Update appointment with new time
        const updatedAppointment: AppointBookingDto = {
          ...draggedAppointment,
          abDate: date,
          abTime: newDateTime,
          abEndTime: newEndDateTime,
        };

        const result = await onAppointmentUpdate(updatedAppointment);

        if (result.success) {
          showAlert(
            "Appointment Moved",
            `${dragData.patientName}'s appointment has been moved to ${newDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            "success"
          );
        } else {
          showAlert("Update Failed", result.errorMessage || "Failed to update appointment", "error");
        }
      } catch (error) {
        console.error("Error updating appointment:", error);
        showAlert("Error", "An unexpected error occurred while moving the appointment", "error");
      } finally {
        setIsUpdating(false);
        setDraggedAppointment(null);
      }
    },
    [draggedAppointment, onAppointmentUpdate, validateDropZone, showAlert]
  );

  // Regular click handlers
  const handleSlotClick = useCallback(
    (date: Date, hour: number, minute: number) => {
      const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
      const isElapsed = isTimeSlotElapsed(date, hour, minute);
      const isDuringBreak = isTimeSlotDuringBreak(date, hour, minute);
      const slotAppointments = getAppointmentsForSlot(date, hour, minute);

      if (isDuringBreak) {
        return;
      }

      if (withinWorkingHours && isElapsed && slotAppointments.length === 0) {
        onElapsedSlotConfirmation(date, hour, minute);
      }
    },
    [isWithinWorkingHours, isTimeSlotElapsed, isTimeSlotDuringBreak, getAppointmentsForSlot, onElapsedSlotConfirmation]
  );

  const handleSlotDoubleClick = useCallback(
    (date: Date, hour: number, minute: number) => {
      const withinWorkingHours = isWithinWorkingHours(date, hour, minute);
      const isDuringBreak = isTimeSlotDuringBreak(date, hour, minute);
      const slotAppointments = getAppointmentsForSlot(date, hour, minute);

      if (isDuringBreak) {
        return;
      }

      if (withinWorkingHours && slotAppointments.length === 0) {
        onSlotDoubleClick(date, hour, minute);
      }
    },
    [isWithinWorkingHours, isTimeSlotDuringBreak, getAppointmentsForSlot, onSlotDoubleClick]
  );

  const dayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.abDate);
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
    return aptDateOnly.getTime() === currentDateOnly.getTime();
  });

  const dayBreaks = breaks.filter((breakItem) => {
    if (selectedProvider && breakItem.hPLID !== parseInt(selectedProvider)) {
      return false;
    }

    const breakStartDate = new Date(breakItem.bLStartDate);
    const breakEndDate = new Date(breakItem.bLEndDate);

    return currentDate >= breakStartDate && currentDate <= breakEndDate;
  });

  const appointmentLayout = calculateAppointmentLayout(currentDate, dayAppointments);
  const breakLayout = calculateBreakLayout(currentDate, dayBreaks);

  return (
    <Grid container spacing={1}>
      <Grid size={1}>
        <Paper
          elevation={2}
          style={{
            position: "sticky",
            top: 0,
            background: isDarkMode
              ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[700]} 100%)`
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            zIndex: 30,
            padding: theme.spacing(0.5),
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            marginBottom: theme.spacing(0.5),
          }}
        >
          <Typography variant="subtitle2" align="center" fontWeight="bold" color={isDarkMode ? "primary.light" : "primary.main"}>
            Time
          </Typography>
        </Paper>
        {timeSlots.map((slot) => (
          <Box
            key={slot.time}
            style={{
              height: 40,
              display: "flex",
              alignItems: "center",
              borderBottom: `1px solid ${theme.palette.divider}`,
              padding: theme.spacing(0, 1),
              backgroundColor: isDarkMode ? theme.palette.background.paper : "transparent",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {slot.time}
            </Typography>
          </Box>
        ))}
      </Grid>

      <Grid size={11} style={{ position: "relative" }}>
        {/* Loading overlay */}
        {(isUpdating || isResizing) && (
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={24} />
              <Typography variant="body2">{isResizing ? "Resizing appointment..." : "Updating appointment..."}</Typography>
            </Box>
          </Box>
        )}

        <CurrentTimeIndicator date={currentDate} height={40} timeSlots={timeSlots} currentTime={currentTime} />

        <Paper
          elevation={2}
          style={{
            position: "sticky",
            top: 0,
            background: isDarkMode
              ? `linear-gradient(135deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[700]} 100%)`
              : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            zIndex: 30,
            padding: theme.spacing(0.5),
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            marginBottom: theme.spacing(0.5),
          }}
        >
          <Typography variant="subtitle2" align="center" color={isDarkMode ? "primary.light" : "text.primary"}>
            {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            {draggedAppointment && (
              <Typography variant="caption" display="block" color="info.main">
                Moving: {draggedAppointment.abFName} {draggedAppointment.abLName}
              </Typography>
            )}
            {resizeState && (
              <Typography variant="caption" display="block" color={resizeState.isValid ? "success.main" : "error.main"}>
                Resizing: {resizeState.appointment.abFName} {resizeState.appointment.abLName}({resizeState.currentDuration} min)
                {!resizeState.isValid && ` - ${resizeState.conflictReason}`}
              </Typography>
            )}
          </Typography>
        </Paper>

        {timeSlots.map((slot) => {
          const slotAppointments = getAppointmentsForSlot(currentDate, slot.hour, slot.minute);
          const slotBreaks = getBreaksForSlot(currentDate, slot.hour, slot.minute);
          const withinWorkingHours = isWithinWorkingHours(currentDate, slot.hour, slot.minute);
          const isElapsed = isTimeSlotElapsed(currentDate, slot.hour, slot.minute);
          const isDuringBreak = isTimeSlotDuringBreak(currentDate, slot.hour, slot.minute);
          const slotStyles = getSlotStyles(currentDate, slot.hour, slot.minute);

          return (
            <Box
              key={slot.time}
              style={slotStyles}
              onClick={() => handleSlotClick(currentDate, slot.hour, slot.minute)}
              onDoubleClick={() => handleSlotDoubleClick(currentDate, slot.hour, slot.minute)}
              onDragOver={(e) => handleDragOver(e, currentDate, slot.hour, slot.minute)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, currentDate, slot.hour, slot.minute)}
            >
              {!withinWorkingHours && !slotAppointments.length && !slotBreaks.length && (
                <Box display="flex" alignItems="center" height="100%" color="text.disabled">
                  <Block fontSize="small" />
                  <Typography variant="caption" marginLeft={0.5}>
                    Outside hours
                  </Typography>
                </Box>
              )}

              {isDuringBreak && slotAppointments.length === 0 && (
                <Box display="flex" alignItems="center" height="100%" color="warning.main">
                  <Typography variant="caption">🚫 Break Time</Typography>
                </Box>
              )}

              {withinWorkingHours && !isDuringBreak && slotAppointments.length === 0 && slotBreaks.length === 0 && (
                <Typography
                  variant="caption"
                  color={isDarkMode ? "text.secondary" : "text.secondary"}
                  style={{
                    opacity: 0,
                    transition: "opacity 0.2s",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    fontStyle: "italic",
                    fontWeight: isDarkMode ? 500 : "normal",
                  }}
                  className="slot-hint"
                >
                  {isElapsed ? "Click for elapsed booking" : "Double-click to book"}
                </Typography>
              )}

              {/* Render Appointments */}
              {slotAppointments.map((appointment) => {
                const appointmentStart = new Date(appointment.abTime);
                const appointmentStartMinutes = appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
                const slotStartMinutes = slot.hour * 60 + slot.minute;
                const nextSlotStartMinutes = slotStartMinutes + 15;

                if (appointmentStartMinutes >= slotStartMinutes && appointmentStartMinutes < nextSlotStartMinutes) {
                  const slotHeight = 40;

                  // Use current duration if this appointment is being resized
                  const currentDuration = resizeState && resizeState.appointment.abID === appointment.abID ? resizeState.currentDuration : appointment.abDuration;

                  const durationInSlots = currentDuration / 15;
                  const appointmentHeight = Math.max(durationInSlots * slotHeight - 2, currentDuration <= 15 ? 18 : 24);

                  const minuteOffset = appointmentStartMinutes - slotStartMinutes;
                  const topOffset = (minuteOffset / 15) * slotHeight;

                  const layoutInfo = appointmentLayout.find((layout) => layout.appointment.abID === appointment.abID);
                  const column = layoutInfo?.column || 0;
                  const totalColumns = layoutInfo?.totalColumns || 1;

                  return (
                    <Box
                      key={appointment.abID}
                      style={{
                        position: "absolute",
                        top: `${topOffset}px`,
                        left: "4px",
                        right: "4px",
                        height: `${appointmentHeight}px`,
                        zIndex: 20,
                      }}
                    >
                      <AppointmentCard
                        appointment={appointment}
                        showDetails={true}
                        column={column}
                        totalColumns={totalColumns}
                        onClick={onAppointmentClick}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onResizeStart={handleResizeStart}
                        isDragging={draggedAppointment?.abID === appointment.abID}
                        isResizing={resizeState?.appointment.abID === appointment.abID}
                        isElapsed={isElapsed}
                      />
                    </Box>
                  );
                }
                return null;
              })}
            </Box>
          );
        })}
      </Grid>
    </Grid>
  );
};
