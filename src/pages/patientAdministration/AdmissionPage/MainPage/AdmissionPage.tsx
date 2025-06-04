// src/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Stack, IconButton, Avatar, Divider, TextField } from "@mui/material";
import {
  Add,
  Person as PatientIcon,
  Hotel as BedIcon,
  LocalHospital as AdmissionIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { useAlert } from "@/providers/AlertProvider";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { formatDt } from "@/utils/Common/dateUtils";
import useAdmission from "../hooks/useAdmission";
import AdmissionFormDialog from "../Components/AdmissionFormDialog";
import AdmissionStatusDialog from "../Components/AdmissionStatusDialog";
import AdmissionHistoryDialog from "../Components/AdmissionHistoryDialog";

interface EnhancedAdmissionDto extends AdmissionDto {
  patientName?: string;
  bedDisplay?: string;
  roomDisplay?: string;
  departmentDisplay?: string;
  statusDisplay?: string;
  daysAdmitted?: number;
}

const AdmissionPage: React.FC = () => {
  // State management
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientClearTrigger, setPatientClearTrigger] = useState(0);
  const [selectedAdmission, setSelectedAdmission] = useState<EnhancedAdmissionDto | null>(null);

  // Dialog states
  const [isAdmissionFormOpen, setIsAdmissionFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const { showAlert } = useAlert();
  const { admissions, loading, currentAdmissionStatus, refreshAdmissions, refreshPatientStatus, admitPatient, checkPatientAdmissionStatus } = useAdmission();

  // Load data on component mount
  useEffect(() => {
    refreshAdmissions();
  }, [refreshAdmissions]);

  // Enhanced admissions with calculated fields
  const enhancedAdmissions = useMemo(() => {
    return admissions.map((admission) => {
      const patientName = `${admission.ipAdmissionDto.pTitle} ${admission.ipAdmissionDto.pfName} ${admission.ipAdmissionDto.pmName || ""} ${
        admission.ipAdmissionDto.plName
      }`.trim();
      const bedDisplay = admission.wrBedDetailsDto.bedName || "Not Assigned";
      const roomDisplay = admission.ipAdmissionDetailsDto.rName || "Unknown Room";
      const departmentDisplay = admission.ipAdmissionDto.deptName || "Unknown Department";

      // Calculate days admitted
      const admitDate = new Date(admission.ipAdmissionDto.admitDate);
      const today = new Date();
      const daysAdmitted = Math.floor((today.getTime() - admitDate.getTime()) / (1000 * 3600 * 24));

      return {
        ...admission,
        patientName,
        bedDisplay,
        roomDisplay,
        departmentDisplay,
        statusDisplay: admission.ipAdmissionDto.ipStatus || "Admitted",
        daysAdmitted,
      };
    });
  }, [admissions]);

  // Filtered admissions based on search
  const filteredAdmissions = useMemo(() => {
    if (!searchTerm) return enhancedAdmissions;

    const searchLower = searchTerm.toLowerCase();
    return enhancedAdmissions.filter((admission) => {
      return (
        admission.patientName?.toLowerCase().includes(searchLower) ||
        admission.ipAdmissionDto.pChartCode.toLowerCase().includes(searchLower) ||
        admission.ipAdmissionDto.admitCode.toLowerCase().includes(searchLower) ||
        admission.bedDisplay?.toLowerCase().includes(searchLower) ||
        admission.roomDisplay?.toLowerCase().includes(searchLower) ||
        admission.departmentDisplay?.toLowerCase().includes(searchLower)
      );
    });
  }, [enhancedAdmissions, searchTerm]);

  // Statistics
  const statistics = useMemo(() => {
    const total = enhancedAdmissions.length;
    const statusCounts = enhancedAdmissions.reduce((acc, admission) => {
      const status = admission.statusDisplay || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      statusCounts,
    };
  }, [enhancedAdmissions]);

  // Event handlers
  const handlePatientSelect = useCallback(
    async (patient: PatientSearchResult | null) => {
      setSelectedPatient(patient);
      if (patient) {
        await checkPatientAdmissionStatus(patient.pChartID);
      }
    },
    [checkPatientAdmissionStatus]
  );

  const handleNewAdmission = useCallback(() => {
    if (!selectedPatient) {
      showAlert("Warning", "Please select a patient first", "warning");
      return;
    }

    if (currentAdmissionStatus?.isAdmitted) {
      showAlert("Warning", "This patient is already admitted", "warning");
      return;
    }
    setSelectedAdmission(null);
    setIsAdmissionFormOpen(true);
  }, [selectedPatient, currentAdmissionStatus, showAlert]);

  const handleAdmissionSubmit = useCallback(
    async (admissionData: AdmissionDto) => {
      try {
        await admitPatient(admissionData);
        setIsAdmissionFormOpen(false);
        showAlert("Success", "Patient admitted successfully", "success");

        // Clear patient selection and refresh data
        setSelectedPatient(null);
        setSelectedAdmission(null);
        setPatientClearTrigger((prev) => prev + 1);
        await refreshAdmissions();
      } catch (error) {
        showAlert("Error", "Failed to admit patient", "error");
      }
    },
    [admitPatient, showAlert, refreshAdmissions]
  );

  const handleCheckStatus = useCallback(() => {
    if (!selectedPatient) {
      showAlert("Warning", "Please select a patient first", "warning");
      return;
    }
    setIsStatusDialogOpen(true);
  }, [selectedPatient, showAlert]);

  const handleViewHistory = useCallback((admission: EnhancedAdmissionDto) => {
    setSelectedAdmission(admission);
    setIsHistoryDialogOpen(true);
  }, []);

  const handleEditAdmission = useCallback((admission: EnhancedAdmissionDto) => {
    setSelectedAdmission(admission);
    setIsAdmissionFormOpen(true);
  }, []);

  const handleAdmissionClose = useCallback(() => {
    setIsAdmissionFormOpen(false);
    setSelectedAdmission(null);
  }, []);

  // Grid columns
  const columns: Column<EnhancedAdmissionDto>[] = [
    {
      key: "patientInfo",
      header: "Patient Information",
      visible: true,
      sortable: true,
      width: 200,
      render: (admission) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            <PatientIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {admission.patientName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {admission.ipAdmissionDto.pChartCode}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "admitCode",
      header: "Admission Code",
      visible: true,
      sortable: true,
      width: 130,
      render: (admission) => (
        <Typography variant="body2" fontWeight="medium">
          {admission.ipAdmissionDto.admitCode}
        </Typography>
      ),
    },
    {
      key: "admitDate",
      header: "Admit Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (admission) => (
        <Box>
          <Typography variant="body2">{formatDt(admission.ipAdmissionDto.admitDate)}</Typography>
          <Typography variant="caption" color="text.secondary">
            {admission.daysAdmitted} day{admission.daysAdmitted !== 1 ? "s" : ""}
          </Typography>
        </Box>
      ),
    },
    {
      key: "location",
      header: "Location",
      visible: true,
      sortable: true,
      width: 180,
      render: (admission) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {admission.roomDisplay}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bed: {admission.bedDisplay}
          </Typography>
        </Box>
      ),
    },
    {
      key: "department",
      header: "Department",
      visible: true,
      sortable: true,
      width: 150,
      formatter: (value, admission) => admission.departmentDisplay || "Unknown",
    },
    {
      key: "attendingPhysician",
      header: "Attending Physician",
      visible: true,
      sortable: true,
      width: 180,
      formatter: (value, admission) => admission.ipAdmissionDto.attendingPhysicianName || "Not Assigned",
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 120,
      render: (admission) => <Chip label={admission.statusDisplay} size="small" color={admission.statusDisplay === "Admitted" ? "success" : "default"} variant="filled" />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 120,
      render: (admission) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            color="primary"
            onClick={(event) => {
              event.stopPropagation();
              handleViewHistory(admission);
            }}
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={(event) => {
              event.stopPropagation();
              handleEditAdmission(admission);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
          Patient Admission Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={refreshAdmissions} asynchronous />
        </Stack>
      </Box>

      {/* Patient Search and Demographics */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SearchIcon />
              Patient Search
            </Typography>
            <PatientSearch onPatientSelect={handlePatientSelect} clearTrigger={patientClearTrigger} placeholder="Search by name, UHID, or phone number" />

            {selectedPatient && (
              <Box mt={2}>
                <Stack direction="row" spacing={1}>
                  <CustomButton
                    variant="contained"
                    icon={AdmissionIcon}
                    text="New Admission"
                    onClick={handleNewAdmission}
                    disabled={currentAdmissionStatus?.isAdmitted}
                    color="primary"
                  />
                  <CustomButton variant="outlined" icon={ViewIcon} text="Check Status" onClick={handleCheckStatus} />
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PatientDemographics pChartID={selectedPatient?.pChartID || null} variant="compact" showEditButton={false} showRefreshButton={false} />
        </Grid>
      </Grid>

      {/* Statistics Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderLeft: "4px solid #1976d2" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 48, height: 48, mx: "auto", mb: 1 }}>
                <AdmissionIcon />
              </Avatar>
              <Typography variant="h4" color="#1976d2" fontWeight="bold">
                {statistics.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Admissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {Object.entries(statistics.statusCounts).map(([status, count]) => (
          <Grid size={{ xs: 12, md: 3 }} key={status}>
            <Card sx={{ borderLeft: `4px solid ${status === "Admitted" ? "#4caf50" : "#ff9800"}` }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar sx={{ bgcolor: status === "Admitted" ? "#4caf50" : "#ff9800", width: 48, height: 48, mx: "auto", mb: 1 }}>
                  <BedIcon />
                </Avatar>
                <Typography variant="h4" color={status === "Admitted" ? "#4caf50" : "#ff9800"} fontWeight="bold">
                  {count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Current Admissions Grid */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AdmissionIcon />
            Current Admissions
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField type="search" placeholder="Search admissions..." value={searchTerm} size="small" onChange={(e) => setSearchTerm(e.target.value)} />
          </Box>
        </Box>

        <CustomGrid
          columns={columns}
          data={filteredAdmissions}
          loading={loading}
          maxHeight="600px"
          emptyStateMessage="No current admissions found"
          rowKeyField="admitID"
          density="medium"
          showDensityControls
          onRowClick={handleViewHistory}
        />
      </Paper>

      {/* Dialogs */}
      <AdmissionFormDialog
        open={isAdmissionFormOpen}
        onClose={handleAdmissionClose}
        onSubmit={handleAdmissionSubmit}
        patient={selectedPatient}
        existingAdmission={selectedAdmission}
      />

      <AdmissionStatusDialog open={isStatusDialogOpen} onClose={() => setIsStatusDialogOpen(false)} patient={selectedPatient} admissionStatus={currentAdmissionStatus} />

      <AdmissionHistoryDialog open={isHistoryDialogOpen} onClose={() => setIsHistoryDialogOpen(false)} admission={selectedAdmission} />
    </Box>
  );
};

export default AdmissionPage;
