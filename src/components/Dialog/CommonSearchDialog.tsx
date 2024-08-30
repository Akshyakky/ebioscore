import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  Box,
} from "@mui/material";

import { Close, Edit } from "@mui/icons-material";
import CustomSwitch from "../Checkbox/ColorSwitch";
import FloatingLabelTextBox from "../TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomGrid from "../CustomGrid/CustomGrid";
import CustomButton from "../Button/CustomButton";

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
}

function CommonSearchDialog<T>({
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
      visible: true,
      render: (
        row: T & { serialNumber: number; Status: string },
        rowIndex: number,
        columnIndex: number
      ) =>
        (
          <CustomButton
            text="Edit"
            onClick={() => handleEditAndClose(row)}
            icon={Edit}
          />
        ) as JSX.Element, // Ensure return type is JSX.Element
    },
    ...columns.map((column) => ({
      ...column,
      render: column.render
        ? (
            row: T & { serialNumber: number; Status: string },
            rowIndex: number,
            columnIndex: number
          ) => column.render!(row) as JSX.Element // Ensure return type is JSX.Element
        : undefined,
    })),
    {
      key: "status",
      header: "Status",
      visible: true,
      render: (
        row: T & { serialNumber: number; Status: string },
        rowIndex: number,
        columnIndex: number
      ) =>
        (
          <Typography variant="body2">
            {switchStatus[getItemId(row)] ? "Active" : "Hidden"}
          </Typography>
        ) as JSX.Element, // Ensure return type is JSX.Element
    },
    {
      key: "action",
      header: "Action",
      visible: true,
      render: (
        row: T & { serialNumber: number; Status: string },
        rowIndex: number,
        columnIndex: number
      ) =>
        (
          <CustomSwitch
            size="medium"
            color="secondary"
            checked={switchStatus[getItemId(row)]}
            onChange={(event) => handleSwitchChange(row, event.target.checked)}
          />
        ) as JSX.Element, // Ensure return type is JSX.Element
    },
  ];

  const handleDialogClose = () => {
    setSearchTerm("");
    onClose();
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleDialogClose();
        }
      }}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box>
          <Typography variant="h6" id="resource-list-header">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{ minHeight: "600px", maxHeight: "600px", overflowY: "auto" }}
      >
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <FloatingLabelTextBox
                ControlID="SearchTerm"
                title="Search"
                value={searchTerm}
                onChange={handleSearchInputChange}
                placeholder={searchPlaceholder}
                size="small"
                autoComplete="off"
              />
            </Grid>
          </Grid>
        </Box>
        <CustomGrid
          columns={enhancedColumns}
          data={dataWithIndex}
          searchTerm={searchTerm}
        />
      </DialogContent>
      <DialogActions>
        <CustomButton
          variant="contained"
          text="Close"
          icon={Close}
          size="medium"
          onClick={handleDialogClose}
          color="secondary"
        />
      </DialogActions>
    </Dialog>
  );
}

export default CommonSearchDialog;
