// src/pages/clinicalManagement/PatientHistory/Components/PastMedicationHistory.tsx

import { Column } from "@/components/CustomGrid/CustomGrid";
import { PastMedicationDto } from "@/interfaces/ClinicalManagement/PastMedicationDto";
import { formatDt } from "@/utils/Common/dateUtils";
import { Delete as DeleteIcon, Edit as EditIcon, Medication as MedicationIcon, Visibility as ViewIcon } from "@mui/icons-material";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { GenericHistoryList } from "./GenericHistoryList";

export const PastMedicationHistory = (props: any) => {
  const columns: Column<PastMedicationDto>[] = [
    {
      key: "opipDate",
      header: "Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (medication) => <Typography variant="body2">{formatDt(medication.pastMedicationMastDto.opipDate)}</Typography>,
    },
    {
      key: "details",
      header: "Medications",
      visible: true,
      sortable: false,
      width: 400,
      render: (medication) => (
        <Box>
          {medication.details && medication.details.length > 0 ? (
            <Stack direction="column" spacing={0.5}>
              {medication.details.slice(0, 2).map((detail, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {detail.medText}
                  </Typography>
                  <Chip label={detail.mFrqName || "N/A"} size="small" variant="outlined" />
                  <Typography variant="caption" color="text.secondary">
                    ({formatDt(detail.fromDate)} - {formatDt(detail.toDate)})
                  </Typography>
                </Box>
              ))}
              {medication.details.length > 2 && <Chip label={`+${medication.details.length - 2} more`} size="small" variant="filled" color="default" />}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No medications recorded
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "medicationCount",
      header: "Count",
      visible: true,
      sortable: true,
      width: 100,
      render: (medication) => <Chip label={`${medication.details?.length || 0} items`} size="small" color="primary" variant="filled" />,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      render: (medication) => (
        <Chip
          label={medication.pastMedicationMastDto.rActiveYN === "Y" ? "Active" : "Inactive"}
          size="small"
          color={medication.pastMedicationMastDto.rActiveYN === "Y" ? "success" : "default"}
          variant="filled"
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 150,
      render: (medication) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary" onClick={() => props.onView(medication.pastMedicationMastDto)} title="View">
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info" onClick={() => props.onEdit(medication.pastMedicationMastDto)} title="Edit">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => props.onDelete(medication.pastMedicationMastDto)} title="Delete">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <GenericHistoryList<PastMedicationDto>
      {...props}
      title="Past Medication"
      icon={<MedicationIcon />}
      columns={columns}
      idField="opipPastMedID"
      dateField="opipDate"
      descField="details"
      notesField="rNotes"
      activeField="rActiveYN"
      isMedication={true}
    />
  );
};
