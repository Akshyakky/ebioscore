// src/pages/clinicalManagement/PatientHistory/Components/ObstetricsHistory.tsx
import { Column } from "@/components/CustomGrid/CustomGrid";
import { OPIPHistObstetricsDto } from "@/interfaces/ClinicalManagement/OPIPHistObstetricsDto";
import { formatDt } from "@/utils/Common/dateUtils";
import { stripHtml } from "@/utils/Common/formatText";
import { Delete as DeleteIcon, Edit as EditIcon, PregnantWoman as ObstetricsIcon, Visibility as ViewIcon } from "@mui/icons-material";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { GenericHistoryList } from "./GenericHistoryList";

export const ObstetricsHistory = (props: any) => {
  const columns: Column<OPIPHistObstetricsDto>[] = [
    {
      key: "opipDate",
      header: "Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (history) => <Typography variant="body2">{formatDt(history.opipDate)}</Typography>,
    },
    {
      key: "obDesc",
      header: "Description",
      visible: true,
      sortable: true,
      width: 250,
      render: (history) => (
        <Typography
          variant="body2"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {history.obDesc || "-"}
        </Typography>
      ),
    },
    {
      key: "deliveryInfo",
      header: "Delivery Information",
      visible: true,
      sortable: false,
      width: 300,
      render: (history) => (
        <Box>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {history.deliveryName && <Chip label={`Delivery: ${history.deliveryName}`} size="small" variant="outlined" color="primary" />}
            {history.foetalAgeWeek && (
              <Chip label={`Gestational Age: ${history.foetalAgeWeek}w${history.foetalAgeDay ? ` ${history.foetalAgeDay}d` : ""}`} size="small" variant="outlined" />
            )}
            {history.bGender && <Chip label={`Gender: ${history.bGender}`} size="small" variant="outlined" color={history.bGender === "Male" ? "info" : "secondary"} />}
            {history.bBirthWeight && <Chip label={`Weight: ${history.bBirthWeight}g`} size="small" variant="outlined" />}
          </Stack>
        </Box>
      ),
    },
    {
      key: "complications",
      header: "Complications",
      visible: true,
      sortable: false,
      width: 200,
      render: (history) => (
        <Typography
          variant="body2"
          color={history.complication ? "error.main" : "text.secondary"}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {stripHtml(history.complication) || "None reported"}
        </Typography>
      ),
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      render: (history) => (
        <Chip label={history.rActiveYN === "Y" ? "Active" : "Inactive"} size="small" color={history.rActiveYN === "Y" ? "success" : "default"} variant="filled" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      visible: true,
      sortable: false,
      width: 150,
      render: (history) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary" onClick={() => props.onView(history)} title="View">
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info" onClick={() => props.onEdit(history)} title="Edit">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => props.onDelete(history)} title="Delete">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <GenericHistoryList<OPIPHistObstetricsDto>
      {...props}
      title="Obstetrics History"
      icon={<ObstetricsIcon />}
      columns={columns}
      idField="opipOBID"
      dateField="opipDate"
      descField="obDesc"
      notesField="bComments"
      activeField="rActiveYN"
    />
  );
};
