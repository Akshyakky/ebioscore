import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { BreakConSuspendData, BreakDto } from "@/interfaces/FrontOffice/BreakListData";
import { useAlert } from "@/providers/AlertProvider";
import { breakConSuspendService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PlayCircleOutline as ResumeIcon,
  Search as SearchIcon,
  PauseCircleOutline as SuspendIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Box, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import BreakListForm from "../Form/BreakListForm";
import BreakSuspend from "../Form/BreakSuspend";
import { useBreakListOperations } from "../hooks/useBreakListOperations";
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

const typeOptions = [
  { value: "physician", label: "Physician Break" },
  { value: "resource", label: "Resource Break" },
];

export const frequencyCodeMap = {
  none: "FO70",
  daily: "FO71",
  weekly: "FO72",
  monthly: "FO73",
  yearly: "FO74",
};

export const weekDayCodeMap = {
  Sunday: "FO75",
  Monday: "FO76",
  Tuesday: "FO77",
  Wednesday: "FO78",
  Thursday: "FO79",
  Friday: "FO80",
  Saturday: "FO81",
};

const BreakListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [isResumeConfirmOpen, setIsResumeConfirmOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [suspendData, setSuspendData] = useState<BreakConSuspendData | null>(null);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const { showAlert } = useAlert();
  const {
    breakList,
    selectedBreak,
    setSelectedBreak,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isSuspendDialogOpen,
    setIsSuspendDialogOpen,
    isLoading,
    error,
    fetchBreakList,
    deleteBreak,
    suspendBreak,
    resumeBreak,
  } = useBreakListOperations();
  const [filters, setFilters] = useState<{
    status: string;
    type: string;
  }>({
    status: "",
    type: "",
  });

  useEffect(() => {
    fetchBreakList();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchBreakList();
  }, [fetchBreakList]);

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
    setSelectedBreak(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((breakItem: BreakDto) => {
    setSelectedBreak(breakItem);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((breakItem: BreakDto) => {
    setSelectedBreak(breakItem);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedBreak) return;
    const success = await deleteBreak(selectedBreak);
    if (success) {
      setIsDeleteConfirmOpen(false);
      setSelectedBreak(null);
    }
  }, [selectedBreak, deleteBreak]);

  const handleSuspend = useCallback(
    async (breakItem: BreakDto) => {
      const suspendData = await suspendBreak(breakItem);
      if (suspendData) {
        setSuspendData(suspendData);
        setSelectedBreak(breakItem);
        setIsSuspendDialogOpen(true);
      }
    },
    [suspendBreak]
  );

  const handleResume = useCallback(
    async (breakItem: BreakDto) => {
      await resumeBreak(breakItem);
    },
    [resumeBreak]
  );

  const handleSuspendDialogClose = useCallback(
    async (isSaved: boolean, updatedData?: BreakConSuspendData) => {
      setIsSuspendDialogOpen(false);
      if (isSaved && updatedData) {
        try {
          const result = await breakConSuspendService.save(updatedData);
          if (result.success) {
            showAlert("Success", "Break suspended successfully", "success");
          } else {
            showAlert("Error", result.errorMessage || "Failed to suspend break", "error");
          }
        } catch (error) {
          console.error("Error updating suspend status:", error);
          showAlert("Error", "Failed to update suspend status", "error");
        }
      }
      setSelectedBreak(null);
      setSuspendData(null);
    },
    [showAlert]
  );

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      if (refreshData) {
        handleRefresh();
      }
      setSelectedBreak(null);
    },
    [handleRefresh]
  );

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "",
      type: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!breakList.length) {
      return {
        totalBreaks: 0,
        activeBreaks: 0,
        physicianBreaks: 0,
        resourceBreaks: 0,
        suspendedBreaks: 0,
      };
    }

    const physicianCount = breakList.filter((b) => b?.isPhyResYN === "Y").length;
    const suspendedCount = breakList.filter((b) => b?.status === "Suspended").length;
    const activeCount = breakList.filter((b) => b?.rActiveYN === "Y").length - suspendedCount;

    return {
      totalBreaks: breakList.length,
      activeBreaks: activeCount,
      physicianBreaks: physicianCount,
      resourceBreaks: breakList.length - physicianCount,
      suspendedBreaks: suspendedCount,
    };
  }, [breakList]);

  const filteredBreaks = useMemo(() => {
    if (!breakList.length) return [];

    return breakList.filter((breakItem) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        breakItem?.bLName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        breakItem?.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        breakItem?.bLFrqDesc?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "" ||
        (filters.status === "active" && breakItem?.rActiveYN === "Y" && breakItem?.status === "") ||
        (filters.status === "suspended" && breakItem?.status === "Suspended");

      const matchesType = filters.type === "" || (filters.type === "physician" && breakItem?.isPhyResYN === "Y") || (filters.type === "resource" && breakItem?.isPhyResYN === "N");

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [breakList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Breaks</Typography>
          <Typography variant="h4">{stats.totalBreaks}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeBreaks}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Physician</Typography>
          <Typography variant="h4" color="info.main">
            {stats.physicianBreaks}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Resource</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.resourceBreaks}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Suspended</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.suspendedBreaks}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };
  const handleResumeClick = useCallback((breakItem: BreakDto) => {
    setSelectedBreak(breakItem);
    setIsResumeConfirmOpen(true);
  }, []);

  const handleConfirmResume = useCallback(async () => {
    if (!selectedBreak) return;
    await resumeBreak(selectedBreak);
    setIsResumeConfirmOpen(false);
    setSelectedBreak(null);
  }, [selectedBreak, resumeBreak]);

  const handleResumeDialogClose = useCallback(() => {
    setIsResumeConfirmOpen(false);
    setSelectedBreak(null);
  }, []);

  const columns: Column<BreakDto>[] = [
    {
      key: "bLName",
      header: "Break Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      key: "assignedName",
      header: "Assigned To",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
    },
    {
      key: "isPhyResYN",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 130,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "primary" : "secondary"} label={value === "Y" ? "Physician" : "Resource"} />,
    },
    {
      key: "bLStartDate",
      header: "Start Date",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: Date | string) => formatDate(value),
    },
    {
      key: "bLEndDate",
      header: "End Date",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: Date | string) => formatDate(value),
    },
    {
      key: "bLStartTime",
      header: "Start Time",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: Date | string) => formatTime(value),
    },
    {
      key: "bLEndTime",
      header: "End Time",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: Date | string) => formatTime(value),
    },
    {
      key: "bLFrqDesc",
      header: "Frequency",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: any, item: BreakDto) => {
        const frequencyKey = Object.keys(frequencyCodeMap).find((key) => frequencyCodeMap[key as keyof typeof frequencyCodeMap] === value) || "none";
        const frequencyLabel = frequencyKey.charAt(0).toUpperCase() + frequencyKey.slice(1);

        if (frequencyKey === "weekly" && item.bLFrqWkDesc) {
          const weekdays = item.bLFrqWkDesc
            .split(",")
            .map((code) => Object.keys(weekDayCodeMap).find((day) => weekDayCodeMap[day as keyof typeof weekDayCodeMap] === code))
            .filter((day): day is string => !!day)
            .map((day) => day.slice(0, 3))
            .join(", ");
          return `${frequencyLabel} (${weekdays})`;
        }

        return frequencyLabel || "-";
      },
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
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: any, item: BreakDto) => (
        <Tooltip
          title={
            value === "Suspended" ? (
              <Box>
                <Typography variant="body2">Suspended From: {formatDate(item?.bCSStartDate || "")}</Typography>
                <Typography variant="body2">Suspended Until: {formatDate(item?.bCSEndDate || "")}</Typography>
              </Box>
            ) : (
              ""
            )
          }
        >
          <Chip size="small" color={value === "Suspended" ? "error" : "success"} label={value === "Suspended" ? `Suspended` : "Active"} />
        </Tooltip>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 220,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View Break">
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
          <Tooltip title={item.status === "Suspended" ? "Resume Break" : "Suspend Break"}>
            <IconButton
              size="small"
              color={item.status === "Suspended" ? "success" : "warning"}
              onClick={() => (item.status === "Suspended" ? handleResumeClick(item) : handleSuspend(item))}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
              }}
            >
              {item.status === "Suspended" ? <ResumeIcon fontSize="small" /> : <SuspendIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Break">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(item)}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
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
          Error loading breaks: {error}
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
            <Typography variant="h5" component="h1" gutterBottom>
              Break List
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
              <SmartButton text="Add Break" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by name, notes or frequency"
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
            <Tooltip title="Filter Breaks">
              <Stack direction="row" spacing={2}>
                <DropdownSelect
                  label="Status"
                  name="status"
                  value={filters.status}
                  options={statusOptions}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  size="small"
                  defaultText="All Status"
                />
                <DropdownSelect
                  label="Type"
                  name="type"
                  value={filters.type}
                  options={typeOptions}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  size="small"
                  defaultText="All Types"
                />
                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.type) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredBreaks as BreakDto[]} maxHeight="calc(100vh - 280px)" emptyStateMessage="No breaks found" loading={isLoading} />
      </Paper>

      {isFormOpen && <BreakListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedBreak} viewOnly={isViewMode} />}

      {isSuspendDialogOpen && suspendData && <BreakSuspend open={isSuspendDialogOpen} onClose={handleSuspendDialogClose} breakData={suspendData} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the break "${selectedBreak?.bLName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />

      <ConfirmationDialog
        open={isResumeConfirmOpen}
        onClose={handleResumeDialogClose}
        onConfirm={handleConfirmResume}
        title="Confirm Resume"
        message={`Are you sure you want to resume the break "${selectedBreak?.bLName}"?`}
        confirmText="Resume"
        cancelText="Cancel"
        type="success"
        maxWidth="xs"
      />
    </Box>
  );
};

export default BreakListPage;
