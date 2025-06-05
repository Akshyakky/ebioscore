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
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading admission information...
        </Typography>
      </Paper>
    );
  }

  if (!patient) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">Please search and select a patient to view admission details.</Alert>
      </Paper>
    );
  }

  if (!admission || !admissionInfo) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning" icon={<PatientIcon />}>
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
    <Paper sx={{ p: 3, border: "1px solid", borderColor: "success.200", backgroundColor: "success.50" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "success.main", width: 48, height: 48 }}>
            <AdmissionIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              Current Admission
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient is currently admitted and eligible for transfer
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          <CustomButton variant="outlined" icon={HistoryIcon} text="View History" onClick={onHistoryClick} size="small" />
          <CustomButton variant="contained" icon={TransferIcon} text="Transfer Patient" onClick={onTransferClick} color="primary" size="small" />
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Patient Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PatientIcon fontSize="small" />
              Patient Information
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Name:</strong> {admissionInfo.patientName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>UHID:</strong> {admissionInfo.pChartCode}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Admission Code:</strong> {admissionInfo.admitCode}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Admit Date:</strong> {formatDt(admissionInfo.admitDate)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Duration:</strong> {admissionInfo.admissionDuration} day{admissionInfo.admissionDuration !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Current Location */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BedIcon fontSize="small" />
              Current Location
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Department:</strong> {admissionInfo.deptName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Room Group:</strong> {admissionInfo.roomGroupName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Room:</strong> {admissionInfo.rName}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <strong>Bed:</strong> {admissionInfo.bedName}
                <Chip
                  icon={bedStatusInfo.icon}
                  label={bedStatusInfo.label}
                  size="small"
                  sx={{
                    backgroundColor: bedStatusInfo.color,
                    color: "white",
                    ml: 1,
                  }}
                />
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Medical Team */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <DoctorIcon fontSize="small" />
              Medical Team
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Attending Physician:</strong> {admissionInfo.attendingPhysicianName || "Not assigned"}
              </Typography>
              {admissionInfo.primaryPhysicianName && (
                <Typography variant="body2" gutterBottom>
                  <strong>Primary Physician:</strong> {admissionInfo.primaryPhysicianName}
                </Typography>
              )}
              {admissionInfo.treatPhyName && admissionInfo.treatPhyName !== admissionInfo.attendingPhysicianName && (
                <Typography variant="body2" gutterBottom>
                  <strong>Treating Physician:</strong> {admissionInfo.treatPhyName}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Payment & Insurance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InsuranceIcon fontSize="small" />
              Payment & Insurance
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Patient Type:</strong> {admissionInfo.pTypeName}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <strong>Insurance:</strong>
                <Chip
                  icon={<InsuranceIcon />}
                  label={admissionInfo.insuranceYN === "Y" ? "Covered" : "Self Pay"}
                  size="small"
                  color={admissionInfo.insuranceYN === "Y" ? "success" : "default"}
                  variant="outlined"
                />
              </Typography>
              {admissionInfo.insuranceYN === "Y" && admissionInfo.opipInsID && (
                <Typography variant="body2" gutterBottom>
                  <strong>Insurance ID:</strong> {admissionInfo.opipInsID}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Status Indicators */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Status Indicators
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <Chip icon={<CheckIcon />} label={admissionInfo.ipStatus} size="small" color="success" variant="filled" />
              <Chip label={admissionInfo.caseTypeName} size="small" color="primary" variant="outlined" />
              {admissionInfo.insuranceYN === "Y" && <Chip icon={<InsuranceIcon />} label="Insured" size="small" color="info" variant="outlined" />}
              {admissionInfo.deliveryCaseYN === "Y" && <Chip label="Delivery Case" size="small" color="secondary" variant="outlined" />}
              {admissionInfo.provDiagnosisYN === "Y" && <Chip label="Provisional Diagnosis" size="small" color="warning" variant="outlined" />}
              {admissionInfo.dischargeAdviceYN === "Y" && <Chip label="Discharge Advice Given" size="small" color="info" variant="outlined" />}
            </Stack>
          </Box>
        </Grid>

        {/* Transfer Eligibility */}
        <Grid size={{ xs: 12 }}>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Transfer Eligible:</strong> This patient can be transferred to another bed or ward. Click "Transfer Patient" to select a new location and complete the
              transfer process.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CurrentAdmissionDisplay;
