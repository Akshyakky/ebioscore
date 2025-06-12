import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { toast } from "react-toastify";

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

interface ApiErrorResponse {
  message?: string;
  errors?: { [key: string]: string[] };
  statusCode?: number;
}

interface ErrorDetails {
  message: string;
  code?: string;
  status?: number;
  timestamp: string;
  path?: string;
}

const handleError = (error: unknown): void => {
  const errorDetails: ErrorDetails = {
    message: "An unexpected error occurred",
    timestamp: new Date().toISOString(),
  };

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as ApiErrorResponse;
    errorDetails.message = response?.message || error.message;
    errorDetails.status = error.response?.status ?? 0;
    errorDetails.code = error.code ?? "";
    errorDetails.path = error.config?.url ?? "";

    // Log detailed error information
    console.error("API Error:", {
      message: errorDetails.message,
      status: errorDetails.status,
      code: errorDetails.code,
      path: errorDetails.path,
      response: error.response?.data,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        headers: error.config?.headers,
      },
    });

    // Show appropriate toast notification based on error type
    if (errorDetails.status === 401) {
      toast.error("Session expired. Please log in again.");
      // You might want to trigger a logout or redirect here
    } else if (errorDetails.status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (errorDetails.status === 404) {
      toast.error("The requested resource was not found.");
    } else if (errorDetails.status === 500) {
      toast.error("Server error. Please try again later.");
    } else {
      toast.error(errorDetails.message);
    }
  } else if (error instanceof Error) {
    // Handle standard Error objects
    errorDetails.message = error.message;
    errorDetails.code = error.name;

    console.error("Standard Error:", {
      message: errorDetails.message,
      code: errorDetails.code,
      stack: error.stack,
    });

    toast.error(errorDetails.message);
  } else {
    // Handle unknown error types
    console.error("Unknown Error:", error);
    toast.error("An unexpected error occurred. Please try again.");
  }

  // Here you could add additional error reporting logic
  // For example, sending to an error tracking service
  if (process.env.NODE_ENV === "production") {
    // Send error to monitoring service
    // errorReportingService.captureError(errorDetails);
  }
};

export interface ApiConfig {
  baseURL: string;
}

type HttpMethod = "get" | "post" | "put" | "delete";

export class CommonApiService {
  private readonly baseURL: string;
  private readonly timeZone: string;
  private readonly apiSecret: string;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.apiSecret = import.meta.env.VITE_API_SECRET;
  }

  private generateSignature(data: unknown): string {
    const payload = JSON.stringify(this.processData(data));
    // Using crypto-js for browser compatibility
    const hmac = CryptoJS.HmacSHA256(payload, this.apiSecret);
    return hmac.toString().toLowerCase();
  }

  private generateUUID(): string {
    // Try native implementation first
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    // Fallback implementation
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private getHeaders(token?: string, additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Time-Zone": this.timeZone,
      //"X-Request-ID": crypto.randomUUID ? crypto.randomUUID() : self.crypto.randomUUID(),
      "X-Request-ID": this.generateUUID(),
      "X-Request-Timestamp": new Date().toISOString(),
      // Prevent MIME type sniffing
      "X-Content-Type-Options": "nosniff",
      // Prevent clickjackingx
      "X-Frame-Options": "DENY",
      // Enable strict XSS protection
      "X-XSS-Protection": "1; mode=block",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return { ...headers, ...additionalHeaders };
  }

  private formatDateWithTimeZone(date: Date): string {
    return dayjs(date).tz(this.timeZone).format("YYYY-MM-DDTHH:mm:ssZ");
  }

  private processData(data: unknown): unknown {
    if (data instanceof Date) {
      return this.formatDateWithTimeZone(data);
    } else if (Array.isArray(data)) {
      return data.map((item) => this.processData(item));
    } else if (typeof data === "object" && data !== null) {
      return Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = this.processData(value);
        return acc;
      }, {} as Record<string, unknown>);
    }
    return data;
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    token?: string,
    additionalHeaders?: Record<string, string>,
    params?: Record<string, unknown>
  ): Promise<AxiosResponse<T>> {
    const processedData = this.processData(data);
    const signature = this.generateSignature(processedData);

    const config: AxiosRequestConfig = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        ...this.getHeaders(token, additionalHeaders),
        "X-Request-Signature": signature,
      },
      data: processedData,
      params: this.processData(params),
      withCredentials: true,
      // Add request timeout
      timeout: 30000,
      // Limit response size
      maxContentLength: 10 * 1024 * 1024, // 10MB
      maxBodyLength: 10 * 1024 * 1024, // 10MB
      // Validate status
      validateStatus: (status) => status >= 200 && status < 300,
    };

    return axios(config);
  }

  private async makeRequest<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    token?: string,
    additionalHeaders?: Record<string, string>,
    params?: Record<string, unknown>
  ): Promise<T> {
    try {
      const response = await this.request<T>(method, endpoint, data, token, additionalHeaders, params);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  public async get<T>(endpoint: string, token?: string, params?: Record<string, unknown>, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>("get", endpoint, undefined, token, additionalHeaders, params);
  }

  public async post<T>(endpoint: string, data: unknown, token?: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>("post", endpoint, data, token, additionalHeaders);
  }

  public async put<T>(endpoint: string, data: unknown, token?: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>("put", endpoint, data, token, additionalHeaders);
  }

  public async delete<T>(endpoint: string, token?: string, data?: unknown, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>("delete", endpoint, data, token, additionalHeaders);
  }

  public async getBlob(endpoint: string, token?: string, params?: Record<string, unknown>, additionalHeaders?: Record<string, string>): Promise<Blob> {
    try {
      const config: AxiosRequestConfig = {
        method: "get",
        url: `${this.baseURL}${endpoint}`,
        headers: this.getHeaders(token, additionalHeaders),
        params: this.processData(params),
        responseType: "blob",
        withCredentials: true,
      };
      const response = await axios(config);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}
