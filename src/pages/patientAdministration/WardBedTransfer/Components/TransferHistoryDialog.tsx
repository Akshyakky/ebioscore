// src/pages/patientAdministration/WardBedTransfer/Components/TransferHistoryDialog.tsx
import CustomButton from "@/components/Button/CustomButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { PatientSearchResult } from "@/interfaces/PatientAdministration/Patient/PatientSearch.interface";
import { calculateDaysBetween, formatDt } from "@/utils/Common/dateUtils";
import {
  CalendarToday as CalendarIcon,
  MedicalServices as DoctorIcon,
  History as HistoryIcon,
  Assignment as NotesIcon,
  Person as PatientIcon,
  SwapHoriz as TransferIcon,
} from "@mui/icons-material";
import { Alert, Avatar, Box, Chip, Divider, Grid, Paper, Typography } from "@mui/material";
import React, { useMemo } from "react";

interface TransferHistoryRecord {
  transferId: number;
  admitID: number;
  pChartID: number;
  pChartCode: string;
  patientName: string;
  fromBedId: number;
  fromBedName: string;
  fromRoomName: string;
  toBedId: number;
  toBedName: string;
  toRoomName: string;
  transferDate: Date;
  treatPhyID: number;
  treatPhyName: string;
  reasonForTransfer: string;
  transferNotes: string;
  transferredBy: string;
  status: "Completed" | "Pending" | "Cancelled";
}

interface TransferHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  transferHistory: TransferHistoryRecord[];
  patient: PatientSearchResult | null;
}

const TransferHistoryDialog: React.FC<TransferHistoryDialogProps> = ({ open, onClose, transferHistory, patient }) => {
  // Enhanced transfer history with additional calculations
  const enhancedHistory = useMemo(() => {
    return transferHistory.map((transfer, index) => ({
      ...transfer,
      transferNumber: index + 1,
      daysBetween: index > 0 ? calculateDaysBetween(transferHistory[index - 1].transferDate, transfer.transferDate) : 0,
      formattedDate: formatDt(transfer.transferDate),
    }));
  }, [transferHistory]);

  // Transfer statistics
  const transferStats = useMemo(() => {
    const totalTransfers = transferHistory.length;
    const completedTransfers = transferHistory.filter((t) => t.status === "Completed").length;
    const pendingTransfers = transferHistory.filter((t) => t.status === "Pending").length;

    const uniqueRooms = new Set([...transferHistory.map((t) => t.fromRoomName), ...transferHistory.map((t) => t.toRoomName)]).size;

    const uniquePhysicians = new Set(transferHistory.map((t) => t.treatPhyName)).size;

    return {
      total: totalTransfers,
      completed: completedTransfers,
      pending: pendingTransfers,
      uniqueRooms,
      uniquePhysicians,
    };
  }, [transferHistory]);

  // Grid columns for transfer history
  const columns: Column<(typeof enhancedHistory)[0]>[] = [
    {
      key: "transferNumber",
      header: "#",
      visible: true,
      sortable: true,
      width: 60,
      formatter: (value: number) => value.toString(),
    },
    {
      key: "transferDate",
      header: "Transfer Date",
      visible: true,
      sortable: true,
      width: 140,
      render: (transfer) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {transfer.formattedDate}
          </Typography>
          {transfer.daysBetween > 0 && (
            <Typography variant="caption" color="text.secondary">
              {transfer.daysBetween} days after previous
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "fromLocation",
      header: "From",
      visible: true,
      sortable: true,
      width: 160,
      render: (transfer) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {transfer.fromRoomName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bed: {transfer.fromBedName}
          </Typography>
        </Box>
      ),
    },
    {
      key: "toLocation",
      header: "To",
      visible: true,
      sortable: true,
      width: 160,
      render: (transfer) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {transfer.toRoomName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bed: {transfer.toBedName}
          </Typography>
        </Box>
      ),
    },
    {
      key: "treatPhyName",
      header: "Treating Physician",
      visible: true,
      sortable: true,
      width: 180,
      render: (transfer) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: "secondary.main", width: 24, height: 24 }}>
            <DoctorIcon sx={{ fontSize: 14 }} />
          </Avatar>
          <Typography variant="body2">{transfer.treatPhyName}</Typography>
        </Box>
      ),
    },
    {
      key: "reasonForTransfer",
      header: "Reason",
      visible: true,
      sortable: true,
      width: 200,
      render: (transfer) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 180,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={transfer.reasonForTransfer}
        >
          {transfer.reasonForTransfer}
        </Typography>
      ),
    },
    {
      key: "status",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      render: (transfer) => (
        <Chip label={transfer.status} size="small" color={transfer.status === "Completed" ? "success" : transfer.status === "Pending" ? "warning" : "error"} variant="filled" />
      ),
    },
  ];

  const renderTransferSummary = () => (
    <Paper sx={{ p: 2, mb: 3, backgroundColor: "info.50", border: "1px solid", borderColor: "info.200" }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <HistoryIcon />
        Transfer Summary
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {transferStats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Transfers
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {transferStats.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {transferStats.uniqueRooms}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Different Rooms
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="secondary.main" fontWeight="bold">
              {transferStats.uniquePhysicians}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Different Physicians
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderTransferTimeline = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CalendarIcon />
        Transfer Timeline
      </Typography>

      <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
        {enhancedHistory.length === 0 ? (
          <Alert severity="info">No transfers found for this patient.</Alert>
        ) : (
          enhancedHistory.map((transfer, index) => (
            <Box key={transfer.transferId} sx={{ mb: 2 }}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: transfer.status === "Completed" ? "success.50" : transfer.status === "Pending" ? "warning.50" : "error.50",
                  border: "1px solid",
                  borderColor: transfer.status === "Completed" ? "success.200" : transfer.status === "Pending" ? "warning.200" : "error.200",
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                        <Typography variant="caption" fontWeight="bold">
                          {transfer.transferNumber}
                        </Typography>
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {transfer.formattedDate}
                        </Typography>
                        <Chip
                          label={transfer.status}
                          size="small"
                          color={transfer.status === "Completed" ? "success" : transfer.status === "Pending" ? "warning" : "error"}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary">
                          From
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {transfer.fromRoomName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transfer.fromBedName}
                        </Typography>
                      </Box>

                      <TransferIcon color="primary" />

                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary">
                          To
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {transfer.toRoomName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transfer.toBedName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box>
                      <Typography variant="body2">
                        <strong>Physician:</strong> {transfer.treatPhyName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Reason:</strong> {transfer.reasonForTransfer}
                      </Typography>
                      {transfer.transferNotes && (
                        <Typography variant="caption" color="text.secondary">
                          <strong>Notes:</strong> {transfer.transferNotes}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
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
        Detailed Transfer History
      </Typography>

      <CustomGrid
        columns={columns}
        data={enhancedHistory}
        maxHeight="400px"
        emptyStateMessage="No transfer history found"
        rowKeyField="transferId"
        density="small"
        showDensityControls={false}
      />
    </Paper>
  );

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={`Transfer History - ${patient?.fullName || "Patient"}`}
      maxWidth="xl"
      fullWidth
      showCloseButton
      actions={<CustomButton variant="contained" text="Close" onClick={onClose} color="primary" />}
    >
      <Box sx={{ p: 2 }}>
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

        {/* Transfer Summary */}
        {renderTransferSummary()}

        {/* Transfer Timeline */}
        {renderTransferTimeline()}

        {/* Detailed History Grid */}
        {renderDetailedHistory()}
      </Box>
    </GenericDialog>
  );
};

export default TransferHistoryDialog;
