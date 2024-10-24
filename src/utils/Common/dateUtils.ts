//utils/Common/dateUtils.ts
import { format } from "date-fns";

export function formatDate(isoString: string): string {
  return format(new Date(isoString), "dd/MM/yyyy");
}

export const formatDt = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
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
  return date.toISOString().split("T")[0];
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
