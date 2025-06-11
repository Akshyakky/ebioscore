import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Grid, TextField, InputAdornment, IconButton, Chip, Stack, Tooltip } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import SmartButton from "@/components/Button/SmartButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import { InvestigationListDto } from "@/interfaces/Laboratory/InvestigationListDto";
import InvestigationForm from "../Form/InvestigationForm";
import { useInvestigationList } from "../hooks/useInvestigationList";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const reportOptions = [
  { value: "yes", label: "Report Required" },
  { value: "no", label: "No Report" },
];

const sampleOptions = [
  { value: "yes", label: "Sample Required" },
  { value: "no", label: "No Sample" },
];

const InvestigationListPage: React.FC = () => {
  const { showAlert } = useAlert();
  const { department } = useDropdownValues(["department"]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [selectedInvestigation, setSelectedInvestigation] = useState<InvestigationListDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [showStats, setShowStats] = useState(false);

  const { investigationList, isLoading, error, fetchInvestigationList, deleteInvestigation } = useInvestigationList();
  const [filters, setFilters] = useState<{
    status: string;
    department: string;
    report: string;
    sample: string;
  }>({
    status: "",
    department: "",
    report: "",
    sample: "",
  });

  const handleRefresh = useCallback(() => {
    fetchInvestigationList();
  }, [fetchInvestigationList]);

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
    setSelectedInvestigation(null);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((investigation: InvestigationListDto) => {
    setSelectedInvestigation(investigation);
    setIsViewMode(false);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((investigation: InvestigationListDto) => {
    setSelectedInvestigation(investigation);
    setIsViewMode(true);
    setIsFormOpen(true);
  }, []);

  const handleDeleteClick = useCallback((investigation: InvestigationListDto) => {
    setSelectedInvestigation(investigation);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedInvestigation?.lInvMastDto?.invID) return;

    try {
      const success = await deleteInvestigation(selectedInvestigation.lInvMastDto.invID);

      if (success) {
        showAlert("Success", "Investigation deleted successfully", "success");
      } else {
        throw new Error("Failed to delete investigation");
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      showAlert("Error", "Failed to delete investigation", "error");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  }, [selectedInvestigation, deleteInvestigation, showAlert]);

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
      department: "",
      report: "",
      sample: "",
    });
  }, []);

  // Calculate stats for the dashboard
  const stats = useMemo(() => {
    if (!investigationList.length) {
      return {
        totalInvestigations: 0,
        activeInvestigations: 0,
        inactiveInvestigations: 0,
        withReport: 0,
        withSample: 0,
        totalComponents: 0,
      };
    }
    const activeCount = investigationList.filter((inv) => inv.lInvMastDto?.rActiveYN === "Y").length;
    const withReportCount = investigationList.filter((inv) => inv.lInvMastDto?.invReportYN === "Y").length;
    const withSampleCount = investigationList.filter((inv) => inv.lInvMastDto?.invSampleYN === "Y").length;
    const totalComponentsCount = investigationList.reduce((sum, inv) => sum + (inv.lComponentsDto?.length || 0), 0);

    return {
      totalInvestigations: investigationList.length,
      activeInvestigations: activeCount,
      inactiveInvestigations: investigationList.length - activeCount,
      withReport: withReportCount,
      withSample: withSampleCount,
      totalComponents: totalComponentsCount,
    };
  }, [investigationList]);

  // Apply filters to the list
  const filteredInvestigations = useMemo(() => {
    if (!investigationList.length) return [];

    return investigationList.filter((investigation) => {
      const inv = investigation.lInvMastDto;
      if (!inv) return false;

      const matchesSearch =
        debouncedSearchTerm === "" ||
        inv.invName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        inv.invCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        inv.invShortName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        inv.methods?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = filters.status === "" || (filters.status === "active" && inv.rActiveYN === "Y") || (filters.status === "inactive" && inv.rActiveYN === "N");

      const matchesDepartment = filters.department === "" || inv.deptID === Number(filters.department);

      const matchesReport = filters.report === "" || (filters.report === "yes" && inv.invReportYN === "Y") || (filters.report === "no" && inv.invReportYN === "N");

      const matchesSample = filters.sample === "" || (filters.sample === "yes" && inv.invSampleYN === "Y") || (filters.sample === "no" && inv.invSampleYN === "N");

      return matchesSearch && matchesStatus && matchesDepartment && matchesReport && matchesSample;
    });
  }, [investigationList, debouncedSearchTerm, filters]);

  const renderStatsDashboard = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Investigations</Typography>
          <Typography variant="h4">{stats.totalInvestigations}</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Active</Typography>
          <Typography variant="h4" color="success.main">
            {stats.activeInvestigations}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Inactive</Typography>
          <Typography variant="h4" color="error.main">
            {stats.inactiveInvestigations}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">With Report</Typography>
          <Typography variant="h4" color="info.main">
            {stats.withReport}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">With Sample</Typography>
          <Typography variant="h4" color="warning.main">
            {stats.withSample}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Typography variant="h6">Total Components</Typography>
          <Typography variant="h4" color="secondary.main">
            {stats.totalComponents}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const columns: Column<InvestigationListDto>[] = [
    {
      key: "lInvMastDto.invCode",
      header: "Code",
      visible: true,
      sortable: true,
      filterable: true,
      width: 120,
      formatter: (value: any, item: InvestigationListDto) => item.lInvMastDto?.invCode || "-",
    },
    {
      key: "lInvMastDto.invName",
      header: "Investigation Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 250,
      formatter: (value: any, item: InvestigationListDto) => item.lInvMastDto?.invName || "-",
    },
    {
      key: "lInvMastDto.invShortName",
      header: "Short Name",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: any, item: InvestigationListDto) => item.lInvMastDto?.invShortName || "-",
    },
    {
      key: "lInvMastDto.deptName",
      header: "Department",
      visible: true,
      sortable: true,
      filterable: true,
      width: 150,
      formatter: (value: any, item: InvestigationListDto) => item.lInvMastDto?.deptName || "-",
    },
    {
      key: "componentCount",
      header: "Components",
      visible: true,
      sortable: true,
      width: 120,
      formatter: (value: any, item: InvestigationListDto) => <Chip size="small" label={`${item.lComponentsDto?.length || 0} items`} color="primary" variant="outlined" />,
    },
    {
      key: "lInvMastDto.invReportYN",
      header: "Report",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: any, item: InvestigationListDto) => (
        <Chip size="small" color={item.lInvMastDto?.invReportYN === "Y" ? "success" : "default"} label={item.lInvMastDto?.invReportYN === "Y" ? "Yes" : "No"} />
      ),
    },
    {
      key: "lInvMastDto.invSampleYN",
      header: "Sample",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: any, item: InvestigationListDto) => (
        <Chip size="small" color={item.lInvMastDto?.invSampleYN === "Y" ? "warning" : "default"} label={item.lInvMastDto?.invSampleYN === "Y" ? "Yes" : "No"} />
      ),
    },
    {
      key: "lInvMastDto.rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      filterable: true,
      width: 100,
      formatter: (value: any, item: InvestigationListDto) => (
        <Chip size="small" color={item.lInvMastDto?.rActiveYN === "Y" ? "success" : "error"} label={item.lInvMastDto?.rActiveYN === "Y" ? "Active" : "Inactive"} />
      ),
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
          <Tooltip title="View Investigation">
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
          <Tooltip title="Edit Investigation">
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
          </Tooltip>
          <Tooltip title="Delete Investigation">
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

  // if (error) {
  //   return (
  //     <Box sx={{ p: 2 }}>
  //       <Typography color="error" variant="h6">
  //         Error loading investigations: {error}
  //       </Typography>
  //       <SmartButton text="Retry" onClick={handleRefresh} variant="contained" color="primary" />
  //     </Box>
  //   );
  // }

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
              Investigation List
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
              <SmartButton text="Add Investigation" icon={AddIcon} onClick={handleAddNew} color="primary" variant="contained" size="small" />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by code, name, short name or methods"
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
            <Tooltip title="Filter Investigations">
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
                  label="Department"
                  name="department"
                  value={filters.department}
                  options={department || []}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  size="small"
                  defaultText="All Departments"
                />
                <DropdownSelect
                  label="Report"
                  name="report"
                  value={filters.report}
                  options={reportOptions}
                  onChange={(e) => handleFilterChange("report", e.target.value)}
                  size="small"
                  defaultText="All"
                />
                <DropdownSelect
                  label="Sample"
                  name="sample"
                  value={filters.sample}
                  options={sampleOptions}
                  onChange={(e) => handleFilterChange("sample", e.target.value)}
                  size="small"
                  defaultText="All"
                />
                <Box display="flex" alignItems="center" gap={1}>
                  {Object.values(filters).some((v) => v) && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v).length})`} onDelete={handleClearFilters} size="small" color="primary" />
                  )}
                </Box>
              </Stack>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CustomGrid columns={columns} data={filteredInvestigations} maxHeight="calc(100vh - 280px)" emptyStateMessage="No investigations found" loading={isLoading} />
      </Paper>

      {isFormOpen && <InvestigationForm open={isFormOpen} onClose={handleFormClose} initialData={selectedInvestigation} viewOnly={isViewMode} />}

      <ConfirmationDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete the investigation "${selectedInvestigation?.lInvMastDto?.invName}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
        maxWidth="xs"
      />
    </Box>
  );
};

export default InvestigationListPage;
