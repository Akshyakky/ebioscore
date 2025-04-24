// src/utils/sanitizeInput.ts
import DOMPurify from "dompurify";

/**
 * Sanitizes string inputs to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  return typeof input === "string" ? DOMPurify.sanitize(input).trim() : "";
}

/**
 * Sanitizes an object by cleaning all string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };

  Object.keys(result).forEach((key) => {
    const value = result[key];

    if (typeof value === "string") {
      (result as Record<string, any>)[key] = sanitizeString(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      (result as Record<string, any>)[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      (result as Record<string, any>)[key] = value.map((item) => (typeof item === "object" ? sanitizeObject(item) : item));
    }
  });

  return result;
}

/**
 * Use this in form submissions to sanitize all input data
 */
export function sanitizeFormData<T extends Record<string, any>>(formData: T): T {
  return sanitizeObject(formData);
}
