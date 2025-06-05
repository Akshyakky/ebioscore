// src/pages/patientAdministration/AdmissionPage/Components/AdmissionHistoryDialog.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Paper, Grid, Chip, Avatar, Divider, Tab, Tabs, CircularProgress, Alert, Stack } from "@mui/material";
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
  admission: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`admission-tabpanel-${index}`} aria-labelledby={`admission-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 1.5 }}>{children}</Box>}
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
          color={item.status === "ADMITTED" ? "success" : item.status === "Discharged" ? "info" : item.status === "Transferred" ? "warning" : "default"}
          variant="filled"
        />
      ),
    },
  ];

  const renderCurrentAdmissionDetails = () => (
    <Paper sx={{ p: 1.5 }}>
      <Grid container spacing={1.5}>
        {/* Basic Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AdmissionIcon fontSize="small" />
            Admission Information
          </Typography>
          <Stack spacing={0.25} sx={{ pl: 1 }}>
            <Typography variant="caption">
              <strong>Admission Code:</strong> {currentAdmission.admitCode}
            </Typography>
            <Typography variant="caption">
              <strong>Admit Date:</strong> {formatDt(currentAdmission.admitDate)}
            </Typography>
            <Typography variant="caption">
              <strong>Duration:</strong> {admissionDuration} day{admissionDuration !== 1 ? "s" : ""}
            </Typography>
            <Typography variant="caption">
              <strong>Case Type:</strong> {currentAdmission.caseTypeName}
            </Typography>
            <Typography variant="caption">
              <strong>Patient Type:</strong> {currentAdmission.pTypeName}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
              <Typography variant="caption">
                <strong>Status:</strong>
              </Typography>
              <Chip label={currentAdmission.ipStatus} size="small" color="success" variant="filled" sx={{ height: 16, fontSize: "0.6rem" }} />
            </Box>
          </Stack>
        </Grid>

        {/* Location Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BedIcon fontSize="small" />
            Location Details
          </Typography>
          <Stack spacing={0.25} sx={{ pl: 1 }}>
            <Typography variant="caption">
              <strong>Department:</strong> {currentAdmission.deptName}
            </Typography>
            <Typography variant="caption">
              <strong>Room Group:</strong> {bedDetails.rGrpName}
            </Typography>
            <Typography variant="caption">
              <strong>Room:</strong> {admissionDetails.rName}
            </Typography>
            <Typography variant="caption">
              <strong>Bed:</strong> {bedDetails.bedName}
            </Typography>
            <Typography variant="caption">
              <strong>Bed Category:</strong> {admissionDetails.wCatName || "Standard"}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
              <Typography variant="caption">
                <strong>Bed Status:</strong>
              </Typography>
              <Chip label={bedDetails.bedStatusValue} size="small" color="warning" variant="outlined" sx={{ height: 16, fontSize: "0.6rem" }} />
            </Box>
          </Stack>
        </Grid>

        {/* Medical Team */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DoctorIcon fontSize="small" />
            Medical Team
          </Typography>
          <Stack spacing={0.25} sx={{ pl: 1 }}>
            <Typography variant="caption">
              <strong>Attending Physician:</strong> {currentAdmission.attendingPhysicianName || "Not assigned"}
            </Typography>
            {currentAdmission.primaryPhysicianName && (
              <Typography variant="caption">
                <strong>Primary Physician:</strong> {currentAdmission.primaryPhysicianName}
              </Typography>
            )}
            {currentAdmission.primaryReferralSourceName && (
              <Typography variant="caption">
                <strong>Referral Source:</strong> {currentAdmission.primaryReferralSourceName}
              </Typography>
            )}
            {admissionDetails.treatingPhyName && admissionDetails.treatingPhyName !== currentAdmission.attendingPhysicianName && (
              <Typography variant="caption">
                <strong>Treating Physician:</strong> {admissionDetails.treatingPhyName}
              </Typography>
            )}
          </Stack>
        </Grid>

        {/* Insurance Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalance fontSize="small" />
            Insurance Information
          </Typography>
          <Stack spacing={0.25} sx={{ pl: 1 }}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption">
                <strong>Coverage:</strong>
              </Typography>
              <Chip
                label={currentAdmission.insuranceYN === "Y" ? "Covered" : "Not Covered"}
                size="small"
                color={currentAdmission.insuranceYN === "Y" ? "success" : "default"}
                variant="outlined"
                sx={{ height: 16, fontSize: "0.6rem" }}
              />
            </Box>

            {currentAdmission.insuranceYN === "Y" && currentAdmission.opipInsID && (
              <>
                <Typography variant="caption">
                  <strong>Insurance ID:</strong> {currentAdmission.opipInsID}
                </Typography>
                {currentAdmission.selectedInsuranceDetails && (
                  <>
                    <Typography variant="caption">
                      <strong>Carrier:</strong> {currentAdmission.selectedInsuranceDetails.insurName}
                    </Typography>
                    <Typography variant="caption">
                      <strong>Policy:</strong> {currentAdmission.selectedInsuranceDetails.policyNumber}
                    </Typography>
                    <Typography variant="caption">
                      <strong>Holder:</strong> {currentAdmission.selectedInsuranceDetails.policyHolder}
                    </Typography>
                  </>
                )}
              </>
            )}

            {currentAdmission.insuranceYN === "N" && (
              <Alert severity="info" sx={{ py: 0.25 }}>
                <Typography variant="caption">Patient does not have insurance coverage for this admission</Typography>
              </Alert>
            )}
          </Stack>
        </Grid>

        {/* Additional Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" gutterBottom>
            Additional Information
          </Typography>
          <Box sx={{ pl: 1 }}>
            <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
              {currentAdmission.insuranceYN === "Y" && <Chip label="Has Insurance" size="small" color="info" variant="outlined" sx={{ height: 16, fontSize: "0.6rem" }} />}
              {currentAdmission.deliveryCaseYN === "Y" && <Chip label="Delivery Case" size="small" color="secondary" variant="outlined" sx={{ height: 16, fontSize: "0.6rem" }} />}
              {currentAdmission.provDiagnosisYN === "Y" && (
                <Chip label="Provisional Diagnosis" size="small" color="warning" variant="outlined" sx={{ height: 16, fontSize: "0.6rem" }} />
              )}
              {currentAdmission.dischargeAdviceYN === "Y" && (
                <Chip label="Discharge Advice Given" size="small" color="success" variant="outlined" sx={{ height: 16, fontSize: "0.6rem" }} />
              )}
            </Box>
            <Typography variant="caption">
              <strong>Visit Number:</strong> {currentAdmission.advisedVisitNo}
            </Typography>
            {currentAdmission.visitGesy && (
              <Typography variant="caption" display="block">
                <strong>GESY Visit:</strong> {currentAdmission.visitGesy}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* NOK/Attendant Information */}
        {currentAdmission.patNokID && currentAdmission.patNokID > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleIcon fontSize="small" />
              Patient Attendant
            </Typography>
            <Stack spacing={0.25} sx={{ pl: 1 }}>
              <Typography variant="caption">
                <strong>Attendant ID:</strong> {currentAdmission.patNokID}
              </Typography>
              {currentAdmission.attendantName && (
                <Typography variant="caption">
                  <strong>Name:</strong> {currentAdmission.attendantName}
                </Typography>
              )}
              {currentAdmission.attendantRelation && (
                <Typography variant="caption">
                  <strong>Relationship:</strong> {currentAdmission.attendantRelation}
                </Typography>
              )}
              {currentAdmission.attendantPhone && (
                <Typography variant="caption">
                  <strong>Contact:</strong> {currentAdmission.attendantPhone}
                </Typography>
              )}
            </Stack>
          </Grid>
        )}

        {/* Instructions */}
        {(currentAdmission.nurseIns || currentAdmission.clerkIns || currentAdmission.patientIns) && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <NotesIcon fontSize="small" />
              Instructions
            </Typography>
            <Grid container spacing={1} sx={{ pl: 1 }}>
              {currentAdmission.nurseIns && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 1, backgroundColor: "grey.50" }}>
                    <Typography variant="caption" fontWeight="medium" gutterBottom>
                      Nurse Instructions
                    </Typography>
                    <Typography variant="caption" display="block">
                      {currentAdmission.nurseIns}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {currentAdmission.clerkIns && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 1, backgroundColor: "grey.50" }}>
                    <Typography variant="caption" fontWeight="medium" gutterBottom>
                      Clerk Instructions
                    </Typography>
                    <Typography variant="caption" display="block">
                      {currentAdmission.clerkIns}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {currentAdmission.patientIns && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper sx={{ p: 1, backgroundColor: "grey.50" }}>
                    <Typography variant="caption" fontWeight="medium" gutterBottom>
                      Patient Instructions
                    </Typography>
                    <Typography variant="caption" display="block">
                      {currentAdmission.patientIns}
                    </Typography>
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
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TimelineIcon fontSize="small" />
        Previous Admissions
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px">
          <CircularProgress size={24} />
        </Box>
      ) : (
        <CustomGrid
          columns={historyColumns}
          data={admissionHistory}
          maxHeight="350px"
          emptyStateMessage="No previous admission history found"
          rowKeyField="admitID"
          showDensityControls={false}
        />
      )}
    </Paper>
  );

  const renderBillingInformation = () => (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <BillingIcon fontSize="small" />
        Billing Information
      </Typography>

      <Stack spacing={0.5} sx={{ pl: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Billing information will be available once integrated with the billing module.
        </Typography>
        <Typography variant="caption">
          <strong>Patient Type:</strong> {currentAdmission.pTypeName}
        </Typography>
        <Typography variant="caption">
          <strong>Insurance Coverage:</strong> {currentAdmission.insuranceYN === "Y" ? "Yes" : "No"}
        </Typography>
        {currentAdmission.acApprovedBy && (
          <Typography variant="caption">
            <strong>Approved By:</strong> {currentAdmission.acApprovedBy}
          </Typography>
        )}
        {currentAdmission.acReason && (
          <Typography variant="caption">
            <strong>Approval Reason:</strong> {currentAdmission.acReason}
          </Typography>
        )}
      </Stack>
    </Paper>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`Admission Details - ${patientName}`}
      maxWidth="lg"
      fullWidth
      showCloseButton
      actions={<CustomButton variant="contained" text="Close" onClick={onClose} color="primary" size="small" />}
    >
      <Box sx={{ width: "100%" }}>
        {/* Compact Patient Header */}
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
                {patientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                UHID: {currentAdmission.pChartCode} | Admission: {currentAdmission.admitCode}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Compact Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admission details tabs" variant="scrollable" scrollButtons="auto">
            <Tab
              label="Current Admission"
              icon={<AdmissionIcon fontSize="small" />}
              iconPosition="start"
              id="admission-tab-0"
              aria-controls="admission-tabpanel-0"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              label="History"
              icon={<HistoryIcon fontSize="small" />}
              iconPosition="start"
              id="admission-tab-1"
              aria-controls="admission-tabpanel-1"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              label="Billing"
              icon={<BillingIcon fontSize="small" />}
              iconPosition="start"
              id="admission-tab-2"
              aria-controls="admission-tabpanel-2"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
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
