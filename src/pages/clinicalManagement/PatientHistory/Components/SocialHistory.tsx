import { Column } from "@/components/CustomGrid/CustomGrid";
import { OPIPHistSHDto } from "@/interfaces/ClinicalManagement/OPIPHistSHDto";
import { formatDt } from "@/utils/Common/dateUtils";
import { stripHtml } from "@/utils/Common/formatText";
import { Delete as DeleteIcon, Edit as EditIcon, Assignment as SocialIcon, Visibility as ViewIcon } from "@mui/icons-material";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { GenericHistoryList } from "./GenericHistoryList";

export const SocialHistory = (props: any) => {
  const columns: Column<OPIPHistSHDto>[] = [
    {
      key: "opipSHDate",
      header: "Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (history) => <Typography variant="body2">{formatDt(history.opipSHDate)}</Typography>,
    },
    {
      key: "opipSHDesc",
      header: "Description",
      visible: true,
      sortable: true,
      width: 400,
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
          {stripHtml(history.opipSHDesc)}
        </Typography>
      ),
    },
    {
      key: "opipSHNotes",
      header: "Notes",
      visible: true,
      sortable: false,
      width: 200,
      render: (history) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {history.opipSHNotes || "-"}
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
    <GenericHistoryList<OPIPHistSHDto>
      {...props}
      title="Social History"
      icon={<SocialIcon />}
      columns={columns}
      idField="opipSHID"
      dateField="opipSHDate"
      descField="opipSHDesc"
      notesField="opipSHNotes"
      activeField="rActiveYN"
    />
  );
};
