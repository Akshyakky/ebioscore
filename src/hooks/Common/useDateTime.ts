import { useState, useCallback, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// Extend Day.js with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

type DateInput = string | number | Date | Dayjs;
type Unit =
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond";

interface UseDayjsReturn {
  date: Dayjs;
  setDate: (date: DateInput) => void;
  format: (template?: string, date?: DateInput) => string;
  formatDate: (date?: DateInput) => string;
  formatDateYMD: (date?: DateInput) => string;
  formatDateTime: (date?: DateInput) => string;
  formatTime: (date?: DateInput) => string;
  formatISO: (date?: DateInput) => string;
  formatUnix: (date?: DateInput) => number;
  parse: (dateString: string, format?: string) => Dayjs;
  add: (amount: number, unit: Unit, date?: DateInput) => Dayjs;
  subtract: (amount: number, unit: Unit, date?: DateInput) => Dayjs;
  startOf: (unit: Unit, date?: DateInput) => Dayjs;
  endOf: (unit: Unit, date?: DateInput) => Dayjs;
  isBefore: (compareDate: DateInput, date?: DateInput) => boolean;
  isAfter: (compareDate: DateInput, date?: DateInput) => boolean;
  isSame: (compareDate: DateInput, unit?: Unit, date?: DateInput) => boolean;
  isBetween: (
    start: DateInput,
    end: DateInput,
    unit?: Unit,
    inclusivity?: "()" | "[]" | "[)" | "(]",
    date?: DateInput
  ) => boolean;
  diff: (
    compareDate: DateInput,
    unit?: Unit,
    float?: boolean,
    date?: DateInput
  ) => number;
  toUTC: (date?: DateInput) => Dayjs;
  toLocal: (date?: DateInput) => Dayjs;
  setTimezone: (tz: string, date?: DateInput) => Dayjs;
  fromNow: (withoutSuffix?: boolean, date?: DateInput) => string;
  calendar: (date?: DateInput) => {
    year: number;
    month: number;
    date: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  };
}

const useDayjs = (initialDate: DateInput = new Date()): UseDayjsReturn => {
  const [date, setInternalDate] = useState<Dayjs>(dayjs(initialDate));

  const setDate = useCallback((newDate: DateInput): void => {
    setInternalDate(dayjs(newDate));
  }, []);

  const format = useCallback(
    (
      template: string = "YYYY-MM-DD HH:mm:ss",
      inputDate?: DateInput
    ): string => {
      return dayjs(inputDate || date).format(template);
    },
    [date]
  );

  const formatDate = useCallback(
    (inputDate?: DateInput): string => {
      return dayjs(inputDate || date).format("DD/MM/YYYY");
    },
    [date]
  );

  const formatDateYMD = useCallback(
    (inputDate?: DateInput): string => {
      return dayjs(inputDate || date).format("YYYY-MM-DD");
    },
    [date]
  );

  const formatDateTime = useCallback(
    (inputDate?: DateInput): string => {
      return dayjs(inputDate || date).format("DD/MM/YYYY HH:mm");
    },
    [date]
  );

  const formatTime = useCallback(
    (inputDate?: DateInput): string => {
      return dayjs(inputDate || date).format("HH:mm");
    },
    [date]
  );

  const formatISO = useCallback(
    (inputDate?: DateInput): string => {
      return dayjs(inputDate || date).toISOString();
    },
    [date]
  );

  const formatUnix = useCallback(
    (inputDate?: DateInput): number => {
      return dayjs(inputDate || date).unix();
    },
    [date]
  );

  const parse = useCallback((dateString: string, format?: string): Dayjs => {
    return dayjs(dateString, format);
  }, []);

  const add = useCallback(
    (amount: number, unit: Unit, inputDate?: DateInput): Dayjs => {
      return dayjs(inputDate || date).add(amount, unit);
    },
    [date]
  );

  const subtract = useCallback(
    (amount: number, unit: Unit, inputDate?: DateInput): Dayjs => {
      return dayjs(inputDate || date).subtract(amount, unit);
    },
    [date]
  );

  const startOf = useCallback(
    (unit: Unit, inputDate?: DateInput): Dayjs => {
      return dayjs(inputDate || date).startOf(unit);
    },
    [date]
  );

  const endOf = useCallback(
    (unit: Unit, inputDate?: DateInput): Dayjs => {
      return dayjs(inputDate || date).endOf(unit);
    },
    [date]
  );

  const isBefore = useCallback(
    (compareDate: DateInput, inputDate?: DateInput): boolean => {
      return dayjs(inputDate || date).isBefore(dayjs(compareDate));
    },
    [date]
  );

  const isAfter = useCallback(
    (compareDate: DateInput, inputDate?: DateInput): boolean => {
      return dayjs(inputDate || date).isAfter(dayjs(compareDate));
    },
    [date]
  );

  const isSame = useCallback(
    (compareDate: DateInput, unit?: Unit, inputDate?: DateInput): boolean => {
      return dayjs(inputDate || date).isSame(dayjs(compareDate), unit);
    },
    [date]
  );

  const isBetween = useCallback(
    (
      start: DateInput,
      end: DateInput,
      unit?: Unit,
      inclusivity?: "()" | "[]" | "[)" | "(]",
      inputDate?: DateInput
    ): boolean => {
      return dayjs(inputDate || date).isBetween(
        dayjs(start),
        dayjs(end),
        unit,
        inclusivity
      );
    },
    [date]
  );

  const diff = useCallback(
    (
      compareDate: DateInput,
      unit?: Unit,
      float?: boolean,
      inputDate?: DateInput
    ): number => {
      return dayjs(inputDate || date).diff(dayjs(compareDate), unit, float);
    },
    [date]
  );

  const toUTC = useCallback(
    (inputDate?: DateInput): Dayjs => {
      return dayjs(inputDate || date).utc();
    },
    [date]
  );

  const toLocal = useCallback(
    (inputDate?: DateInput): Dayjs => {
      return dayjs(inputDate || date).local();
    },
    [date]
  );

  const setTimezone = useCallback(
    (tz: string, inputDate?: DateInput): Dayjs => {
      return dayjs(inputDate || date).tz(tz);
    },
    [date]
  );

  const fromNow = useCallback(
    (withoutSuffix?: boolean, inputDate?: DateInput): string => {
      return dayjs(inputDate || date).fromNow(withoutSuffix);
    },
    [date]
  );

  const calendar = useCallback(
    (inputDate?: DateInput) => {
      const d = dayjs(inputDate || date);
      return {
        year: d.year(),
        month: d.month(),
        date: d.date(),
        day: d.day(),
        hour: d.hour(),
        minute: d.minute(),
        second: d.second(),
        millisecond: d.millisecond(),
      };
    },
    [date]
  );

  return {
    date,
    setDate,
    format,
    formatDate,
    formatDateYMD,
    formatDateTime,
    formatTime,
    formatISO,
    formatUnix,
    parse,
    add,
    subtract,
    startOf,
    endOf,
    isBefore,
    isAfter,
    isSame,
    isBetween,
    diff,
    toUTC,
    toLocal,
    setTimezone,
    fromNow,
    calendar,
  };
};

export default useDayjs;
