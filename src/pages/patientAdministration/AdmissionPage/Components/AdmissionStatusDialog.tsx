// src/pages/patientAdministration/AdmissionPage/Components/AdmissionStatusDialog.tsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Chip, Avatar, Divider, Alert, CircularProgress } from "@mui/material";
import {
  Person as PatientIcon,
  Hotel as BedIcon,
  LocalHospital as AdmissionIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as DoctorIcon,
  Home as HomeIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomButton from "@/components/Button/CustomButton";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { AdmissionHistoryDto } from "@/interfaces/PatientAdministration/AdmissionHistoryDto";
import { formatDt, calculateDaysBetween } from "@/utils/Common/dateUtils";

interface PatientAdmissionStatusResponse {
  isAdmitted: boolean;
  admissionData?: AdmissionDto;
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
  const [loading, setLoading] = useState(false);

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
      <Paper sx={{ p: 2, backgroundColor: "success.50", border: "1px solid", borderColor: "success.200" }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Avatar sx={{ bgcolor: "success.main", width: 40, height: 40 }}>
            <AdmissionIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              Currently Admitted
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active admission in progress
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Admission Information
              </Typography>
              <Typography variant="body2">
                <strong>Admission Code:</strong> {admission.admitCode}
              </Typography>
              <Typography variant="body2">
                <strong>Admit Date:</strong> {formatDt(admission.admitDate)}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {admissionDuration} day{admissionDuration !== 1 ? "s" : ""}
              </Typography>
              <Typography variant="body2">
                <strong>Case Type:</strong> {admission.caseTypeName}
              </Typography>
              <Typography variant="body2">
                <strong>Patient Type:</strong> {admission.pTypeName}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Location Details
              </Typography>
              <Typography variant="body2">
                <strong>Department:</strong> {admission.deptName}
              </Typography>
              <Typography variant="body2">
                <strong>Room:</strong> {details.rName}
              </Typography>
              <Typography variant="body2">
                <strong>Bed:</strong> {bedDetails.bedName}
              </Typography>
              <Typography variant="body2">
                <strong>Room Group:</strong> {bedDetails.rGrpName}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Medical Team
              </Typography>
              <Typography variant="body2">
                <strong>Attending Physician:</strong> {admission.attendingPhysicianName || "Not assigned"}
              </Typography>
              {admission.primaryPhysicianName && (
                <Typography variant="body2">
                  <strong>Primary Physician:</strong> {admission.primaryPhysicianName}
                </Typography>
              )}
              {admission.primaryReferralSourceName && (
                <Typography variant="body2">
                  <strong>Referral Source:</strong> {admission.primaryReferralSourceName}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status Indicators
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip icon={<CheckIcon />} label={admission.ipStatus} size="small" color="success" variant="filled" />
                {admission.insuranceYN === "Y" && <Chip label="Has Insurance" size="small" color="info" variant="outlined" />}
                {admission.deliveryCaseYN === "Y" && <Chip label="Delivery Case" size="small" color="secondary" variant="outlined" />}
                {admission.provDiagnosisYN === "Y" && <Chip label="Provisional Diagnosis" size="small" color="warning" variant="outlined" />}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderNotAdmittedInfo = () => {
    return (
      <Paper sx={{ p: 2, backgroundColor: "info.50", border: "1px solid", borderColor: "info.200" }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Avatar sx={{ bgcolor: "info.main", width: 40, height: 40 }}>
            <HomeIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" color="info.main" fontWeight="bold">
              Not Currently Admitted
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient is not currently admitted to the hospital
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          This patient can be admitted. Use the "New Admission" button to start the admission process.
        </Alert>
      </Paper>
    );
  };

  const renderAdmissionHistory = () => {
    if (admissionHistory.length === 0) {
      return <Alert severity="info">No previous admission history found for this patient.</Alert>;
    }

    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarIcon />
          Previous Admissions ({admissionHistory.length})
        </Typography>

        <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
          {admissionHistory.map((history, index) => (
            <Paper key={history.admitID} sx={{ p: 2, mb: 1, backgroundColor: "grey.50" }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2">
                    <strong>Admission #{history.serialNumber}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {history.admitCode}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2">
                    <strong>Dates:</strong>
                  </Typography>
                  <Typography variant="caption">
                    {formatDt(history.admitDate)}
                    {history.dischargeDate && <> - {formatDt(history.dischargeDate)}</>}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2">
                    <strong>Location:</strong>
                  </Typography>
                  <Typography variant="caption">
                    {history.wardName} - {history.roomName}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Bed: {history.bedName}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2">
                    <strong>Physician:</strong>
                  </Typography>
                  <Typography variant="caption">{history.attendingPhysicianName}</Typography>
                  <Typography variant="caption" display="block">
                    {history.speciality}
                  </Typography>
                  <Chip label={history.status} size="small" color={history.status === "Discharged" ? "success" : "default"} variant="outlined" sx={{ mt: 0.5 }} />
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
      maxWidth="lg"
      fullWidth
      showCloseButton
      actions={<CustomButton variant="contained" text="Close" onClick={onClose} color="primary" />}
    >
      <Box sx={{ p: 2 }}>
        {/* Patient Information Header */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              <PatientIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {patient.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                UHID: {patient.pChartCode}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Current Status */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Current Status
          </Typography>
          {isCurrentlyAdmitted ? renderCurrentAdmissionInfo() : renderNotAdmittedInfo()}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Admission History */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Admission History
          </Typography>
          {renderAdmissionHistory()}
        </Box>
      </Box>
    </GenericDialog>
  );
};

export default AdmissionStatusDialog;
