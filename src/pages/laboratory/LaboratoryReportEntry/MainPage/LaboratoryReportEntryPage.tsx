import SmartButton from "@/components/Button/SmartButton";
import FormField from "@/components/EnhancedFormField/EnhancedFormField";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { GetLabRegistersListDto } from "@/interfaces/Laboratory/LaboratoryReportEntry";
import { useAlert } from "@/providers/AlertProvider";
import { Close as CloseIcon, Refresh as RefreshIcon, Assignment as ReportIcon, Science as SampleIcon, Search as SearchIcon } from "@mui/icons-material";
import { Alert, Box, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

// Import refactored hooks and components
import { StatisticsPanel } from "../components/common/StatisticsPanel";
import { FilterBar } from "../components/filters/FilterBar";
import { InvestigationStatusList } from "../components/InvestigationStatusList";
import LabEnterReportDialog from "../components/LabEnterReportDialog";
import { LabRegistersGrid } from "../components/LabRegistersGrid";
import SampleStatusUpdateDialog from "../components/SampleStatusUpdateDialog";
import { useLabFilters } from "../hooks/useLabFilters";
import { useLaboratoryReportEntry } from "../hooks/useLaboratoryReportEntry";
import { useLabStatistics } from "../hooks/useLabStatistics";
import { canUpdateSampleStatus } from "../utils/statusUtils";

const LaboratoryReportEntryPage: React.FC = () => {
  const { showAlert } = useAlert();
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
    statusLoading,
    handleServiceTypeChange,
    refreshData,
    fetchInvestigationStatus,
    clearInvestigationStatus,
    updateLoading,
    updateSampleStatus,
  } = useLaboratoryReportEntry();

  const { searchTerm, debouncedSearchTerm, control, setValue, filteredRegisters, handleSearchChange, handleClearSearch, handleClearFilters } = useLabFilters(
    labRegisters,
    selectedServiceType
  );

  const stats = useLabStatistics(labRegisters);

  // Service type setup
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
  }, [labServiceTypes, selectedServiceType, setValue, handleServiceTypeChange]);

  // Service group options
  const serviceGroupOptions = React.useMemo(() => {
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

  // Event handlers
  const handleServiceTypeDropdownChange = useCallback(
    (value: any) => {
      const serviceTypeId = parseInt(value.value);
      setSelectedServiceType(serviceTypeId);
      handleServiceTypeChange(serviceTypeId);
    },
    [handleServiceTypeChange]
  );

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenUpdateDialog = useCallback(() => {
    if (investigationStatuses.length > 0) {
      const hasEditableStatuses = investigationStatuses.some((inv) => canUpdateSampleStatus(inv.sampleStatus));

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

      {showStats && <StatisticsPanel stats={stats} />}

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
            <FilterBar
              control={control}
              serviceGroupOptions={serviceGroupOptions}
              selectedServiceType={selectedServiceType}
              filters={control._formValues}
              onClearFilters={handleClearFilters}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <LabRegistersGrid
          data={filteredRegisters}
          loading={isLoading}
          searchTerm={debouncedSearchTerm}
          onRowClick={handleRowClick}
          onEnterReport={handleEnterReport}
          onViewReport={handleViewReport}
          onPrintReport={handlePrintReport}
          emptyMessage={labRegisters.length === 0 ? "No lab registers found for the selected service type" : "No lab registers match your search criteria"}
        />
      </Paper>

      {/* Investigation Status Dialog */}
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
            {selectedRegister && investigationStatuses.length > 0 && investigationStatuses.some((inv) => canUpdateSampleStatus(inv.sampleStatus)) && (
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
        <Box sx={{ minHeight: "50vh" }}>
          {selectedRegister && (
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Lab Reg No: {selectedRegister.labRegister.labRegNo} | Patient: {selectedRegister.labRegister.patientFullName}
            </Typography>
          )}
          <InvestigationStatusList investigations={investigationStatuses} loading={statusLoading} selectedRegister={selectedRegister} />
        </Box>
      </GenericDialog>

      {/* Sample Status Update Dialog */}
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

      {/* Lab Enter Report Dialog */}
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
