// src/pages/patientAdministration/AdmissionPage/Components/AdmissionHistoryDialog.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Paper, Grid, Chip, Avatar, Divider, Tab, Tabs, CircularProgress, Alert } from "@mui/material";
import {
  History as HistoryIcon,
  Person as PatientIcon,
  Hotel as BedIcon,
  LocalHospital as AdmissionIcon,
  MedicalServices as DoctorIcon,
  Timeline as TimelineIcon,
  Receipt as BillingIcon,
  Assignment as NotesIcon,
  AccountBalance,
} from "@mui/icons-material";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { AdmissionHistoryDto } from "@/interfaces/PatientAdministration/AdmissionHistoryDto";
import { formatDt, calculateDaysBetween } from "@/utils/Common/dateUtils";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import PeopleIcon from "@mui/icons-material/People";

interface AdmissionHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  admission: any; // Current admission data
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`admission-tabpanel-${index}`} aria-labelledby={`admission-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdmissionHistoryDialog: React.FC<AdmissionHistoryDialogProps> = ({ open, onClose, admission }) => {
  const [tabValue, setTabValue] = useState(0);
  const [admissionHistory, setAdmissionHistory] = useState<AdmissionHistoryDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Load admission history when dialog opens
  useEffect(() => {
    if (open && admission) {
      loadAdmissionHistory();
    }
  }, [open, admission]);

  const loadAdmissionHistory = async () => {
    if (!admission?.ipAdmissionDto?.admitID) return;

    try {
      setLoading(true);
      const result = await extendedAdmissionService.getAdmissionHistory(admission.ipAdmissionDto.admitID);
      if (result.success && result.data) {
        setAdmissionHistory(result.data);
      }
    } catch (error) {
      console.error("Error loading admission history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!admission) {
    return null;
  }

  const currentAdmission = admission.ipAdmissionDto;
  const admissionDetails = admission.ipAdmissionDetailsDto;
  const bedDetails = admission.wrBedDetailsDto;
  const patientName = admission.patientName || `${currentAdmission.pfName} ${currentAdmission.pmName || ""} ${currentAdmission.plName}`.trim();

  // Calculate admission duration
  const admissionDuration = calculateDaysBetween(new Date(currentAdmission.admitDate), new Date());

  // History grid columns
  const historyColumns: Column<AdmissionHistoryDto>[] = [
    {
      key: "serialNumber",
      header: "#",
      visible: true,
      sortable: true,
      width: 60,
      formatter: (value: number) => value.toString(),
    },
    {
      key: "admitCode",
      header: "Admission Code",
      visible: true,
      sortable: true,
      width: 120,
      formatter: (value: string) => value || "N/A",
    },
    {
      key: "admitDate",
      header: "Admit Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (item) => <Typography variant="body2">{formatDt(item.admitDate)}</Typography>,
    },
    {
      key: "dischargeDate",
      header: "Discharge Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (item) => <Typography variant="body2">{item.dischargeDate ? formatDt(item.dischargeDate) : "Active"}</Typography>,
    },
    {
      key: "attendingPhysicianName",
      header: "Attending Physician",
      visible: true,
      sortable: true,
      width: 180,
      render: (item) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {item.attendingPhysicianName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.speciality}
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
      render: (item) => (
        <Box>
          <Typography variant="body2">
            {item.wardName} - {item.roomName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bed: {item.bedName} | {item.bedCategory}
          </Typography>
        </Box>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      render: (item) => (
        <Chip
          label={item.status}
          size="small"
          color={item.status === "Currently Admitted" ? "success" : item.status === "Discharged" ? "info" : item.status === "Transferred" ? "warning" : "default"}
          variant="filled"
        />
      ),
    },
  ];

  const renderCurrentAdmissionDetails = () => (
    <Paper sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AdmissionIcon />
            Admission Information
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Admission Code:</strong> {currentAdmission.admitCode}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Admit Date:</strong> {formatDt(currentAdmission.admitDate)}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Duration:</strong> {admissionDuration} day{admissionDuration !== 1 ? "s" : ""}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Case Type:</strong> {currentAdmission.caseTypeName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Patient Type:</strong> {currentAdmission.pTypeName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Status:</strong>
              <Chip label={currentAdmission.ipStatus} size="small" color="success" variant="filled" sx={{ ml: 1 }} />
            </Typography>
          </Box>
        </Grid>

        {/* Location Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BedIcon />
            Location Details
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Department:</strong> {currentAdmission.deptName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Room Group:</strong> {bedDetails.rGrpName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Room:</strong> {admissionDetails.rName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Bed:</strong> {bedDetails.bedName}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Bed Category:</strong> {admissionDetails.wCatName || "Standard"}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Bed Status:</strong>
              <Chip label={bedDetails.bedStatusValue} size="small" color="warning" variant="outlined" sx={{ ml: 1 }} />
            </Typography>
          </Box>
        </Grid>

        {/* Medical Team */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DoctorIcon />
            Medical Team
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Attending Physician:</strong> {currentAdmission.attendingPhysicianName || "Not assigned"}
            </Typography>
            {currentAdmission.primaryPhysicianName && (
              <Typography variant="body2" gutterBottom>
                <strong>Primary Physician:</strong> {currentAdmission.primaryPhysicianName}
              </Typography>
            )}
            {currentAdmission.primaryReferralSourceName && (
              <Typography variant="body2" gutterBottom>
                <strong>Referral Source:</strong> {currentAdmission.primaryReferralSourceName}
              </Typography>
            )}
            {admissionDetails.treatingPhyName && admissionDetails.treatingPhyName !== currentAdmission.attendingPhysicianName && (
              <Typography variant="body2" gutterBottom>
                <strong>Treating Physician:</strong> {admissionDetails.treatingPhyName}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Insurance Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalance />
            Insurance Information
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Insurance Coverage:</strong>
              <Chip
                label={currentAdmission.insuranceYN === "Y" ? "Covered" : "Not Covered"}
                size="small"
                color={currentAdmission.insuranceYN === "Y" ? "success" : "default"}
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Typography>

            {currentAdmission.insuranceYN === "Y" && currentAdmission.opipInsID && (
              <>
                <Typography variant="body2" gutterBottom>
                  <strong>Insurance ID:</strong> {currentAdmission.opipInsID}
                </Typography>
                {/* Add more insurance details if available in the admission data */}
                {currentAdmission.selectedInsuranceDetails && (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Insurance Carrier:</strong> {currentAdmission.selectedInsuranceDetails.insurName}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Policy Number:</strong> {currentAdmission.selectedInsuranceDetails.policyNumber}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Policy Holder:</strong> {currentAdmission.selectedInsuranceDetails.policyHolder}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Relationship:</strong> {currentAdmission.selectedInsuranceDetails.relation}
                    </Typography>
                  </>
                )}
              </>
            )}

            {currentAdmission.insuranceYN === "N" && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Patient does not have insurance coverage for this admission
              </Alert>
            )}
          </Box>
        </Grid>

        {/* Additional Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {currentAdmission.insuranceYN === "Y" && <Chip label="Has Insurance" size="small" color="info" variant="outlined" />}
              {currentAdmission.deliveryCaseYN === "Y" && <Chip label="Delivery Case" size="small" color="secondary" variant="outlined" />}
              {currentAdmission.provDiagnosisYN === "Y" && <Chip label="Provisional Diagnosis" size="small" color="warning" variant="outlined" />}
              {currentAdmission.dischargeAdviceYN === "Y" && <Chip label="Discharge Advice Given" size="small" color="success" variant="outlined" />}
            </Box>
            <Typography variant="body2" gutterBottom>
              <strong>Visit Number:</strong> {currentAdmission.advisedVisitNo}
            </Typography>
            {currentAdmission.visitGesy && (
              <Typography variant="body2" gutterBottom>
                <strong>GESY Visit:</strong> {currentAdmission.visitGesy}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* NOK/Attendant Information */}
        {currentAdmission.patNokID && currentAdmission.patNokID > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleIcon />
              Patient Attendant
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Attendant ID:</strong> {currentAdmission.patNokID}
              </Typography>
              {currentAdmission.attendantName && (
                <Typography variant="body2" gutterBottom>
                  <strong>Name:</strong> {currentAdmission.attendantName}
                </Typography>
              )}
              {currentAdmission.attendantRelation && (
                <Typography variant="body2" gutterBottom>
                  <strong>Relationship:</strong> {currentAdmission.attendantRelation}
                </Typography>
              )}
              {currentAdmission.attendantPhone && (
                <Typography variant="body2" gutterBottom>
                  <strong>Contact:</strong> {currentAdmission.attendantPhone}
                </Typography>
              )}
            </Box>
          </Grid>
        )}

        {/* Instructions */}
        {(currentAdmission.nurseIns || currentAdmission.clerkIns || currentAdmission.patientIns) && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <NotesIcon />
              Instructions
            </Typography>
            <Grid container spacing={2} sx={{ pl: 2 }}>
              {currentAdmission.nurseIns && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Nurse Instructions
                    </Typography>
                    <Typography variant="body2">{currentAdmission.nurseIns}</Typography>
                  </Paper>
                </Grid>
              )}
              {currentAdmission.clerkIns && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Clerk Instructions
                    </Typography>
                    <Typography variant="body2">{currentAdmission.clerkIns}</Typography>
                  </Paper>
                </Grid>
              )}
              {currentAdmission.patientIns && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 2, backgroundColor: "grey.50" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Patient Instructions
                    </Typography>
                    <Typography variant="body2">{currentAdmission.patientIns}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Paper>
  );

  const renderAdmissionHistory = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TimelineIcon />
        Previous Admissions
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <CustomGrid
          columns={historyColumns}
          data={admissionHistory}
          maxHeight="400px"
          emptyStateMessage="No previous admission history found"
          rowKeyField="admitID"
          density="small"
          showDensityControls={false}
        />
      )}
    </Paper>
  );

  const renderBillingInformation = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <BillingIcon />
        Billing Information
      </Typography>

      <Box sx={{ pl: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Billing information will be available once integrated with the billing module.
        </Typography>
        <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
          <strong>Patient Type:</strong> {currentAdmission.pTypeName}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Insurance Coverage:</strong> {currentAdmission.insuranceYN === "Y" ? "Yes" : "No"}
        </Typography>
        {currentAdmission.acApprovedBy && (
          <Typography variant="body2" gutterBottom>
            <strong>Approved By:</strong> {currentAdmission.acApprovedBy}
          </Typography>
        )}
        {currentAdmission.acReason && (
          <Typography variant="body2" gutterBottom>
            <strong>Approval Reason:</strong> {currentAdmission.acReason}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`Admission Details - ${patientName}`}
      maxWidth="xl"
      fullWidth
      showCloseButton
      actions={<CustomButton variant="contained" text="Close" onClick={onClose} color="primary" />}
    >
      <Box sx={{ width: "100%" }}>
        {/* Patient Header */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              <PatientIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {patientName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                UHID: {currentAdmission.pChartCode} | Admission: {currentAdmission.admitCode}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admission details tabs">
            <Tab label="Current Admission" icon={<AdmissionIcon />} iconPosition="start" id="admission-tab-0" aria-controls="admission-tabpanel-0" />
            <Tab label="History" icon={<HistoryIcon />} iconPosition="start" id="admission-tab-1" aria-controls="admission-tabpanel-1" />
            <Tab label="Billing" icon={<BillingIcon />} iconPosition="start" id="admission-tab-2" aria-controls="admission-tabpanel-2" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {renderCurrentAdmissionDetails()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderAdmissionHistory()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderBillingInformation()}
        </TabPanel>
      </Box>
    </GenericDialog>
  );
};

export default AdmissionHistoryDialog;
