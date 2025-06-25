import { Column } from "@/components/CustomGrid/CustomGrid";
import { OPIPHistROSDto } from "@/interfaces/ClinicalManagement/OPIPHistROSDto";
import { formatDt } from "@/utils/Common/dateUtils";
import { Delete as DeleteIcon, Edit as EditIcon, Psychology as ReviewIcon, Visibility as ViewIcon } from "@mui/icons-material";
import { Chip, IconButton, Stack, Typography } from "@mui/material";
import { GenericHistoryList } from "./GenericHistoryList";

const ReviewOfSystem = (props: any) => {
  const columns: Column<OPIPHistROSDto>[] = [
    {
      key: "opipRosDate",
      header: "Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (history) => <Typography variant="body2">{formatDt(history.opipRosDate)}</Typography>,
    },
    {
      key: "opipRosDesc",
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
          {history.opipRosDesc}
        </Typography>
      ),
    },
    {
      key: "opipRosNotes",
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
          {history.opipRosNotes || "-"}
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
    <GenericHistoryList<OPIPHistROSDto>
      {...props}
      title="Review of System"
      icon={<ReviewIcon />}
      columns={columns}
      idField="opipRosID"
      dateField="opipRosDate"
      descField="opipRosDesc"
      notesField="opipRosNotes"
      activeField="rActiveYN"
    />
  );
};

export default ReviewOfSystem;
