import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import { AppLogEntry } from "@/interfaces/Common/AppLogEntry";
import { useLoading } from "@/hooks/Common/useLoading";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { format } from "date-fns";
import { LogService } from "@/services/NotGenericPaternServices/LogService";
import CustomAccordion from "@/components/Accordion/CustomAccordion";

// Define log levels with their corresponding colors
const LOG_LEVELS = [
  { value: "", label: "All Levels" },
  { value: "Trace", label: "Trace", color: "#6c757d" },
  { value: "Debug", label: "Debug", color: "#17a2b8" },
  { value: "Information", label: "Information", color: "#28a745" },
  { value: "Warning", label: "Warning", color: "#ffc107" },
  { value: "Error", label: "Error", color: "#dc3545" },
  { value: "Critical", label: "Critical", color: "#7b1fa2" },
  { value: "None", label: "None", color: "#6c757d" },
];

const LogViewer: React.FC = () => {
  const theme = useTheme();
  const { setLoading } = useLoading();

  // State for filters
  const [level, setLevel] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>("");

  // State for pagination
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(500);
  const [totalCount, setTotalCount] = useState<number>(0);

  // State for logs data
  const [logs, setLogs] = useState<AppLogEntry[]>([]);

  // State for selected log detail view
  const [selectedLog, setSelectedLog] = useState<AppLogEntry | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);

  // Column definitions for the grid
  const columns = useMemo<Column<AppLogEntry>[]>(
    () => [
      {
        key: "logId",
        header: "ID",
        visible: true,
        sortable: true,
        width: 80,
        align: "right",
      },
      {
        key: "timestamp",
        header: "Timestamp",
        visible: true,
        sortable: true,
        width: 180,
        formatter: (value: string | undefined) => (value ? format(new Date(value), "yyyy-MM-dd HH:mm:ss") : ""),
      },
      {
        key: "level",
        header: "Level",
        visible: true,
        sortable: true,
        width: 120,
        render: (item: AppLogEntry) => {
          const logLevel = LOG_LEVELS.find((level) => level.value === item.level) || LOG_LEVELS[0];
          return (
            <Chip
              label={item.level}
              size="small"
              style={{
                backgroundColor: logLevel.color,
                color: ["Warning", "Information", "Debug"].includes(item.level || "") ? "#000" : "#fff",
                fontWeight: "bold",
                minWidth: "80px",
              }}
            />
          );
        },
      },
      {
        key: "message",
        header: "Message",
        visible: true,
        sortable: true,
        width: 400,
        cellStyle: { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
      },
      {
        key: "source",
        header: "Source",
        visible: true,
        sortable: true,
        width: 200,
      },
      {
        key: "applicationName",
        header: "Application",
        visible: true,
        sortable: true,
        width: 150,
      },
      {
        key: "hostname",
        header: "Hostname",
        visible: true,
        sortable: true,
        width: 150,
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 80,
        render: (item: AppLogEntry) => (
          <IconButton size="small" onClick={() => handleViewDetail(item)} color="primary" title="View Details">
            <InfoIcon />
          </IconButton>
        ),
      },
    ],
    []
  );

  // Load logs on initial render and when filters change
  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, level]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const result = await LogService.getPagedLogEntries(page + 1, pageSize, level, startDate || undefined, endDate || undefined);

      if (result.success && result.data) {
        setLogs(result.data.items);
        setTotalCount(result.data.totalCount);
      } else {
        console.error("Failed to fetch logs:", result.errorMessage);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    fetchLogs();
  };

  const handleReset = () => {
    setLevel("");
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
    setSearchTerm("");
    setPage(0);
    // Fetch logs again with reset filters
    fetchLogs();
  };

  const handleViewDetail = (log: AppLogEntry) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedLog(null);
  };

  // Handle level change
  const handleLevelChange = (event: SelectChangeEvent<string>) => {
    setLevel(event.target.value);
  };

  // Custom filter function to handle searching in message and exception
  //   const customFilter = (item: AppLogEntry, searchValue: string): boolean => {
  //     if (!searchValue) return true;
  //     const searchLower = searchValue.toLowerCase();

  //     return (
  //       (item.message && item.message.toLowerCase().includes(searchLower)) ||
  //       (item.exception && item.exception.toLowerCase().includes(searchLower)) ||
  //       (item.source && item.source.toLowerCase().includes(searchLower)) ||
  //       (item.applicationName && item.applicationName.toLowerCase().includes(searchLower))
  //     );
  //   };

  // Render log properties table
  const renderPropertiesTable = (properties: Record<string, any> | undefined) => {
    if (!properties || Object.keys(properties).length === 0) {
      return <Typography variant="body2">No structured properties available</Typography>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Structured Properties
        </Typography>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Property</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(properties).map(([key, value]) => (
              <tr key={key}>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{key}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Application Logs
      </Typography>

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <CustomAccordion title="Filters" defaultExpanded>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="log-level-label">Log Level</InputLabel>
                <Select labelId="log-level-label" value={level} label="Log Level" onChange={handleLevelChange}>
                  {LOG_LEVELS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(value) => {
                    // Convert to Date if needed - this handles the PickerValue type
                    if (value) {
                      const dateValue = new Date(value.toString());
                      setStartDate(dateValue);
                    } else {
                      setStartDate(null);
                    }
                  }}
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(value) => {
                    // Convert to Date if needed - this handles the PickerValue type
                    if (value) {
                      const dateValue = new Date(value.toString());
                      setEndDate(dateValue);
                    } else {
                      setEndDate(null);
                    }
                  }}
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
              <TextField
                label="Search"
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in message or exception..."
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }} container justifyContent="flex-end" spacing={1}>
              <Grid>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset}>
                  Reset
                </Button>
              </Grid>
              <Grid>
                <Button variant="contained" color="primary" startIcon={<FilterListIcon />} onClick={handleSearch}>
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </CustomAccordion>
      </Paper>

      {/* Logs Grid */}
      <CustomGrid
        columns={columns}
        data={logs}
        maxHeight="calc(100vh - 300px)"
        searchTerm={searchTerm}
        pagination={true}
        pageSize={pageSize}
        onFilterChange={() => {}}
        showExportCSV={true}
        showExportPDF={true}
        exportFileName="application_logs"
        // customFilter={customFilter}
        showColumnCustomization={true}
        emptyStateMessage="No logs found for the selected filters."
      />

      {/* Log Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetail} fullWidth maxWidth="md">
        <DialogTitle>
          Log Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDetail}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">ID</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.logId}
                </Typography>

                <Typography variant="subtitle2">Timestamp</Typography>
                <Typography variant="body1" gutterBottom>
                  {format(new Date(selectedLog.timestamp), "yyyy-MM-dd HH:mm:ss.SSS")}
                </Typography>

                <Typography variant="subtitle2">Level</Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip
                    label={selectedLog.level}
                    size="small"
                    style={{
                      backgroundColor: LOG_LEVELS.find((l) => l.value === selectedLog.level)?.color || "#6c757d",
                      color: ["Warning", "Information", "Debug"].includes(selectedLog.level || "") ? "#000" : "#fff",
                      fontWeight: "bold",
                    }}
                  />
                </Typography>

                <Typography variant="subtitle2">Source</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.source || "N/A"}
                </Typography>

                <Typography variant="subtitle2">Application</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.applicationName || "N/A"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Hostname</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.hostname || "N/A"}
                </Typography>

                <Typography variant="subtitle2">User</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.user || "N/A"}
                </Typography>

                <Typography variant="subtitle2">Thread ID</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.threadId}
                </Typography>

                <Typography variant="subtitle2">Correlation ID</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.correlationId || "N/A"}
                </Typography>

                <Typography variant="subtitle2">Context</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLog.context || "N/A"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Message</Typography>
                <Paper variant="outlined" sx={{ p: 2, whiteSpace: "pre-wrap" }}>
                  <Typography variant="body1">{selectedLog.message || "N/A"}</Typography>
                </Paper>
              </Grid>

              {selectedLog.exception && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2">Exception</Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      whiteSpace: "pre-wrap",
                      maxHeight: "200px",
                      overflow: "auto",
                      backgroundColor: theme.palette.mode === "dark" ? "#2d2d2d" : "#f5f5f5",
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                    }}
                  >
                    {selectedLog.exception}
                  </Paper>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>{renderPropertiesTable(selectedLog.structuredProperties)}</Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogViewer;
