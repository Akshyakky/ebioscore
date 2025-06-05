// src/pages/patientAdministration/WardBedTransfer/Components/CurrentAdmissionDisplay.tsx
import React, { useMemo } from "react";
import { Box, Typography, Paper, Grid, Chip, Avatar, Stack, Alert, Divider, CircularProgress } from "@mui/material";
import {
  Person as PatientIcon,
  Hotel as BedIcon,
  LocalHospital as AdmissionIcon,
  MedicalServices as DoctorIcon,
  CalendarToday as CalendarIcon,
  SwapHoriz as TransferIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  AccountBalance as InsuranceIcon,
  Room as RoomIcon,
  Business as DepartmentIcon,
} from "@mui/icons-material";
import CustomButton from "@/components/Button/CustomButton";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { formatDt, calculateDaysBetween } from "@/utils/Common/dateUtils";

interface CurrentAdmissionDisplayProps {
  patient: PatientSearchResult | null;
  admission: AdmissionDto | null;
  loading: boolean;
  onTransferClick: () => void;
  onHistoryClick: () => void;
}

const CurrentAdmissionDisplay: React.FC<CurrentAdmissionDisplayProps> = ({ patient, admission, loading, onTransferClick, onHistoryClick }) => {
  // Process admission data for display
  const admissionInfo = useMemo(() => {
    if (!admission || !patient) return null;

    const admissionDto = admission.ipAdmissionDto;
    const detailsDto = admission.ipAdmissionDetailsDto;
    const bedDto = admission.wrBedDetailsDto;

    const patientName = `${admissionDto.pTitle} ${admissionDto.pfName} ${admissionDto.pmName || ""} ${admissionDto.plName}`.trim();
    const admissionDuration = calculateDaysBetween(new Date(admissionDto.admitDate), new Date());

    return {
      // Patient Information
      patientName,
      pChartCode: admissionDto.pChartCode,

      // Admission Details
      admitCode: admissionDto.admitCode,
      admitDate: new Date(admissionDto.admitDate),
      admissionDuration,
      ipStatus: admissionDto.ipStatus,
      caseTypeName: admissionDto.caseTypeName,
      pTypeName: admissionDto.pTypeName,

      // Location Information
      deptName: admissionDto.deptName,
      rName: detailsDto.rName,
      bedName: bedDto.bedName,
      roomGroupName: bedDto.rGrpName,
      bedStatus: bedDto.bedStatusValue,

      // Medical Team
      attendingPhysicianName: admissionDto.attendingPhysicianName,
      primaryPhysicianName: admissionDto.primaryPhysicianName,
      treatPhyName: detailsDto.treatPhyName,

      // Insurance and Payment
      insuranceYN: admissionDto.insuranceYN,
      opipInsID: admissionDto.opipInsID,

      // Additional Flags
      deliveryCaseYN: admissionDto.deliveryCaseYN,
      provDiagnosisYN: admissionDto.provDiagnosisYN,
      dischargeAdviceYN: admissionDto.dischargeAdviceYN,
    };
  }, [admission, patient]);

  // Bed status configuration
  const bedStatusConfig = {
    OCCUP: { color: "#f44336", label: "Occupied", icon: <BedIcon fontSize="small" /> },
    AVLBL: { color: "#4caf50", label: "Available", icon: <CheckIcon fontSize="small" /> },
    BLOCK: { color: "#ff9800", label: "Blocked", icon: <ErrorIcon fontSize="small" /> },
    MAINT: { color: "#9c27b0", label: "Maintenance", icon: <ErrorIcon fontSize="small" /> },
    RESERV: { color: "#2196f3", label: "Reserved", icon: <BedIcon fontSize="small" /> },
  };

  const getBedStatusConfig = (status: string) => {
    return (
      bedStatusConfig[status as keyof typeof bedStatusConfig] || {
        color: "#757575",
        label: status || "Unknown",
        icon: <BedIcon fontSize="small" />,
      }
    );
  };

  if (loading) {
    return (
      <Paper sx={{ p: 1.5, textAlign: "center" }}>
        <CircularProgress size={32} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Loading admission information...
        </Typography>
      </Paper>
    );
  }

  if (!patient) {
    return (
      <Paper sx={{ p: 1.5 }}>
        <Alert severity="info" sx={{ py: 0.5 }}>
          <Typography variant="body2">Please search and select a patient to view admission details.</Typography>
        </Alert>
      </Paper>
    );
  }

  if (!admission || !admissionInfo) {
    return (
      <Paper sx={{ p: 1.5 }}>
        <Alert severity="warning" icon={<PatientIcon />} sx={{ py: 0.5 }}>
          <Typography variant="body2">
            <strong>{patient.fullName}</strong> (UHID: {patient.pChartCode}) is not currently admitted.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Patient must be admitted before initiating a transfer.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  const bedStatusInfo = getBedStatusConfig(admissionInfo.bedStatus);

  return (
    <Paper
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "success.200",
        backgroundColor: "success.50",
      }}
    >
      {/* Compact Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: "success.main", width: 36, height: 36 }}>
            <AdmissionIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" color="success.main" fontWeight="bold">
              Current Admission
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Patient is admitted and eligible for transfer
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5}>
          <CustomButton variant="outlined" icon={HistoryIcon} text="History" onClick={onHistoryClick} size="small" />
          <CustomButton variant="contained" icon={TransferIcon} text="Transfer" onClick={onTransferClick} color="primary" size="small" />
        </Stack>
      </Box>

      {/* Compact Information Grid */}
      <Grid container spacing={1.5}>
        {/* Patient Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <PatientIcon fontSize="small" />
              Patient Information
            </Typography>
            <Box sx={{ pl: 1, fontSize: "0.75rem" }}>
              <Stack spacing={0.25}>
                <Typography variant="caption">
                  <strong>Name:</strong> {admissionInfo.patientName}
                </Typography>
                <Typography variant="caption">
                  <strong>UHID:</strong> {admissionInfo.pChartCode} | <strong>Code:</strong> {admissionInfo.admitCode}
                </Typography>
                <Typography variant="caption">
                  <strong>Admitted:</strong> {formatDt(admissionInfo.admitDate)} ({admissionInfo.admissionDuration} day{admissionInfo.admissionDuration !== 1 ? "s" : ""})
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Grid>

        {/* Current Location */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <BedIcon fontSize="small" />
              Current Location
            </Typography>
            <Box sx={{ pl: 1, fontSize: "0.75rem" }}>
              <Stack spacing={0.25}>
                <Typography variant="caption">
                  <strong>Department:</strong> {admissionInfo.deptName}
                </Typography>
                <Typography variant="caption">
                  <strong>Room Group:</strong> {admissionInfo.roomGroupName}
                </Typography>
                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <strong>Location:</strong> {admissionInfo.rName} - {admissionInfo.bedName}
                  <Chip
                    icon={bedStatusInfo.icon}
                    label={bedStatusInfo.label}
                    size="small"
                    sx={{
                      backgroundColor: bedStatusInfo.color,
                      color: "white",
                      height: 16,
                      fontSize: "0.6rem",
                      "& .MuiChip-icon": { fontSize: "0.7rem" },
                    }}
                  />
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Grid>

        {/* Medical Team */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <DoctorIcon fontSize="small" />
              Medical Team
            </Typography>
            <Box sx={{ pl: 1, fontSize: "0.75rem" }}>
              <Stack spacing={0.25}>
                <Typography variant="caption">
                  <strong>Attending:</strong> {admissionInfo.attendingPhysicianName || "Not assigned"}
                </Typography>
                {admissionInfo.treatPhyName && admissionInfo.treatPhyName !== admissionInfo.attendingPhysicianName && (
                  <Typography variant="caption">
                    <strong>Treating:</strong> {admissionInfo.treatPhyName}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        </Grid>

        {/* Payment & Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <InsuranceIcon fontSize="small" />
              Payment & Status
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                <Chip icon={<CheckIcon />} label={admissionInfo.ipStatus} size="small" color="success" variant="filled" sx={{ height: 18, fontSize: "0.6rem" }} />
                <Chip label={admissionInfo.pTypeName} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                {admissionInfo.insuranceYN === "Y" && (
                  <Chip icon={<InsuranceIcon />} label="Insured" size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                )}
                {admissionInfo.deliveryCaseYN === "Y" && <Chip label="Delivery" size="small" color="secondary" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />}
              </Stack>
            </Box>
          </Box>
        </Grid>

        {/* Transfer Eligibility */}
        <Grid size={{ xs: 12 }}>
          <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>
            <Typography variant="caption">
              <strong>Transfer Eligible:</strong> This patient can be transferred to another bed or ward. Click "Transfer" to select a new location and complete the transfer
              process.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CurrentAdmissionDisplay;
