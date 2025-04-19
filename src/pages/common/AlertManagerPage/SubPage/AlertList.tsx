// src/pages/common/AlertManagerPage/SubPage/AlertList.tsx
import React, { useMemo, useCallback } from "react";
import { Grid, Typography, Paper, Box, Chip } from "@mui/material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { showAlert } from "@/utils/Common/showAlert";
import useDayjs from "@/hooks/Common/useDateTime";

interface AlertListProps {
  alerts: AlertDto[];
  onEditAlert: (alert: AlertDto, index: number) => void;
  onDeleteAlert: (alertId: number) => void;
}

const AlertList: React.FC<AlertListProps> = ({ alerts, onEditAlert, onDeleteAlert }) => {
  const { formatDate } = useDayjs();

  const handleDelete = useCallback(
    (alert: AlertDto) => {
      showAlert("Confirm Delete", "Are you sure you want to delete this alert?", "warning", {
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        onConfirm: () => onDeleteAlert(alert.oPIPAlertID),
      });
    },
    [onDeleteAlert]
  );

  const columns = useMemo<Column<AlertDto>[]>(
    () => [
      {
        key: "serialNo",
        header: "No.",
        visible: true,
        width: 70,
        render: (_, rowIndex: number) => <Typography variant="body2">{rowIndex + 1}</Typography>,
      },
      {
        key: "oPIPDate",
        header: "Date",
        visible: true,
        width: 120,
        formatter: (value: Date) => <Typography variant="body2">{value ? formatDate(new Date(value)) : "-"}</Typography>,
      },
      {
        key: "alertDescription",
        header: "Description",
        visible: true,
        formatter: (value: string) => (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PriorityHighIcon color="error" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">{value}</Typography>
          </Box>
        ),
      },
      {
        key: "rCreatedBy",
        header: "Created By",
        visible: true,
        width: 150,
        formatter: (value: string) => <Chip size="small" label={value || "System"} color="primary" variant="outlined" sx={{ fontWeight: 500 }} />,
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        width: 120,
        render: (item: AlertDto, index: number) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton icon={EditIcon} onClick={() => onEditAlert(item, index)} color="primary" size="small" variant="outlined" ariaLabel="Edit alert" />
            <CustomButton icon={DeleteIcon} onClick={() => handleDelete(item)} color="error" size="small" variant="outlined" ariaLabel="Delete alert" />
          </Box>
        ),
      },
    ],
    [formatDate, onEditAlert, handleDelete]
  );

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
        }}
      >
        <PriorityHighIcon color="error" sx={{ mr: 1 }} />
        Patient Alerts
        {alerts.length > 0 && <Chip label={`${alerts.length} active`} size="small" color="primary" sx={{ ml: 2 }} />}
      </Typography>

      <CustomGrid
        columns={columns}
        data={alerts}
        maxHeight="400px"
        minHeight="200px"
        emptyStateMessage="No active alerts for this patient"
        showExportCSV={alerts.length > 0}
        showExportPDF={alerts.length > 0}
        exportFileName="patient_alerts"
      />
    </Paper>
  );
};

export default React.memo(AlertList);
