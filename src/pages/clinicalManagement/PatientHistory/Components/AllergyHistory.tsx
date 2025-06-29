import { Column } from "@/components/CustomGrid/CustomGrid";
import { AllergyDto } from "@/interfaces/ClinicalManagement/AllergyDto";
import { formatDt } from "@/utils/Common/dateUtils";
import { LocalPharmacy as AllergyIcon, Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon } from "@mui/icons-material";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { GenericHistoryList } from "./GenericHistoryList";

export const AllergyHistory = (props: any) => {
  const columns: Column<AllergyDto>[] = [
    {
      key: "opipDate",
      header: "Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (allergy) => <Typography variant="body2">{formatDt(allergy.allergyMastDto.opipDate)}</Typography>,
    },
    {
      key: "details",
      header: "Allergies",
      visible: true,
      sortable: false,
      width: 400,
      render: (allergy) => (
        <Box>
          {allergy.details && allergy.details.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {allergy.details.slice(0, 3).map((detail, index) => (
                <Chip key={index} label={detail.mfName || detail.medText} size="small" variant="outlined" color="error" />
              ))}
              {allergy.details.length > 3 && <Chip label={`+${allergy.details.length - 3} more`} size="small" variant="filled" color="default" />}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No allergies recorded
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "allergyCount",
      header: "Count",
      visible: true,
      sortable: true,
      width: 100,
      render: (allergy) => <Chip label={`${allergy.details?.length || 0} items`} size="small" color="primary" variant="filled" />,
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      render: (allergy) => (
        <Chip
          label={allergy.allergyMastDto.rActiveYN === "Y" ? "Active" : "Inactive"}
          size="small"
          color={allergy.allergyMastDto.rActiveYN === "Y" ? "success" : "default"}
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
      render: (allergy) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary" onClick={() => props.onView(allergy)} title="View">
            <ViewIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="info" onClick={() => props.onEdit(allergy)} title="Edit">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => props.onDelete(allergy)} title="Delete">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <GenericHistoryList<AllergyDto>
      {...props}
      title="Allergy"
      icon={<AllergyIcon />}
      columns={columns}
      idField="opipAlgId"
      dateField="opipDate"
      descField="details"
      notesField="rNotes"
      activeField="rActiveYN"
      isMedication={true}
    />
  );
};
