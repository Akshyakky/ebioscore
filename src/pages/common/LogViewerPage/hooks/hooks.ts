// src/pages/common/LogViewerPage/hooks/useLogEntries.ts

import { AppLogEntry } from "@/interfaces/Common/AppLogEntry";
import { logEntryServiceExtended, LogLevels, PagedLogEntriesRequest } from "@/services/LogServices/LogEntryService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export interface LogFilters {
  level: string;
  startDate: Date | null;
  endDate: Date | null;
  source: string;
  searchTerm: string;
}

export interface LogStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  debugCount: number;
}

export const useLogEntries = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState<LogFilters>({
    level: "",
    startDate: null,
    endDate: null,
    source: "",
    searchTerm: "",
  });

  // Query for paginated log entries
  const {
    data: logData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["logEntries", currentPage, pageSize, filters],
    queryFn: async () => {
      const request: PagedLogEntriesRequest = {
        pageIndex: currentPage,
        pageSize: pageSize,
        level: filters.level || "",
        startDate: filters.startDate?.toISOString() || "",
        endDate: filters.endDate?.toISOString() || "",
      };

      const response = await logEntryServiceExtended.getPagedLogEntries(request);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.errorMessage || "Failed to fetch log entries");
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Query for log statistics
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["logStats"],
    queryFn: async () => {
      try {
        // Get all logs for stats calculation
        const allLogsResponse = await logEntryServiceExtended.getAllLogEntries();

        if (allLogsResponse.success && allLogsResponse.data) {
          const logs = allLogsResponse.data;

          const stats: LogStats = {
            totalLogs: logs.length,
            errorCount: logs.filter((log) => log.level?.toLowerCase() === "error").length,
            warningCount: logs.filter((log) => log.level?.toLowerCase() === "warning").length,
            infoCount: logs.filter((log) => log.level?.toLowerCase().includes("info")).length,
            debugCount: logs.filter((log) => log.level?.toLowerCase() === "debug").length,
          };

          return stats;
        }

        return {
          totalLogs: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          debugCount: 0,
        };
      } catch (error) {
        console.error("Error fetching log stats:", error);
        return {
          totalLogs: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          debugCount: 0,
        };
      }
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const logs = logData?.items || [];
  const totalCount = logData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const stats = statsData || {
    totalLogs: 0,
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    debugCount: 0,
  };

  const refreshLogs = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["logEntries"] });
    queryClient.invalidateQueries({ queryKey: ["logStats"] });
  }, [queryClient]);

  const updateFilters = useCallback((newFilters: Partial<LogFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const updatePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const updatePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      level: "",
      startDate: null,
      endDate: null,
      source: "",
      searchTerm: "",
    });
    setCurrentPage(1);
  }, []);

  // Convenience methods for quick filtering
  const showErrorLogs = useCallback(() => {
    updateFilters({ level: LogLevels.ERROR });
  }, [updateFilters]);

  const showWarningLogs = useCallback(() => {
    updateFilters({ level: LogLevels.WARNING });
  }, [updateFilters]);

  const showRecentLogs = useCallback(() => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    updateFilters({ startDate, endDate });
  }, [updateFilters]);

  const showTodayLogs = useCallback(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    updateFilters({ startDate: startOfDay, endDate: endOfDay });
  }, [updateFilters]);

  // Delete log entry
  const deleteLogEntry = useCallback(
    async (logId: number): Promise<boolean> => {
      try {
        const response = await logEntryServiceExtended.deleteLogEntry(logId);

        if (response.success) {
          // Refresh the data after successful deletion
          refreshLogs();
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to delete log entry");
        }
      } catch (error) {
        console.error("Error deleting log entry:", error);
        throw error;
      }
    },
    [refreshLogs]
  );

  // Create new log entry (for testing purposes)
  const createLogEntry = useCallback(
    async (logEntry: Partial<AppLogEntry>): Promise<boolean> => {
      try {
        const response = await logEntryServiceExtended.createLogEntry(logEntry as AppLogEntry);

        if (response.success) {
          refreshLogs();
          return true;
        } else {
          throw new Error(response.errorMessage || "Failed to create log entry");
        }
      } catch (error) {
        console.error("Error creating log entry:", error);
        throw error;
      }
    },
    [refreshLogs]
  );

  return {
    // Data
    logs,
    stats,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    filters,

    // Loading states
    isLoading,
    isStatsLoading,
    error: error?.message,

    // Actions
    refreshLogs,
    updateFilters,
    updatePage,
    updatePageSize,
    clearFilters,
    deleteLogEntry,
    createLogEntry,

    // Quick filters
    showErrorLogs,
    showWarningLogs,
    showRecentLogs,
    showTodayLogs,
  };
};
