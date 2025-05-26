import { OperationResult } from "@/interfaces/Common/OperationResult";
import { AppointmentService } from "@/services/NotGenericPaternServices/AppointmentService";
import { debounce } from "@/utils/Common/debounceUtils";
import { useCallback, useEffect, useMemo, useState } from "react";
import useDayjs from "../Common/useDateTime";
import { useServerDate } from "../Common/useServerDate";

interface SchedulerState {
  appointments: any[];
  currentView: "day" | "week" | "workWeek" | "month";
  date: Date;
}

export const useAppointments = (initialDate: Date, hpID?: number, rlID?: number) => {
  const { date: serverDate, formatDate, formatDateTime, formatTime, add, formatISO, format, parse } = useDayjs(useServerDate());
  const [state, setState] = useState<SchedulerState>({
    appointments: [],
    currentView: "day",
    date: initialDate,
  });

  const calculateDateRange = useCallback((view: "day" | "week" | "workWeek" | "month", date: Date) => {
    const start = new Date(date);
    const end = new Date(date);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    switch (view) {
      case "week":
        start.setDate(date.getDate() - date.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case "workWeek":
        start.setDate(date.getDate() - (date.getDay() - 1));
        end.setDate(start.getDate() + 4);
        break;
      case "month":
        start.setDate(1);
        end.setMonth(date.getMonth() + 1);
        end.setDate(0);
        break;
    }

    return { start, end };
  }, []);

  const loadAppointments = useCallback(
    async (view: "day" | "week" | "workWeek" | "month", date: Date) => {
      const { start, end } = calculateDateRange(view, date);
      const startDate = format("YYYY-MM-DD", start);
      const endDate = format("YYYY-MM-DD", end);

      try {
        const result: OperationResult<any[]> = await AppointmentService.fetchAppointmentsByDateAndType(startDate, endDate, hpID, rlID);
        setState((prevState) => ({
          ...prevState,
          appointments: result.success && result.data ? result.data : [],
        }));
      } catch (error) {
        setState((prevState) => ({ ...prevState, appointments: [] }));
      }
    },
    [calculateDateRange, hpID, rlID]
  );

  const debouncedLoadAppointments = useMemo(() => debounce(loadAppointments, 300), [loadAppointments]);

  useEffect(() => {
    debouncedLoadAppointments(state.currentView, state.date);
    return () => {
      debouncedLoadAppointments.cancel();
    };
  }, [state.currentView, state.date, hpID, rlID, debouncedLoadAppointments]);

  const refresh = () => {
    loadAppointments(state.currentView, state.date);
  };

  return {
    state,
    setState,
    refresh,
  };
};
