import { APIConfig } from "@/apiConfig";
import { AppLogEntry } from "@/interfaces/Common/AppLogEntry";
import { OperationResult } from "@/interfaces/Common/OperationResult";
import { PaginatedList } from "@/interfaces/Common/PaginatedList";
import { CommonApiService } from "@/services/CommonApiService";
import { store } from "@/store";

// Initialize API service
const apiService = new CommonApiService({
  baseURL: APIConfig.commonURL,
});

// Function to get the token from the store
const getToken = () => store.getState().auth.token!;

/**
 * Get all log entries
 */
const getAllLogEntries = async (): Promise<OperationResult<AppLogEntry[]>> => {
  return apiService.get<OperationResult<AppLogEntry[]>>("LogEntry", getToken());
};

/**
 * Get log entry by id
 */
const getLogEntryById = async (id: number): Promise<OperationResult<AppLogEntry>> => {
  return apiService.get<OperationResult<AppLogEntry>>(`LogEntry/${id}`, getToken());
};

/**
 * Get paged log entries with filtering options
 */
const getPagedLogEntries = async (pageIndex: number, pageSize: number, level?: string, startDate?: Date, endDate?: Date): Promise<OperationResult<PaginatedList<AppLogEntry>>> => {
  const params: Record<string, any> = {
    pageIndex,
    pageSize,
  };

  if (level) {
    params.level = level;
  }

  if (startDate) {
    params.startDate = startDate.toISOString();
  }

  if (endDate) {
    params.endDate = endDate.toISOString();
  }

  return apiService.get<OperationResult<PaginatedList<AppLogEntry>>>("LogEntry/paged", getToken(), params);
};

export const LogService = {
  getAllLogEntries,
  getLogEntryById,
  getPagedLogEntries,
};
