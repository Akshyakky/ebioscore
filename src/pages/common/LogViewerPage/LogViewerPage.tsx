// src/pages/admin/LogViewerPage/MainPage/LogViewerPage.tsx

import {
  Clear as ClearIcon,
  Close as CloseIcon,
  Code as DebugIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  BugReport as ErrorIcon,
  Info as InfoIcon,
  Assessment as LogIcon,
  History as RecentIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Today as TodayIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { AppLogEntry } from "@/interfaces/Common/AppLogEntry";
import { useAlert } from "@/providers/AlertProvider";
import { LogLevels } from "@/services/LogServices/LogEntryService";
import { debounce } from "@/utils/Common/debounceUtils";
import { useLogEntries } from "./hooks/hooks";

const LogViewerPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AppLogEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);

  const {
    logs,
    stats,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    filters,
    isLoading,
    isStatsLoading,
    error,
    refreshLogs,
    updateFilters,
    updatePage,
    updatePageSize,
    clearFilters,
    deleteLogEntry,
    showErrorLogs,
    showWarningLogs,
    showRecentLogs,
    showTodayLogs,
  } = useLogEntries();

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearchTerm(value);
        updateFilters({ searchTerm: value });
      }, 300),
    [updateFilters]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    updateFilters({ searchTerm: "" });
    debouncedSearch.cancel();
  }, [debouncedSearch, updateFilters]);

  const handleView = useCallback((log: AppLogEntry) => {
    setSelectedLog(log);
    setIsViewDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((log: AppLogEntry) => {
    setSelectedLog(log);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedLog) return;

    try {
      await deleteLogEntry(selectedLog.logId);
      showAlert("Success", "Log entry deleted successfully", "success");
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete log entry", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedLog, deleteLogEntry, showAlert]);

  const handlePageChange = useCallback(
    (_event: unknown, newPage: number) => {
      updatePage(newPage);
    },
    [updatePage]
  );

  const handlePageSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updatePageSize(parseInt(event.target.value, 10));
    },
    [updatePageSize]
  );

  const handleDateFilterChange = useCallback(
    (field: "startDate" | "endDate", value: dayjs.Dayjs | null) => {
      updateFilters({ [field]: value?.toDate() || null });
    },
    [updateFilters]
  );

  const handleLevelFilterChange = useCallback(
    (event: any) => {
      updateFilters({ level: event.target.value });
    },
    [updateFilters]
  );

  const exportLogs = useCallback(() => {
    try {
      const csvContent = [
        "Timestamp,Level,Message,Source,User,Exception",
        ...logs.map((log) =>
          [
            log.timestamp ? new Date(log.timestamp).toISOString() : "",
            log.level || "",
            `"${log.message?.replace(/"/g, '""') || ""}"`,
            log.source || "",
            log.logUser || "",
            `"${log.exception?.replace(/"/g, '""') || ""}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `logs_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showAlert("Success", "Logs exported successfully", "success");
    } catch (error) {
      console.error("Export failed:", error);
      showAlert("Error", "Failed to export logs", "error");
    }
  }, [logs, showAlert]);

  const getLogLevelColor = (level: string): string => {
    switch (level?.toLowerCase()) {
      case "error":
      case "fatal":
      case "critical":
        return "#f44336";
      case "warning":
        return "#ff9800";
      case "information":
      case "info":
        return "#2196f3";
      case "debug":
        return "#9c27b0";
      default:
        return "#757575";
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case "error":
      case "fatal":
      case "critical":
        return <ErrorIcon fontSize="small" style={{ color: "#f44336" }} />;
      case "warning":
        return <WarningIcon fontSize="small" style={{ color: "#ff9800" }} />;
      case "information":
      case "info":
        return <InfoIcon fontSize="small" style={{ color: "#2196f3" }} />;
      case "debug":
        return <DebugIcon fontSize="small" style={{ color: "#9c27b0" }} />;
      default:
        return <LogIcon fontSize="small" style={{ color: "#757575" }} />;
    }
  };

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <LogIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalLogs}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Logs
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #f44336", cursor: "pointer" }} onClick={showErrorLogs}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#f44336", width: 40, height: 40 }}>
                <ErrorIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.errorCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Errors
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #ff9800", cursor: "pointer" }} onClick={showWarningLogs}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                <WarningIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.warningCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Warnings
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #2196f3" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#2196f3", width: 40, height: 40 }}>
                <InfoIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.infoCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Information
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #9c27b0" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#9c27b0", width: 40, height: 40 }}>
                <DebugIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {stats.debugCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Debug
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFilters = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Advanced Filters
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Log Level</InputLabel>
            <Select value={filters.level} label="Log Level" onChange={handleLevelFilterChange}>
              <MenuItem value="">All Levels</MenuItem>
              {Object.values(LogLevels).map((level) => (
                <MenuItem key={level} value={level}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {getLogLevelIcon(level)}
                    <Typography>{level}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={filters.startDate ? dayjs(filters.startDate) : null}
              onChange={(value) => handleDateFilterChange("startDate", value)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="End Date"
              value={filters.endDate ? dayjs(filters.endDate) : null}
              onChange={(value) => handleDateFilterChange("endDate", value)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Stack direction="row" spacing={1}>
            <SmartButton text="Today" onClick={showTodayLogs} variant="outlined" size="small" icon={TodayIcon} />
            <SmartButton text="Last 24h" onClick={showRecentLogs} variant="outlined" size="small" icon={RecentIcon} />
            <SmartButton text="Clear" onClick={clearFilters} variant="outlined" size="small" icon={ClearIcon} color="error" />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<AppLogEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      visible: true,
      sortable: true,
      width: 180,
      formatter: (value: any) => (value ? new Date(value).toLocaleString() : "-"),
    },
    {
      key: "level",
      header: "Level",
      visible: true,
      sortable: true,
      width: 120,
      formatter: (value: string) => (
        <Chip
          size="small"
          icon={getLogLevelIcon(value)}
          label={value || "Unknown"}
          sx={{
            backgroundColor: `${getLogLevelColor(value)}20`,
            color: getLogLevelColor(value),
            fontWeight: "bold",
          }}
        />
      ),
    },
    {
      key: "message",
      header: "Message",
      visible: true,
      sortable: true,
      width: 400,
      formatter: (value: string) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "-"}
        </Typography>
      ),
    },
    {
      key: "source",
      header: "Source",
      visible: true,
      sortable: true,
      width: 150,
      formatter: (value: string) => value || "-",
    },
    {
      key: "logUser",
      header: "User",
      visible: true,
      sortable: true,
      width: 120,
      formatter: (value: string) => value || "-",
    },
    {
      key: "exception",
      header: "Exception",
      visible: true,
      sortable: false,
      width: 120,
      formatter: (value: string) => (value ? <Chip size="small" color="error" label="Has Exception" /> : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 120,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleView(item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(item)}
            sx={{
              bgcolor: "rgba(244, 67, 54, 0.08)",
              "&:hover": { bgcolor: "rgba(244, 67, 54, 0.15)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading logs: {error}
        </Alert>
        <SmartButton text="Retry" onClick={refreshLogs} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          System Logs
        </Typography>
        <Stack direction="row" spacing={1}>
          <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
        </Stack>
      </Box>
      {/* Statistics Dashboard */}
      {showStats && renderStatsDashboard()}
      {/* Advanced Filters */}
      {renderFilters()}
      {/* Search and Actions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search logs by message, source, or user"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <SmartButton text="Export CSV" icon={DownloadIcon} onClick={exportLogs} color="info" variant="outlined" size="small" disabled={logs.length === 0} />
              <SmartButton
                text="Refresh"
                icon={RefreshIcon}
                onClick={refreshLogs}
                color="primary"
                variant="outlined"
                size="small"
                disabled={isLoading}
                asynchronous={true}
                showLoadingIndicator={true}
                loadingText="Refreshing..."
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      {/* Data Grid */}
      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={logs} maxHeight="calc(100vh - 320px)" emptyStateMessage="No log entries found" density="small" loading={isLoading} />

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={currentPage}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[25, 50, 100, 200]}
          sx={{ mt: 1 }}
        />
      </Paper>
      {/* View Log Dialog */}
      <GenericDialog
        open={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        title={`Log Entry Details - ${selectedLog?.level || "Unknown"}`}
        maxWidth="md"
        fullWidth
        showCloseButton
      >
        {selectedLog && (
          <Box sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : "N/A"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Level
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {getLogLevelIcon(selectedLog.level || "")}
                  <Typography variant="body2">{selectedLog.level || "Unknown"}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Message
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ whiteSpace: "pre-wrap" }}>
                  {selectedLog.message || "No message"}
                </Typography>
              </Grid>
              {selectedLog.exception && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Exception
                  </Typography>
                  <Paper sx={{ p: 1, bgcolor: "grey.100", maxHeight: 200, overflow: "auto" }}>
                    <Typography variant="body2" component="pre" sx={{ fontSize: "0.75rem" }}>
                      {selectedLog.exception}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Source
                </Typography>
                <Typography variant="body2">{selectedLog.source || "N/A"}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body2">{selectedLog.logUser || "N/A"}</Typography>
              </Grid>
              {selectedLog.structuredProperties && Object.keys(selectedLog.structuredProperties).length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Additional Properties
                  </Typography>
                  <Paper sx={{ p: 1, bgcolor: "grey.100" }}>
                    <pre style={{ fontSize: "0.75rem", margin: 0 }}>{JSON.stringify(selectedLog.structuredProperties, null, 2)}</pre>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </GenericDialog>
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete this log entry?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default LogViewerPage;
