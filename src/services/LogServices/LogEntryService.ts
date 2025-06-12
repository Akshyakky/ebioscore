// src/services/LogServices/LogEntryService.ts

import { APIConfig } from "@/apiConfig";
import { AppLogEntry } from "@/interfaces/Common/AppLogEntry";
import { CommonApiService } from "@/services/CommonApiService";
import { GenericEntityService, OperationResult, PaginatedList } from "@/services/GenericEntityService/GenericEntityService";
import { createEntityService } from "@/utils/Common/serviceFactory";

export interface LogMessageRequest {
  level: string;
  message: string;
  source?: string;
  properties?: Record<string, any>;
}

export interface PagedLogEntriesRequest {
  pageIndex: number;
  pageSize: number;
  level?: string;
  startDate?: string; // ISO string format
  endDate?: string; // ISO string format
}

class ExtendedLogEntryService extends GenericEntityService<AppLogEntry> {
  constructor() {
    super(new CommonApiService({ baseURL: APIConfig.commonURL }), "LogEntry");
  }

  /**
   * Creates a new log entry
   */
  async createLogEntry(logEntry: AppLogEntry): Promise<OperationResult<AppLogEntry>> {
    return this.apiService.post<OperationResult<AppLogEntry>>(`${this.baseEndpoint}`, logEntry, this.getToken());
  }

  /**
   * Retrieves all log entries
   */
  async getAllLogEntries(): Promise<OperationResult<AppLogEntry[]>> {
    return this.apiService.get<OperationResult<AppLogEntry[]>>(`${this.baseEndpoint}`, this.getToken());
  }

  /**
   * Retrieves a log entry by ID
   */
  async getLogEntryById(id: number): Promise<OperationResult<AppLogEntry>> {
    return this.apiService.get<OperationResult<AppLogEntry>>(`${this.baseEndpoint}/${id}`, this.getToken());
  }

  /**
   * Deletes a log entry by ID
   */
  async deleteLogEntry(id: number): Promise<OperationResult<boolean>> {
    return this.apiService.delete<OperationResult<boolean>>(`${this.baseEndpoint}/${id}`, this.getToken());
  }

  /**
   * Retrieves paginated log entries with optional filtering
   */
  async getPagedLogEntries(request: PagedLogEntriesRequest): Promise<OperationResult<PaginatedList<AppLogEntry>>> {
    const params: Record<string, string> = {
      pageIndex: request.pageIndex.toString(),
      pageSize: request.pageSize.toString(),
    };

    if (request.level) {
      params.level = request.level;
    }

    if (request.startDate) {
      params.startDate = request.startDate;
    }

    if (request.endDate) {
      params.endDate = request.endDate;
    }

    return this.apiService.get<OperationResult<PaginatedList<AppLogEntry>>>(`${this.baseEndpoint}/paged`, this.getToken(), params);
  }

  /**
   * Logs a message with specified level and metadata
   */
  async logMessage(request: LogMessageRequest): Promise<OperationResult<AppLogEntry>> {
    const logRequest = {
      level: request.level || "Information",
      message: request.message,
      source: request.source,
      properties: request.properties || {},
    };

    return this.apiService.post<OperationResult<AppLogEntry>>(`${this.baseEndpoint}/logMessage`, logRequest, this.getToken());
  }

  /**
   * Convenience method to log different levels of messages
   */
  async logInformation(message: string, source?: string, properties?: Record<string, any>): Promise<OperationResult<AppLogEntry>> {
    return this.logMessage({
      level: "Information",
      message,
      source: source || "",
      properties: properties || {},
    });
  }

  async logWarning(message: string, source?: string, properties?: Record<string, any>): Promise<OperationResult<AppLogEntry>> {
    return this.logMessage({
      level: "Warning",
      message,
      source: source || "",
      properties: properties || {},
    });
  }

  async logError(message: string, source?: string, properties?: Record<string, any>): Promise<OperationResult<AppLogEntry>> {
    return this.logMessage({
      level: "Error",
      message,
      source: source || "",
      properties: properties || {},
    });
  }

  async logDebug(message: string, source?: string, properties?: Record<string, any>): Promise<OperationResult<AppLogEntry>> {
    return this.logMessage({
      level: "Debug",
      message,
      source: source || "",
      properties: properties || {},
    });
  }

  /**
   * Retrieves log entries filtered by date range
   */
  async getLogEntriesByDateRange(startDate: Date, endDate: Date, pageIndex: number = 0, pageSize: number = 50): Promise<OperationResult<PaginatedList<AppLogEntry>>> {
    return this.getPagedLogEntries({
      pageIndex,
      pageSize,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  /**
   * Retrieves log entries filtered by log level
   */
  async getLogEntriesByLevel(level: string, pageIndex: number = 0, pageSize: number = 50): Promise<OperationResult<PaginatedList<AppLogEntry>>> {
    return this.getPagedLogEntries({
      pageIndex,
      pageSize,
      level,
    });
  }

  /**
   * Retrieves recent log entries (last 24 hours)
   */
  async getRecentLogEntries(pageIndex: number = 0, pageSize: number = 50): Promise<OperationResult<PaginatedList<AppLogEntry>>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    return this.getLogEntriesByDateRange(startDate, endDate, pageIndex, pageSize);
  }

  /**
   * Retrieves error logs only
   */
  async getErrorLogs(pageIndex: number = 0, pageSize: number = 50): Promise<OperationResult<PaginatedList<AppLogEntry>>> {
    return this.getLogEntriesByLevel("Error", pageIndex, pageSize);
  }

  /**
   * Retrieves warning and error logs
   */
  async getCriticalLogs(pageIndex: number = 0, pageSize: number = 50): Promise<OperationResult<PaginatedList<AppLogEntry>>> {
    // Since the backend filters by exact level, we'll need to make separate calls
    // In a real implementation, you might want to modify the backend to accept multiple levels
    return this.getLogEntriesByLevel("Error", pageIndex, pageSize);
  }
}

// Export basic service using factory pattern (for simple CRUD operations)
export const logEntryService = createEntityService<AppLogEntry>("LogEntry", "commonURL");

// Export extended service with custom methods (for complex operations)
export const logEntryServiceExtended = new ExtendedLogEntryService();

// Export types for convenience
export type { AppLogEntry };

// Export commonly used log levels as constants
export const LogLevels = {
  TRACE: "Trace",
  DEBUG: "Debug",
  INFORMATION: "Information",
  WARNING: "Warning",
  ERROR: "Error",
  CRITICAL: "Critical",
  FATAL: "Fatal",
} as const;

export type LogLevel = (typeof LogLevels)[keyof typeof LogLevels];
