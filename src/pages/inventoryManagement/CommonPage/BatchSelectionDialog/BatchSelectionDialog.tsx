import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { Close, Search } from "@mui/icons-material";
import { Box, Button, Chip, TextField, Typography, useTheme } from "@mui/material";
import { useCallback, useMemo, useState } from "react";

export interface BatchSelectionDialogProps<T = any> {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedItem: T) => void;
  data: T[];
}

// batch columns
const batchColumns = <T extends Record<string, any>>(): Column<T>[] => [
  {
    key: "batchNo",
    header: "Batch No",
    visible: true,
    width: 150,
    sortable: false,
  },
  {
    key: "productQOH",
    header: "Available Qty",
    visible: true,
    width: 120,
    sortable: false,
    type: "number",
    render: (item) => <Chip label={item.productQOH || 0} size="small" color={item.productQOH > 10 ? "success" : item.productQOH > 0 ? "warning" : "error"} variant="outlined" />,
  },
  {
    key: "expiryDate",
    header: "Expiry Date",
    visible: true,
    width: 150,
    sortable: false,
    render: (item) => {
      const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
      if (!expiryDate) return "-";

      const formattedDate = expiryDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const daysUntilExpiry = (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      const isExpiringSoon = daysUntilExpiry < 90;

      return (
        <Typography variant="body2" color={isExpiringSoon ? "warning.main" : "text.primary"} fontWeight={isExpiringSoon ? "medium" : "normal"}>
          {formattedDate}
        </Typography>
      );
    },
  },
  {
    key: "sellingPrice",
    header: "Unit Price",
    visible: true,
    width: 120,
    sortable: false,
    type: "number",
    render: (item) => (
      <Typography variant="body2" fontWeight="medium">
        ₹{(item.sellingPrice || 0).toFixed(2)}
      </Typography>
    ),
  },
  {
    key: "deptName",
    header: "Department",
    visible: true,
    width: 150,
    sortable: false,
  },
];

function BatchSelectionDialog<T extends Record<string, any>>({ open, onClose, onSelect, data }: BatchSelectionDialogProps<T>) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const getItemId = (item: T | null) => {
    if (!item) return null;
    return item["grnDetID"];
  };

  const handleSelectItem = useCallback(
    (item: T) => {
      onSelect(item);
      onClose();
    },
    [getItemId, onSelect, onClose]
  );

  const finalColumns: Column<T>[] = useMemo(() => {
    const baseColumns: Column<T>[] = batchColumns<T>();

    // Add action column at the end
    const actionColumn: Column<T> = {
      key: "_actions",
      header: "",
      visible: true,
      width: 100,
      sortable: false,
      align: "center",
      render: (item) => {
        return (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectItem(item);
            }}
          >
            Select
          </Button>
        );
      },
    };

    return [...baseColumns, actionColumn];
  }, [getItemId, handleSelectItem]);

  const handleClose = useCallback(() => {
    setSearchTerm("");
    onClose();
  }, [onClose]);

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title="Select Product Batch"
      maxWidth="md"
      fullWidth={true}
      showCloseButton={true}
      disableEscapeKeyDown={false}
      disableBackdropClick={false}
      dialogContentSx={{ py: 2 }}
      titleSx={{ fontWeight: "medium" }}
      actionsSx={{ px: 2, py: 1 }}
      closeButtonSx={{ color: theme.palette.text.secondary }}
      actions={
        <>
          <SmartButton text="Cancel" onClick={handleClose} variant="outlined" color="secondary" icon={Close} />
        </>
      }
    >
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select a batch from the available options below:
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={"Search..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
        </Box>

        {data.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            <CustomGrid<T>
              columns={finalColumns}
              data={data}
              maxHeight={`400px`}
              searchTerm={searchTerm}
              rowKeyField={"grnDetID"}
              density="medium"
              showDensityControls={false}
              emptyStateMessage="No batches available"
            />
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No batches available</Typography>
          </Box>
        )}
      </Box>
    </GenericDialog>
  );
}

export default BatchSelectionDialog;
