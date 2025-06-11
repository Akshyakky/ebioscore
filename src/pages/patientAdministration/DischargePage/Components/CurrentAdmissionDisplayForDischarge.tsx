// src/pages/patientAdministration/DischargePage/Components/CurrentAdmissionDisplayForDischarge.tsx
import CustomButton from "@/components/Button/CustomButton";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { IpDischargeDto } from "@/interfaces/PatientAdministration/IpDischargeDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { calculateDaysBetween, formatDt } from "@/utils/Common/dateUtils";
import {
  LocalHospital as AdmissionIcon,
  Hotel as BedIcon,
  CheckCircle as CheckIcon,
  ExitToApp as DischargeIcon,
  MedicalServices as DoctorIcon,
  History as HistoryIcon,
  Home as HomeIcon,
  AccountBalance as InsuranceIcon,
  Person as PatientIcon,
} from "@mui/icons-material";
import { Alert, Avatar, Box, Chip, CircularProgress, Grid, Paper, Stack, Typography } from "@mui/material";
import React, { useMemo } from "react";

interface CurrentAdmissionDisplayForDischargeProps {
  patient: PatientSearchResult | null;
  admission: AdmissionDto | null;
  existingDischarge: IpDischargeDto | null;
  loading: boolean;
  onDischargeClick: () => void;
  onEditDischargeClick: () => void;
  onHistoryClick: () => void;
}

const CurrentAdmissionDisplayForDischarge: React.FC<CurrentAdmissionDisplayForDischargeProps> = ({
  patient,
  admission,
  existingDischarge,
  loading,
  onDischargeClick,
  onEditDischargeClick,
  onHistoryClick,
}) => {
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

  // Process existing discharge information
  const dischargeInfo = useMemo(() => {
    if (!existingDischarge) return null;

    return {
      dischgCode: existingDischarge.dischargeCode,
      dischgDate: new Date(existingDischarge.dischgDate),
      dischgStatus: existingDischarge.dischgStatus,
      dischgPhyName: existingDischarge.dischgPhyName,
      dischgType: existingDischarge.dischgType,
      releaseBedYN: existingDischarge.releaseBedYN,
      authorisedBy: existingDischarge.authorisedBy,
    };
  }, [existingDischarge]);

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
          <Typography variant="body2">Please search and select a patient to view admission details and process discharge.</Typography>
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
            Patient must be admitted before processing discharge.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  // If patient has been discharged
  if (existingDischarge && dischargeInfo) {
    return (
      <Paper
        sx={{
          p: 1.5,
          border: "1px solid",
          borderColor: "info.200",
          backgroundColor: "info.50",
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "info.main", width: 36, height: 36 }}>
              <HomeIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" color="info.main" fontWeight="bold">
                Patient Discharged
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Discharge has been processed for this admission
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={0.5}>
            <CustomButton variant="outlined" icon={HistoryIcon} text="History" onClick={onHistoryClick} size="small" />
            <CustomButton variant="contained" icon={DischargeIcon} text="Edit Discharge" onClick={onEditDischargeClick} color="primary" size="small" />
          </Stack>
        </Box>

        {/* Information Grid */}
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
                    <strong>UHID:</strong> {admissionInfo.pChartCode} | <strong>Admission:</strong> {admissionInfo.admitCode}
                  </Typography>
                  <Typography variant="caption">
                    <strong>Admitted:</strong> {formatDt(admissionInfo.admitDate)} ({admissionInfo.admissionDuration} day{admissionInfo.admissionDuration !== 1 ? "s" : ""})
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* Discharge Information */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                <DischargeIcon fontSize="small" />
                Discharge Information
              </Typography>
              <Box sx={{ pl: 1, fontSize: "0.75rem" }}>
                <Stack spacing={0.25}>
                  <Typography variant="caption">
                    <strong>Discharge Code:</strong> {dischargeInfo.dischgCode}
                  </Typography>
                  <Typography variant="caption">
                    <strong>Discharged:</strong> {formatDt(dischargeInfo.dischgDate)}
                  </Typography>
                  <Typography variant="caption">
                    <strong>Status:</strong> {dischargeInfo.dischgStatus} | <strong>Type:</strong> {dischargeInfo.dischgType}
                  </Typography>
                  <Typography variant="caption">
                    <strong>Physician:</strong> {dischargeInfo.dischgPhyName}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* Status Summary */}
          <Grid size={{ xs: 12 }}>
            <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>
              <Typography variant="caption">
                <strong>Discharge Complete:</strong> Patient has been successfully discharged.
                {dischargeInfo.releaseBedYN === "Y" && " Bed has been released for new admissions."}
                {dischargeInfo.authorisedBy && ` Authorized by: ${dischargeInfo.authorisedBy}.`}
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  // Patient is admitted and eligible for discharge
  return (
    <Paper
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "warning.200",
        backgroundColor: "warning.50",
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: "warning.main", width: 36, height: 36 }}>
            <AdmissionIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" color="warning.main" fontWeight="bold">
              Ready for Discharge
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Patient is currently admitted and eligible for discharge
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5}>
          <CustomButton variant="outlined" icon={HistoryIcon} text="History" onClick={onHistoryClick} size="small" />
          <CustomButton variant="contained" icon={DischargeIcon} text="Process Discharge" onClick={onDischargeClick} color="primary" size="small" />
        </Stack>
      </Box>

      {/* Information Grid */}
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
                <Typography variant="caption">
                  <strong>Location:</strong> {admissionInfo.rName} - {admissionInfo.bedName}
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
                <Chip
                  icon={<CheckIcon />}
                  label={admissionInfo.ipStatus}
                  size="small"
                  color={admissionInfo.ipStatus === "ADMITTED" ? "success" : "default"}
                  variant="filled"
                  sx={{ height: 18, fontSize: "0.6rem" }}
                />
                <Chip label={admissionInfo.pTypeName} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                {admissionInfo.insuranceYN === "Y" && (
                  <Chip icon={<InsuranceIcon />} label="Insured" size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                )}
                {admissionInfo.deliveryCaseYN === "Y" && <Chip label="Delivery" size="small" color="secondary" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />}
                {admissionInfo.dischargeAdviceYN === "Y" && (
                  <Chip label="Discharge Advice Given" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                )}
              </Stack>
            </Box>
          </Box>
        </Grid>

        {/* Discharge Eligibility */}
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
            <Typography variant="caption">
              <strong>Discharge Eligible:</strong> This patient is currently admitted and can be discharged. Click "Process Discharge" to complete the discharge procedure and
              release the bed for new admissions.
              {admissionInfo.dischargeAdviceYN === "Y" && " Discharge advice has already been provided to the patient."}
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CurrentAdmissionDisplayForDischarge;
