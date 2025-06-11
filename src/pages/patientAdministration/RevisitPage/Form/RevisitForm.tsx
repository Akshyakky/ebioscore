import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { DateFilterType, OPVisitDto } from "@/interfaces/PatientAdministration/revisitFormData";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import { Close as CloseIcon, Print as PrintIcon, Refresh as RefreshIcon, Search as SearchIcon } from "@mui/icons-material";
import { Box, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRevisit } from "../hooks/useRevisitForm";

interface PatientVisitHistoryDialogProps {
  open: boolean;
  onClose: (refreshData?: boolean) => void;
  onEditVisit?: (visitData: OPVisitDto) => void;
  pChartID?: number;
}

const statusOptions = [
  { value: "W", label: "Waiting" },
  { value: "C", label: "Completed" },
  { value: "X", label: "Cancelled" },
];

const visitTypeOptions = [
  { value: "H", label: "Hospital" },
  { value: "P", label: "Physician" },
];

const dateFilterOptions = [
  { value: DateFilterType.Today, label: "Today" },
  { value: DateFilterType.LastOneWeek, label: "Last Week" },
  { value: DateFilterType.LastOneMonth, label: "Last Month" },
  { value: DateFilterType.LastThreeMonths, label: "Last 3 Months" },
  { value: DateFilterType.Custom, label: "Custom Range" },
];

const PatientVisitHistoryDialog: React.FC<PatientVisitHistoryDialogProps> = ({ open, onClose, onEditVisit, pChartID }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedVisit, setSelectedVisit] = useState<OPVisitDto | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);
  const { showAlert } = useAlert();
  const { visitList, isLoading, fetchVisitList, deleteVisit, cancelVisit } = useRevisit();

  const [filters, setFilters] = useState<{
    status: string;
    visitType: string;
    dateFilter: DateFilterType;
    startDate: Date | null;
    endDate: Date | null;
  }>({
    status: "",
    visitType: "",
    dateFilter: DateFilterType.Today,
    startDate: null,
    endDate: null,
  });

  const formatDate = (date: any): string => {
    if (!date) return "-";
    try {
      let dateObj: Date;

      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === "string") {
        dateObj = new Date(date);
      } else if (typeof date === "number") {
        dateObj = new Date(date);
      } else {
        return "-";
      }
      if (isNaN(dateObj.getTime())) {
        return "-";
      }
      const day = dateObj.getDate().toString().padStart(2, "0");
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const year = dateObj.getFullYear();
      const hours = dateObj.getHours().toString().padStart(2, "0");
      const minutes = dateObj.getMinutes().toString().padStart(2, "0");
      if (hours === "00" && minutes === "00") {
        return `${day}/${month}/${year}`;
      } else {
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
    } catch (error) {
      return "-";
    }
  };

  useEffect(() => {
    if (open) {
      fetchVisitList(filters.dateFilter, filters.startDate, filters.endDate);
    }
  }, [open, fetchVisitList, filters.dateFilter, filters.startDate, filters.endDate, pChartID]);

  const handleRefresh = useCallback(() => {
    fetchVisitList(filters.dateFilter, filters.startDate, filters.endDate);
  }, [fetchVisitList, filters.dateFilter, filters.startDate, filters.endDate, pChartID]);

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

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedVisit) return;
    try {
      const success = await deleteVisit(selectedVisit.opVID);
      if (success) {
        showAlert("Success", "Visit deleted successfully", "success");
        handleRefresh();
      } else {
        throw new Error("Failed to delete visit");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete visit", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedVisit, deleteVisit, handleRefresh]);

  const handleFilterChange = useCallback((field: keyof typeof filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "",
      visitType: "",
      dateFilter: DateFilterType.Today,
      startDate: null,
      endDate: null,
    });
  }, []);

  const handlePrintVisit = useCallback((visit: OPVisitDto) => {
    window.print();
  }, []);

  const stats = useMemo(() => {
    if (!visitList.length) {
      return {
        totalVisits: 0,
        waitingVisits: 0,
        completedVisits: 0,
        cancelledVisits: 0,
        hospitalVisits: 0,
        physicianVisits: 0,
      };
    }

    const waitingCount = visitList.filter((v) => v.pVisitStatus === "W").length;
    const completedCount = visitList.filter((v) => v.pVisitStatus === "C").length;
    const cancelledCount = visitList.filter((v) => v.pVisitStatus === "X").length;
    const hospitalCount = visitList.filter((v) => v.pVisitType === "H").length;
    const physicianCount = visitList.filter((v) => v.pVisitType === "P").length;

    return {
      totalVisits: visitList.length,
      waitingVisits: waitingCount,
      completedVisits: completedCount,
      cancelledVisits: cancelledCount,
      hospitalVisits: hospitalCount,
      physicianVisits: physicianCount,
    };
  }, [visitList]);

  const filteredVisits = useMemo(() => {
    if (!visitList.length) return [];
    return visitList.filter((visit) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        visit.pChartCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        visit.attendingPhysicianName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        visit.deptName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        visit.pTypeName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || visit.pVisitStatus === filters.status;
      const matchesVisitType = filters.visitType === "" || visit.pVisitType === filters.visitType;

      return matchesSearch && matchesStatus && matchesVisitType;
    });
  }, [visitList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Total Visits</Typography>
          <Typography variant="h4">{stats.totalVisits}</Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Waiting</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.waitingVisits}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Completed</Typography>
          <Typography variant="h4" color="success.main">
            {stats.completedVisits}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Cancelled</Typography>
          <Typography variant="h4" color="error.main">
            {stats.cancelledVisits}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Hospital</Typography>
          <Typography variant="h4" color="info.main">
            {stats.hospitalVisits}
          </Typography>
        </Grid>
        <Grid size={{ sm: 12, md: 6 }}>
          <Typography variant="h6">Physician</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.physicianVisits}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<OPVisitDto>[] = [
    {
      key: "pChartCode",
      header: "UHID",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "pVisitDate",
      header: "Visit Date",
      visible: true,
      sortable: true,
      filterable: true,
      width: 160,
      render: (item) => formatDate(item.pVisitDate),
    },
    {
      key: "pVisitType",
      header: "Visit Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 110,
      formatter: (value: string) => <Chip size="small" color={value === "H" ? "info" : "secondary"} label={value === "H" ? "Hospital" : "Physician"} />,
    },
    {
      key: "deptName",
      header: "Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => value || "-",
    },
    {
      key: "attendingPhysicianName",
      header: "Attending Physician",
      visible: true,
      sortable: true,
      filterable: true,
      width: 200,
      formatter: (value: string) => value || "-",
    },
    {
      key: "pTypeName",
      header: "Payment Source",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "pVisitStatus",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: string) => {
        const statusMap = { W: "Waiting", C: "Completed", X: "Cancelled" };
        const colorMap = { W: "warning", C: "success", X: "error" };
        return <Chip size="small" color={colorMap[value as keyof typeof colorMap] as any} label={statusMap[value as keyof typeof statusMap]} />;
      },
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      filterable: false,
      width: 200,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Print Visit">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handlePrintVisit(item)}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
              }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <GenericDialog
        open={open}
        onClose={() => onClose()}
        title="Patient Visit History"
        maxWidth="xl"
        fullWidth
        showCloseButton
        actions={<SmartButton text="Close" onClick={() => onClose()} variant="contained" color="primary" />}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
          </Box>
          {showStats && renderStatsDashboard()}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid size={{ sm: 12, md: 8 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                  Patient Visits {pChartID ? `for UHID: ${pChartID}` : ""}
                </Typography>
              </Grid>
              <Grid size={{ sm: 12, md: 4 }} display="flex" justifyContent="flex-end">
                <Stack direction="row" spacing={1}>
                  <SmartButton text="Refresh" icon={RefreshIcon} onClick={handleRefresh} color="info" variant="outlined" size="small" disabled={isLoading} />
                </Stack>
              </Grid>

              <Grid size={{ sm: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Search by UHID, physician, department..."
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
              <Grid size={{ sm: 12, md: 8 }}>
                <Tooltip title="Filter Visits">
                  <Stack direction="row" spacing={2} sx={{ pt: 1, pb: 1 }}>
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
                      label="Visit Type"
                      name="visitType"
                      value={filters.visitType}
                      options={visitTypeOptions}
                      onChange={(e) => handleFilterChange("visitType", e.target.value)}
                      size="small"
                      defaultText="All Types"
                    />

                    <DropdownSelect
                      label="Date Range"
                      name="dateFilter"
                      value={filters.dateFilter}
                      options={dateFilterOptions}
                      onChange={(e) => handleFilterChange("dateFilter", e.target.value)}
                      size="small"
                    />

                    <Box display="flex" alignItems="center" gap={1}>
                      {Object.values(filters).some(Boolean) && (
                        <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                      )}
                    </Box>
                  </Stack>
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <CustomGrid columns={columns} data={filteredVisits} maxHeight="calc(100vh - 320px)" emptyStateMessage="No visits found" loading={isLoading} />
          </Paper>
        </Box>
      </GenericDialog>

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the visit for "${selectedVisit?.pChartCode}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </>
  );
};

export default PatientVisitHistoryDialog;
