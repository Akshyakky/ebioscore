// src/pages/common/AlertManagerPage/SubPage/AlertGrid.tsx
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import React, { useMemo } from "react";

interface AlertGridProps {
  alerts: AlertDto[];
  onEditAlert: (alert: AlertDto) => void;
  onDeleteAlert: (alert: AlertDto) => void;
}

const AlertGrid: React.FC<AlertGridProps> = ({ alerts, onEditAlert, onDeleteAlert }) => {
  interface AlertGridColumn extends Column<AlertDto> {
    render?: (item: AlertDto, rowIndex: number, columnIndex: number) => React.ReactNode;
    formatter?: (value: any) => string;
  }

  const columns = useMemo<AlertGridColumn[]>(
    () => [
      {
        key: "rowNumber",
        header: "#",
        visible: true,
        sortable: false,
        filterable: false,
        align: "center",
        render: (_, rowIndex) => (
          <Typography variant="body2" align="center">
            {rowIndex + 1}
          </Typography>
        ),
      },
      {
        key: "category",
        header: "Category",
        visible: true,
        sortable: true,
        filterable: true,
        align: "center",
        render: (item: AlertDto) => (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Chip label={item.category || "N/A"} color={getCategoryColor(item.category)} size="small" sx={{ minWidth: "90px", justifyContent: "center" }} />
          </Box>
        ),
      },
      {
        key: "alertDescription",
        header: "Description",
        visible: true,
        sortable: true,
        filterable: true,
        align: "left",
      },
      {
        key: "oPIPDate",
        header: "Date",
        visible: true,
        sortable: true,
        filterable: true,
        align: "center",
      },
      {
        key: "patOPIPYN",
        header: "OP/IP",
        visible: true,
        sortable: true,
        filterable: true,
        align: "center",
        render: (item: AlertDto) => (
          <Typography variant="body2" align="center">
            {item.patOPIPYN === "O" ? "Outpatient" : item.patOPIPYN === "I" ? "Inpatient" : item.patOPIPYN || "N/A"}
          </Typography>
        ),
      },
      {
        key: "rActiveYN",
        header: "Status",
        visible: true,
        sortable: true,
        filterable: true,
        align: "center",
        render: (item: AlertDto) => (
          <Chip
            label={item.rActiveYN === "Y" ? "Active" : "Inactive"}
            color={item.rActiveYN === "Y" ? "success" : "default"}
            size="small"
            sx={{ minWidth: "70px", justifyContent: "center" }}
          />
        ),
      },
      {
        key: "actions",
        header: "Actions",
        visible: true,
        sortable: false,
        filterable: false,
        align: "center",
        render: (item: AlertDto) => (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEditAlert(item);
              }}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
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
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.08)",
                "&:hover": { bgcolor: "rgba(25, 118, 210, 0.15)" },
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
          pageSize={10}
          showExportCSV={true}
          exportFileName="patient_alerts"
          emptyStateMessage="No alerts found for this patient"
          virtualScroll={false}
          initialSortBy={{ field: "oPIPDate" as any, direction: "desc" }}
          gridStyle={{
            borderRadius: "4px",
            overflow: "hidden",
          }}
        />
      )}
    </Box>
  );
};

export default AlertGrid;
