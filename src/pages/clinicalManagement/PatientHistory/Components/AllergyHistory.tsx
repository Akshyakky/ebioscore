import { Column } from "@/components/CustomGrid/CustomGrid";
import { AllergyDto } from "@/interfaces/ClinicalManagement/AllergyDto";
import { formatDt } from "@/utils/Common/dateUtils";
import { LocalPharmacy as AllergyIcon, Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon } from "@mui/icons-material";
import { Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { GenericHistoryList } from "./GenericHistoryList";

export const AllergyHistory = (props: any) => {
  const columns: Column<AllergyDto>[] = [
    {
      key: "opIPHistAllergyMastDto.opipDate",
      header: "Date",
      visible: true,
      sortable: true,
      width: 120,
      render: (allergy) => <Typography variant="body2">{formatDt(allergy.opIPHistAllergyMastDto.opipDate)}</Typography>,
    },
    {
      key: "allergyDetails",
      header: "Allergies",
      visible: true,
      sortable: false,
      width: 400,
      render: (allergy) => (
        <Box>
          {allergy.allergyDetails && allergy.allergyDetails.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
              {allergy.allergyDetails.slice(0, 3).map((detail, index) => (
                <Chip key={index} label={detail.mfName || detail.medText} size="small" variant="outlined" color="error" />
              ))}
              {allergy.allergyDetails.length > 3 && <Chip label={`+${allergy.allergyDetails.length - 3} more`} size="small" variant="filled" color="default" />}
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
      render: (allergy) => <Chip label={`${allergy.allergyDetails?.length || 0} items`} size="small" color="primary" variant="filled" />,
    },
    {
      key: "opIPHistAllergyMastDto.rActiveYN",
      header: "Status",
      visible: true,
      sortable: true,
      width: 100,
      render: (allergy) => (
        <Chip
          label={allergy.opIPHistAllergyMastDto.rActiveYN === "Y" ? "Active" : "Inactive"}
          size="small"
          color={allergy.opIPHistAllergyMastDto.rActiveYN === "Y" ? "success" : "default"}
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
      idField="opIPHistAllergyMastDto.opipAlgId"
      dateField="opIPHistAllergyMastDto.opipDate"
      descField="allergyDetails"
      notesField="opIPHistAllergyMastDto.rNotes"
      activeField="opIPHistAllergyMastDto.rActiveYN"
    />
  );
};
