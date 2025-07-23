import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";

export interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

export interface AppointmentLayout {
  appointment: AppointBookingDto;
  column: number;
  totalColumns: number;
}
