// src/pages/patientAdministration/DischargeSummary/MainPage/DischargeSummaryPage.tsx
import CustomButton from "@/components/Button/CustomButton";
import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { IpDischargeDetailDto } from "@/interfaces/PatientAdministration/IpDischargeDetailDto";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { PatientDemographics } from "@/pages/patientAdministration/CommonPage/Patient/PatientDemographics/PatientDemographics";
import { PatientSearch } from "@/pages/patientAdministration/CommonPage/Patient/PatientSearch/PatientSearch";
import { useAlert } from "@/providers/AlertProvider";
import { formatDt } from "@/utils/Common/dateUtils";
import {
  CheckCircle as CheckIcon,
  ExpandLess as CollapseIcon,
  ExitToApp as DischargeIcon,
  MedicalServices as DoctorIcon,
  Edit as EditIcon,
  ExpandMore as ExpandIcon,
  History as HistoryIcon,
  Person as PatientIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Assignment as SummaryIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Alert, Avatar, Box, Card, CardContent, Chip, Collapse, Grid, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DischargeSummaryForm from "../Form/DischargeSummaryForm";
import useDischargeSummary from "../hooks/useDischargeSummary";

interface EnhancedDischargeSummaryDto extends IpDischargeDetailDto {
  patientName?: string;
  uhid?: string;
  admissionCode?: string;
  dischargeCode?: string;
  dischargeType?: string;
  lengthOfStay?: number;
}

interface EnhancedDischargeDto extends IpDischargeDto {
  hasSummary?: boolean;
}

const DischargeSummaryPage: React.FC = () => {
  // State management
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientClearTrigger, setPatientClearTrigger] = useState(0);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "completed">("all");

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<EnhancedDischargeSummaryDto | null>(null);

  const { showAlert } = useAlert();
  const {
    dischargeSummaries,
    dischargedPatients,
    currentPatientInfo,
    loading,
    refreshDischargeSummaries,
    refreshDischargedPatients,
    loadPatientDischargeInfo,
    saveDischargeSummary,
    getDischargeSummaryByDischargeId,
  } = useDischargeSummary();

  // Load data on component mount
  useEffect(() => {
    refreshDischargeSummaries();
    refreshDischargedPatients();
  }, [refreshDischargeSummaries, refreshDischargedPatients]);

  // Enhanced summaries with additional fields
  const enhancedSummaries = useMemo(() => {
    return dischargeSummaries.map(
      (summary) =>
        ({
          ...summary,
          patientName: "Patient Name", // Would come from related data
          uhid: "UHID", // Would come from related data
          admissionCode: "ADM001", // Would come from related data
          dischargeCode: "DSC001", // Would come from related data
          dischargeType: "Normal", // Would come from related data
          lengthOfStay: 5, // Would be calculated
        } as EnhancedDischargeSummaryDto)
    );
  }, [dischargeSummaries]);

  // Enhanced discharged patients
  const enhancedDischargedPatients = useMemo(() => {
    return dischargedPatients.map((discharge) => {
      const hasSummary = dischargeSummaries.some((s) => s.dischgID === discharge.dischgID);
      const patientName = `${discharge.pTitle} ${discharge.pfName} ${discharge.pmName || ""} ${discharge.plName}`.trim();

      return {
        ...discharge,
        hasSummary,
        patientName,
      } as EnhancedDischargeDto;
    });
  }, [dischargedPatients, dischargeSummaries]);

  // Filter summaries based on search and active filter
  const filteredData = useMemo(() => {
    let data: any[] = [];

    if (activeFilter === "all") {
      // Show all summaries
      data = enhancedSummaries;
    } else if (activeFilter === "pending") {
      // Show discharged patients without summaries
      data = enhancedDischargedPatients.filter((d) => !d.hasSummary);
    } else if (activeFilter === "completed") {
      // Show only completed summaries
      data = enhancedSummaries;
    }

    if (!searchTerm) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) => {
      const searchableFields = [item.patientName, item.pChartCode, item.dischargeCode, item.consultant, item.speciality].filter(Boolean).join(" ").toLowerCase();

      return searchableFields.includes(searchLower);
    });
  }, [enhancedSummaries, enhancedDischargedPatients, searchTerm, activeFilter]);

  // Statistics
  const statistics = useMemo(() => {
    const totalDischarged = dischargedPatients.length;
    const totalSummaries = dischargeSummaries.length;
    const pendingSummaries = enhancedDischargedPatients.filter((d) => !d.hasSummary).length;

    const today = new Date();
    const todaySummaries = dischargeSummaries.filter((summary) => new Date(summary.reportDate).toDateString() === today.toDateString()).length;

    return {
      totalDischarged,
      totalSummaries,
      pendingSummaries,
      todaySummaries,
      completionRate: totalDischarged > 0 ? Math.round((totalSummaries / totalDischarged) * 100) : 0,
    };
  }, [dischargedPatients, dischargeSummaries, enhancedDischargedPatients]);

  // Event handlers
  const handlePatientSelect = useCallback(
    async (patient: PatientSearchResult | null) => {
      setSelectedPatient(patient);
      setShowPatientDetails(!!patient);
      if (patient) {
        await loadPatientDischargeInfo(patient.pChartID);
      }
    },
    [loadPatientDischargeInfo]
  );

  const handleCreateSummary = useCallback(() => {
    if (!selectedPatient) {
      showAlert("Warning", "Please select a patient first", "warning");
      return;
    }

    if (!currentPatientInfo?.discharge) {
      showAlert("Warning", "Selected patient has not been discharged", "warning");
      return;
    }

    if (currentPatientInfo.dischargeSummary) {
      showAlert("Info", "This patient already has a discharge summary", "info");
      setSelectedSummary(currentPatientInfo.dischargeSummary as EnhancedDischargeSummaryDto);
    } else {
      setSelectedSummary(null);
    }

    setIsFormOpen(true);
  }, [selectedPatient, currentPatientInfo, showAlert]);

  const handleEditSummary = useCallback((summary: EnhancedDischargeSummaryDto) => {
    setSelectedSummary(summary);
    setIsFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (summaryData: IpDischargeDetailDto) => {
      try {
        await saveDischargeSummary(summaryData);
        setIsFormOpen(false);

        const action = summaryData.dischgDetID ? "updated" : "created";
        showAlert("Success", `Discharge summary ${action} successfully`, "success");

        // Clear patient selection and refresh data
        setSelectedPatient(null);
        setSelectedSummary(null);
        setShowPatientDetails(false);
        setPatientClearTrigger((prev) => prev + 1);

        await refreshDischargeSummaries();
        await refreshDischargedPatients();
      } catch (error) {
        showAlert("Error", "Failed to save discharge summary", "error");
      }
    },
    [saveDischargeSummary, showAlert, refreshDischargeSummaries, refreshDischargedPatients]
  );

  const handlePrintSummary = useCallback(
    (_summary: EnhancedDischargeSummaryDto) => {
      // Implement print functionality
      showAlert("Info", "Print functionality will be implemented", "info");
    },
    [showAlert]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedSummary(null);
  }, []);

  // Grid columns for completed summaries
  const summaryColumns: Column<EnhancedDischargeSummaryDto>[] = [
    {
      key: "patientInfo",
      header: "Patient Information",
      visible: true,
      sortable: true,
      width: 200,
      render: (summary) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
            <PatientIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {summary.patientName || "N/A"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {summary.uhid || "N/A"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "reportDate",
      header: "Report Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (summary) => (
        <Box>
          <Typography variant="body2">{formatDt(new Date(summary.reportDate))}</Typography>
          <Typography variant="caption" color="text.secondary">
            Stay: {summary.lengthOfStay || 0} days
          </Typography>
        </Box>
      ),
    },
    {
      key: "consultant",
      header: "Consultant",
      visible: true,
      sortable: true,
      width: 180,
      render: (summary) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "secondary.main", width: 24, height: 24 }}>
            <DoctorIcon sx={{ fontSize: 14 }} />
          </Avatar>
          <Typography variant="body2">{summary.consultant || "Not specified"}</Typography>
        </Box>
      ),
    },
    {
      key: "speciality",
      header: "Speciality",
      visible: true,
      sortable: true,
      width: 150,
      formatter: (value: string) => value || "Not specified",
    },
    {
      key: "finalDiagnosis",
      header: "Final Diagnosis",
      visible: true,
      sortable: true,
      width: 250,
      render: (summary) => (
        <Typography
          variant="body2"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {summary.finalDiagnosis || "Not specified"}
        </Typography>
      ),
    },
    {
      key: "reviewDate",
      header: "Review Date",
      visible: true,
      sortable: true,
      width: 120,
      formatter: (value: string) => (value ? formatDt(new Date(value)) : "Not set"),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 150,
      render: (summary) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            color="primary"
            onClick={(event) => {
              event.stopPropagation();
              handleEditSummary(summary);
            }}
            title="Edit Summary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={(event) => {
              event.stopPropagation();
              handlePrintSummary(summary);
            }}
            title="Print Summary"
          >
            <PrintIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={(event) => {
              event.stopPropagation();
              // View details functionality
            }}
            title="View Details"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // Grid columns for pending summaries
  const pendingColumns: Column<EnhancedDischargeDto>[] = [
    {
      key: "patientInfo",
      header: "Patient Information",
      visible: true,
      sortable: true,
      width: 200,
      render: (discharge) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "warning.main", width: 32, height: 32 }}>
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
      formatter: (value: string) => value || "N/A",
    },
    {
      key: "dischgDate",
      header: "Discharge Date",
      visible: true,
      sortable: true,
      width: 140,
      formatter: (value: string) => formatDt(new Date(value)),
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
      key: "summaryStatus",
      header: "Summary Status",
      visible: true,
      sortable: true,
      width: 140,
      render: (_discharge) => <Chip icon={<WarningIcon />} label="Pending" size="small" color="warning" variant="outlined" />,
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 120,
      render: (discharge) => (
        <CustomButton
          variant="contained"
          text="Create Summary"
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            // Load patient info and open form
            handlePatientSelect({
              pChartID: discharge.pChartID,
              fullName: discharge.patientName || "",
              pChartCode: discharge.pChartCode,
            } as PatientSearchResult);
            setTimeout(() => handleCreateSummary(), 500);
          }}
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 1.5 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
          Discharge Summary Management
        </Typography>
        <SmartButton
          variant="outlined"
          icon={RefreshIcon}
          text="Refresh"
          onAsyncClick={async () => {
            await refreshDischargeSummaries();
            await refreshDischargedPatients();
          }}
          asynchronous
          size="small"
        />
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={1} mb={1.5}>
        <Grid size={{ xs: 2.4 }}>
          <Card sx={{ borderLeft: "3px solid #1976d2" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32 }}>
                  <DischargeIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#1976d2" fontWeight="bold">
                    {statistics.totalDischarged}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Discharged
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 2.4 }}>
          <Card sx={{ borderLeft: "3px solid #4caf50" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#4caf50", width: 32, height: 32 }}>
                  <SummaryIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#4caf50" fontWeight="bold">
                    {statistics.totalSummaries}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed Summaries
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 2.4 }}>
          <Card sx={{ borderLeft: "3px solid #ff9800" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#ff9800", width: 32, height: 32 }}>
                  <WarningIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#ff9800" fontWeight="bold">
                    {statistics.pendingSummaries}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending Summaries
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 2.4 }}>
          <Card sx={{ borderLeft: "3px solid #9c27b0" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#9c27b0", width: 32, height: 32 }}>
                  <HistoryIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#9c27b0" fontWeight="bold">
                    {statistics.todaySummaries}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Today's Summaries
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 2.4 }}>
          <Card sx={{ borderLeft: "3px solid #2196f3" }}>
            <CardContent sx={{ p: 1, textAlign: "center", "&:last-child": { pb: 1 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#2196f3", width: 32, height: 32 }}>
                  <CheckIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="#2196f3" fontWeight="bold">
                    {statistics.completionRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completion Rate
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
            Patient Search & Summary Creation
          </Typography>
          {selectedPatient && (
            <IconButton size="small" onClick={() => setShowPatientDetails(!showPatientDetails)}>
              {showPatientDetails ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          )}
        </Box>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: selectedPatient ? 6 : 12 }}>
            <PatientSearch onPatientSelect={handlePatientSelect} clearTrigger={patientClearTrigger} placeholder="Search discharged patient by name, UHID, or phone" />

            {selectedPatient && currentPatientInfo && (
              <Box mt={1}>
                {currentPatientInfo.discharge ? (
                  <Stack direction="row" spacing={1}>
                    <CustomButton
                      variant="contained"
                      icon={SummaryIcon}
                      text={currentPatientInfo.dischargeSummary ? "Edit Summary" : "Create Summary"}
                      onClick={handleCreateSummary}
                      color="primary"
                      size="small"
                    />
                    {currentPatientInfo.dischargeSummary && (
                      <CustomButton
                        variant="outlined"
                        icon={PrintIcon}
                        text="Print"
                        onClick={() => handlePrintSummary(currentPatientInfo.dischargeSummary as EnhancedDischargeSummaryDto)}
                        size="small"
                      />
                    )}
                  </Stack>
                ) : (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    This patient has not been discharged yet.
                  </Alert>
                )}
              </Box>
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

      {/* Filter and Search Bar */}
      <Paper sx={{ p: 1.5, mb: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1}>
            <CustomButton variant={activeFilter === "all" ? "contained" : "outlined"} text="All Summaries" onClick={() => setActiveFilter("all")} size="small" />
            <CustomButton
              variant={activeFilter === "pending" ? "contained" : "outlined"}
              text="Pending"
              onClick={() => setActiveFilter("pending")}
              size="small"
              color={activeFilter === "pending" ? "warning" : "inherit"}
            />
            <CustomButton
              variant={activeFilter === "completed" ? "contained" : "outlined"}
              text="Completed"
              onClick={() => setActiveFilter("completed")}
              size="small"
              color={activeFilter === "completed" ? "success" : "inherit"}
            />
          </Stack>

          <TextField type="search" placeholder="Search summaries..." value={searchTerm} size="small" onChange={(e) => setSearchTerm(e.target.value)} sx={{ width: 250 }} />
        </Box>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ p: 1.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SummaryIcon fontSize="small" />
            {activeFilter === "pending" ? "Pending Discharge Summaries" : "Discharge Summaries"}
          </Typography>
        </Box>

        <CustomGrid
          columns={activeFilter === "pending" ? pendingColumns : summaryColumns}
          data={filteredData}
          loading={loading}
          maxHeight="450px"
          emptyStateMessage={activeFilter === "pending" ? "No pending discharge summaries found" : "No discharge summaries found"}
          rowKeyField={activeFilter === "pending" ? "dischgID" : "dischgDetID"}
          showDensityControls={false}
          onRowClick={activeFilter === "pending" ? undefined : handleEditSummary}
        />
      </Paper>

      {/* Dialogs */}
      <DischargeSummaryForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        patient={selectedPatient}
        admission={currentPatientInfo?.admission || null}
        discharge={currentPatientInfo?.discharge || null}
        existingSummary={selectedSummary}
      />
    </Box>
  );
};

export default DischargeSummaryPage;
