import React, { useState, useEffect } from "react";
import { Grid, Typography, Box } from "@mui/material";
import { Edit } from "@mui/icons-material";
import CustomSwitch from "../Checkbox/ColorSwitch";
import CustomGrid, { Column } from "../CustomGrid/CustomGrid";
import CustomButton from "../Button/CustomButton";
import GenericDialog from "./GenericDialog";
import Close from "@mui/icons-material/Close";
import FormField from "../FormField/FormField";

type ExtendedItem<T> = T & {
  serialNumber: number;
  Status: string;
};
interface CommonSearchDialogProps<T> {
  open: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  title: string;
  fetchItems: () => Promise<T[]>;
  updateActiveStatus: (id: number, status: boolean) => Promise<boolean>;
  columns: Column<T>[];
  getItemId: (item: T) => number;
  getItemActiveStatus: (item: T) => boolean;
  searchPlaceholder: string;
  onSearch?: (searchQuery: string) => void;
  dialogProps?: {
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
    fullWidth?: boolean;
    dialogContentSx?: React.CSSProperties;
  };
  isEditButtonVisible?: boolean;
  isStatusVisible?: boolean;
  isActionVisible?: boolean;
  showExportCSV?: boolean;
  showExportPDF?: boolean;
  pagination?: boolean;
}

function GenericAdvanceSearch<T extends Record<string, any>>({
  open,
  onClose,
  onSelect,
  title,
  fetchItems,
  updateActiveStatus,
  columns: originalColumns,
  getItemId,
  getItemActiveStatus,
  searchPlaceholder,
  onSearch,
  dialogProps,
  isEditButtonVisible = false,
  isStatusVisible = false,
  isActionVisible = false,
  showExportCSV = false,
  showExportPDF = false,
  pagination = false,
}: CommonSearchDialogProps<T>) {
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<T[]>([]);

  useEffect(() => {
    if (open) {
      fetchAllItems();
    }
  }, [open]);

  const fetchAllItems = async () => {
    const items = await fetchItems();
    const initialSwitchStatus = items.reduce(
      (statusMap, item) => {
        statusMap[getItemId(item)] = getItemActiveStatus(item);
        return statusMap;
      },
      {} as { [key: number]: boolean }
    );
    setSwitchStatus(initialSwitchStatus);
    setSearchResults(items);
  };

  const handleEditAndClose = (item: T) => {
    debugger;
    onClose();
    onSelect(item);
  };

  const handleSwitchChange = async (item: ExtendedItem<T>, checked: boolean) => {
    const success = await updateActiveStatus(getItemId(item), checked);
    if (success) {
      setSwitchStatus((prev) => ({ ...prev, [getItemId(item)]: checked }));
    }
  };

  const dataWithIndex: ExtendedItem<T>[] = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: switchStatus[getItemId(item)] ? "Active" : "Hidden",
  }));

  const enhancedColumns = React.useMemo(() => {
    const editColumn: Column<ExtendedItem<T>> | null = isEditButtonVisible
      ? {
          key: "edit" as keyof ExtendedItem<T> & string,
          header: "Edit",
          visible: true,
          sortable: false,
          render: (_item: ExtendedItem<T>, rowIndex: number) => <CustomButton text="Edit" onClick={() => handleEditAndClose(searchResults[rowIndex])} icon={Edit} size="small" />,
        }
      : null;
    const statusColumn: Column<ExtendedItem<T>> | null = isStatusVisible
      ? {
          key: "Status" as keyof ExtendedItem<T> & string,
          header: "Status",
          visible: true,
          sortable: false,
          render: (item: ExtendedItem<T>) => <Typography variant="body2">{switchStatus[getItemId(item)] ? "Active" : "Hidden"}</Typography>,
        }
      : null;
    const actionColumn: Column<ExtendedItem<T>> | null = isActionVisible
      ? {
          key: "action" as keyof ExtendedItem<T> & string,
          header: "Action",
          visible: true,
          sortable: false,
          render: (item: ExtendedItem<T>) => (
            <CustomSwitch size="small" color="secondary" checked={switchStatus[getItemId(item)]} onChange={(event) => handleSwitchChange(item, event.target.checked)} />
          ),
        }
      : null;
    const convertedColumns: Column<ExtendedItem<T>>[] = originalColumns.map((col) => ({
      ...col,
      key: col.key as keyof ExtendedItem<T> & string,
      render: col.render ? (item: ExtendedItem<T>, rowIndex: number, columnIndex: number) => col.render!(item, rowIndex, columnIndex) : undefined,
    }));
    return [...(editColumn ? [editColumn] : []), ...convertedColumns, ...(statusColumn ? [statusColumn] : []), ...(actionColumn ? [actionColumn] : [])] as Column<
      ExtendedItem<T>
    >[];
  }, [isEditButtonVisible, isStatusVisible, isActionVisible, originalColumns, switchStatus, searchResults]);

  const handleDialogClose = () => {
    setSearchTerm("");
    onClose();
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    if (onSearch) {
      onSearch(newSearchTerm);
    }
  };

  const dialogContent = (
    <>
      <Box>
        <Grid container>
          <FormField
            type="search"
            label="Search"
            value={searchTerm}
            onChange={handleSearchInputChange}
            name="search"
            ControlID="SearchField"
            placeholder={searchPlaceholder}
            InputProps={{
              type: "search",
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Box>

      <CustomGrid columns={enhancedColumns} data={dataWithIndex} searchTerm={searchTerm} showExportCSV={showExportCSV} showExportPDF={showExportPDF} pagination={pagination} />
    </>
  );

  const dialogActions = <CustomButton variant="contained" text="Close" icon={Close} size="medium" onClick={handleDialogClose} color="secondary" />;
  return (
    <GenericDialog
      open={open}
      onClose={handleDialogClose}
      title={title}
      maxWidth={dialogProps?.maxWidth || "lg"}
      fullWidth
      showCloseButton
      actions={dialogActions}
      disableBackdropClick
      disableEscapeKeyDown
      dialogContentSx={{
        minHeight: "600px",
        maxHeight: "600px",
        overflowY: "auto",
      }}
    >
      {dialogContent}
    </GenericDialog>
  );
}

export default GenericAdvanceSearch;
