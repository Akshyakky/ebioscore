import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { OTProcedureListDto } from "@/interfaces/ClinicalManagement/ProcedureListDto";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  CheckCircle as ActiveIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Person as DoctorIcon,
  Edit as EditIcon,
  Business as HospitalIcon,
  Cancel as InactiveIcon,
  LocalHospital as ProcedureIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProcedureForm from "../Form/ProcedureListForm";
import { useProcedureList } from "../hooks/useProcedureListForm";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const procedureTypeOptions = [
  { value: "HOSP", label: "Hospital" },
  { value: "DR", label: "Doctor" },
];

const ProcedureListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedProcedure, setSelectedProcedure] = useState<OTProcedureListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(true);

  const { procedureList, isLoading, error, fetchProcedureList, deleteProcedure } = useProcedureList();

  const [filters, setFilters] = useState<{
    status: string;
    procType: string;
    transfer: string;
  }>({
    status: "",
    procType: "",
    transfer: "",
  });

  const handleRefresh = useCallback(() => {
    fetchProcedureList();
  }, [fetchProcedureList]);

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
    setSelectedProcedure(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((procedure: OTProcedureListDto) => {
    setSelectedProcedure(procedure);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((procedure: OTProcedureListDto) => {
    setSelectedProcedure(procedure);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((procedure: OTProcedureListDto) => {
    setSelectedProcedure(procedure);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProcedure) return;

    try {
      const success = await deleteProcedure(selectedProcedure.procedureID);

      if (success) {
        showAlert("Success", "Procedure deleted successfully", "success");
      } else {
        throw new Error("Failed to delete procedure");
      }
    } catch (error) {
      showAlert("Error", "Failed to delete procedure", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedProcedure, deleteProcedure]);

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
      procType: "",
      transfer: "",
    });
  }, []);

  const stats = useMemo(() => {
    if (!procedureList.length) {
      return {
        totalProcedures: 0,
        activeProcedures: 0,
        inactiveProcedures: 0,
        hospitalProcedures: 0,
        doctorProcedures: 0,
        transferableProcedures: 0,
      };
    }

    const activeCount = procedureList.filter((p) => p.rActiveYN === "Y").length;
    const hospitalCount = procedureList.filter((p) => p.procType === "HOSP").length;
    const doctorCount = procedureList.filter((p) => p.procType === "DR").length;
    const transferCount = procedureList.filter((p) => p.transferYN === "Y").length;

    return {
      totalProcedures: procedureList.length,
      activeProcedures: activeCount,
      inactiveProcedures: procedureList.length - activeCount,
      hospitalProcedures: hospitalCount,
      doctorProcedures: doctorCount,
      transferableProcedures: transferCount,
    };
  }, [procedureList]);

  const filteredProcedures = useMemo(() => {
    if (!procedureList.length) return [];
    return procedureList.filter((procedure) => {
      const matchesSearch =
        debouncedSearchTerm === "" ||
        procedure.procedureName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        procedure.procedureCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        procedure.procedureNameLong?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        procedure.rNotes?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && procedure.rActiveYN === "Y") || (filters.status === "inactive" && procedure.rActiveYN === "N");

      const matchesProcType = filters.procType === "" || procedure.procType === filters.procType;

      const matchesTransfer =
        filters.transfer === "" ||
        (filters.transfer === "transferable" && procedure.transferYN === "Y") ||
        (filters.transfer === "non-transferable" && procedure.transferYN === "N");

      return matchesSearch && matchesStatus && matchesProcType && matchesTransfer;
    });
  }, [procedureList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Grid container spacing={1.5} mb={1.5}>
      <Grid size={{ xs: 12, sm: 2.4 }}>
        <Card sx={{ borderLeft: "3px solid #1976d2" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                <ProcedureIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#1976d2" fontWeight="bold">
                  {stats.totalProcedures}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Procedures
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
                <ActiveIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#4caf50" fontWeight="bold">
                  {stats.activeProcedures}
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
        <Card sx={{ borderLeft: "3px solid #f44336" }}>
          <CardContent sx={{ p: 1.5, textAlign: "center", "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ bgcolor: "#f44336", width: 40, height: 40 }}>
                <InactiveIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#f44336" fontWeight="bold">
                  {stats.inactiveProcedures}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inactive
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
                <HospitalIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#2196f3" fontWeight="bold">
                  {stats.hospitalProcedures}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Hospital
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
                <DoctorIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h5" color="#ff9800" fontWeight="bold">
                  {stats.doctorProcedures}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Doctor
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const columns: Column<OTProcedureListDto>[] = [
    {
      key: "procedureCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
    },
    {
      key: "procedureName",
      header: "Procedure Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      key: "procedureNameLong",
      header: "Long Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 300,
      formatter: (value: string) => value || "-",
    },
    {
      key: "procType",
      header: "Type",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: string) => {
        const typeLabel = value === "HOSP" ? "Hospital" : value === "DR" ? "Doctor" : value;
        const color = value === "HOSP" ? "info" : value === "DR" ? "warning" : "default";
        return <Chip size="small" color={color} label={typeLabel} />;
      },
    },
    {
      key: "chargeID",
      header: "Charge ID",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      formatter: (value: string) => <Chip size="small" color={value === "Y" ? "success" : "error"} label={value === "Y" ? "Active" : "Inactive"} />,
    },
    {
      key: "rNotes",
      header: "Notes",
      visible: true,
      sortable: true,
      filterable: true,
      width: 300,
      formatter: (value: string) => (value ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : "-"),
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
          Error loading procedures: {error}
        </Typography>
        <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Procedure List
        </Typography>
        <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
      </Box>

      {/* Statistics Dashboard */}
      {showStats && renderStatsDashboard()}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name or long name"
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
          <Grid size={{ xs: 12, md: 5 }}>
            <Tooltip title="Filter Procedures">
              <Stack direction="row" spacing={2} alignItems="center">
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
                  name="procType"
                  value={filters.procType}
                  options={procedureTypeOptions}
                  onChange={(e) => handleFilterChange("procType", e.target.value)}
                  size="small"
                  defaultText="All Types"
                />
                <Box display="flex" alignItems="center" gap={1}>
                  {Object.values(filters).some(Boolean) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
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
              <SmartButton text="Add Procedure" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredProcedures} maxHeight="calc(100vh - 280px)" emptyStateMessage="No procedures found" density="small" loading={isLoading} />
      </Paper>

      {isFormOpen && <ProcedureForm open={isFormOpen} onClose={handleFormClose} initialData={selectedProcedure} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the procedure "${selectedProcedure?.procedureName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default ProcedureListPage;
