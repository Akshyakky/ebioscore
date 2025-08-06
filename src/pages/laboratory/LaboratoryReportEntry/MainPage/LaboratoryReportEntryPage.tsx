import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GetLabRegistersListDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { useAlert } from "@/providers/AlertProvider";
import { debounce } from "@/utils/Common/debounceUtils";
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  LocalHospital as HospitalIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Assignment as ReportIcon,
  Science as SampleIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Alert, Box, Chip, CircularProgress, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import LabEnterReportDialog from "../components/LabEnterReportDialog";
import SampleStatusUpdateDialog from "../components/SampleStatusUpdateDialog";
import { useLaboratoryReportEntry } from "../hooks/useLaboratoryReportEntry";

const sampleStatusOptions = [
  { value: "all", label: "All Report Status" },
  { value: "pending", label: "Sample Pending" },
  { value: "collected", label: "Sample Collected" },
  { value: "rejected", label: "Sample Rejected" },
  { value: "completed", label: "Report Completed" },
  { value: "approved", label: "Report Approved" },
  { value: "deleted", label: "Deleted" },
];

const patientStatusOptions = [
  { value: "all", label: "All Patients" },
  { value: "op", label: "Out-Patient (OP)" },
  { value: "ip", label: "In-Patient (IP)" },
];

interface FilterFormData {
  serviceType: string;
  sampleStatus: string;
  patientStatus: string;
  reportStatus: string;
  serviceGroup: string;
}

const LaboratoryReportEntryPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [showStats, setShowStats] = useState(false);
  const { serviceType, serviceGroup } = useDropdownValues(["serviceType", "serviceGroup"]);
  const [labServiceTypes, setLabServiceTypes] = useState<any[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<number | null>(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openEnterReportDialog, setOpenEnterReportDialog] = useState(false);
  const [selectedReportRegister, setSelectedReportRegister] = useState<GetLabRegistersListDto | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState<GetLabRegistersListDto | null>(null);

  const {
    labRegisters,
    isLoading,
    error,
    investigationStatuses,
    selectedLabRegNo: _selectedLabRegNo,
    statusLoading,
    handleServiceTypeChange,
    refreshData,
    fetchInvestigationStatus,
    clearInvestigationStatus,
    updateLoading,
    updateSampleStatus,
  } = useLaboratoryReportEntry();

  // Setup form for filters
  const {
    control,
    watch,
    setValue,
    reset: resetFilters,
  } = useForm<FilterFormData>({
    defaultValues: {
      serviceType: "",
      sampleStatus: "all",
      patientStatus: "all",
      reportStatus: "all",
      serviceGroup: "all",
    },
  });

  const filters = watch();

  useEffect(() => {
    if (Array.isArray(serviceType) && serviceType.length > 0) {
      const filteredServiceTypes = serviceType.filter((type) => type.labYN === "Y");
      setLabServiceTypes(filteredServiceTypes);
    }
  }, [serviceType]);

  useEffect(() => {
    if (!selectedServiceType && labServiceTypes.length > 0) {
      const defaultServiceType = labServiceTypes[0];
      setSelectedServiceType(defaultServiceType.bchID);
      setValue("serviceType", defaultServiceType.bchID.toString());
      handleServiceTypeChange(defaultServiceType.bchID);
    }
  }, [labServiceTypes.length]);

  const debouncedSearch = useMemo(() => debounce((value: string) => setDebouncedSearchTerm(value), 300), []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleServiceTypeDropdownChange = useCallback(
    (value: any) => {
      const serviceTypeId = parseInt(value.value);
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

  const handleClearFilters = useCallback(() => {
    resetFilters({
      serviceType: selectedServiceType?.toString() || "",
      sampleStatus: "all",
      patientStatus: "all",
      reportStatus: "all",
      serviceGroup: "all",
    });
  }, [resetFilters, selectedServiceType]);

  const serviceGroupOptions = useMemo(() => {
    const options = [{ value: "all", label: "All Service Groups" }];
    if (serviceGroup && Array.isArray(serviceGroup)) {
      options.push(
        ...serviceGroup.map((sg) => ({
          value: sg.value.toString(),
          label: sg.label,
        }))
      );
    }
    return options;
  }, [serviceGroup]);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenUpdateDialog = useCallback(() => {
    if (investigationStatuses.length > 0) {
      const hasEditableStatuses = investigationStatuses.some((inv) => inv.sampleStatus === "Pending" || inv.sampleStatus === "Collected");

      if (!hasEditableStatuses) {
        showAlert("Info", "Sample status can only be updated for investigations that are Pending or Collected", "info");
        return;
      }

      setOpenUpdateDialog(true);
    } else {
      showAlert("Info", "Please select a lab register first", "info");
    }
  }, [investigationStatuses, showAlert]);

  const handleCloseUpdateDialog = useCallback(() => {
    setOpenUpdateDialog(false);
  }, []);

  const handleEnterReport = useCallback((register: GetLabRegistersListDto) => {
    setSelectedReportRegister(register);
    setOpenEnterReportDialog(true);
  }, []);

  const handleCloseEnterReportDialog = useCallback(() => {
    setOpenEnterReportDialog(false);
    setSelectedReportRegister(null);
    refreshData();
  }, [refreshData]);

  const handleViewReport = useCallback(
    (register: GetLabRegistersListDto) => {
      showAlert("Info", `Viewing report for Lab Reg No: ${register.labRegister.labRegNo}`, "info");
    },
    [showAlert]
  );

  const handlePrintReport = useCallback(
    (register: GetLabRegistersListDto) => {
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
        completedResults: 0,
        approvedResults: 0,
        totalInvestigations: 0,
        opPatients: 0,
        ipPatients: 0,
      };
    }

    const pendingSamples = labRegisters.reduce((sum, reg) => sum + reg.labRegister.invSamplePendingCount, 0);
    const collectedSamples = labRegisters.reduce((sum, reg) => sum + reg.labRegister.invSampleCollectedCount, 0);
    const completedResults = labRegisters.reduce((sum, reg) => sum + (reg.labRegister.invResultCompletedCount || 0), 0);
    const approvedResults = labRegisters.reduce((sum, reg) => sum + (reg.labRegister.invResultApprovedCount || 0), 0);
    const totalInvestigations = labRegisters.reduce((sum, reg) => sum + reg.labRegister.investigationCount, 0);
    const opPatients = labRegisters.filter((reg) => reg.labRegister.patientStatus === "OP").length;
    const ipPatients = labRegisters.filter((reg) => reg.labRegister.patientStatus.startsWith("IP")).length;

    return {
      totalRegisters: labRegisters.length,
      pendingSamples,
      collectedSamples,
      completedResults,
      approvedResults,
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

      const matchesSampleStatus = filters.sampleStatus === "all" || reg.sampleStatus?.toLowerCase().includes(filters.sampleStatus.toLowerCase());

      const matchesPatientStatus =
        filters.patientStatus === "all" || (filters.patientStatus === "op" && reg.patientStatus === "OP") || (filters.patientStatus === "ip" && reg.patientStatus.startsWith("IP"));

      const matchesReportStatus =
        filters.reportStatus === "all" ||
        (filters.reportStatus === "pending" && reg.sampleStatus === "Pending") ||
        (filters.reportStatus === "partial" && (reg.sampleStatus === "Partially Collected" || reg.sampleStatus === "Partially Completed")) ||
        (filters.reportStatus === "completed" && reg.sampleStatus === "Completed") ||
        (filters.reportStatus === "approved" && (reg.sampleStatus === "Approved" || reg.sampleStatus === "Partially Approved"));

      const matchesServiceGroup = filters.serviceGroup === "all" || (reg.serviceGroups && reg.serviceGroups.some((sg) => sg.serviceGroupId.toString() === filters.serviceGroup));

      return matchesSearch && matchesSampleStatus && matchesPatientStatus && matchesReportStatus && matchesServiceGroup;
    });
  }, [labRegisters, debouncedSearchTerm, filters]);

  const handleRowClick = useCallback(
    async (register: GetLabRegistersListDto) => {
      setSelectedRegister(register);
      setOpenStatusDialog(true);
      await fetchInvestigationStatus(register.labRegister.labRegNo);
    },
    [fetchInvestigationStatus]
  );

  const handleCloseStatusDialog = useCallback(() => {
    setOpenStatusDialog(false);
    setSelectedRegister(null);
    clearInvestigationStatus();
  }, [clearInvestigationStatus]);

  const getInvestigationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "error";
      case "collected":
        return "warning";
      case "completed":
        return "info";
      case "approved":
        return "success";
      case "rejected":
        return "default";
      default:
        return "default";
    }
  };

  const getSampleStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "error";
      case "partially collected":
      case "collected":
        return "warning";
      case "partially completed":
      case "completed":
        return "info";
      case "partially approved":
      case "approved":
        return "success";
      case "rejected":
        return "default";
      default:
        return "default";
    }
  };

  const getSampleStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "partially completed":
        return <AssignmentTurnedInIcon />;
      case "approved":
      case "partially approved":
        return <CheckCircleIcon />;
      default:
        return <SampleIcon />;
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
      header: "Report Status",
      visible: true,
      sortable: true,
      width: 180,
      render: (item) => (
        <Chip
          size="small"
          icon={getSampleStatusIcon(item.labRegister.sampleStatus)}
          label={item.labRegister.sampleStatus}
          color={getSampleStatusColor(item.labRegister.sampleStatus)}
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      key: "investigations",
      header: "Investigations",
      visible: true,
      width: 300,
      render: (item) => (
        <Box>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`Total: ${item.labRegister.investigationCount}`} color="default" variant="filled" sx={{ fontSize: "0.7rem", mb: 0.5 }} />
            {(item.labRegister.invSamplePendingCount || 0) > 0 && (
              <Chip size="small" label={`Pending: ${item.labRegister.invSamplePendingCount}`} color="error" variant="outlined" sx={{ fontSize: "0.7rem", mb: 0.5 }} />
            )}
            {(item.labRegister.invSampleCollectedCount || 0) > 0 && (
              <Chip size="small" label={`Collected: ${item.labRegister.invSampleCollectedCount}`} color="warning" variant="outlined" sx={{ fontSize: "0.7rem", mb: 0.5 }} />
            )}
            {(item.labRegister.invResultCompletedCount || 0) > 0 && (
              <Chip size="small" label={`Completed: ${item.labRegister.invResultCompletedCount}`} color="info" variant="outlined" sx={{ fontSize: "0.7rem", mb: 0.5 }} />
            )}
            {(item.labRegister.invResultApprovedCount || 0) > 0 && (
              <Chip size="small" label={`Approved: ${item.labRegister.invResultApprovedCount}`} color="success" variant="outlined" sx={{ fontSize: "0.7rem", mb: 0.5 }} />
            )}
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
      key: "serviceGroups",
      header: "Service Groups",
      visible: true,
      width: 200,
      render: (item) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {item.labRegister.serviceGroups && item.labRegister.serviceGroups.length > 0 ? (
            item.labRegister.serviceGroups.map((sg) => (
              <Chip key={sg.serviceGroupId} size="small" label={sg.serviceGroupName} color="primary" variant="outlined" sx={{ fontSize: "0.7rem", mb: 0.5 }} />
            ))
          ) : (
            <Typography variant="caption" color="text.secondary">
              -
            </Typography>
          )}
        </Stack>
      ),
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
    <Box sx={{ p: 2, height: "100vh" }}>
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
              <Typography variant="h4" color="error.main">
                {stats.pendingSamples}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">Collected Samples</Typography>
              <Typography variant="h4" color="warning.main">
                {stats.collectedSamples}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">Completed Results</Typography>
              <Typography variant="h4" color="info.main">
                {stats.completedResults}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">Approved Results</Typography>
              <Typography variant="h4" color="success.main">
                {stats.approvedResults}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Typography variant="h6">Total Tests</Typography>
              <Typography variant="h4" color="secondary.main">
                {stats.totalInvestigations}
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
              <FormField
                name="serviceType"
                control={control}
                label="Service Type"
                type="select"
                size="small"
                fullWidth
                required
                options={labServiceTypes.map((type) => ({
                  value: type.bchID.toString(),
                  label: type.bchName,
                }))}
                defaultText="Select Service Type"
                onChange={handleServiceTypeDropdownChange}
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

          <Grid size={{ xs: 12, md: 8 }}>
            <Tooltip title="Filter Lab Registers">
              <Stack direction="row" spacing={2}>
                <FormField name="serviceGroup" control={control} label="Service Group" type="select" size="small" options={serviceGroupOptions} defaultText="All Service Groups" />
                <FormField name="sampleStatus" control={control} label="Report Status" type="select" size="small" options={sampleStatusOptions} defaultText="All Report Status" />
                <FormField name="patientStatus" control={control} label="Patient Status" type="select" size="small" options={patientStatusOptions} defaultText="All Patients" />

                <Box display="flex" alignItems="center" gap={1}>
                  {Object.values(filters).some((v) => v !== "all" && v !== selectedServiceType?.toString()) && (
                    <Chip
                      label={`Filters (${Object.values(filters).filter((v) => v !== "all" && v !== selectedServiceType?.toString()).length})`}
                      onDelete={handleClearFilters}
                      size="small"
                      color="primary"
                    />
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
          onRowClick={handleRowClick}
        />
      </Paper>

      <GenericDialog
        open={openStatusDialog}
        onClose={handleCloseStatusDialog}
        title="Investigation Status"
        maxWidth="md"
        fullWidth
        showCloseButton={true}
        actions={
          <>
            <SmartButton text="Close" onClick={handleCloseStatusDialog} variant="outlined" size="small" />
            {selectedRegister && investigationStatuses.length > 0 && investigationStatuses.some((inv) => inv.sampleStatus === "Pending" || inv.sampleStatus === "Collected") && (
              <SmartButton text="Update Sample Status" icon={SampleIcon} onClick={handleOpenUpdateDialog} color="warning" variant="contained" size="small" />
            )}
            {selectedRegister && (
              <SmartButton
                text="Enter Report"
                icon={ReportIcon}
                onClick={() => {
                  handleCloseStatusDialog();
                  handleEnterReport(selectedRegister);
                }}
                color="primary"
                variant="contained"
                size="small"
              />
            )}
          </>
        }
      >
        {selectedRegister && (
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Lab Reg No: {selectedRegister.labRegister.labRegNo} | Patient: {selectedRegister.labRegister.patientFullName}
          </Typography>
        )}

        {statusLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : investigationStatuses.length > 0 ? (
          <Stack spacing={2}>
            {investigationStatuses.map((investigation, index) => (
              <Paper key={index} elevation={1} sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {investigation.investigationName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Code: {investigation.investigationCode}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Chip label={investigation.sampleStatus} color={getInvestigationStatusColor(investigation.sampleStatus)} sx={{ fontWeight: 500 }} />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            {selectedRegister && (
              <Box mt={2} p={2} borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Summary
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Chip size="small" label={`Total Investigations: ${selectedRegister.labRegister.investigationCount}`} color="default" />
                  {(selectedRegister.labRegister.invSamplePendingCount || 0) > 0 && (
                    <Chip size="small" label={`Pending: ${selectedRegister.labRegister.invSamplePendingCount}`} color="secondary" variant="outlined" />
                  )}
                  {(selectedRegister.labRegister.invSampleCollectedCount || 0) > 0 && (
                    <Chip size="small" label={`Collected: ${selectedRegister.labRegister.invSampleCollectedCount}`} color="warning" variant="outlined" />
                  )}
                  {(selectedRegister.labRegister.invResultCompletedCount || 0) > 0 && (
                    <Chip size="small" label={`Completed: ${selectedRegister.labRegister.invResultCompletedCount}`} color="info" variant="outlined" />
                  )}
                  {(selectedRegister.labRegister.invResultApprovedCount || 0) > 0 && (
                    <Chip size="small" label={`Approved: ${selectedRegister.labRegister.invResultApprovedCount}`} color="success" variant="outlined" />
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography color="text.secondary">No investigation data available</Typography>
          </Box>
        )}
      </GenericDialog>

      {selectedRegister && (
        <SampleStatusUpdateDialog
          open={openUpdateDialog}
          onClose={handleCloseUpdateDialog}
          investigations={investigationStatuses}
          labRegNo={selectedRegister.labRegister.labRegNo}
          serviceTypeId={selectedServiceType || 0}
          onUpdate={updateSampleStatus}
          loading={updateLoading}
        />
      )}

      {selectedReportRegister && (
        <LabEnterReportDialog
          open={openEnterReportDialog}
          onClose={handleCloseEnterReportDialog}
          labRegNo={selectedReportRegister.labRegister.labRegNo}
          serviceTypeId={selectedServiceType || 0}
          patientName={selectedReportRegister.labRegister.patientFullName}
          onSave={handleCloseEnterReportDialog}
        />
      )}
    </Box>
  );
};

export default LaboratoryReportEntryPage;
