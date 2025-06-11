// src/pages/patientAdministration/DischargePage/MainPage/DischargePage.tsx
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { useAlert } from "@/providers/AlertProvider";
import { calculateDaysBetween, formatDt } from "@/utils/Common/dateUtils";
import {
  LocalHospital as AdmissionIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  ExpandLess as CollapseIcon,
  ExitToApp as DischargeIcon,
  ExpandMore as ExpandIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  Person as PatientIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Collapse, Grid, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CurrentAdmissionDisplayForDischarge from "../Components/CurrentAdmissionDisplayForDischarge";
import DischargeFormDialog from "../Components/DischargeFormDialog";
import DischargeHistoryDialog from "../Components/DischargeHistoryDialog";
import useDischarge from "../hooks/useDischarge";

interface EnhancedDischargeDto extends IpDischargeDto {
  patientName?: string;
  admissionCode?: string;
  admissionDate?: Date;
  lengthOfStay?: number;
  departmentName?: string;
  roomName?: string;
  bedName?: string;
  statusDisplay?: string;
  typeDisplay?: string;
}

const DischargePage: React.FC = () => {
  // State management
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientClearTrigger, setPatientClearTrigger] = useState(0);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  // Dialog states
  const [isDischargeFormOpen, setIsDischargeFormOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedDischarge, setSelectedDischarge] = useState<EnhancedDischargeDto | null>(null);

  const { showAlert } = useAlert();
  const {
    currentAdmissions,
    recentDischarges,
    currentAdmissionStatus,
    existingDischarge,
    loading,
    refreshCurrentAdmissions,
    refreshRecentDischarges,
    checkPatientAdmissionStatus,
    checkExistingDischarge,
    processDischarge,
  } = useDischarge();

  // Load data on component mount
  useEffect(() => {
    refreshCurrentAdmissions();
    refreshRecentDischarges();
  }, [refreshCurrentAdmissions, refreshRecentDischarges]);

  // Enhanced discharges with calculated fields
  const enhancedDischarges = useMemo(() => {
    return recentDischarges.map((discharge) => {
      const patientName = `${discharge.pTitle} ${discharge.pfName} ${discharge.pmName || ""} ${discharge.plName}`.trim();

      // Calculate length of stay if admission data is available
      const admissionDate = new Date(); // This would ideally come from related admission data
      const dischargeDate = new Date(discharge.dischgDate);
      const lengthOfStay = calculateDaysBetween(admissionDate, dischargeDate);

      return {
        ...discharge,
        patientName,
        lengthOfStay,
        statusDisplay: discharge.dischgStatus || "Discharged",
        typeDisplay: discharge.dischgType || "Normal",
      };
    });
  }, [recentDischarges]);

  // Filtered discharges based on search
  const filteredDischarges = useMemo(() => {
    if (!searchTerm) return enhancedDischarges;

    const searchLower = searchTerm.toLowerCase();
    return enhancedDischarges.filter((discharge) => {
      return (
        discharge.patientName?.toLowerCase().includes(searchLower) ||
        discharge.pChartCode?.toLowerCase().includes(searchLower) ||
        discharge.dischargeCode?.toLowerCase().includes(searchLower) ||
        discharge.dischgStatus?.toLowerCase().includes(searchLower) ||
        discharge.dischgPhyName?.toLowerCase().includes(searchLower)
      );
    });
  }, [enhancedDischarges, searchTerm]);

  // Statistics
  const statistics = useMemo(() => {
    const totalAdmissions = currentAdmissions.length;
    const totalDischarges = enhancedDischarges.length;

    const today = new Date();
    const todayDischarges = enhancedDischarges.filter((discharge) => new Date(discharge.dischgDate).toDateString() === today.toDateString()).length;

    const normalDischarges = enhancedDischarges.filter((d) => d.dischgType === "DISCHARGED").length;
    const damaDischarges = enhancedDischarges.filter((d) => d.dischgType === "DAMA").length;

    return {
      totalAdmissions,
      totalDischarges,
      todayDischarges,
      normalDischarges,
      damaDischarges,
    };
  }, [currentAdmissions, enhancedDischarges]);

  // Event handlers
  const handlePatientSelect = useCallback(
    async (patient: PatientSearchResult | null) => {
      setSelectedPatient(patient);
      setShowPatientDetails(!!patient);
      if (patient) {
        await checkPatientAdmissionStatus(patient.pChartID);
        // Check if there's an existing discharge for this patient's current admission
        if (currentAdmissionStatus?.isAdmitted && currentAdmissionStatus.admissionData) {
          await checkExistingDischarge(currentAdmissionStatus.admissionData.ipAdmissionDto.admitID);
        }
      }
    },
    [checkPatientAdmissionStatus, checkExistingDischarge, currentAdmissionStatus]
  );

  const handleProcessDischarge = useCallback(() => {
    if (!selectedPatient) {
      showAlert("Warning", "Please select a patient first", "warning");
      return;
    }

    if (!currentAdmissionStatus?.isAdmitted) {
      showAlert("Warning", "Selected patient is not currently admitted", "warning");
      return;
    }

    setSelectedDischarge(null);
    setIsDischargeFormOpen(true);
  }, [selectedPatient, currentAdmissionStatus, showAlert]);

  const handleEditDischarge = useCallback(() => {
    if (!existingDischarge) {
      showAlert("Warning", "No existing discharge found to edit", "warning");
      return;
    }

    setSelectedDischarge(existingDischarge as EnhancedDischargeDto);
    setIsDischargeFormOpen(true);
  }, [existingDischarge, showAlert]);

  const handleDischargeSubmit = useCallback(
    async (dischargeData: IpDischargeDto) => {
      try {
        await processDischarge(dischargeData);
        setIsDischargeFormOpen(false);
        showAlert("Success", "Patient discharge processed successfully", "success");

        // Clear patient selection and refresh data
        setSelectedPatient(null);
        setSelectedDischarge(null);
        setShowPatientDetails(false);
        setPatientClearTrigger((prev) => prev + 1);
        await refreshCurrentAdmissions();
        await refreshRecentDischarges();
      } catch (error) {
        showAlert("Error", "Failed to process patient discharge", "error");
      }
    },
    [processDischarge, showAlert, refreshCurrentAdmissions, refreshRecentDischarges]
  );

  const handleViewHistory = useCallback((discharge: EnhancedDischargeDto) => {
    setSelectedDischarge(discharge);
    setIsHistoryDialogOpen(true);
  }, []);

  const handlePatientHistory = useCallback(() => {
    if (!selectedPatient) {
      showAlert("Warning", "Please select a patient first", "warning");
      return;
    }
    setIsHistoryDialogOpen(true);
  }, [selectedPatient, showAlert]);

  const handleDischargeClose = useCallback(() => {
    setIsDischargeFormOpen(false);
    setSelectedDischarge(null);
  }, []);

  // Grid columns
  const columns: Column<EnhancedDischargeDto>[] = [
    {
      key: "patientInfo",
      header: "Patient Information",
      visible: true,
      sortable: true,
      width: 200,
      render: (discharge) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            <PatientIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {discharge.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {discharge.pChartCode}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "dischargeCode",
      header: "Discharge Code",
      visible: true,
      sortable: true,
      width: 130,
      render: (discharge) => (
        <Typography variant="body2" fontWeight="medium">
          {discharge.dischargeCode || "N/A"}
        </Typography>
      ),
    },
    {
      key: "dischgDate",
      header: "Discharge Date",
      visible: true,
      sortable: true,
      width: 140,
      render: (discharge) => (
        <Box>
          <Typography variant="body2">{formatDt(discharge.dischgDate)}</Typography>
          {discharge.lengthOfStay && (
            <Typography variant="caption" color="text.secondary">
              Stay: {discharge.lengthOfStay} day{discharge.lengthOfStay !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "dischgPhyName",
      header: "Discharging Physician",
      visible: true,
      sortable: true,
      width: 180,
      formatter: (value: string) => value || "Not specified",
    },
    {
      key: "dischgStatus",
      header: "Status",
      visible: true,
      sortable: true,
      width: 120,
      formatter: (value: string) => value || "Discharged",
    },
    {
      key: "dischgType",
      header: "Type",
      visible: true,
      sortable: true,
      width: 120,
      render: (discharge) => {
        const getTypeColor = (type: string) => {
          switch (type) {
            case "DISCHARGED":
              return "success";
            case "DAMA":
              return "warning";
            case "TRANSFER":
              return "info";
            case "EXPIRED":
              return "error";
            default:
              return "default";
          }
        };

        return <Chip label={discharge.dischgType || "Normal"} size="small" color={getTypeColor(discharge.dischgType || "DISCHARGED") as any} variant="filled" />;
      },
    },
    {
      key: "bedRelease",
      header: "Bed Released",
      visible: true,
      sortable: true,
      width: 100,
      render: (discharge) => (
        <Chip
          icon={discharge.releaseBedYN === "Y" ? <CheckIcon /> : <CloseIcon />}
          label={discharge.releaseBedYN === "Y" ? "Yes" : "No"}
          size="small"
          color={discharge.releaseBedYN === "Y" ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 120,
      render: (discharge) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            color="primary"
            onClick={(event) => {
              event.stopPropagation();
              handleViewHistory(discharge);
            }}
            title="View History"
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={(event) => {
              event.stopPropagation();
              // Edit discharge functionality could be added here
            }}
            title="View Details"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 1.5 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Patient Discharge Management
        </Typography>
        <SmartButton
          variant="outlined"
          icon={RefreshIcon}
          text="Refresh"
          onAsyncClick={async () => {
            await refreshCurrentAdmissions();
            await refreshRecentDischarges();
          }}
          asynchronous
          size="small"
        />
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={1} mb={1.5}>
        <Grid size={{ xs: 3 }}>
          <Card sx={{ borderLeft: "3px solid #1976d2" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32 }}>
                  <AdmissionIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#1976d2" fontWeight="bold">
                    {statistics.totalAdmissions}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current Admissions
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
                  <DischargeIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#4caf50" fontWeight="bold">
                    {statistics.totalDischarges}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recent Discharges
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
                  <HomeIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#ff9800" fontWeight="bold">
                    {statistics.todayDischarges}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Today's Discharges
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
                  <CheckIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#9c27b0" fontWeight="bold">
                    {statistics.normalDischarges}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Normal Discharges
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patient Search Section */}
      <Paper sx={{ p: 1.5, mb: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SearchIcon fontSize="small" />
            Patient Search & Discharge
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
                <CustomButton
                  variant="contained"
                  icon={DischargeIcon}
                  text={existingDischarge ? "Edit Discharge" : "Process Discharge"}
                  onClick={existingDischarge ? handleEditDischarge : handleProcessDischarge}
                  disabled={!currentAdmissionStatus?.isAdmitted}
                  color="primary"
                  size="small"
                />
                <CustomButton variant="outlined" icon={HistoryIcon} text="History" onClick={handlePatientHistory} size="small" />
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

      {/* Current Admission Display */}
      {selectedPatient && (
        <Box mb={1.5}>
          <CurrentAdmissionDisplayForDischarge
            patient={selectedPatient}
            admission={currentAdmissionStatus?.admissionData || null}
            existingDischarge={existingDischarge}
            loading={loading}
            onDischargeClick={handleProcessDischarge}
            onEditDischargeClick={handleEditDischarge}
            onHistoryClick={handlePatientHistory}
          />
        </Box>
      )}

      {/* Recent Discharges Grid */}
      <Paper sx={{ p: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DischargeIcon fontSize="small" />
            Recent Discharges
          </Typography>
          <TextField type="search" placeholder="Search discharges..." value={searchTerm} size="small" onChange={(e) => setSearchTerm(e.target.value)} sx={{ width: 200 }} />
        </Box>

        <CustomGrid
          columns={columns}
          data={filteredDischarges}
          loading={loading}
          maxHeight="450px"
          emptyStateMessage="No recent discharges found"
          rowKeyField="dischgID"
          showDensityControls={false}
          onRowClick={handleViewHistory}
        />
      </Paper>

      {/* Dialogs */}
      <DischargeFormDialog
        open={isDischargeFormOpen}
        onClose={handleDischargeClose}
        onSubmit={handleDischargeSubmit}
        patient={selectedPatient}
        currentAdmission={currentAdmissionStatus?.admissionData || null}
        existingDischarge={selectedDischarge}
      />

      <DischargeHistoryDialog
        open={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        dischargeHistory={[]}
        patient={selectedPatient}
        currentDischarge={existingDischarge}
      />
    </Box>
  );
};

export default DischargePage;
