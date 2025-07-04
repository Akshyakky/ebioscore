import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import LifestyleManagement from "@/pages/clinicalManagement/LifeStyle/MainPage/LifestyleManagement";
import PatientHistoryDialog from "@/pages/clinicalManagement/PatientHistory/Components/PatientHistoryDialog";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { useAlert } from "@/providers/AlertProvider";
import { formatDt } from "@/utils/Common/dateUtils";
import {
  AccountBalance,
  LocalHospital as AdmissionIcon,
  Hotel as BedIcon,
  ExpandLess as CollapseIcon,
  Edit as EditIcon,
  ExpandMore as ExpandIcon,
  History as HistoryIcon,
  FitnessCenter as LifestyleIcon,
  ManageSearch as PatientIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Collapse, Grid, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdmissionFormDialog from "../Components/AdmissionFormDialog";
import AdmissionHistoryDialog from "../Components/AdmissionHistoryDialog";
import AdmissionStatusDialog from "../Components/AdmissionStatusDialog";
import useAdmission from "../hooks/useAdmission";

interface EnhancedAdmissionDto extends AdmissionDto {
  patientName?: string;
  bedDisplay?: string;
  roomDisplay?: string;
  departmentDisplay?: string;
  statusDisplay?: string;
  daysAdmitted?: number;
  insuranceDisplay?: string;
  hasActiveInsurance?: boolean;
  insuranceCarrierName?: string;
  policyNumber?: string;
}

const AdmissionPage: React.FC = () => {
  // State management
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientClearTrigger, setPatientClearTrigger] = useState(0);
  const [selectedAdmission, setSelectedAdmission] = useState<EnhancedAdmissionDto | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  // Dialog states
  const [isAdmissionFormOpen, setIsAdmissionFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isLifestyleOpen, setIsLifestyleOpen] = useState<boolean>(false);
  const [selectedAdmissionForLifestyle, setSelectedAdmissionForLifestyle] = useState<EnhancedAdmissionDto | null>(null);

  const { showAlert } = useAlert();
  const { admissions, loading, currentAdmissionStatus, refreshAdmissions, refreshPatientStatus, admitPatient, checkPatientAdmissionStatus } = useAdmission();

  const [isPatientHistoryOpen, setIsPatientHistoryOpen] = useState(false);
  const [selectedAdmissionForHistory, setSelectedAdmissionForHistory] = useState<EnhancedAdmissionDto | null>(null);

  // Lifestyle management handlers
  const handleManageLifestyle = useCallback((admission: EnhancedAdmissionDto) => {
    setSelectedAdmissionForLifestyle(admission);
    setIsLifestyleOpen(true);
  }, []);

  const handleCloseLifestyle = useCallback(() => {
    setIsLifestyleOpen(false);
    setSelectedAdmissionForLifestyle(null);
  }, []);

  const handlePatientHistory = useCallback((admission: EnhancedAdmissionDto) => {
    setSelectedAdmissionForHistory(admission);
    setIsPatientHistoryOpen(true);
  }, []);

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
        statusDisplay: admission.ipAdmissionDto.ipStatus || "ADMITTED",
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
      setShowPatientDetails(!!patient);
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
        setShowPatientDetails(false);
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
    setSelectedPatient({
      pChartID: admission.ipAdmissionDto.pChartID,
      pChartCode: admission.ipAdmissionDto.pChartCode,
      fullName: admission.patientName || "",
    });
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
            {/* Insurance indicator */}
            {admission.ipAdmissionDto.insuranceYN === "Y" && (
              <Chip icon={<AccountBalance />} label="Insured" size="small" color="info" variant="outlined" sx={{ ml: 0.5, height: 16, fontSize: "0.65rem" }} />
            )}
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
      formatter: (_value, admission) => admission.departmentDisplay || "Unknown",
    },
    {
      key: "attendingPhysician",
      header: "Attending Physician",
      visible: true,
      sortable: true,
      width: 180,
      formatter: (_value, admission) => admission.ipAdmissionDto.attendingPhysicianName || "Not Assigned",
    },
    {
      key: "paymentInsurance",
      header: "Payment & Insurance",
      visible: true,
      sortable: true,
      width: 160,
      render: (admission) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {admission.ipAdmissionDto.pTypeName}
          </Typography>
          <Box display="flex" gap={0.5} mt={0.5}>
            {admission.ipAdmissionDto.insuranceYN === "Y" ? (
              <Chip icon={<AccountBalance />} label="Insured" size="small" color="success" variant="filled" />
            ) : (
              <Chip label="Self Pay" size="small" color="default" variant="outlined" />
            )}
          </Box>
        </Box>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 120,
      render: (admission) => (
        <Stack spacing={0.5}>
          <Chip label={admission.statusDisplay} size="small" color={admission.statusDisplay === "ADMITTED" ? "success" : "default"} variant="filled" />
          {admission.ipAdmissionDto.deliveryCaseYN === "Y" && <Chip label="Delivery" size="small" color="secondary" variant="outlined" />}
        </Stack>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 220, // Increased width to accommodate the new Lifestyle button
      render: (admission) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            color="primary"
            onClick={(event) => {
              event.stopPropagation();
              handleViewHistory(admission);
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
              handleEditAdmission(admission);
            }}
            title="Edit Admission"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="success"
            onClick={(event) => {
              event.stopPropagation();
              handlePatientHistory(admission);
            }}
            title="Patient History"
          >
            <PatientIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="warning"
            onClick={(event) => {
              event.stopPropagation();
              handleManageLifestyle(admission);
            }}
            title="Lifestyle"
            sx={{ bgcolor: "rgba(237, 108, 2, 0.08)", "&:hover": { bgcolor: "rgba(237, 108, 2, 0.15)" } }}
          >
            <LifestyleIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 1.5 }}>
      {/* Compact Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Patient Admission Management
        </Typography>
        <SmartButton variant="outlined" icon={RefreshIcon} text="Refresh" onAsyncClick={refreshAdmissions} asynchronous size="small" />
      </Box>

      {/* Compact Statistics Cards */}
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

        {Object.entries(statistics.statusCounts)
          .slice(0, 3)
          .map(([status, count]) => (
            <Grid size={{ xs: 3 }} key={status}>
              <Card sx={{ borderLeft: `3px solid ${status === "ADMITTED" ? "#4caf50" : "#ff9800"}` }}>
                <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ bgcolor: status === "ADMITTED" ? "#4caf50" : "#ff9800", width: 32, height: 32 }}>
                      <BedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color={status === "ADMITTED" ? "#4caf50" : "#ff9800"} fontWeight="bold">
                        {count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {status}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Compact Patient Search Section */}
      <Paper sx={{ p: 1.5, mb: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SearchIcon fontSize="small" />
            Patient Search & Admission
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
                  icon={AdmissionIcon}
                  text="New Admission"
                  onClick={handleNewAdmission}
                  disabled={currentAdmissionStatus?.isAdmitted || false}
                  color="primary"
                  size="small"
                />
                <CustomButton variant="outlined" icon={ViewIcon} text="Status" onClick={handleCheckStatus} size="small" />
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

      {/* Compact Current Admissions Grid */}
      <Paper sx={{ p: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AdmissionIcon fontSize="small" />
            Current Admissions
          </Typography>
          <TextField type="search" placeholder="Search admissions..." value={searchTerm} size="small" onChange={(e) => setSearchTerm(e.target.value)} sx={{ width: 200 }} />
        </Box>

        <CustomGrid
          columns={columns}
          data={filteredAdmissions}
          loading={loading}
          maxHeight="450px"
          emptyStateMessage="No current admissions found"
          rowKeyField="ipAdmissionDto"
          showDensityControls={false}
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

      <PatientHistoryDialog
        open={isPatientHistoryOpen}
        onClose={() => {
          setIsPatientHistoryOpen(false);
          setSelectedAdmissionForHistory(null);
        }}
        admission={selectedAdmissionForHistory}
      />

      {/* Lifestyle Management Dialog */}
      {selectedAdmissionForLifestyle && (
        <LifestyleManagement
          open={isLifestyleOpen}
          onClose={handleCloseLifestyle}
          pChartID={selectedAdmissionForLifestyle.ipAdmissionDto.pChartID}
          patientName={selectedAdmissionForLifestyle.patientName || ""}
        />
      )}
    </Box>
  );
};

export default AdmissionPage;
