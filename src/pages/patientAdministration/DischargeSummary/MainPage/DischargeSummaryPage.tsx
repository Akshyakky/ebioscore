import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { useAlert } from "@/providers/AlertProvider";
import { calculateDaysBetween, formatDt } from "@/utils/Common/dateUtils";
import {
  Add,
  LocalHospital as AdmissionIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  ExpandLess as CollapseIcon,
  ExitToApp as DischargeIcon,
  Edit,
  ExpandMore as ExpandIcon,
  Home as HomeIcon,
  Person as PatientIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, Collapse, Grid, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useDischarge from "../../DischargePage/hooks/useDischarge";
import DischargeSummaryForm from "../Form/DischargeSummaryForm";
import { useDischargeSummary } from "../hooks/useDischargeSummary";

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

const DischargeSummaryPage: React.FC = () => {
  // State management
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientClearTrigger, setPatientClearTrigger] = useState(0);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [openSummaryForm, setOpenSummaryForm] = useState(false);
  const [selectedDischargeForSummary, setSelectedDischargeForSummary] = useState<EnhancedDischargeDto | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null); // You'll need to fetch admission data
  const [existingSummaryData, setExistingSummaryData] = useState<any>(null);
  const { saveDischargeSummary, dischargeSummaryList } = useDischargeSummary();
  // Dialog states
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
  // Handler to open discharge summary form
  const handleOpenSummaryForm = async (discharge: EnhancedDischargeDto, isEdit: boolean) => {
    try {
      setSelectedDischargeForSummary(discharge);

      // Fetch patient data if needed
      const patientData: PatientSearchResult = {
        pChartID: discharge.pChartID,
        pChartCode: discharge.pChartCode,
        pfName: discharge.pfName,
        pmName: discharge.pmName,
        plName: discharge.plName,
        pTitle: discharge.pTitle,
        // Add other required fields
      } as PatientSearchResult;
      const admissionData: AdmissionDto = {
        ipAdmissionDto: {
          admitID: discharge.admitID || 0,
          admitCode: discharge.admissionCode || "",
          admitDate: new Date(discharge.admissionDate),
          pChartID: discharge.pChartID,
          pChartCode: discharge.pChartCode,
          pTitle: discharge.pTitle,
          pfName: discharge.pfName,
          pmName: discharge.pmName,
          plName: discharge.plName,
          attendingPhysicianID: discharge.dischgPhyID || 0,
          attendingPhysicianName: discharge.dischgPhyName || "",
          deptName: discharge.departmentName || "General",
        },
      } as AdmissionDto;
      setSelectedPatient(patientData);

      setSelectedAdmission(admissionData);

      if (isEdit && discharge.dischgSumYN === "Y") {
        // Fetch existing discharge summary
        setExistingSummaryData(dischargeSummaryList.find((summary) => summary.dischgID === discharge.dischgID) || null);
      } else {
        setExistingSummaryData(null);
      }

      setOpenSummaryForm(true);
    } catch (error) {
      showAlert("Error", "Error loading discharge summary data", "error");
    }
  };
  // Handler to submit discharge summary
  const handleSummarySubmit = async (summaryData: any) => {
    try {
      await saveDischargeSummary(summaryData);
      showAlert("Success", "Discharge summary created successfully", "success");

      setOpenSummaryForm(false);
      // Refresh the grid
      await refreshRecentDischarges();
    } catch (error) {
      throw error; // Re-throw to let the form handle loading state
    }
  };
  // Handler to close form
  const handleCloseSummaryForm = () => {
    setOpenSummaryForm(false);
    setSelectedDischargeForSummary(null);
    setExistingSummaryData(null);
    setSelectedAdmission(null);
  };
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
      key: "dischgSumYN",
      header: "Discharge Summary Status",
      visible: true,
      sortable: false,
      width: 150,
      render: (discharge) => (
        <Chip
          icon={discharge.dischgSumYN === "Y" ? <CheckIcon /> : <CloseIcon />}
          label={discharge.dischgSumYN === "Y" ? "Entered" : "Not Entered"}
          size="small"
          color={discharge.dischgSumYN === "Y" ? "success" : "default"}
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
              handleOpenSummaryForm(discharge, discharge.dischgSumYN === "Y");
            }}
            title={discharge.dischgSumYN === "N" ? "Add Discharge Summary" : "Edit Discharge Summary"}
          >
            {discharge.dischgSumYN === "N" ? <Add fontSize="small" /> : <Edit fontSize="small" />}
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
        />
      </Paper>
      {openSummaryForm && selectedDischargeForSummary && (
        <DischargeSummaryForm
          open={openSummaryForm}
          onClose={handleCloseSummaryForm}
          onSubmit={handleSummarySubmit}
          patient={selectedPatient}
          admission={selectedAdmission}
          discharge={selectedDischargeForSummary as IpDischargeDto}
          existingSummary={existingSummaryData}
        />
      )}
    </Box>
  );
};

export default DischargeSummaryPage;
