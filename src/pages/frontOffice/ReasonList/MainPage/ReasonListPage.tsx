import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { ReasonListData } from "@/interfaces/FrontOffice/ReasonListData";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Box, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReasonListForm from "../Form/ReasonListForm";
import { useReasonList } from "../hooks/useReasonList";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const durationOptions = [
  { value: "short", label: "Short (< 30 min)" },
  { value: "medium", label: "Medium (30-60 min)" },
  { value: "long", label: "Long (> 60 min)" },
];

const ReasonListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<ReasonListData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { reasonList, isLoading, error, fetchReasonList, deleteReason } = useReasonList();

  const [filters, setFilters] = useState<{
    status: string;
    duration: string;
  }>({
    status: "",
    duration: "",
  });

  const handleRefresh = useCallback(() => {
    fetchReasonList();
  }, [fetchReasonList]);

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
    setSelectedReason(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((reason: ReasonListData) => {
    setSelectedReason(reason);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((reason: ReasonListData) => {
    setSelectedReason(reason);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((reason: ReasonListData) => {
    setSelectedReason(reason);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedReason) return;

    try {
      const success = await deleteReason(selectedReason.arlID);

      if (success) {
        showAlert("Success", "Reason deleted successfully", "success");
      } else {
        throw new Error("Failed to delete reason");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete reason", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedReason, deleteReason]);

  const handleFormClose = useCallback(
    (refreshData?: boolean) => {
      setIsFormOpen(false);
      if (refreshData) {
        handleRefresh();
      }
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
      duration: "",
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!reasonList.length) {
      return {
        totalReasons: 0,
        activeReasons: 0,
        inactiveReasons: 0,
        shortDuration: 0,
        mediumDuration: 0,
        longDuration: 0,
      };
    }

    const activeCount = reasonList.filter((r) => r.rActiveYN === "Y").length;
    const shortCount = reasonList.filter((r) => r.arlDuration < 30).length;
    const mediumCount = reasonList.filter((r) => r.arlDuration >= 30 && r.arlDuration <= 60).length;
    const longCount = reasonList.filter((r) => r.arlDuration > 60).length;

    return {
      totalReasons: reasonList.length,
      activeReasons: activeCount,
      inactiveReasons: reasonList.length - activeCount,
      shortDuration: shortCount,
      mediumDuration: mediumCount,
      longDuration: longCount,
    };
  }, [reasonList]);

  // Apply filters to the list
  const filteredReasons = useMemo(() => {
    if (!reasonList.length) return [];

    return reasonList.filter((reason) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        reason.arlName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reason.arlCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reason.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reason.rlName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && reason.rActiveYN === "Y") || (filters.status === "inactive" && reason.rActiveYN === "N");

      const matchesDuration =
        filters.duration === "" ||
        (filters.duration === "short" && reason.arlDuration < 30) ||
        (filters.duration === "medium" && reason.arlDuration >= 30 && reason.arlDuration <= 60) ||
        (filters.duration === "long" && reason.arlDuration > 60);

      return matchesSearch && matchesStatus && matchesDuration;
    });
  }, [reasonList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Reasons</Typography>
          <Typography variant="h4">{stats.totalReasons}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeReasons}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveReasons}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Short</Typography>
          <Typography variant="h4" color="info.main">
            {stats.shortDuration}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Medium</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.mediumDuration}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Long</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.longDuration}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<ReasonListData>[] = [
    {
      key: "arlCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "arlName",
      header: "Reason Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "arlDuration",
      header: "Duration (min)",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: number) => value,
    },
    {
      key: "arlDurDesc",
      header: "Duration Description",
      visible: true,
      sortable: true,
      filterable: true,
      width: 180,
      formatter: (value: string) => value || "-",
    },
    {
      key: "rlName",
      header: "Associated Resource",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => value || "-",
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
      width: 300,
      formatter: (value: any) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 170,
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
          Error loading reasons: {error}
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
              Reason List
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
              <SmartButton text="Add Reason" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name or resource"
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
            <Tooltip title="Filter Reasons">
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
                  label="Duration"
                  name="duration"
                  value={filters.duration}
                  options={durationOptions}
                  onChange={(e) => handleFilterChange("duration", e.target.value)}
                  size="small"
                  defaultText="All Durations"
                />

                <Box display="flex" alignItems="center" gap={1}>
                  {(filters.status || filters.duration) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredReasons} maxHeight="calc(100vh - 280px)" emptyStateMessage="No reasons found" loading={isLoading} />
      </Paper>

      {isFormOpen && <ReasonListForm open={isFormOpen} onClose={handleFormClose} initialData={selectedReason} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the reason "${selectedReason?.arlName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default ReasonListPage;
