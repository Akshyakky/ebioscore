// src/frontOffice/utils/appointmentUtils.ts
import { AppointmentData, AppointmentLayout } from "../types";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "Scheduled":
      return "info";
    case "Confirmed":
      return "success";
    case "InProgress":
      return "warning";
    case "Completed":
      return "success";
    case "Cancelled":
      return "error";
    case "NoShow":
      return "error";
    default:
      return "default";
  }
};

export const calculateAppointmentLayout = (date: Date, appointments: AppointmentData[]): AppointmentLayout[] => {
  const sortedAppointments = [...appointments].sort((a, b) => new Date(a.abTime).getTime() - new Date(b.abTime).getTime());

  const layout: AppointmentLayout[] = [];
  const columns: Array<{ endTime: Date; appointments: AppointmentData[] }> = [];

  sortedAppointments.forEach((appointment) => {
    const startTime = new Date(appointment.abTime);
    const endTime = new Date(appointment.abEndTime);

    let columnIndex = columns.findIndex((col) => col.endTime <= startTime);

    if (columnIndex === -1) {
      columnIndex = columns.length;
      columns.push({ endTime, appointments: [appointment] });
    } else {
      columns[columnIndex].endTime = endTime;
      columns[columnIndex].appointments.push(appointment);
    }

    layout.push({
      appointment,
      column: columnIndex,
      totalColumns: Math.max(
        columns.length,
        layout.reduce((max, item) => Math.max(max, item.totalColumns), 1)
      ),
    });
  });

  layout.forEach((item) => {
    item.totalColumns = columns.length;
  });

  return layout;
};
