import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TableSortLabel,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Edit, Search } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { useAppSelector } from "@/store/hooks";
import CustomButton from "../Button/CustomButton";
import CustomSwitch from "../Checkbox/ColorSwitch";
import GenericDialog from "./GenericDialog";

type ExtendedItem<T> = T & {
  serialNumber: number;
  Status: string;
};

export interface Column<T> {
  key: keyof T & string;
  header: string;
  visible?: boolean;
  sortable?: boolean;
  width?: string | number;
  render?: (item: T, rowIndex: number, columnIndex: number) => React.ReactNode;
}

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
  isStatusVisible?: ((item: T) => boolean) | boolean;
  isActionVisible?: ((item: T) => boolean) | boolean;
  showExportCSV?: boolean;
  showExportPDF?: boolean;
  pagination?: boolean;
  customFilter?: (item: T, searchValue: string) => boolean;
}

type Order = "asc" | "desc";

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
  customFilter,
}: CommonSearchDialogProps<T>) {
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("");
  const user = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (open) {
      fetchAllItems();
    } else {
      setSearchTerm("");
      setDataLoaded(false);
    }
  }, [open]);

  const fetchAllItems = async () => {
    setIsLoading(true);
    setDataLoaded(false);
    try {
      const items = await fetchItems();

      if (!Array.isArray(items)) {
        console.error("Fetched items is not an array:", items);
        setSearchResults([]);
        return;
      }

      const initialSwitchStatus = items.reduce((statusMap, item) => {
        if (item && getItemId(item)) {
          statusMap[getItemId(item)] = getItemActiveStatus(item);
        }
        return statusMap;
      }, {} as { [key: number]: boolean });

      setSwitchStatus(initialSwitchStatus);
      setSearchResults(items);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error fetching items:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAndClose = (rowIndex: number) => {
    if (!dataLoaded) {
      console.error("Data not yet loaded");
      return;
    }

    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      console.error("No search results available");
      return;
    }

    if (rowIndex < 0 || rowIndex >= searchResults.length) {
      console.error(`Invalid row index: ${rowIndex}. Available rows: ${searchResults.length}`);
      return;
    }

    const item = searchResults[rowIndex];
    if (!item) {
      console.error("Item not found at index:", rowIndex);
      return;
    }

    if (!getItemId(item)) {
      console.error("Selected item is missing ID:", item);
      return;
    }

    onClose();
    onSelect(item);
  };

  const handleSwitchChange = async (item: ExtendedItem<T>, checked: boolean) => {
    try {
      const success = await updateActiveStatus(getItemId(item), checked);
      if (success) {
        setSwitchStatus((prev) => ({ ...prev, [getItemId(item)]: checked }));
        fetchAllItems();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const stableSort = <T extends Record<string, any>>(array: T[], comparator: (a: T, b: T) => number) => {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order: Order, orderBy: string): ((a: any, b: any) => number) => {
    return order === "desc" ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = <T extends Record<string, any>>(a: T, b: T, orderBy: string): number => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

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

  // Add serial numbers and status information to each item
  const dataWithIndex: ExtendedItem<T>[] = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: switchStatus[getItemId(item)] ? "Active" : "Hidden",
  }));

  // Prepare the columns including the edit, status, and action columns
  const enhancedColumns = React.useMemo(() => {
    const editColumn: Column<ExtendedItem<T>> | null = isEditButtonVisible
      ? {
          key: "edit" as keyof ExtendedItem<T> & string,
          header: "Edit",
          visible: true,
          sortable: false,
          render: (item: ExtendedItem<T>, rowIndex: number) => {
            const canEdit = (item.modifyYN === "Y" || user?.adminYN === "Y" || item.modifyYN === undefined) && isEditButtonVisible;
            return canEdit ? <CustomButton text="Edit" onClick={() => handleEditAndClose(rowIndex)} icon={Edit} size="small" disabled={isLoading || !dataLoaded} /> : null;
          },
        }
      : null;

    const statusColumn: Column<ExtendedItem<T>> | null = isStatusVisible
      ? {
          key: "Status" as keyof ExtendedItem<T> & string,
          header: "Status",
          visible: true,
          sortable: false,
          render: (item: ExtendedItem<T>) => {
            const shouldBeVisible = (typeof isStatusVisible === "function" && isStatusVisible(item)) || item.modifyYN === undefined;
            return shouldBeVisible ? <Typography variant="body2">{switchStatus[getItemId(item)] ? "Active" : "Hidden"}</Typography> : null;
          },
        }
      : null;

    const actionColumn: Column<ExtendedItem<T>> | null = isActionVisible
      ? {
          key: "action" as keyof ExtendedItem<T> & string,
          header: "Action",
          visible: true,
          sortable: false,
          render: (item: ExtendedItem<T>) => {
            const shouldBeVisible = (typeof isActionVisible === "function" && isActionVisible(item)) || item.modifyYN === undefined;
            return shouldBeVisible ? (
              <CustomSwitch
                size="small"
                color="secondary"
                checked={switchStatus[getItemId(item)] ?? false}
                onChange={(event) => handleSwitchChange(item, event.target.checked)}
                disabled={isLoading}
              />
            ) : null;
          },
        }
      : null;

    // Convert original columns to work with ExtendedItem<T>
    const convertedColumns: Column<ExtendedItem<T>>[] = originalColumns.map((col) => ({
      ...col,
      key: col.key as keyof ExtendedItem<T> & string,
      render: col.render ? (item: ExtendedItem<T>, rowIndex: number, columnIndex: number) => col.render!(item, rowIndex, columnIndex) : undefined,
    }));

    return [...(editColumn ? [editColumn] : []), ...convertedColumns, ...(statusColumn ? [statusColumn] : []), ...(actionColumn ? [actionColumn] : [])] as Column<
      ExtendedItem<T>
    >[];
  }, [isEditButtonVisible, isStatusVisible, isActionVisible, originalColumns, switchStatus, searchResults, isLoading]);

  // Filter the data based on search term or custom filter
  const filteredData = dataWithIndex.filter((item) => {
    if (customFilter) {
      return customFilter(item as T, searchTerm);
    }

    if (!searchTerm) return true;

    // Default search on all visible string or number fields
    return Object.entries(item).some(([key, value]) => {
      const column = enhancedColumns.find((col) => col.key === key);
      if (column && column.visible !== false) {
        const valueStr = String(value).toLowerCase();
        return valueStr.includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });

  // Apply sorting
  const sortedData = orderBy ? stableSort(filteredData, getComparator(order, orderBy)) : filteredData;

  // Apply pagination
  const paginatedData = pagination ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : sortedData;

  const renderTableCell = (item: ExtendedItem<T>, column: Column<ExtendedItem<T>>, rowIndex: number, columnIndex: number) => {
    if (column.render) {
      return column.render(item, rowIndex, columnIndex);
    }

    // Default rendering for cells without custom render function
    return String(item[column.key] || "");
  };

  const dialogContent = (
    <>
      <Box mb={2}>
        <Grid container>
          {/* Replacing FormField with TextField component */}
          <TextField
            fullWidth
            type="search"
            label="Search"
            value={searchTerm}
            onChange={handleSearchInputChange}
            name="search"
            id="SearchField"
            placeholder={searchPlaceholder}
            variant="outlined"
            size="small"
            InputProps={{
              type: "search",
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small" aria-label="search results table">
          <TableHead>
            <TableRow>
              {enhancedColumns
                .filter((column) => column.visible !== false)
                .map((column, index) => (
                  <TableCell key={column.key}>
                    {column.sortable !== false ? (
                      <TableSortLabel active={orderBy === column.key} direction={orderBy === column.key ? order : "asc"} onClick={() => handleRequestSort(column.key)}>
                        {column.header}
                      </TableSortLabel>
                    ) : (
                      column.header
                    )}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <TableRow key={getItemId(item) || rowIndex} hover>
                  {enhancedColumns
                    .filter((column) => column.visible !== false)
                    .map((column, columnIndex) => (
                      <TableCell key={`${getItemId(item)}-${column.key}`}>{renderTableCell(item, column, rowIndex, columnIndex)}</TableCell>
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={enhancedColumns.filter((col) => col.visible !== false).length} align="center">
                  <Typography variant="body2">No results found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
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
        ...(dialogProps?.dialogContentSx || {}),
      }}
    >
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        dialogContent
      )}
    </GenericDialog>
  );
}

export default GenericAdvanceSearch;
