// src/frontOffice/hooks/useSchedulerData.ts
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { BreakListData } from "@/interfaces/FrontOffice/BreakListDto";
import { HospWorkHoursDto } from "@/interfaces/FrontOffice/HospWorkHoursDto";
import { useState } from "react";

const Appointments: AppointBookingDto[] = [];

const Breaks: BreakListData[] = [];

const WorkHours: HospWorkHoursDto[] = [];

export const useSchedulerData = () => {
  const [appointments, setAppointments] = useState<AppointBookingDto[]>(Appointments);
  const [breaks, setBreaks] = useState<BreakListData[]>(Breaks);
  const [workHours, setWorkHours] = useState<HospWorkHoursDto[]>(WorkHours);

  return {
    appointments,
    setAppointments,
    breaks,
    setBreaks,
    workHours,
    setWorkHours,
  };
};
