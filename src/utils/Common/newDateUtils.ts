// src/utils/Common/dateUtils.ts

/**
 * Comprehensive date utility functions for the application
 */

/**
 * Formats a date for display purposes
 * @param date - Date to format
 * @param includeTime - Whether to include time in the format
 * @returns Formatted date string
 */
export const formatDt = (date: Date | string | null | undefined, includeTime: boolean = true): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };

  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
};

/**
 * Calculates the number of days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days between the dates
 */
export const calculateDaysBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  const timeDifference = end.getTime() - start.getTime();
  return Math.floor(timeDifference / (1000 * 3600 * 24));
};

/**
 * Adds days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with added days
 */
export const addDays = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

/**
 * Subtracts days from a date
 * @param date - Base date
 * @param days - Number of days to subtract
 * @returns New date with subtracted days
 */
export const subtractDays = (date: Date | string, days: number): Date => {
  return addDays(date, -days);
};

/**
 * Gets the start of the day for a given date
 * @param date - Input date
 * @returns Date set to start of day (00:00:00)
 */
export const startOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Gets the end of the day for a given date
 * @param date - Input date
 * @returns Date set to end of day (23:59:59.999)
 */
export const endOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Checks if a date is today
 * @param date - Date to check
 * @returns True if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
};

/**
 * Checks if a date is yesterday
 * @param date - Date to check
 * @returns True if the date is yesterday
 */
export const isYesterday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const yesterday = subtractDays(new Date(), 1);

  return dateObj.getDate() === yesterday.getDate() && dateObj.getMonth() === yesterday.getMonth() && dateObj.getFullYear() === yesterday.getFullYear();
};

/**
 * Checks if a date is tomorrow
 * @param date - Date to check
 * @returns True if the date is tomorrow
 */
export const isTomorrow = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const tomorrow = addDays(new Date(), 1);

  return dateObj.getDate() === tomorrow.getDate() && dateObj.getMonth() === tomorrow.getMonth() && dateObj.getFullYear() === tomorrow.getFullYear();
};

/**
 * Gets a relative time description (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to compare
 * @param baseDate - Base date for comparison (defaults to now)
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date | string, baseDate: Date = new Date()): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const diffInSeconds = Math.floor((baseDate.getTime() - dateObj.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      const plural = count !== 1 ? "s" : "";
      if (diffInSeconds < 0) {
        return `in ${count} ${interval.label}${plural}`;
      } else {
        return `${count} ${interval.label}${plural} ago`;
      }
    }
  }

  return "just now";
};

/**
 * Formats a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @param separator - Separator between dates (default: " - ")
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date | string | null, endDate: Date | string | null, separator: string = " - "): string => {
  if (!startDate && !endDate) return "";
  if (!startDate) return `Until ${formatDt(endDate, false)}`;
  if (!endDate) return `From ${formatDt(startDate, false)}`;

  return `${formatDt(startDate, false)}${separator}${formatDt(endDate, false)}`;
};

/**
 * Gets the age from a birth date
 * @param birthDate - Birth date
 * @param referenceDate - Reference date for age calculation (defaults to today)
 * @returns Age in years
 */
export const calculateAge = (birthDate: Date | string, referenceDate: Date = new Date()): number => {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;

  if (isNaN(birth.getTime())) {
    return 0;
  }

  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birth.getDate())) {
    age--;
  }

  return Math.max(0, age);
};

/**
 * Formats time duration in a human-readable format
 * @param startTime - Start time
 * @param endTime - End time
 * @returns Formatted duration string
 */
export const formatDuration = (startTime: Date | string, endTime: Date | string): string => {
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;

  const diffInMs = end.getTime() - start.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    const remainingHours = diffInHours % 24;
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""}${remainingHours > 0 ? `, ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}` : ""}`;
  } else if (diffInHours > 0) {
    const remainingMinutes = diffInMinutes % 60;
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""}${remainingMinutes > 0 ? `, ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}` : ""}`;
  } else {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""}`;
  }
};

/**
 * Validates if a date string is in a valid format
 * @param dateString - Date string to validate
 * @returns True if valid date
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Gets the current server date (utility for consistent date handling)
 * @returns Current date
 */
export const getCurrentDate = (): Date => {
  return new Date();
};

/**
 * Converts a date to ISO string format for API calls
 * @param date - Date to convert
 * @returns ISO string representation
 */
export const toISOString = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString();
};

/**
 * Parses various date formats to a Date object
 * @param dateInput - Date input in various formats
 * @returns Parsed Date object or null if invalid
 */
export const parseDate = (dateInput: string | number | Date | null | undefined): Date | null => {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }

  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Default export with all date utility functions
 */
export default {
  formatDt,
  calculateDaysBetween,
  addDays,
  subtractDays,
  startOfDay,
  endOfDay,
  isToday,
  isYesterday,
  isTomorrow,
  getRelativeTime,
  formatDateRange,
  calculateAge,
  formatDuration,
  isValidDate,
  getCurrentDate,
  toISOString,
  parseDate,
};
