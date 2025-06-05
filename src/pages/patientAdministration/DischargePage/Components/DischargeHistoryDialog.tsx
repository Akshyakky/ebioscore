// src/pages/patientAdministration/DischargePage/Components/DischargeHistoryDialog.tsx
import React, { useMemo } from "react";
import { Box, Typography, Paper, Grid, Chip, Avatar, Stack, Alert, Divider, Tab, Tabs } from "@mui/material";
import {
  History as HistoryIcon,
  Person as PatientIcon,
  ExitToApp as DischargeIcon,
  MedicalServices as DoctorIcon,
  CalendarToday as CalendarIcon,
  Assignment as NotesIcon,
  Home as HomeIcon,
  LocalHospital as HospitalIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { AdmissionHistoryDto } from "@/interfaces/PatientAdministration/AdmissionHistoryDto";
import { formatDt, calculateDaysBetween } from "@/utils/Common/dateUtils";

interface DischargeHistoryRecord extends IpDischargeDto {
  admissionCode?: string;
  patientName?: string;
  admissionDate?: Date;
  lengthOfStay?: number;
  departmentName?: string;
  roomName?: string;
  bedName?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`discharge-tabpanel-${index}`} aria-labelledby={`discharge-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 1.5 }}>{children}</Box>}
    </div>
  );
};

interface DischargeHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  dischargeHistory: DischargeHistoryRecord[];
  admissionHistory?: AdmissionHistoryDto[];
  patient: PatientSearchResult | null;
  currentDischarge?: IpDischargeDto | null;
}

const DischargeHistoryDialog: React.FC<DischargeHistoryDialogProps> = ({ open, onClose, dischargeHistory, admissionHistory = [], patient, currentDischarge }) => {
  const [tabValue, setTabValue] = React.useState(0);

  // Enhanced discharge history with additional calculations
  const enhancedHistory = useMemo(() => {
    return dischargeHistory.map((discharge, index) => {
      const admissionDate = discharge.admissionDate || new Date(2024, 0, 1); // Fallback date
      const dischargeDate = new Date(discharge.dischgDate);
      const lengthOfStay = calculateDaysBetween(admissionDate, dischargeDate);

      return {
        ...discharge,
        dischargeNumber: index + 1,
        lengthOfStay,
        formattedDischargeDate: formatDt(discharge.dischgDate),
        formattedAdmissionDate: discharge.admissionDate ? formatDt(discharge.admissionDate) : "N/A",
      };
    });
  }, [dischargeHistory]);

  // Discharge statistics
  const dischargeStats = useMemo(() => {
    const totalDischarges = dischargeHistory.length;
    const normalDischarges = dischargeHistory.filter((d) => d.dischgType === "DISCHARGED").length;
    const damaDischarges = dischargeHistory.filter((d) => d.dischgType === "DAMA").length;
    const transferDischarges = dischargeHistory.filter((d) => d.dischgType === "TRANSFER").length;
    const expiredCases = dischargeHistory.filter((d) => d.dischgType === "EXPIRED").length;

    const averageStay = enhancedHistory.length > 0 ? Math.round(enhancedHistory.reduce((sum, d) => sum + (d.lengthOfStay || 0), 0) / enhancedHistory.length) : 0;

    const uniquePhysicians = new Set(dischargeHistory.map((d) => d.dischgPhyName).filter(Boolean)).size;

    return {
      total: totalDischarges,
      normal: normalDischarges,
      dama: damaDischarges,
      transfer: transferDischarges,
      expired: expiredCases,
      averageStay,
      uniquePhysicians,
    };
  }, [dischargeHistory, enhancedHistory]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Grid columns for discharge history
  const columns: Column<(typeof enhancedHistory)[0]>[] = [
    {
      key: "dischargeNumber",
      header: "#",
      visible: true,
      sortable: true,
      width: 60,
      formatter: (value: number) => value.toString(),
    },
    {
      key: "dischargeCode",
      header: "Discharge Code",
      visible: true,
      sortable: true,
      width: 120,
      formatter: (value: string) => value || "N/A",
    },
    {
      key: "formattedDischargeDate",
      header: "Discharge Date",
      visible: true,
      sortable: true,
      width: 140,
      render: (discharge) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {discharge.formattedDischargeDate}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Stay: {discharge.lengthOfStay} day{discharge.lengthOfStay !== 1 ? "s" : ""}
          </Typography>
        </Box>
      ),
    },
    {
      key: "admissionCode",
      header: "Admission",
      visible: true,
      sortable: true,
      width: 120,
      render: (discharge) => (
        <Box>
          <Typography variant="body2">{discharge.admissionCode || "N/A"}</Typography>
          <Typography variant="caption" color="text.secondary">
            {discharge.formattedAdmissionDate}
          </Typography>
        </Box>
      ),
    },
    {
      key: "dischgPhyName",
      header: "Discharging Physician",
      visible: true,
      sortable: true,
      width: 180,
      render: (discharge) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "secondary.main", width: 24, height: 24 }}>
            <DoctorIcon sx={{ fontSize: 14 }} />
          </Avatar>
          <Typography variant="body2">{discharge.dischgPhyName || "Not specified"}</Typography>
        </Box>
      ),
    },
    {
      key: "dischgStatus",
      header: "Status",
      visible: true,
      sortable: true,
      width: 120,
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

        return <Chip label={discharge.dischgType || "N/A"} size="small" color={getTypeColor(discharge.dischgType || "") as any} variant="filled" />;
      },
    },
    {
      key: "location",
      header: "Location",
      visible: true,
      sortable: true,
      width: 150,
      render: (discharge) => (
        <Box>
          <Typography variant="body2">{discharge.roomName || "N/A"}</Typography>
          <Typography variant="caption" color="text.secondary">
            {discharge.bedName || "N/A"} | {discharge.departmentName || "N/A"}
          </Typography>
        </Box>
      ),
    },
  ];

  const renderDischargeStatistics = () => (
    <Paper sx={{ p: 2, mb: 3, backgroundColor: "info.50", border: "1px solid", borderColor: "info.200" }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <HistoryIcon />
        Discharge Statistics
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 2 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {dischargeStats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Discharges
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {dischargeStats.normal}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Normal
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {dischargeStats.dama}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              DAMA
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {dischargeStats.transfer}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transfers
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="secondary.main" fontWeight="bold">
              {dischargeStats.averageStay}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg. Stay (Days)
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {dischargeStats.uniquePhysicians}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Physicians
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderCurrentDischarge = () => {
    if (!currentDischarge) return null;

    return (
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "success.50", border: "1px solid", borderColor: "success.200" }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DischargeIcon />
          Current Discharge Information
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                <strong>Discharge Code:</strong> {currentDischarge.dischargeCode}
              </Typography>
              <Typography variant="body2">
                <strong>Discharge Date:</strong> {formatDt(currentDischarge.dischgDate)}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {currentDischarge.dischgStatus}
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {currentDischarge.dischgType}
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                <strong>Discharging Physician:</strong> {currentDischarge.dischgPhyName}
              </Typography>
              <Typography variant="body2">
                <strong>Bed Released:</strong> {currentDischarge.releaseBedYN === "Y" ? "Yes" : "No"}
              </Typography>
              {currentDischarge.authorisedBy && (
                <Typography variant="body2">
                  <strong>Authorized By:</strong> {currentDischarge.authorisedBy}
                </Typography>
              )}
              {currentDischarge.deliveryType && (
                <Typography variant="body2">
                  <strong>Delivery Type:</strong> {currentDischarge.deliveryType}
                </Typography>
              )}
            </Stack>
          </Grid>

          {currentDischarge.rNotes && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2">
                <strong>Discharge Notes:</strong>
              </Typography>
              <Paper sx={{ p: 1, backgroundColor: "grey.50", mt: 0.5 }}>
                <Typography variant="caption">{currentDischarge.rNotes}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  };

  const renderDischargeTimeline = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TimelineIcon />
        Discharge Timeline
      </Typography>

      <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
        {enhancedHistory.length === 0 ? (
          <Alert severity="info">No discharge history found for this patient.</Alert>
        ) : (
          enhancedHistory.map((discharge, index) => (
            <Box key={discharge.dischgID || index} sx={{ mb: 2 }}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor:
                    discharge.dischgType === "DISCHARGED"
                      ? "success.50"
                      : discharge.dischgType === "DAMA"
                      ? "warning.50"
                      : discharge.dischgType === "EXPIRED"
                      ? "error.50"
                      : "info.50",
                  border: "1px solid",
                  borderColor:
                    discharge.dischgType === "DISCHARGED"
                      ? "success.200"
                      : discharge.dischgType === "DAMA"
                      ? "warning.200"
                      : discharge.dischgType === "EXPIRED"
                      ? "error.200"
                      : "info.200",
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                        <Typography variant="caption" fontWeight="bold">
                          {discharge.dischargeNumber}
                        </Typography>
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {discharge.formattedDischargeDate}
                        </Typography>
                        <Chip
                          label={discharge.dischgType}
                          size="small"
                          color={
                            discharge.dischgType === "DISCHARGED" ? "success" : discharge.dischgType === "DAMA" ? "warning" : discharge.dischgType === "EXPIRED" ? "error" : "info"
                          }
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="body2">
                      <strong>Code:</strong> {discharge.dischargeCode || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {discharge.dischgStatus}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Length of Stay:</strong> {discharge.lengthOfStay} day{discharge.lengthOfStay !== 1 ? "s" : ""}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 5 }}>
                    <Typography variant="body2">
                      <strong>Physician:</strong> {discharge.dischgPhyName || "Not specified"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {discharge.roomName || "N/A"} - {discharge.bedName || "N/A"}
                    </Typography>
                    {discharge.authorisedBy && (
                      <Typography variant="body2">
                        <strong>Authorized By:</strong> {discharge.authorisedBy}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {discharge.rNotes && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 1 }}>
                    <Typography variant="caption">
                      <strong>Notes:</strong> {discharge.rNotes}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {index < enhancedHistory.length - 1 && (
                <Box display="flex" justifyContent="center" my={1}>
                  <Divider sx={{ width: "2px", height: "20px", backgroundColor: "primary.main" }} orientation="vertical" />
                </Box>
              )}
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );

  const renderDetailedHistory = () => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <NotesIcon />
        Detailed Discharge History
      </Typography>

      <CustomGrid
        columns={columns}
        data={enhancedHistory}
        maxHeight="400px"
        emptyStateMessage="No discharge history found"
        rowKeyField="dischgID"
        density="small"
        showDensityControls={false}
      />
    </Paper>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`Discharge History - ${patient?.fullName || "Patient"}`}
      maxWidth="xl"
      fullWidth
      showCloseButton
      actions={<CustomButton variant="contained" text="Close" onClick={onClose} color="primary" />}
    >
      <Box sx={{ width: "100%" }}>
        {/* Patient Header */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              <PatientIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {patient?.fullName || "Patient Name"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                UHID: {patient?.pChartCode || "N/A"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="discharge history tabs" variant="scrollable" scrollButtons="auto">
            <Tab
              label="Current Discharge"
              icon={<DischargeIcon fontSize="small" />}
              iconPosition="start"
              id="discharge-tab-0"
              aria-controls="discharge-tabpanel-0"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              label="Statistics"
              icon={<HistoryIcon fontSize="small" />}
              iconPosition="start"
              id="discharge-tab-1"
              aria-controls="discharge-tabpanel-1"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              label="Timeline"
              icon={<TimelineIcon fontSize="small" />}
              iconPosition="start"
              id="discharge-tab-2"
              aria-controls="discharge-tabpanel-2"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              label="Detailed History"
              icon={<NotesIcon fontSize="small" />}
              iconPosition="start"
              id="discharge-tab-3"
              aria-controls="discharge-tabpanel-3"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {renderCurrentDischarge()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderDischargeStatistics()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderDischargeTimeline()}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderDetailedHistory()}
        </TabPanel>
      </Box>
    </GenericDialog>
  );
};

export default DischargeHistoryDialog;
