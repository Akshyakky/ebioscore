// src/hooks/useDateOperations.ts
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

export const useDateOperations = () => {
  const DEFAULT_TIMEZONE = "Asia/Kolkata"; // Adjust as needed

  // Format dates
  const formatDate = (
    date: dayjs.ConfigType,
    format: string = "DD/MM/YYYY"
  ) => {
    return dayjs(date).format(format);
  };

  const formatDateTime = (
    date: dayjs.ConfigType,
    format: string = "DD/MM/YYYY HH:mm"
  ) => {
    return dayjs(date).format(format);
  };

  const formatTime = (date: dayjs.ConfigType, format: string = "HH:mm") => {
    return dayjs(date).format(format);
  };

  // Parse dates
  const parseDate = (dateString: string, format: string = "DD/MM/YYYY") => {
    return dayjs(dateString, format);
  };

  const parseDateTime = (
    dateTimeString: string,
    format: string = "DD/MM/YYYY HH:mm"
  ) => {
    return dayjs(dateTimeString, format);
  };

  const parseTime = (
    timeString: string,
    baseDate: dayjs.ConfigType = undefined
  ) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return baseDate
      ? dayjs(baseDate).hour(hours).minute(minutes)
      : dayjs().hour(hours).minute(minutes);
  };

  // Date calculations
  const calculateDateRange = (
    view: "day" | "week" | "workWeek" | "month",
    date: dayjs.ConfigType
  ) => {
    const dateObj = dayjs(date);
    let start = dateObj.startOf("day");
    let end = dateObj.endOf("day");

    switch (view) {
      case "week":
        start = dateObj.startOf("week");
        end = dateObj.endOf("week");
        break;
      case "workWeek":
        start = dateObj.startOf("week").add(1, "day");
        end = start.add(4, "day").endOf("day");
        break;
      case "month":
        start = dateObj.startOf("month");
        end = dateObj.endOf("month");
        break;
    }

    return { start, end };
  };

  const calculateEndTime = (
    startTime: dayjs.ConfigType,
    durationMinutes: number
  ) => {
    return dayjs(startTime).add(durationMinutes, "minute");
  };

  const addDuration = (
    date: dayjs.ConfigType,
    amount: number,
    unit: dayjs.ManipulateType
  ) => {
    return dayjs(date).add(amount, unit);
  };

  const subtractDuration = (
    date: dayjs.ConfigType,
    amount: number,
    unit: dayjs.ManipulateType
  ) => {
    return dayjs(date).subtract(amount, unit);
  };

  // Date comparisons
  const isSameDay = (date1: dayjs.ConfigType, date2: dayjs.ConfigType) => {
    return dayjs(date1).isSame(dayjs(date2), "day");
  };

  const isBefore = (date1: dayjs.ConfigType, date2: dayjs.ConfigType) => {
    return dayjs(date1).isBefore(dayjs(date2));
  };

  const isAfter = (date1: dayjs.ConfigType, date2: dayjs.ConfigType) => {
    return dayjs(date1).isAfter(dayjs(date2));
  };

  // Utility functions
  const getCurrentDate = () => dayjs().tz(DEFAULT_TIMEZONE);

  const getCurrentDateTime = () => dayjs().tz(DEFAULT_TIMEZONE);

  const toDate = (date: dayjs.ConfigType) => dayjs(date).toDate();

  const toISOString = (date: dayjs.ConfigType) => dayjs(date).toISOString();

  const getDayOfWeek = (date: dayjs.ConfigType) => dayjs(date).day();

  const getWeekOfYear = (date: dayjs.ConfigType) => dayjs(date).week();

  const getDaysInMonth = (date: dayjs.ConfigType) => dayjs(date).daysInMonth();

  // Time zone operations
  const convertToTimezone = (date: dayjs.ConfigType, timezone: string) => {
    return dayjs(date).tz(timezone);
  };

  const convertToLocalTime = (date: dayjs.ConfigType) => {
    return dayjs(date).local();
  };

  // Date validations
  const isValidDate = (date: dayjs.ConfigType) => {
    return dayjs(date).isValid();
  };

  return {
    formatDate,
    formatDateTime,
    formatTime,
    parseDate,
    parseDateTime,
    parseTime,
    calculateDateRange,
    calculateEndTime,
    addDuration,
    subtractDuration,
    isSameDay,
    isBefore,
    isAfter,
    getCurrentDate,
    getCurrentDateTime,
    toDate,
    toISOString,
    getDayOfWeek,
    getWeekOfYear,
    getDaysInMonth,
    convertToTimezone,
    convertToLocalTime,
    isValidDate,
  };
};
