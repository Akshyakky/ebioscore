import SmartButton from "@/components/Button/SmartButton";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { AddCircle, CheckCircle, Close, Search } from "@mui/icons-material";
import { Box, Button, Chip, TextField, Typography, alpha, useTheme } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";

export interface BatchSelectionColumn<T = any> {
  field: keyof T | string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  type?: "string" | "number" | "date" | "boolean";
  renderCell?: (item: T, rowIndex: number, columnIndex: number) => React.ReactNode;
  valueGetter?: (item: T) => any;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
}

export interface BatchSelectionDialogProps<T = any> {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedItem: T) => void;
  data: T[];
  columns?: BatchSelectionColumn<T>[];
  title?: string;
  subtitle?: string;
  idField?: keyof T;
  selectionField?: keyof T;
  defaultColumns?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  selectButtonIcon?: React.ElementType;
  height?: number;
  multiSelect?: boolean;
  selectedItems?: T[];
  getRowId?: (row: T) => string | number;
}

// Default batch columns
const getDefaultBatchColumns = <T extends Record<string, any>>(): Column<T>[] => [
  {
    key: "batchNo",
    header: "Batch No",
    visible: true,
    width: 150,
    sortable: false,
  },
  {
    key: "chUnits",
    header: "Available Qty",
    visible: true,
    width: 120,
    sortable: false,
    type: "number",
    render: (item) => <Chip label={item.chUnits || 0} size="small" color={item.chUnits > 10 ? "success" : item.chUnits > 0 ? "warning" : "error"} variant="outlined" />,
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
    key: "hCValue",
    header: "Unit Price",
    visible: true,
    width: 120,
    sortable: false,
    type: "number",
    render: (item) => (
      <Typography variant="body2" fontWeight="medium">
        ₹{(item.hCValue || 0).toFixed(2)}
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

function BatchSelectionDialog<T extends Record<string, any>>({
  open,
  onClose,
  onSelect,
  data,
  columns,
  title = "Select Product Batch",
  subtitle = "Select a batch from the available options below:",
  idField = "grnDetID" as keyof T,
  selectionField = "batchNo" as keyof T,
  defaultColumns = true,
  maxWidth = "md",
  fullWidth = true,
  showSearch = false,
  searchPlaceholder = "Search...",
  height = 400,
  multiSelect = false,
  selectedItems = [],
  getRowId,
}: BatchSelectionDialogProps<T>) {
  const theme = useTheme();
  const [selectedMultipleItems, setSelectedMultipleItems] = useState<T[]>(selectedItems);
  const [searchTerm, setSearchTerm] = useState("");

  const getItemId = useCallback(
    (item: T | null) => {
      if (!item) return null;
      return getRowId ? getRowId(item) : idField ? item[idField] : null;
    },
    [idField, getRowId]
  );

  const handleSelectItem = useCallback(
    (item: T) => {
      if (multiSelect) {
        const itemId = getItemId(item);
        const isSelected = selectedMultipleItems.some((selected) => getItemId(selected) === itemId);

        if (isSelected) {
          setSelectedMultipleItems(selectedMultipleItems.filter((selected) => getItemId(selected) !== itemId));
        } else {
          setSelectedMultipleItems([...selectedMultipleItems, item]);
        }
      } else {
        onSelect(item);
        onClose();
      }
    },
    [multiSelect, selectedMultipleItems, getItemId, onSelect, onClose]
  );

  const handleMultiSelectComplete = useCallback(() => {
    selectedMultipleItems.forEach((item) => onSelect(item));
    onClose();
  }, [selectedMultipleItems, onSelect, onClose]);

  // Convert BatchSelectionColumn to Column
  const convertToColumn = (col: BatchSelectionColumn<T>): Column<T> => {
    return {
      key: String(col.field),
      header: col.headerName,
      visible: true,
      width: col.width,
      sortable: col.sortable,
      type: col.type === "string" ? "text" : col.type === "number" ? "number" : col.type === "date" ? "date" : "custom",
      render: col.renderCell,
      align: col.align,
    };
  };

  // Merge default columns with custom columns and add action column
  const finalColumns: Column<T>[] = useMemo(() => {
    const baseColumns: Column<T>[] = columns ? columns.map(convertToColumn) : defaultColumns ? getDefaultBatchColumns<T>() : [];

    // Add action column at the end
    const actionColumn: Column<T> = {
      key: "_actions",
      header: multiSelect ? "Action" : "",
      visible: true,
      width: multiSelect ? 120 : 100,
      sortable: false,
      align: "center",
      render: (item) => {
        if (multiSelect) {
          const itemId = getItemId(item);
          const isSelected = selectedMultipleItems.some((selected) => getItemId(selected) === itemId);

          return (
            <Button
              size="small"
              variant={isSelected ? "contained" : "outlined"}
              color={isSelected ? "success" : "primary"}
              startIcon={isSelected ? <CheckCircle /> : <AddCircle />}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectItem(item);
              }}
              sx={{ minWidth: 90 }}
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
          );
        }

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
  }, [columns, defaultColumns, multiSelect, selectedMultipleItems, getItemId, handleSelectItem]);

  const handleClose = useCallback(() => {
    setSelectedMultipleItems([]);
    setSearchTerm("");
    onClose();
  }, [onClose]);

  return (
    <GenericDialog
      open={open}
      onClose={handleClose}
      title={title}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
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
          {multiSelect && selectedMultipleItems.length > 0 && (
            <SmartButton text={`Confirm Selection (${selectedMultipleItems.length})`} onClick={handleMultiSelectComplete} variant="contained" color="primary" />
          )}
        </>
      }
    >
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>

        {showSearch && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
              }}
            />
          </Box>
        )}

        {multiSelect && selectedMultipleItems.length > 0 && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: 1 }}>
            <Typography variant="body2" color="success.main" fontWeight="medium">
              {selectedMultipleItems.length} item{selectedMultipleItems.length > 1 ? "s" : ""} selected
            </Typography>
          </Box>
        )}

        {data.length > 0 ? (
          <Box sx={{ width: "100%" }}>
            <CustomGrid<T>
              columns={finalColumns}
              data={data}
              maxHeight={`${height}px`}
              searchTerm={searchTerm}
              rowKeyField={idField}
              density="medium"
              showDensityControls={false}
              pagination={data.length > 10}
              pageSize={10}
              emptyStateMessage="No batches available"
              gridStyle={{
                "& .MuiTableRow-root:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                "& .MuiTableHead-root": {
                  "& .MuiTableCell-root": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    fontWeight: 600,
                  },
                },
                "& .MuiTableBody-root": {
                  "& .MuiTableCell-root": {
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  },
                },
              }}
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
