// src/frontOffice/utils/appointmentUtils.ts
import { AppointBookingDto } from "@/interfaces/FrontOffice/AppointBookingDto";
import { AppointmentLayout } from "../types";

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

export const calculateAppointmentLayout = (date: Date, appointments: AppointBookingDto[]): AppointmentLayout[] => {
  const sortedAppointments = [...appointments].sort((a, b) => new Date(a.abTime).getTime() - new Date(b.abTime).getTime());

  const layout: AppointmentLayout[] = [];
  const columns: Array<{ endTime: Date; appointments: AppointBookingDto[] }> = [];

  // Define minimum number of columns for consistent sizing
  const MINIMUM_COLUMNS = 5;

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
      totalColumns: Math.max(MINIMUM_COLUMNS, columns.length),
    });
  });

  // Ensure all appointments have the same totalColumns value
  // Use the maximum of MINIMUM_COLUMNS or actual columns needed
  const finalTotalColumns = Math.max(MINIMUM_COLUMNS, columns.length);

  layout.forEach((item) => {
    item.totalColumns = finalTotalColumns;
  });

  return layout;
};

/**
 * Calculate the optimal width for appointments based on total columns and minimum size requirements
 * This ensures appointments don't become too narrow when there are many columns
 */
export const calculateAppointmentWidth = (totalColumns: number, minWidthPercentage: number = 15): { width: string; shouldStack: boolean } => {
  const idealWidth = 100 / totalColumns - 1; // -1 for margin

  // If calculated width is too small, suggest stacking or alternative layout
  if (idealWidth < minWidthPercentage) {
    return {
      width: `${minWidthPercentage}%`,
      shouldStack: true,
    };
  }

  return {
    width: `${idealWidth}%`,
    shouldStack: false,
  };
};

/**
 * Distribute appointments evenly across available columns when there are fewer appointments than minimum columns
 * This provides better visual balance
 */
export const calculateDistributedLayout = (date: Date, appointments: AppointBookingDto[]): AppointmentLayout[] => {
  const sortedAppointments = [...appointments].sort((a, b) => new Date(a.abTime).getTime() - new Date(b.abTime).getTime());
  const MINIMUM_COLUMNS = 5;

  if (sortedAppointments.length === 0) {
    return [];
  }

  const layout: AppointmentLayout[] = [];
  const columns: Array<{ endTime: Date; appointments: AppointBookingDto[] }> = [];

  // First pass: Calculate actual overlapping columns
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
      totalColumns: Math.max(MINIMUM_COLUMNS, columns.length),
    });
  });

  const actualColumns = columns.length;
  const finalTotalColumns = Math.max(MINIMUM_COLUMNS, actualColumns);

  // If we have fewer actual columns than minimum, distribute appointments for better visual balance
  if (actualColumns < MINIMUM_COLUMNS && actualColumns > 1) {
    const distributionFactor = Math.floor(MINIMUM_COLUMNS / actualColumns);

    layout.forEach((item, index) => {
      // Distribute columns more evenly across the available space
      item.column = item.column * distributionFactor;
      item.totalColumns = finalTotalColumns;
    });
  } else {
    // Standard case: just ensure all have the same totalColumns
    layout.forEach((item) => {
      item.totalColumns = finalTotalColumns;
    });
  }

  return layout;
};
