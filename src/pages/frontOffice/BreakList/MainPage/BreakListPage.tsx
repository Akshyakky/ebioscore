import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  PauseCircleOutline as SuspendIcon,
  PlayCircleOutline as ResumeIcon,
} from "@mui/icons-material";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip } from "@mui/material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { BreakConSuspendData, BreakListData } from "@/interfaces/FrontOffice/BreakListData";
import BreakListForm from "../Form/BreakListForm";
import BreakSuspendDetails from "../SubPage/BreakSuspendDetails";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import { useBreak } from "../hooks/useBreak";
import { breakConSuspendService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
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
  const [selectedBreak, setSelectedBreak] = useState<BreakListData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState<boolean>(false);
  const [suspendData, setSuspendData] = useState<BreakConSuspendData | null>(null);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { breakList, isLoading, error, fetchBreakList, deleteBreak, suspendBreak, resumeBreak } = useBreak();
  const { showAlert } = useAlert();

  const [filters, setFilters] = useState<{
    status: string;
    type: string;
  }>({
    status: "",
    type: "",
  });

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

  const handleEdit = useCallback((breakItem: BreakListData) => {
    setSelectedBreak(breakItem);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((breakItem: BreakListData) => {
    setSelectedBreak(breakItem);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((breakItem: BreakListData) => {
    setSelectedBreak(breakItem);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedBreak) return;

    try {
      const success = await deleteBreak(selectedBreak.bLID);
      if (success) {
        showAlert("Success", "Break deleted successfully", "success");
      } else {
        throw new Error("Failed to delete break");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete break", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
      setSelectedBreak(null);
    }
  }, [selectedBreak, deleteBreak, showAlert]);

  const handleSuspend = useCallback(
    async (breakItem: BreakListData) => {
      try {
        const suspendResult = await breakConSuspendService.getAll();
        if (suspendResult.success && suspendResult.data) {
          const filteredSuspendDetails = suspendResult.data.filter((bsd: BreakConSuspendData) => bsd.bLID === breakItem.bLID);
          if (filteredSuspendDetails.length > 0) {
            const currentSuspendDetail = filteredSuspendDetails[0];
            setSuspendData({
              bCSID: currentSuspendDetail.bCSID,
              bLID: breakItem.bLID,
              hPLID: currentSuspendDetail.hPLID || null, // Adjust as needed
              bLStartDate: currentSuspendDetail.bLStartDate || breakItem.bLStartDate,
              bLEndDate: currentSuspendDetail.bLEndDate || breakItem.bLEndDate,
              bCSStartDate: new Date(currentSuspendDetail.bCSStartDate),
              bCSEndDate: new Date(currentSuspendDetail.bCSEndDate),
              rActiveYN: currentSuspendDetail.rActiveYN,
              rNotes: currentSuspendDetail.rNotes || "",
              transferYN: currentSuspendDetail.transferYN || "N",
            });
          } else {
            setSuspendData({
              bCSID: 0,
              bLID: breakItem.bLID,
              hPLID: null,
              bLStartDate: breakItem.bLStartDate,
              bLEndDate: breakItem.bLEndDate,
              bCSStartDate: new Date(),
              bCSEndDate: new Date(),
              rActiveYN: "N",
              rNotes: "",
              transferYN: "N",
            });
          }
          setSelectedBreak(breakItem);
          setIsSuspendDialogOpen(true);
        }
      } catch (error) {
        console.error("Error loading suspend details:", error);
        showAlert("Error", "Failed to load suspend details", "error");
      }
    },
    [showAlert]
  );

  const handleResume = useCallback(
    async (breakItem: BreakListData) => {
      if (!breakItem.bCSID) {
        showAlert("Error", "No suspend record found", "error");
        return;
      }
      try {
        const success = await resumeBreak(breakItem.bCSID, breakItem.bLID);
        if (success) {
          showAlert("Success", "Break resumed successfully", "success");
        } else {
          showAlert("Error", "Failed to resume break", "error");
        }
      } catch (error) {
        console.error("Error resuming break:", error);
        showAlert("Error", "Failed to resume break", "error");
      }
    },
    [resumeBreak, showAlert]
  );

  const handleSuspendDialogClose = useCallback(
    async (isSaved: boolean, updatedData?: BreakConSuspendData) => {
      setIsSuspendDialogOpen(false);
      if (isSaved && updatedData) {
        try {
          const result = await suspendBreak(updatedData);
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
    [suspendBreak, showAlert]
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
        inactiveBreaks: 0,
        physicianBreaks: 0,
        resourceBreaks: 0,
      };
    }

    const activeCount = breakList.filter((b) => b.rActiveYN === "Y").length;
    const physicianCount = breakList.filter((b) => b.isPhyResYN === "Y").length;

    return {
      totalBreaks: breakList.length,
      activeBreaks: activeCount,
      inactiveBreaks: breakList.length - activeCount,
      physicianBreaks: physicianCount,
      resourceBreaks: breakList.length - physicianCount,
    };
  }, [breakList]);

  const filteredBreaks = useMemo(() => {
    if (!breakList.length) return [];

    return breakList.filter((breakItem) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        breakItem.bLName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        breakItem.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        breakItem.bLFrqDesc?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && breakItem.rActiveYN === "Y") || (filters.status === "inactive" && breakItem.rActiveYN === "N");

      const matchesType = filters.type === "" || (filters.type === "physician" && breakItem.isPhyResYN === "Y") || (filters.type === "resource" && breakItem.isPhyResYN === "N");

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [breakList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Total Breaks</Typography>
          <Typography variant="h4">{stats.totalBreaks}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeBreaks}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveBreaks}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Physician</Typography>
          <Typography variant="h4" color="info.main">
            {stats.physicianBreaks}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}>
          <Typography variant="h6">Resource</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.resourceBreaks}
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

  const columns: Column<BreakListData>[] = [
    {
      key: "bLName",
      header: "Break Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
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
      key: "isPhyResYN",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 130,
      formatter: (value: any) => <Chip size="small" color={value === "Y" ? "primary" : "secondary"} label={value === "Y" ? "Physician" : "Resource"} />,
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
      key: "bLFrqDesc",
      header: "Frequency",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: any, item: BreakListData) => {
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
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 220, // Increased width to accommodate new button
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
            color="info"
            onClick={() => handleEdit(item)}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color={item.rActiveYN === "Y" ? "warning" : "success"}
            onClick={() => (item.rActiveYN === "Y" ? handleSuspend(item) : handleResume(item))}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.08)",
              "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
            }}
          >
            {item.rActiveYN === "Y" ? <SuspendIcon fontSize="small" /> : <ResumeIcon fontSize="small" />}
          </IconButton>
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
              <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
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
        <CustomGrid columns={columns} data={filteredBreaks} maxHeight="calc(100vh - 280px)" emptyStateMessage="No breaks found" loading={isLoading} />
      </Paper>

      {isFormOpen && <BreakListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedBreak} viewOnly={isViewMode} />}

      {isSuspendDialogOpen && suspendData && <BreakSuspendDetails open={isSuspendDialogOpen} onClose={handleSuspendDialogClose} breakData={suspendData} />}

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
    </Box>
  );
};

export default BreakListPage;
