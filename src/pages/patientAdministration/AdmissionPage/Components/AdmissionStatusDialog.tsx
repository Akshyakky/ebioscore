// src/pages/patientAdministration/AdmissionPage/Components/AdmissionStatusDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { AdmissionHistoryDto } from "@/interfaces/PatientAdministration/AdmissionHistoryDto";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { calculateDaysBetween, formatDt } from "@/utils/Common/dateUtils";
import {
  AccountBalance,
  LocalHospital as AdmissionIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Home as HomeIcon,
  Person as PatientIcon,
} from "@mui/icons-material";
import { Alert, Avatar, Box, Chip, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import React from "react";

interface PatientAdmissionStatusResponse {
  isAdmitted: boolean;
  admissionData?: AdmissionDto | undefined;
  patientData?: any;
  admissionHistory: AdmissionHistoryDto[];
}

interface AdmissionStatusDialogProps {
  open: boolean;
  onClose: () => void;
  patient: PatientSearchResult | null;
  admissionStatus: PatientAdmissionStatusResponse | null;
}

const AdmissionStatusDialog: React.FC<AdmissionStatusDialogProps> = ({ open, onClose, patient, admissionStatus }) => {
  if (!patient) {
    return null;
  }

  const isCurrentlyAdmitted = admissionStatus?.isAdmitted || false;
  const currentAdmission = admissionStatus?.admissionData;
  const admissionHistory = admissionStatus?.admissionHistory || [];

  // Calculate admission duration if currently admitted
  const admissionDuration = currentAdmission ? calculateDaysBetween(new Date(currentAdmission.ipAdmissionDto.admitDate), new Date()) : 0;

  const renderCurrentAdmissionInfo = () => {
    if (!currentAdmission) return null;

    const admission = currentAdmission.ipAdmissionDto;
    const details = currentAdmission.ipAdmissionDetailsDto;
    const bedDetails = currentAdmission.wrBedDetailsDto;

    return (
      <Paper
        sx={{
          p: 1.5,
          backgroundColor: "success.50",
          border: "1px solid",
          borderColor: "success.200",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <Avatar sx={{ bgcolor: "success.main", width: 32, height: 32 }}>
            <AdmissionIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" color="success.main" fontWeight="bold">
              Currently Admitted
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Active admission in progress
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: "0.75rem", fontWeight: "medium" }}>
                Admission Information
              </Typography>
              <Stack spacing={0.25} sx={{ pl: 1 }}>
                <Typography variant="caption">
                  <strong>Code:</strong> {admission.admitCode}
                </Typography>
                <Typography variant="caption">
                  <strong>Date:</strong> {formatDt(admission.admitDate)}
                </Typography>
                <Typography variant="caption">
                  <strong>Duration:</strong> {admissionDuration} day{admissionDuration !== 1 ? "s" : ""}
                </Typography>
                <Typography variant="caption">
                  <strong>Case Type:</strong> {admission.caseTypeName}
                </Typography>
                <Typography variant="caption">
                  <strong>Patient Type:</strong> {admission.pTypeName}
                </Typography>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: "0.75rem", fontWeight: "medium" }}>
                Location Details
              </Typography>
              <Stack spacing={0.25} sx={{ pl: 1 }}>
                <Typography variant="caption">
                  <strong>Department:</strong> {admission.deptName}
                </Typography>
                <Typography variant="caption">
                  <strong>Room:</strong> {details.rName}
                </Typography>
                <Typography variant="caption">
                  <strong>Bed:</strong> {bedDetails.bedName}
                </Typography>
                <Typography variant="caption">
                  <strong>Room Group:</strong> {bedDetails.rGrpName}
                </Typography>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: "0.75rem", fontWeight: "medium" }}>
                Medical Team
              </Typography>
              <Stack spacing={0.25} sx={{ pl: 1 }}>
                <Typography variant="caption">
                  <strong>Attending:</strong> {admission.attendingPhysicianName || "Not assigned"}
                </Typography>
                {admission.primaryPhysicianName && (
                  <Typography variant="caption">
                    <strong>Primary:</strong> {admission.primaryPhysicianName}
                  </Typography>
                )}
                {admission.primaryReferralSourceName && (
                  <Typography variant="caption">
                    <strong>Referral:</strong> {admission.primaryReferralSourceName}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: "0.75rem", fontWeight: "medium" }}>
                Insurance Coverage
              </Typography>
              <Stack spacing={0.5} sx={{ pl: 1 }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="caption">
                    <strong>Status:</strong>
                  </Typography>
                  <Chip
                    label={admission.insuranceYN === "Y" ? "Insured" : "Self Pay"}
                    size="small"
                    color={admission.insuranceYN === "Y" ? "success" : "default"}
                    variant="outlined"
                    sx={{ height: 16, fontSize: "0.6rem" }}
                  />
                </Box>

                {admission.insuranceYN === "Y" && admission.opipInsID && (
                  <Typography variant="caption">
                    <strong>Insurance Reference:</strong> {admission.opipInsID}
                  </Typography>
                )}

                {admission.insuranceYN === "N" && (
                  <Typography variant="caption" color="text.secondary">
                    Patient responsible for all charges
                  </Typography>
                )}
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box mt={1}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: "0.75rem", fontWeight: "medium" }}>
                Status Indicators
              </Typography>
              <Box display="flex" gap={0.5} flexWrap="wrap" sx={{ pl: 1 }}>
                <Chip icon={<CheckIcon />} label={admission.ipStatus} size="small" color="success" variant="filled" sx={{ height: 18, fontSize: "0.6rem" }} />
                {admission.insuranceYN === "Y" && (
                  <Chip icon={<AccountBalance />} label="Has Insurance" size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                )}
                {admission.deliveryCaseYN === "Y" && <Chip label="Delivery Case" size="small" color="secondary" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />}
                {admission.provDiagnosisYN === "Y" && (
                  <Chip label="Provisional Diagnosis" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderNotAdmittedInfo = () => {
    return (
      <Paper
        sx={{
          p: 1.5,
          backgroundColor: "info.50",
          border: "1px solid",
          borderColor: "info.200",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <Avatar sx={{ bgcolor: "info.main", width: 32, height: 32 }}>
            <HomeIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" color="info.main" fontWeight="bold">
              Not Currently Admitted
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Patient is not currently admitted to the hospital
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ py: 0.5 }}>
          <Typography variant="caption">This patient can be admitted. Use the "New Admission" button to start the admission process.</Typography>
        </Alert>
      </Paper>
    );
  };

  const renderAdmissionHistory = () => {
    if (admissionHistory.length === 0) {
      return (
        <Alert severity="info" sx={{ py: 0.5 }}>
          <Typography variant="caption">No previous admission history found for this patient.</Typography>
        </Alert>
      );
    }

    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarIcon fontSize="small" />
          Previous Admissions ({admissionHistory.length})
        </Typography>

        <Box sx={{ maxHeight: "250px", overflowY: "auto" }}>
          {admissionHistory.map((history, index) => (
            <Paper key={history.admitID} sx={{ p: 1.5, mb: 1, backgroundColor: "grey.50" }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" fontWeight="medium">
                    Admission #{history.serialNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {history.admitCode}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" fontWeight="medium">
                    Dates:
                  </Typography>
                  <Typography variant="caption" display="block">
                    {formatDt(history.admitDate)}
                    {history.dischargeDate && <> - {formatDt(history.dischargeDate)}</>}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" fontWeight="medium">
                    Location:
                  </Typography>
                  <Typography variant="caption" display="block">
                    {history.wardName} - {history.roomName}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Bed: {history.bedName}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" fontWeight="medium">
                    Physician:
                  </Typography>
                  <Typography variant="caption" display="block">
                    {history.attendingPhysicianName}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {history.speciality}
                  </Typography>
                  <Chip
                    label={history.status}
                    size="small"
                    color={history.status === "Discharged" ? "success" : "default"}
                    variant="outlined"
                    sx={{ mt: 0.5, height: 16, fontSize: "0.6rem" }}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`Admission Status - ${patient.fullName}`}
      maxWidth="md"
      fullWidth
      showCloseButton
      actions={<CustomButton variant="contained" text="Close" onClick={onClose} color="primary" size="small" />}
    >
      <Box sx={{ p: 1.5 }}>
        {/* Compact Patient Information Header */}
        <Paper
          sx={{
            p: 1.5,
            mb: 1.5,
            backgroundColor: "primary.50",
            border: "1px solid",
            borderColor: "primary.200",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
              <PatientIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {patient.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                UHID: {patient.pChartCode}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Current Status */}
        <Box mb={1.5}>
          <Typography variant="subtitle1" gutterBottom>
            Current Status
          </Typography>
          {isCurrentlyAdmitted ? renderCurrentAdmissionInfo() : renderNotAdmittedInfo()}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Admission History */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Admission History
          </Typography>
          {renderAdmissionHistory()}
        </Box>
      </Box>
    </GenericDialog>
  );
};

export default AdmissionStatusDialog;
