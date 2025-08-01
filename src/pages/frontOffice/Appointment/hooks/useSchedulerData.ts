// src/pages/frontOffice/Appointment/hooks/useSchedulerData.ts
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { BreakDto } from "@/interfaces/FrontOffice/BreakListDto";
import { HospWorkHoursDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { appointmentService } from "@/services/FrontOfficeServices/AppointmentService";
import { breakService } from "@/services/FrontOfficeServices/BreakService";
import { hospWorkHoursService } from "@/services/FrontOfficeServices/HospWorkHoursService";
import { useCallback, useEffect, useState } from "react";

export const useSchedulerData = () => {
  const [appointments, setAppointments] = useState<AppointBookingDto[]>([]);
  const [breaks, setBreaks] = useState<BreakDto[]>([]);
  const [workHours, setWorkHours] = useState<HospWorkHoursDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments from API
  const fetchAppointments = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setIsLoading(true);
      setError(null);

      let result;
      if (startDate && endDate) {
        result = await appointmentService.getAppointmentsByDateRange(startDate, endDate);
      } else {
        result = await appointmentService.getTodaysAppointments();
      }

      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch appointments");
        setAppointments([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setAppointments([]);
      console.error("Error fetching appointments:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch breaks from API
  const fetchBreaks = useCallback(async (startDate?: Date, endDate?: Date, hplId?: number) => {
    try {
      setIsLoading(true);
      setError(null);

      let result;
      if (startDate && endDate) {
        if (hplId) {
          result = await breakService.getBreaksByProvider(hplId, startDate, endDate);
        } else {
          const allBreaksResult = await breakService.getAllBreaksDetailed();
          if (allBreaksResult.success && allBreaksResult.data) {
            // Filter breaks by date range
            const filteredBreaks = allBreaksResult.data.filter((breakItem) => {
              const breakStartDate = new Date(breakItem.bLStartDate);
              const breakEndDate = new Date(breakItem.bLEndDate);

              return (
                ((breakStartDate >= startDate && breakStartDate <= endDate) ||
                  (breakEndDate >= startDate && breakEndDate <= endDate) ||
                  (breakStartDate <= startDate && breakEndDate >= endDate)) &&
                breakItem.rActiveYN === "Y" &&
                breakItem.status !== "Suspended"
              );
            });
            result = { success: true, data: filteredBreaks };
          } else {
            result = allBreaksResult;
          }
        }
      } else {
        result = await breakService.getAllBreaksDetailed();
      }

      if (result.success && result.data) {
        // Filter out suspended breaks
        const activeBreaks = result.data.filter((breakItem) => breakItem.rActiveYN === "Y" && breakItem.status !== "Suspended");
        setBreaks(activeBreaks);
      } else {
        setError(result.errorMessage || "Failed to fetch breaks");
        setBreaks([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setBreaks([]);
      console.error("Error fetching breaks:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch work hours from API
  const fetchWorkHours = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await hospWorkHoursService.getAll();

      if (result.success && result.data) {
        const activeWorkHours = result.data.filter((wh) => wh.rActiveYN === "Y");
        setWorkHours(activeWorkHours);
      } else {
        setError(result.errorMessage || "Failed to fetch work hours");
        console.error("Failed to fetch work hours:", result.errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Error fetching work hours:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new appointment
  const createAppointment = useCallback(
    async (appointmentData: AppointBookingDto) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await appointmentService.saveAppointment(appointmentData);

        if (result.success && result.data) {
          await fetchAppointments();
          return { success: true, data: result.data };
        } else {
          setError(result.errorMessage || "Failed to create appointment");
          return { success: false, errorMessage: result.errorMessage };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        return { success: false, errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAppointments]
  );

  // Update existing appointment
  const updateAppointment = useCallback(
    async (appointmentData: AppointBookingDto) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await appointmentService.saveAppointment(appointmentData);

        if (result.success && result.data) {
          await fetchAppointments();
          return { success: true, data: result.data };
        } else {
          setError(result.errorMessage || "Failed to update appointment");
          return { success: false, errorMessage: result.errorMessage };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        return { success: false, errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAppointments]
  );

  // Cancel appointment
  const cancelAppointment = useCallback(
    async (appointmentId: number, cancelReason: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await appointmentService.cancelAppointment(appointmentId, cancelReason);

        if (result.success) {
          await fetchAppointments();
          return { success: true };
        } else {
          setError(result.errorMessage || "Failed to cancel appointment");
          return { success: false, errorMessage: result.errorMessage };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        return { success: false, errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAppointments]
  );

  // Check for appointment conflicts
  const checkAppointmentConflicts = useCallback(async (hplId: number, appointmentDate: Date, startTime: Date, endTime: Date, excludeAppointmentId?: number) => {
    try {
      const result = await appointmentService.checkAppointmentConflicts(hplId, appointmentDate, startTime, endTime, excludeAppointmentId);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      return { success: false, errorMessage, data: false };
    }
  }, []);

  // Get work hours for a specific day
  const getWorkHoursForDay = useCallback(
    (date: Date) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      return workHours.filter((wh) => wh.daysDesc.toUpperCase() === dayName && wh.rActiveYN === "Y" && wh.wkHoliday === "N");
    },
    [workHours]
  );

  // Check if a specific time is within working hours
  const isTimeWithinWorkingHours = useCallback(
    (date: Date, hour: number, minute: number) => {
      const dayWorkHours = getWorkHoursForDay(date);

      if (dayWorkHours.length === 0) {
        return false;
      }

      const slotMinutes = hour * 60 + minute;

      return dayWorkHours.some((workHour) => {
        if (!workHour.startTime || !workHour.endTime) {
          return false;
        }

        const startTime = new Date(workHour.startTime);
        const endTime = new Date(workHour.endTime);

        const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
        const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

        return slotMinutes >= startMinutes && slotMinutes < endMinutes;
      });
    },
    [getWorkHoursForDay]
  );

  // Get all available time ranges for a specific day
  const getAvailableTimeRanges = useCallback(
    (date: Date) => {
      const dayWorkHours = getWorkHoursForDay(date);

      return dayWorkHours
        .map((workHour) => ({
          id: workHour.hwrkID,
          startTime: workHour.startTime,
          endTime: workHour.endTime,
          langType: workHour.langType,
          notes: workHour.rNotes,
        }))
        .filter((range) => range.startTime && range.endTime);
    },
    [getWorkHoursForDay]
  );

  // Check if a day is a working day
  const isWorkingDay = useCallback(
    (date: Date) => {
      const dayWorkHours = getWorkHoursForDay(date);
      return dayWorkHours.length > 0;
    },
    [getWorkHoursForDay]
  );

  // Get work hours statistics
  const getWorkHoursStats = useCallback(() => {
    const activeDays = new Set(workHours.filter((wh) => wh.rActiveYN === "Y" && wh.wkHoliday === "N").map((wh) => wh.daysDesc)).size;
    const languages = new Set(workHours.filter((wh) => wh.rActiveYN === "Y").map((wh) => wh.langType)).size;
    const holidayHours = workHours.filter((wh) => wh.rActiveYN === "Y" && wh.wkHoliday === "Y").length;

    return {
      totalWorkHours: workHours.length,
      activeDays,
      languages,
      holidayHours,
    };
  }, [workHours]);

  // Fetch appointments by provider
  const fetchAppointmentsByProvider = useCallback(
    async (hplId: number, startDate: Date, endDate: Date) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await appointmentService.getAppointmentsByProvider(hplId, startDate, endDate);

        if (result.success && result.data) {
          setAppointments(result.data);
        } else {
          setError(result.errorMessage || "Failed to fetch appointments by provider");
          setAppointments([]);
        }

        // Also fetch breaks for the same provider and date range
        await fetchBreaks(startDate, endDate, hplId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        setAppointments([]);
        console.error("Error fetching appointments by provider:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchBreaks]
  );

  // Fetch appointments by patient
  const fetchAppointmentsByPatient = useCallback(async (pChartId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await appointmentService.getAppointmentsByPatient(pChartId);

      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        setError(result.errorMessage || "Failed to fetch appointments by patient");
        setAppointments([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setAppointments([]);
      console.error("Error fetching appointments by patient:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchWorkHours();
    fetchAppointments();
    fetchBreaks();
  }, [fetchWorkHours, fetchAppointments, fetchBreaks]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchWorkHours(), fetchAppointments(), fetchBreaks()]);
  }, [fetchWorkHours, fetchAppointments, fetchBreaks]);

  return {
    // Core data
    appointments,
    setAppointments,
    breaks,
    setBreaks,
    workHours,
    setWorkHours,

    // Loading and error states
    isLoading,
    error,

    // Appointment operations
    fetchAppointments,
    fetchAppointmentsByProvider,
    fetchAppointmentsByPatient,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    checkAppointmentConflicts,

    // Break operations
    fetchBreaks,

    // Work hours operations
    fetchWorkHours,
    getWorkHoursForDay,
    isTimeWithinWorkingHours,
    getAvailableTimeRanges,
    isWorkingDay,
    getWorkHoursStats,

    // Utility functions
    refreshData,
  };
};
