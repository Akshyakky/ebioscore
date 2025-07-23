// src/frontOffice/hooks/useTimeSlots.ts
import { useMemo } from "react";
import { TimeSlot } from "../types";

export const useTimeSlots = () => {
  return useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push({
          time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
          hour,
          minute,
        });
      }
    }
    return slots;
  }, []);
};
