import React, { useMemo } from "react";
import { Box, Typography, IconButton, Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { format } from "date-fns";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";

interface AlertGridProps {
  alerts: AlertDto[];
  onEditAlert: (alert: AlertDto) => void;
  onDeleteAlert: (alert: AlertDto) => void;
}

const AlertGrid: React.FC<AlertGridProps> = ({ alerts, onEditAlert, onDeleteAlert }) => {
  interface AlertGridColumn extends Column<AlertDto> {
    render?: (item: AlertDto) => React.ReactNode;
    formatter?: (value: any) => string;
  }

  const columns = useMemo<AlertGridColumn[]>(
    () => [
      {
        key: "oPIPAlertID",
        header: "Alert ID",
        visible: true,
        sortable: true,
        filterable: true,
        width: 100,
      },
      {
        key: "category",
        header: "Category",
        visible: true,
        sortable: true,
        filterable: true,
        width: 150,
        render: (item: AlertDto) => <Chip label={item.category || "N/A"} color={getCategoryColor(item.category)} size="small" />,
      },
      {
        key: "alertDescription",
        header: "Description",
        visible: true,
        sortable: true,
        filterable: true,
        width: 300,
      },
      {
        key: "oPIPDate",
        header: "Date",
        visible: true,
        sortable: true,
        filterable: true,
        width: 150,
        formatter: (value: string) => format(new Date(value), "dd/MM/yyyy"),
      },
      {
        key: "patOPIPYN",
        header: "OP/IP",
        visible: true,
        sortable: true,
        filterable: true,
        width: 100,
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        sortable: false,
        filterable: false,
        width: 120,
        render: (item: AlertDto) => (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEditAlert(item);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteAlert(item);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [onEditAlert, onDeleteAlert]
  );

  // Function to determine chip color based on category
  const getCategoryColor = (category?: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (!category) return "default";

    switch (category.toLowerCase()) {
      case "allergy":
        return "error";
      case "medication":
        return "warning";
      case "diagnosis":
        return "info";
      case "critical":
        return "error";
      case "billing":
        return "secondary";
      case "admin":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Box>
      {alerts.length === 0 ? (
        <Typography variant="body1" sx={{ py: 2, textAlign: "center" }}>
          No alerts found for this patient.
        </Typography>
      ) : (
        <CustomGrid
          columns={columns}
          data={alerts}
          maxHeight="500px"
          pagination={true}
          showExportCSV={true}
          exportFileName="patient_alerts"
          emptyStateMessage="No alerts found for this patient"
          initialSortBy={{ field: "oPIPDate" as any, direction: "desc" }}
        />
      )}
    </Box>
  );
};

export default AlertGrid;
