import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import CustomButton from "@/components/Button/CustomButton";
import ConfirmationDialog from "@/components/Dialog/ConfirmationDialog";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { formatDt } from "@/utils/Common/dateUtils";

interface NextOfKinListProps {
  data: PatNokDetailsDto[];
  onEdit: (item: PatNokDetailsDto) => void;
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

const NextOfKinList: React.FC<NextOfKinListProps> = ({ data, onEdit, onDelete, loading = false }) => {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PatNokDetailsDto | null>(null);

  const handleDeleteClick = (item: PatNokDetailsDto) => {
    setSelectedItem(item);
    setConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem) {
      await onDelete(selectedItem.pNokID);
      setConfirmationOpen(false);
      setSelectedItem(null);
    }
  };

  const columns: Column<PatNokDetailsDto>[] = [
    {
      key: "actions",
      header: "Actions",
      visible: true,
      align: "center",
      width: 120,
      render: (item) => (
        <Box display="flex" justifyContent="center" gap={1}>
          <CustomButton variant="outlined" size="small" icon={EditIcon} onClick={() => onEdit(item)} ariaLabel="Edit next of kin" />
          <CustomButton variant="outlined" size="small" color="error" icon={DeleteIcon} onClick={() => handleDeleteClick(item)} ariaLabel="Delete next of kin" />
        </Box>
      ),
    },
    {
      key: "pNokTitle",
      header: "Title",
      visible: true,
      width: 80,
    },
    {
      key: "fullName",
      header: "Name",
      visible: true,
      render: (item) => {
        const fullName = `${item.pNokFName || ""} ${item.pNokMName || ""} ${item.pNokLName || ""}`.trim();
        return <Typography variant="body2">{fullName}</Typography>;
      },
    },
    {
      key: "pNokRelName",
      header: "Relationship",
      visible: true,
    },
    {
      key: "pNokDob",
      header: "Date of Birth",
      visible: true,
      render: (item) => <Typography variant="body2">{item.pNokDob ? formatDt(item.pNokDob) : ""}</Typography>,
    },
    {
      key: "pAddPhone1",
      header: "Phone",
      visible: true,
    },
    {
      key: "address",
      header: "Address",
      visible: true,
      render: (item) => {
        const addressParts = [item.pNokDoorNo, item.pNokStreet, item.pNokArea, item.pNokCity, item.pNokState, item.pNokPostcode, item.pNokCountry].filter(Boolean);

        return (
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {addressParts.join(", ")}
          </Typography>
        );
      },
    },
    {
      key: "rActiveYN",
      header: "Status",
      visible: true,
      render: (item) => (
        <Typography
          variant="body2"
          sx={{
            color: item.rActiveYN === "Y" ? "success.main" : "error.main",
          }}
        >
          {item.rActiveYN === "Y" ? "Active" : "Inactive"}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      {data.length === 0 && !loading ? (
        <Typography variant="body1" sx={{ py: 2, textAlign: "center" }}>
          No next of kin records found
        </Typography>
      ) : (
        <CustomGrid
          columns={columns}
          data={data}
          loading={loading}
          emptyStateMessage="No next of kin records found"
          maxHeight="400px"
          pagination={data.length > 10}
          pageSize={10}
          showExportCSV={false}
          showExportPDF={false}
          rowKeyField="pNokID"
        />
      )}

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Next of Kin"
        message={`Are you sure you want to delete ${selectedItem?.pNokFName} ${selectedItem?.pNokLName} from next of kin records?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
      />
    </Box>
  );
};

export default NextOfKinList;
