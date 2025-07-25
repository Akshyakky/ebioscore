import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import DropdownSelect from "@/components/DropDown/DropdownSelect";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GetLabRegistersListDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  Close as CloseIcon,
  LocalHospital as HospitalIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Assignment as ReportIcon,
  Science as SampleIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Alert, Box, Chip, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLaboratoryReportEntry } from "../hooks/useLaboratoryReportEntry";

const sampleStatusOptions = [
  { value: "all", label: "All Samples" },
  { value: "pending", label: "Pending" },
  { value: "collected", label: "Collected" },
  { value: "received", label: "Received" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
];

const patientStatusOptions = [
  { value: "all", label: "All Patients" },
  { value: "op", label: "Out-Patient (OP)" },
  { value: "ip", label: "In-Patient (IP)" },
];

const reportStatusOptions = [
  { value: "all", label: "All Reports" },
  { value: "pending", label: "Pending Entry" },
  { value: "partial", label: "Partially Entered" },
  { value: "completed", label: "Completed" },
  { value: "verified", label: "Verified" },
];

const LaboratoryReportEntryPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [showStats, setShowStats] = useState(false);
  const { serviceType } = useDropdownValues(["serviceType"]);
  const [labServiceTypes, setLabServiceTypes] = useState<any[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<number | null>(null);
  const { labRegisters, isLoading, error, handleServiceTypeChange, refreshData } = useLaboratoryReportEntry();

  const [filters, setFilters] = useState<{
    sampleStatus: string;
    patientStatus: string;
    reportStatus: string;
  }>({
    sampleStatus: "all",
    patientStatus: "all",
    reportStatus: "all",
  });

  useEffect(() => {
    if (Array.isArray(serviceType) && serviceType.length > 0) {
      const filteredServiceTypes = serviceType.filter((type) => type.labYN === "Y");
      setLabServiceTypes(filteredServiceTypes);

      // Set the first service type as default if not already selected
      if (!selectedServiceType && filteredServiceTypes.length > 0) {
        const defaultServiceType = filteredServiceTypes[0];
        setSelectedServiceType(defaultServiceType.bchID);
        handleServiceTypeChange(defaultServiceType.bchID);
      }
    }
  }, [serviceType, selectedServiceType]);
  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);
  const handleServiceTypeDropdownChange = useCallback(
    (value: string) => {
      const serviceTypeId = parseInt(value);
      setSelectedServiceType(serviceTypeId);
      handleServiceTypeChange(serviceTypeId);
    },
    [handleServiceTypeChange]
  );
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

  const handleFilterChange = useCallback((field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      sampleStatus: "all",
      patientStatus: "all",
      reportStatus: "all",
    });
  }, []);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleEnterReport = useCallback(
    (register: GetLabRegistersListDto) => {
      // TODO: Navigate to report entry form
      showAlert("Info", `Opening report entry for Lab Reg No: ${register.labRegister.labRegNo}`, "info");
    },
    [showAlert]
  );

  const handleViewReport = useCallback(
    (register: GetLabRegistersListDto) => {
      // TODO: Open report viewer
      showAlert("Info", `Viewing report for Lab Reg No: ${register.labRegister.labRegNo}`, "info");
    },
    [showAlert]
  );

  const handlePrintReport = useCallback(
    (register: GetLabRegistersListDto) => {
      // TODO: Print report
      showAlert("Info", `Printing report for Lab Reg No: ${register.labRegister.labRegNo}`, "info");
    },
    [showAlert]
  );

  const stats = useMemo(() => {
    if (!labRegisters.length) {
      return {
        totalRegisters: 0,
        pendingSamples: 0,
        collectedSamples: 0,
        totalInvestigations: 0,
        opPatients: 0,
        ipPatients: 0,
      };
    }

    const pendingSamples = labRegisters.reduce((sum, reg) => sum + reg.labRegister.invSamplePendingCount, 0);

    const collectedSamples = labRegisters.reduce((sum, reg) => sum + reg.labRegister.invSampleCollectedCount, 0);

    const totalInvestigations = labRegisters.reduce((sum, reg) => sum + reg.labRegister.investigationCount, 0);

    const opPatients = labRegisters.filter((reg) => reg.labRegister.patientStatus === "OP").length;

    const ipPatients = labRegisters.filter((reg) => reg.labRegister.patientStatus.startsWith("IP")).length;

    return {
      totalRegisters: labRegisters.length,
      pendingSamples,
      collectedSamples,
      totalInvestigations,
      opPatients,
      ipPatients,
    };
  }, [labRegisters]);

  const filteredRegisters = useMemo(() => {
    if (!labRegisters.length) return [];

    return labRegisters.filter((register) => {
      const reg = register.labRegister;

      const matchesSearch =
        debouncedSearchTerm === "" ||
        reg.labRegNo.toString().includes(debouncedSearchTerm) ||
        reg.patientFullName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reg.patientUHID?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        reg.referralDoctor?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesSampleStatus = filters.sampleStatus === "all" || reg.sampleStatus?.toLowerCase() === filters.sampleStatus.toLowerCase();

      const matchesPatientStatus =
        filters.patientStatus === "all" || (filters.patientStatus === "op" && reg.patientStatus === "OP") || (filters.patientStatus === "ip" && reg.patientStatus.startsWith("IP"));

      const matchesReportStatus = filters.reportStatus === "all" || true;

      return matchesSearch && matchesSampleStatus && matchesPatientStatus && matchesReportStatus;
    });
  }, [labRegisters, debouncedSearchTerm, filters]);

  const getSampleStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "error";
      case "partially collected":
        return "warning";
      case "collected":
        return "primary";
      case "rejected":
        return "secondary";
      default:
        return "default";
    }
  };
  const columns: Column<GetLabRegistersListDto>[] = [
    {
      key: "labRegNo",
      header: "Lab Reg No",
      visible: true,
      sortable: true,
      width: 120,
      formatter: (_value: any, item: GetLabRegistersListDto) => (
        <Typography variant="h6" color="primary">
          {item.labRegister.labRegNo}
        </Typography>
      ),
    },
    {
      key: "patient",
      header: "Patient Details",
      visible: true,
      sortable: true,
      width: 280,
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {item.labRegister.patientFullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            UHID: {item.labRegister.patientUHID}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip
              size="small"
              icon={<HospitalIcon />}
              label={item.labRegister.patientStatus}
              color={item.labRegister.patientStatus === "OP" ? "primary" : "secondary"}
              variant="outlined"
            />
            {item.labRegister.patientRefCode && (
              <Typography variant="caption" sx={{ ml: 1 }}>
                Ref: {item.labRegister.patientRefCode}
              </Typography>
            )}
          </Box>
        </Box>
      ),
    },
    {
      key: "registrationDate",
      header: "Registration Date",
      visible: true,
      sortable: true,
      width: 150,
      formatter: (_value: any, item: GetLabRegistersListDto) => {
        const date = new Date(item.labRegister.labRegisterDate);
        return (
          <Box>
            <Typography variant="body2">{date.toLocaleDateString()}</Typography>
            <Typography variant="caption" color="text.secondary">
              {date.toLocaleTimeString()}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "referralDoctor",
      header: "Referral Doctor",
      visible: true,
      sortable: true,
      width: 150,
      formatter: (_value: any, item: GetLabRegistersListDto) => item.labRegister.referralDoctor || "-",
    },
    {
      key: "location",
      header: "Location",
      visible: true,
      width: 180,
      render: (item) => {
        const { wardName, roomName, bedName } = item.labRegister;
        if (!wardName && !roomName && !bedName) return "-";
        return (
          <Box>
            {wardName && (
              <Typography variant="caption" display="block">
                Ward: {wardName}
              </Typography>
            )}
            {roomName && (
              <Typography variant="caption" display="block">
                Room: {roomName}
              </Typography>
            )}
            {bedName && (
              <Typography variant="caption" display="block">
                Bed: {bedName}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      key: "sampleStatus",
      header: "Sample Status",
      visible: true,
      sortable: true,
      width: 150,
      render: (item) => (
        <Chip size="small" icon={<SampleIcon />} label={item.labRegister.sampleStatus} color={getSampleStatusColor(item.labRegister.sampleStatus)} sx={{ fontWeight: 500 }} />
      ),
    },
    {
      key: "investigations",
      header: "Investigations",
      visible: true,
      width: 200,
      render: (item) => (
        <Box>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={`Total: ${item.labRegister.investigationCount}`} color="info" variant="filled" sx={{ fontSize: "0.75rem" }} />
            <Chip size="small" label={`Pending: ${item.labRegister.invSamplePendingCount}`} color="error" variant="outlined" sx={{ fontSize: "0.75rem" }} />
            <Chip size="small" label={`Collected: ${item.labRegister.invSampleCollectedCount}`} color="primary" variant="outlined" sx={{ fontSize: "0.75rem" }} />
          </Stack>
        </Box>
      ),
    },
    {
      key: "billedBy",
      header: "Billed By",
      visible: true,
      width: 100,
      formatter: (_value: any, item: GetLabRegistersListDto) => item.labRegister.billedBy || "-",
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 150,
      render: (item) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Enter Report">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEnterReport(item)}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
              }}
            >
              <ReportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Report">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleViewReport(item)}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Report">
            <IconButton
              size="small"
              color="success"
              onClick={() => handlePrintReport(item)}
              sx={{
                bgcolor: "rgba(76, 175, 80, 0.08)",
                "&:hover": { bgcolor: "rgba(76, 175, 80, 0.15)" },
              }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
  const customFilter = useCallback((item: GetLabRegistersListDto, searchValue: string) => {
    const reg = item.labRegister;
    const searchLower = searchValue.toLowerCase();

    return (
      reg.labRegNo.toString().includes(searchLower) ||
      reg.patientFullName?.toLowerCase().includes(searchLower) ||
      reg.patientUHID?.toLowerCase().includes(searchLower) ||
      reg.referralDoctor?.toLowerCase().includes(searchLower) ||
      false
    );
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <SmartButton text={showStats ? "Hide Statistics" : "Show Statistics"} onClick={() => setShowStats(!showStats)} variant="outlined" size="small" />
      </Box>

      {showStats && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">Total Registers</Typography>
              <Typography variant="h4">{stats.totalRegisters}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">Pending Samples</Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pendingSamples}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">Collected Samples</Typography>
              <Typography variant="h4" color="info.main">
                {stats.collectedSamples}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">Total Tests</Typography>
              <Typography variant="h4" color="secondary.main">
                {stats.totalInvestigations}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">OP Patients</Typography>
              <Typography variant="h4" color="primary.main">
                {stats.opPatients}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">IP Patients</Typography>
              <Typography variant="h4" color="secondary.main">
                {stats.ipPatients}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Laboratory Report Entry
            </Typography>
            <Grid size={{ xs: 12, md: 4 }}>
              <DropdownSelect
                label="Service Type"
                name="serviceType"
                value={selectedServiceType?.toString() || ""}
                options={labServiceTypes.map((type) => ({
                  value: type.bchID.toString(),
                  label: type.bchName, // adjust based on your data structure
                }))}
                onChange={(e) => handleServiceTypeDropdownChange(e.target.value)}
                size="small"
                defaultText="Select Service Type"
              />
            </Grid>
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
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by Lab Reg No, Patient Name, UHID, Doctor, or Investigation"
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

          <Grid size={{ xs: 12, md: 4 }}>
            <Tooltip title="Filter Lab Registers">
              <Stack direction="row" spacing={2}>
                <DropdownSelect
                  label="Sample Status"
                  name="sampleStatus"
                  value={filters.sampleStatus}
                  options={sampleStatusOptions}
                  onChange={(e) => handleFilterChange("sampleStatus", e.target.value)}
                  size="small"
                  defaultText="All Samples"
                />
                <DropdownSelect
                  label="Patient Status"
                  name="patientStatus"
                  value={filters.patientStatus}
                  options={patientStatusOptions}
                  onChange={(e) => handleFilterChange("patientStatus", e.target.value)}
                  size="small"
                  defaultText="All Patients"
                />
                <DropdownSelect
                  label="Report Status"
                  name="reportStatus"
                  value={filters.reportStatus}
                  options={reportStatusOptions}
                  onChange={(e) => handleFilterChange("reportStatus", e.target.value)}
                  size="small"
                  defaultText="All Reports"
                />
                <Box display="flex" alignItems="center" gap={1}>
                  {Object.values(filters).some((v) => v !== "all") && (
                    <Chip label={`Filters (${Object.values(filters).filter((v) => v !== "all").length})`} onDelete={handleClearFilters} size="small" color="primary" />
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
          data={filteredRegisters}
          maxHeight="calc(100vh - 380px)"
          emptyStateMessage={labRegisters.length === 0 ? "No lab registers found for the selected service type" : "No lab registers match your search criteria"}
          loading={isLoading}
          customFilter={customFilter}
          searchTerm={debouncedSearchTerm}
          density="medium"
        />
      </Paper>
    </Box>
  );
};

export default LaboratoryReportEntryPage;
