import React, { useState, useEffect } from "react";
import { Grid, Typography, Box } from "@mui/material";
import { Edit } from "@mui/icons-material";
import CustomSwitch from "../Checkbox/ColorSwitch";
import CustomGrid from "../CustomGrid/CustomGrid";
import CustomButton from "../Button/CustomButton";
import GenericDialog from "./GenericDialog";
import Close from "@mui/icons-material/Close";
import FormField from "../FormField/FormField";

interface CommonSearchDialogProps<T> {
  open: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  title: string;
  fetchItems: () => Promise<T[]>;
  updateActiveStatus: (id: number, status: boolean) => Promise<boolean>;
  columns: Array<{
    key: string;
    header: string;
    visible: boolean;
    render?: (row: T) => React.ReactNode;
  }>;
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
}

function GenericAdvanceSearch<T>({
  open,
  onClose,
  onSelect,
  title,
  fetchItems,
  updateActiveStatus,
  columns,
  getItemId,
  getItemActiveStatus,
  searchPlaceholder,
  onSearch,
  dialogProps,
  isEditButtonVisible = false,
  isStatusVisible = false,
  isActionVisible = false,
}: CommonSearchDialogProps<T>) {
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>(
    {}
  );
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
    onClose();
    onSelect(item);
  };

  const handleSwitchChange = async (item: T, checked: boolean) => {
    const success = await updateActiveStatus(getItemId(item), checked);
    if (success) {
      setSwitchStatus((prev) => ({ ...prev, [getItemId(item)]: checked }));
    }
  };

  const dataWithIndex = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: switchStatus[getItemId(item)] ? "Active" : "Hidden",
  }));

  const enhancedColumns = [
    {
      key: "edit",
      header: "Edit",
      visible: isEditButtonVisible,
      render: (row: T & { serialNumber: number; Status: string }) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row)}
          icon={Edit}
          size="small"
        />
      ),
    },
    ...columns.map((column) => ({
      ...column,
      render: column.render
        ? (row: T & { serialNumber: number; Status: string }) =>
          column.render!(row) as React.ReactElement<any>
        : undefined,
    })),
    {
      key: "status",
      header: "Status",
      visible: isStatusVisible,
      render: (row: T & { serialNumber: number; Status: string }) => (
        <Typography variant="body2">
          {switchStatus[getItemId(row)] ? "Active" : "Hidden"}
        </Typography>
      ),
    },
    {
      key: "action",
      header: "Action",
      visible: isActionVisible,
      render: (row: T & { serialNumber: number; Status: string }) => (
        <CustomSwitch
          size="small"
          color="secondary"
          checked={switchStatus[getItemId(row)]}
          onChange={(event) => handleSwitchChange(row, event.target.checked)}
        />
      ),
    },
  ];

  const handleDialogClose = () => {
    setSearchTerm("");
    onClose();
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      <CustomGrid
        columns={enhancedColumns}
        data={dataWithIndex}
        searchTerm={searchTerm}
      />
    </>
  );

  const dialogActions = (
    <CustomButton
      variant="contained"
      text="Close"
      icon={Close}
      size="medium"
      onClick={handleDialogClose}
      color="secondary"
    />
  );

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
