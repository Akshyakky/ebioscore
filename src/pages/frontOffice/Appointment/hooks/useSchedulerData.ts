// src/pages/frontOffice/Appointment/hooks/useSchedulerData.ts
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { BreakListData } from "@/interfaces/FrontOffice/BreakListDto";
import { HospWorkHoursDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { hospWorkHoursService } from "@/services/FrontOfficeServices/HospWorkHoursService";
import { useCallback, useEffect, useState } from "react";

const Appointments: AppointBookingDto[] = [];
const Breaks: BreakListData[] = [];

export const useSchedulerData = () => {
  const [appointments, setAppointments] = useState<AppointBookingDto[]>(Appointments);
  const [breaks, setBreaks] = useState<BreakListData[]>(Breaks);
  const [workHours, setWorkHours] = useState<HospWorkHoursDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch work hours from API
  const fetchWorkHours = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await hospWorkHoursService.getAll();

      if (result.success && result.data) {
        // Filter only active work hours
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

  // Get work hours for a specific day
  const getWorkHoursForDay = useCallback(
    (date: Date) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      var dayWorkHour = workHours.filter((wh) => wh.daysDesc.toUpperCase() === dayName && wh.rActiveYN === "Y" && wh.wkHoliday === "N");
      return dayWorkHour;
    },
    [workHours]
  );

  // Get holiday work hours for a specific day
  const getHolidayWorkHoursForDay = useCallback(
    (date: Date) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      var dayWorkHour = workHours.filter((wh) => wh.daysDesc.toUpperCase() === dayName && wh.rActiveYN === "Y" && wh.wkHoliday === "Y");
      return dayWorkHour;
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

  // Initialize data on mount
  useEffect(() => {
    fetchWorkHours();
  }, [fetchWorkHours]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await fetchWorkHours();
    // Add appointment and break fetching here when available
  }, [fetchWorkHours]);

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

    // Work hours operations
    fetchWorkHours,
    getWorkHoursForDay,
    getHolidayWorkHoursForDay,
    isTimeWithinWorkingHours,
    getAvailableTimeRanges,
    isWorkingDay,
    getWorkHoursStats,

    // Utility functions
    refreshData,
  };
};
