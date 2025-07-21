import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { DAY_OPTIONS, HOLIDAY_OPTIONS, HospWorkHoursDto, LANGUAGE_OPTIONS, STATUS_OPTIONS } from "@/interfaces/FrontOffice/HospWorkHoursDt";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  AccessTime,
  Add as AddIcon,
  Business,
  CheckCircle,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Language as LanguageIcon,
  Public,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ToggleOff,
  ToggleOn,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import HospWorkHoursForm from "../Form/HospWorkHoursForm";
import { useHospWorkHoursOperations } from "../hooks/useHospWorkHoursOperations";

const filterOptions = {
  language: LANGUAGE_OPTIONS,
  day: DAY_OPTIONS,
  holiday: HOLIDAY_OPTIONS,
  status: STATUS_OPTIONS,
};

const HospWorkHoursPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedRows, setSelectedRows] = useState<HospWorkHoursDto[]>([]);
  const { showAlert } = useAlert();

  const {
    workHoursList,
    selectedWorkHours,
    setSelectedWorkHours,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isBulkDeleteConfirmOpen,
    setIsBulkDeleteConfirmOpen,
    selectedIds,
    setSelectedIds,
    isLoading,
    error,
    fetchWorkHoursList,
    deleteWorkHours,
    bulkDeleteWorkHours,
    toggleWorkHoursStatus,
    getActiveWorkHoursList,
    getInactiveWorkHoursList,
    getHolidayWorkHoursList,
  } = useHospWorkHoursOperations();

  const [filters, setFilters] = useState<{
    language: string;
    day: string;
    holiday: string;
    status: string;
  }>({
    language: "",
    day: "",
    holiday: "",
    status: "",
  });

  useEffect(() => {
    fetchWorkHoursList();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchWorkHoursList();
  }, [fetchWorkHoursList]);

  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);

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
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleAddNew = useCallback(() => {
    setSelectedWorkHours(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, [setSelectedWorkHours]);

  const handleView = useCallback(
    (workHours: HospWorkHoursDto) => {
      setSelectedWorkHours(workHours);
      setIsViewMode(true);
      setIsFormOpen(true);
    },
    [setSelectedWorkHours]
  );

  const handleEdit = useCallback(
    (workHours: HospWorkHoursDto) => {
      setSelectedWorkHours(workHours);
      setIsViewMode(false);
      setIsFormOpen(true);
    },
    [setSelectedWorkHours]
  );

  const handleDeleteClick = useCallback(
    (workHours: HospWorkHoursDto) => {
      setSelectedWorkHours(workHours);
      setIsDeleteConfirmOpen(true);
    },
    [setSelectedWorkHours, setIsDeleteConfirmOpen]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedWorkHours) return;
    const success = await deleteWorkHours(selectedWorkHours);
    if (success) {
      setIsDeleteConfirmOpen(false);
      setSelectedWorkHours(null);
    }
  }, [selectedWorkHours, deleteWorkHours, setIsDeleteConfirmOpen, setSelectedWorkHours]);

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedRows.length === 0) {
      showAlert("Warning", "Please select at least one record to delete", "warning");
      return;
    }
    setSelectedIds(selectedRows.map((row) => row.hwrkID));
    setIsBulkDeleteConfirmOpen(true);
  }, [selectedRows, setSelectedIds, setIsBulkDeleteConfirmOpen, showAlert]);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    const success = await bulkDeleteWorkHours(selectedIds, true);
    if (success) {
      setIsBulkDeleteConfirmOpen(false);
      setSelectedIds([]);
      setSelectedRows([]);
    }
  }, [selectedIds, bulkDeleteWorkHours, setIsBulkDeleteConfirmOpen, setSelectedIds]);

  const handleToggleStatus = useCallback(
    async (workHours: HospWorkHoursDto) => {
      await toggleWorkHoursStatus(workHours);
    },
    [toggleWorkHoursStatus]
  );

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      if (refreshData) {
        handleRefresh();
      }
      setSelectedWorkHours(null);
    },
    [handleRefresh, setSelectedWorkHours]
  );

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      language: "",
      day: "",
      holiday: "",
      status: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!workHoursList.length) {
      return {
        totalRecords: 0,
        activeRecords: 0,
        holidayRecords: 0,
        languageCount: 0,
        daysCovered: 0,
      };
    }

    const activeList = getActiveWorkHoursList();
    const holidayList = getHolidayWorkHoursList();
    const uniqueLanguages = new Set(workHoursList.map((wh) => wh.langType)).size;
    const uniqueDays = new Set(activeList.map((wh) => wh.daysDesc)).size;

    return {
      totalRecords: workHoursList.length,
      activeRecords: activeList.length,
      holidayRecords: holidayList.length,
      languageCount: uniqueLanguages,
      daysCovered: uniqueDays,
    };
  }, [workHoursList, getActiveWorkHoursList, getHolidayWorkHoursList]);

  const filteredWorkHours = useMemo(() => {
    if (!workHoursList.length) return [];

    return workHoursList.filter((workHours) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        workHours?.langType?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        workHours?.daysDesc?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        workHours?.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesLanguage = filters.language === "" || workHours?.langType === filters.language;
      const matchesDay = filters.day === "" || workHours?.daysDesc === filters.day;
      const matchesHoliday = filters.holiday === "" || workHours?.wkHoliday === filters.holiday;
      const matchesStatus = filters.status === "" || workHours?.rActiveYN === filters.status;

      return matchesSearch && matchesLanguage && matchesDay && matchesHoliday && matchesStatus;
    });
  }, [workHoursList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <AccessTime fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalRecords}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Records
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #4caf50" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#4caf50", width: 40, height: 40 }}>
                <CheckCircle fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {stats.activeRecords}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #ff9800" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#ff9800", width: 40, height: 40 }}>
                <Business fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.holidayRecords}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Holiday Hours
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
                <LanguageIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                  {stats.languageCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Languages
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #607d8b" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#607d8b", width: 40, height: 40 }}>
                <Public fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#607d8b" fontWeight="bold">
                  {stats.daysCovered}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Days Covered
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const formatTime = (date: Date | string | null) => {
    if (!date) return "-";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const columns: Column<HospWorkHoursDto>[] = [
    {
      key: "langType",
      header: "Language",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: any) => <Chip size="small" color="primary" label={LANGUAGE_OPTIONS.find((opt) => opt.value === value)?.label || value} />,
    },
    {
      key: "daysDesc",
      header: "Day",
      visible: true,
      sortable: true,
      filterable: true,
      width: 130,
      formatter: (value: any) => <Chip size="small" color="secondary" label={DAY_OPTIONS.find((opt) => opt.value === value)?.label || value} />,
    },
    {
      key: "startTime",
      header: "Start Time",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: Date | string | null) => formatTime(value),
    },
    {
      key: "endTime",
      header: "End Time",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: Date | string | null) => formatTime(value),
    },
    {
      key: "wkHoliday",
      header: "Holiday",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "warning" : "info"} label={value === "Y" ? "Yes" : "No"} />,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: any) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 180,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View Details">
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
          </Tooltip>
          <Tooltip title="Edit Work Hours">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleEdit(item)}
              sx={{
                bgcolor: "rgba(156, 39, 176, 0.08)",
                "&:hover": { bgcolor: "rgba(156, 39, 176, 0.15)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={item.rActiveYN === "Y" ? "Deactivate" : "Activate"}>
            <IconButton
              size="small"
              color={item.rActiveYN === "Y" ? "warning" : "success"}
              onClick={() => handleToggleStatus(item)}
              sx={{
                bgcolor: "rgba(255, 152, 0, 0.08)",
                "&:hover": { bgcolor: "rgba(255, 152, 0, 0.15)" },
              }}
            >
              {item.rActiveYN === "Y" ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Work Hours">
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
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Error loading work hours: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
      </Box>

      {showStats && renderStatsDashboard()}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" component="h1" color="primary" sx={{ fontWeight: 600, mb: 1 }} gutterBottom>
              Hospital Work Hours
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} display="flex" justifyContent="flex-end">
            <Stack direction="row" spacing={1}>
              <SmartButton
                text="Refresh"
                icon={RefreshIcon}
                onClick={handleRefresh}
                color="info"
                variant="outlined"
                size="small"
                disabled={isLoading}
                loadingText="Refreshing..."
                asynchronous={true}
                showLoadingIndicator={true}
              />
              <SmartButton text="Add Work Hours" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
              {selectedRows.length > 0 && (
                <SmartButton text={`Delete Selected (${selectedRows.length})`} icon={DeleteIcon} onClick={handleBulkDeleteClick} color="error" variant="contained" size="small" />
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by language, day, or notes"
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
          <Grid size={{ xs: 12, md: 8 }}>
            <Tooltip title="Filter Work Hours">
              <Stack direction="row" spacing={2}>
                <DropdownSelect
                  label="Language"
                  name="language"
                  value={filters.language}
                  options={filterOptions.language}
                  onChange={(e) => handleFilterChange("language", e.target.value)}
                  size="small"
                  defaultText="All Languages"
                />
                <DropdownSelect
                  label="Day"
                  name="day"
                  value={filters.day}
                  options={filterOptions.day}
                  onChange={(e) => handleFilterChange("day", e.target.value)}
                  size="small"
                  defaultText="All Days"
                />
                <DropdownSelect
                  label="Holiday"
                  name="holiday"
                  value={filters.holiday}
                  options={filterOptions.holiday}
                  onChange={(e) => handleFilterChange("holiday", e.target.value)}
                  size="small"
                  defaultText="All"
                />
                <DropdownSelect
                  label="Status"
                  name="status"
                  value={filters.status}
                  options={filterOptions.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  size="small"
                  defaultText="All Status"
                />
                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.language || filters.day || filters.holiday || filters.status) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid
          columns={columns}
          data={filteredWorkHours}
          maxHeight="calc(100vh - 280px)"
          emptyStateMessage="No work hours found"
          loading={isLoading}
          selectable={true}
          onSelectionChange={setSelectedRows}
        />
      </Paper>

      {isFormOpen && <HospWorkHoursForm open={isFormOpen} onClose={handleFormClose} initialData={selectedWorkHours} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the work hours for "${selectedWorkHours?.langType}" language on "${selectedWorkHours?.daysDesc}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />

      <ConfirmationDialog
        open={isBulkDeleteConfirmOpen}
        onClose={() => setIsBulkDeleteConfirmOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Confirm Bulk Delete"
        message={`Are you sure you want to delete ${selectedIds.length} work hours records? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        type="error"
        maxWidth="sm"
      />
    </Box>
  );
};

export default HospWorkHoursPage;
