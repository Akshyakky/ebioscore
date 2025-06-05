// src/utils/Common/formatUtils.ts

/**
 * Utility functions for formatting various data types consistently across the application
 */

/**
 * Formats a number as currency with proper locale formatting
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = "USD", locale: string = "en-US"): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }

  // For Indian Rupee formatting
  if (currency === "INR" || locale === "en-IN") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a date object or string to a readable date format
 * @param date - The date to format
 * @param format - The format type ('short', 'medium', 'long', 'full')
 * @param locale - The locale for formatting
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | null | undefined, format: "short" | "medium" | "long" | "full" = "medium", locale: string = "en-US"): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const options = {
    short: { day: "2-digit" as const, month: "2-digit" as const, year: "numeric" as const },
    medium: { day: "2-digit" as const, month: "short" as const, year: "numeric" as const },
    long: { day: "2-digit" as const, month: "long" as const, year: "numeric" as const },
    full: { weekday: "long" as const, day: "2-digit" as const, month: "long" as const, year: "numeric" as const },
  }[format];

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Formats a date and time object or string
 * @param datetime - The datetime to format
 * @param includeSeconds - Whether to include seconds
 * @param locale - The locale for formatting
 * @returns Formatted datetime string
 */
export const formatDateTime = (datetime: Date | string | null | undefined, includeSeconds: boolean = false, locale: string = "en-US"): string => {
  if (!datetime) return "";

  const dateObj = typeof datetime === "string" ? new Date(datetime) : datetime;

  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(includeSeconds && { second: "2-digit" }),
    hour12: true,
  };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Shorter alias for formatDateTime for backward compatibility
 */
export const formatDt = formatDateTime;

/**
 * Formats a number with proper thousand separators
 * @param value - The number to format
 * @param minimumFractionDigits - Minimum decimal places
 * @param maximumFractionDigits - Maximum decimal places
 * @returns Formatted number string
 */
export const formatNumber = (value: number | null | undefined, minimumFractionDigits: number = 0, maximumFractionDigits: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

/**
 * Formats a percentage value
 * @param value - The decimal value (0.15 for 15%)
 * @param minimumFractionDigits - Minimum decimal places
 * @param maximumFractionDigits - Maximum decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number | null | undefined, minimumFractionDigits: number = 1, maximumFractionDigits: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100);
};

/**
 * Formats a phone number
 * @param phoneNumber - The phone number to format
 * @param countryCode - The country code (default: +1 for US)
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber: string | null | undefined, countryCode: string = "+1"): string => {
  if (!phoneNumber) return "";

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Format for different lengths
  if (cleaned.length === 10) {
    return `${countryCode} (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phoneNumber; // Return original if can't format
};

/**
 * Formats file size in human-readable format
 * @param bytes - The size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number | null | undefined, decimals: number = 2): string => {
  if (!bytes || bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export const truncateText = (text: string | null | undefined, maxLength: number, suffix: string = "..."): string => {
  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalizes the first letter of each word in a string
 * @param text - The text to capitalize
 * @returns Capitalized text
 */
export const capitalizeWords = (text: string | null | undefined): string => {
  if (!text) return "";

  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Formats a medical record number with proper formatting
 * @param mrn - The medical record number
 * @param format - The format pattern (default: 'XXX-XXX-XXXX')
 * @returns Formatted MRN
 */
export const formatMRN = (mrn: string | null | undefined, format: string = "XXX-XXX-XXXX"): string => {
  if (!mrn) return "";

  const cleaned = mrn.replace(/\D/g, "");
  let formatted = "";
  let cleanedIndex = 0;

  for (let i = 0; i < format.length && cleanedIndex < cleaned.length; i++) {
    if (format[i] === "X") {
      formatted += cleaned[cleanedIndex];
      cleanedIndex++;
    } else {
      formatted += format[i];
    }
  }

  return formatted;
};

/**
 * Formats an address object into a single string
 * @param address - The address object
 * @returns Formatted address string
 */
export const formatAddress = (
  address:
    | {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      }
    | null
    | undefined
): string => {
  if (!address) return "";

  const parts = [address.street, address.city, address.state, address.zipCode, address.country].filter(Boolean);

  return parts.join(", ");
};

/**
 * Formats a time duration in milliseconds to human-readable format
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 */
export const formatDuration = (milliseconds: number | null | undefined): string => {
  if (!milliseconds || milliseconds < 0) return "0 seconds";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""}, ${hours % 24} hour${hours % 24 !== 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes % 60} minute${minutes % 60 !== 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}, ${seconds % 60} second${seconds % 60 !== 1 ? "s" : ""}`;
  } else {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }
};

/**
 * Default export object with all formatting functions
 */
export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDt,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatFileSize,
  truncateText,
  capitalizeWords,
  formatMRN,
  formatAddress,
  formatDuration,
};
