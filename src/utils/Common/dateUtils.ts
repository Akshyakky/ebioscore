//utils/Common/dateUtils.ts
import dayjs from "dayjs";

export function formatDate(isoString: string): string {
  return dayjs(isoString).format("DD/MM/YYYY");
}

export const formatDt = (date: Date): string => {
  return dayjs(date).format("DD/MM/YYYY");
};
// src/utils/Common/dateUtils.ts

/**
 * Gets the current date at midnight (00:00:00)
 */
export const getTodayStart = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Gets the current date at end of day (23:59:59)
 */
export const getTodayEnd = (): Date => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

/**
 * Gets the current date and time
 */
export const getCurrentDateTime = (): Date => {
  return new Date();
};

/**
 * Formats a date to ISO string without timezone
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split("T")[0] ?? "";
};

/**
 * Validates if a date is valid
 */
export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Gets default date for forms (current date at midnight)
 */
export const getDefaultFormDate = (): Date => {
  return getTodayStart();
};

/**
 * Calculates the number of days between two dates
 */
export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatTimeStringToDate = (timeString: string): Date => {
  const today = new Date();
  const [hours, minutes] = timeString.split(":");

  const dateWithTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours ?? "0"), parseInt(minutes ?? "0"));
  return dateWithTime;
};
