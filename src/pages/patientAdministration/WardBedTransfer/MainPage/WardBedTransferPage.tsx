// src/pages/patientAdministration/WardBedTransfer/MainPage/WardBedTransferPage.tsx
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { BedTransferRequestDto } from "@/interfaces/PatientAdministration/BedTransferRequestDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { useAlert } from "@/providers/AlertProvider";
import { formatDt } from "@/utils/Common/dateUtils";
import {
  Hotel as BedIcon,
  ExpandLess as CollapseIcon,
  MedicalServices as DoctorIcon,
  ExpandMore as ExpandIcon,
  History as HistoryIcon,
  LocalHospital as HospitalIcon,
  Person as PatientIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  SwapHoriz as TransferIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Collapse, Grid, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import BedTransferDialog from "../Components/BedTransferDialog";
import CurrentAdmissionDisplay from "../Components/CurrentAdmissionDisplay";
import TransferHistoryDialog from "../Components/TransferHistoryDialog";
import useWardBedTransfer from "../hooks/useWardBedTransfer";

interface TransferRecord extends BedTransferRequestDto {
  id: number;
  transferDateTime: Date;
  status: "Completed" | "Pending" | "Cancelled";
  transferredBy: string;
  previousLocation: string;
  newLocation: string;
  patientName: string;
}

const WardBedTransferPage: React.FC = () => {
  // State management
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientClearTrigger, setPatientClearTrigger] = useState(0);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  // Dialog states
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const { showAlert } = useAlert();
  const { currentAdmission, transferHistory, recentTransfers, loading, checkPatientAdmission, processTransfer, refreshTransfers, getTransferHistory } = useWardBedTransfer();

  // Load recent transfers on component mount
  useEffect(() => {
    refreshTransfers();
  }, [refreshTransfers]);

  // Enhanced transfer records with calculated fields
  const enhancedTransfers = useMemo(() => {
    return recentTransfers.map((transfer, index) => {
      const patientName = `${transfer.pChartCode}` || "Unknown Patient";
      const previousLocation = `${transfer.rName || "Unknown Room"} - ${transfer.bedName || "Unknown"}`;
      const newLocation = `${transfer.rName || "New Room"} - ${transfer.bedName || "New Bed"}`;

      return {
        ...transfer,
        id: index + 1,
        transferDateTime: new Date(transfer.transferDate),
        status: "Completed" as "Completed" | "Pending" | "Cancelled",
        transferredBy: "System User",
        previousLocation,
        newLocation,
        patientName,
      };
    });
  }, [recentTransfers]);

  // Filtered transfers based on search
  const filteredTransfers = useMemo(() => {
    if (!searchTerm) return enhancedTransfers;

    const searchLower = searchTerm.toLowerCase();
    return enhancedTransfers.filter((transfer) => {
      return (
        transfer.pChartCode.toLowerCase().includes(searchLower) ||
        transfer.patientName?.toLowerCase().includes(searchLower) ||
        transfer.bedName?.toLowerCase().includes(searchLower) ||
        transfer.rName?.toLowerCase().includes(searchLower) ||
        transfer.reasonForTransfer?.toLowerCase().includes(searchLower)
      );
    });
  }, [enhancedTransfers, searchTerm]);

  // Statistics
  const statistics = useMemo(() => {
    const today = new Date();
    const todayTransfers = enhancedTransfers.filter((transfer) => transfer.transferDateTime.toDateString() === today.toDateString());

    const thisWeek = enhancedTransfers.filter((transfer) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return transfer.transferDateTime >= weekAgo;
    });

    return {
      total: enhancedTransfers.length,
      today: todayTransfers.length,
      thisWeek: thisWeek.length,
      pending: enhancedTransfers.filter((t) => t.status === "Pending").length,
    };
  }, [enhancedTransfers]);

  // Event handlers
  const handlePatientSelect = useCallback(
    async (patient: PatientSearchResult | null) => {
      setSelectedPatient(patient);
      setShowPatientDetails(!!patient);
      if (patient) {
        await checkPatientAdmission(patient.pChartID);
      }
    },
    [checkPatientAdmission]
  );

  const handleInitiateTransfer = useCallback(() => {
    if (!selectedPatient) {
      showAlert("Warning", "Please select a patient first", "warning");
      return;
    }

    if (!currentAdmission) {
      showAlert("Warning", "Selected patient is not currently admitted", "warning");
      return;
    }

    setIsTransferDialogOpen(true);
  }, [selectedPatient, currentAdmission, showAlert]);

  const handleTransferSubmit = useCallback(
    async (transferData: BedTransferRequestDto) => {
      try {
        await processTransfer(transferData);
        setIsTransferDialogOpen(false);
        showAlert("Success", "Patient transferred successfully", "success");

        // Clear patient selection and refresh data
        setSelectedPatient(null);
        setShowPatientDetails(false);
        setPatientClearTrigger((prev) => prev + 1);
        await refreshTransfers();
      } catch (error) {
        showAlert("Error", "Failed to process transfer", "error");
      }
    },
    [processTransfer, showAlert, refreshTransfers]
  );

  const handleViewHistory = useCallback(
    async (transfer: TransferRecord) => {
      if (transfer.admitID) {
        await getTransferHistory(transfer.admitID);
        setIsHistoryDialogOpen(true);
      }
    },
    [getTransferHistory]
  );

  const handleViewPatientHistory = useCallback(async () => {
    if (!currentAdmission) {
      showAlert("Warning", "No current admission selected", "warning");
      return;
    }

    await getTransferHistory(currentAdmission.ipAdmissionDto.admitID);
    setIsHistoryDialogOpen(true);
  }, [currentAdmission, getTransferHistory, showAlert]);

  // Grid columns
  const columns: Column<TransferRecord>[] = [
    {
      key: "id",
      header: "#",
      visible: true,
      sortable: true,
      width: 60,
      formatter: (value: number) => value.toString(),
    },
    {
      key: "patientInfo",
      header: "Patient Information",
      visible: true,
      sortable: true,
      width: 180,
      render: (transfer) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            <PatientIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {transfer.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {transfer.pChartCode}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "transferDateTime",
      header: "Transfer Date/Time",
      visible: true,
      sortable: true,
      width: 140,
      render: (transfer) => <Typography variant="body2">{formatDt(transfer.transferDateTime)}</Typography>,
    },
    {
      key: "previousLocation",
      header: "From",
      visible: true,
      sortable: true,
      width: 160,
      render: (transfer) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {transfer.rName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bed: {transfer.bedName}
          </Typography>
        </Box>
      ),
    },
    {
      key: "newLocation",
      header: "To",
      visible: true,
      sortable: true,
      width: 160,
      render: (transfer) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {transfer.rName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bed: {transfer.bedName}
          </Typography>
        </Box>
      ),
    },
    {
      key: "treatPhyName",
      header: "Treating Physician",
      visible: true,
      sortable: true,
      width: 160,
      formatter: (value, transfer) => transfer.treatPhyName || "Not Assigned",
    },
    {
      key: "reasonForTransfer",
      header: "Reason",
      visible: true,
      sortable: true,
      width: 200,
      render: (transfer) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 180,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={transfer.reasonForTransfer}
        >
          {transfer.reasonForTransfer || "No reason provided"}
        </Typography>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      render: (transfer) => (
        <Chip label={transfer.status} size="small" color={transfer.status === "Completed" ? "success" : transfer.status === "Pending" ? "warning" : "default"} variant="filled" />
      ),
    },
  ];

  return (
    <Box sx={{ p: 1.5 }}>
      {/* Compact Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Ward/Bed Transfer Management
        </Typography>
        <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={refreshTransfers} asynchronous size="small" />
      </Box>

      {/* Compact Statistics Cards */}
      <Grid container spacing={1} mb={1.5}>
        <Grid size={{ xs: 3 }}>
          <Card sx={{ borderLeft: "3px solid #1976d2" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32 }}>
                  <TransferIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#1976d2" fontWeight="bold">
                    {statistics.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Card sx={{ borderLeft: "3px solid #4caf50" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#4caf50", width: 32, height: 32 }}>
                  <HospitalIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#4caf50" fontWeight="bold">
                    {statistics.today}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Today
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Card sx={{ borderLeft: "3px solid #ff9800" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#ff9800", width: 32, height: 32 }}>
                  <BedIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#ff9800" fontWeight="bold">
                    {statistics.thisWeek}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This Week
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 3 }}>
          <Card sx={{ borderLeft: "3px solid #9c27b0" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#9c27b0", width: 32, height: 32 }}>
                  <DoctorIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#9c27b0" fontWeight="bold">
                    {statistics.pending}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Compact Patient Search Section */}
      <Paper sx={{ p: 1.5, mb: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SearchIcon fontSize="small" />
            Patient Search & Transfer
          </Typography>
          {selectedPatient && (
            <IconButton size="small" onClick={() => setShowPatientDetails(!showPatientDetails)}>
              {showPatientDetails ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          )}
        </Box>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: selectedPatient ? 6 : 12 }}>
            <PatientSearch onPatientSelect={handlePatientSelect} clearTrigger={patientClearTrigger} placeholder="Search by name, UHID, or phone number" />

            {selectedPatient && (
              <Stack direction="row" spacing={1} mt={1}>
                <CustomButton variant="contained" icon={TransferIcon} text="Transfer" onClick={handleInitiateTransfer} disabled={!currentAdmission} color="primary" size="small" />
                <CustomButton variant="outlined" icon={HistoryIcon} text="History" onClick={handleViewPatientHistory} disabled={!currentAdmission} size="small" />
              </Stack>
            )}
          </Grid>

          {selectedPatient && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Collapse in={showPatientDetails}>
                <PatientDemographics pChartID={selectedPatient?.pChartID || null} variant="compact" showEditButton={false} showRefreshButton={false} />
              </Collapse>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Compact Current Admission Display */}
      {selectedPatient && (
        <Box mb={1.5}>
          <CurrentAdmissionDisplay
            patient={selectedPatient}
            admission={currentAdmission}
            loading={loading}
            onTransferClick={handleInitiateTransfer}
            onHistoryClick={handleViewPatientHistory}
          />
        </Box>
      )}

      {/* Compact Recent Transfers Grid */}
      <Paper sx={{ p: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HistoryIcon fontSize="small" />
            Recent Transfers
          </Typography>
          <TextField type="search" placeholder="Search transfers..." value={searchTerm} size="small" onChange={(e) => setSearchTerm(e.target.value)} sx={{ width: 200 }} />
        </Box>

        <CustomGrid
          columns={columns}
          data={filteredTransfers}
          loading={loading}
          maxHeight="450px"
          emptyStateMessage="No transfers found"
          rowKeyField="id"
          showDensityControls={false}
          onRowClick={handleViewHistory}
        />
      </Paper>

      {/* Dialogs */}
      <BedTransferDialog
        open={isTransferDialogOpen}
        onClose={() => setIsTransferDialogOpen(false)}
        onSubmit={handleTransferSubmit}
        patient={selectedPatient}
        currentAdmission={currentAdmission}
      />

      <TransferHistoryDialog open={isHistoryDialogOpen} onClose={() => setIsHistoryDialogOpen(false)} transferHistory={transferHistory} patient={selectedPatient} />
    </Box>
  );
};

export default WardBedTransferPage;
