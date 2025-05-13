import React, { useState, useEffect, useCallback } from "react";
import { Grid, Typography, Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { Edit } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { useAppSelector } from "@/store/hooks";
import CustomGrid, { Column } from "../CustomGrid/CustomGrid";
import CustomButton from "../Button/CustomButton";
import CustomSwitch from "../Checkbox/ColorSwitch";
import FormField from "../FormField/FormField";
import GenericDialog from "./GenericDialog";
import { DateFilterType } from "@/interfaces/Common/FilterDto";
import { debug } from "console";

type ExtendedItem<T> = T & {
  serialNumber: number;
  Status: string;
};

interface FilterOption {
  value: string | number;
  label: string;
}

interface FilterConfig {
  name: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string | number;
}

interface CommonSearchDialogProps<T> {
  open: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  title: string;
  fetchItems: () => Promise<T[]>;
  items?: T[];
  updateActiveStatus: (id: number, status: boolean) => Promise<boolean>;
  columns: Column<T>[];
  getItemId: (item: T) => number;
  getItemActiveStatus: (item: T) => boolean;
  searchPlaceholder: string;
  onSearchChange?: (value: string) => void;
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
  showFilters?: boolean;
  filterConfigs?: FilterConfig[];
  onFilterChange?: (filterName: string, value: string | number) => void;
  dateFilterOptions?: {
    showDateFilter?: boolean;
    onDateFilterChange?: (filterType: DateFilterType) => void;
    onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
  };
  onEdit?: (item: T) => void;
}

function EnhancedGenericAdvanceSearch<T extends Record<string, any>>({
  open,
  onClose,
  onSelect,
  title,
  fetchItems,
  items,
  updateActiveStatus,
  columns: originalColumns,
  searchPlaceholder,
  onSearch,
  onSearchChange,
  dialogProps,
  isEditButtonVisible = false,
  isStatusVisible = false,
  isActionVisible = false,
  showExportCSV = false,
  showExportPDF = false,
  pagination = false,
  customFilter,
  showFilters = false,
  filterConfigs = [],
  onFilterChange,
  dateFilterOptions,
  onEdit,
  getItemId,
  getItemActiveStatus,
}: CommonSearchDialogProps<T>) {
  const [switchStatus, setSwitchStatus] = useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const user = useAppSelector((state) => state.auth);

  const [filterValues, setFilterValues] = useState<{ [key: string]: string | number }>({});
  const [dateFilter, setDateFilter] = useState<DateFilterType>(DateFilterType.All);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (open) {
      const initialFilterValues = filterConfigs.reduce((acc, config) => {
        acc[config.name] = config.defaultValue !== undefined ? config.defaultValue : "";
        return acc;
      }, {} as { [key: string]: string | number });
      setFilterValues(initialFilterValues);
      if (!items) {
        fetchAllItems();
      }
    } else {
      setSearchTerm("");
      setDataLoaded(false);
      resetFilters();
    }
  }, [open]);

  useEffect(() => {
    debugger;
    if (items && Array.isArray(items)) {
      setSearchResults(items);
      const initialSwitchStatus = items.reduce((statusMap, item) => {
        statusMap[getItemId(item)] = getItemActiveStatus(item);
        return statusMap;
      }, {} as { [key: number]: boolean });

      setSwitchStatus(initialSwitchStatus);
      setDataLoaded(true);
    }
  }, [items, getItemId, getItemActiveStatus]);

  const handleEditClick = (item: T) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const resetFilters = () => {
    const initialFilterValues = filterConfigs.reduce((acc, config) => {
      acc[config.name] = config.defaultValue !== undefined ? config.defaultValue : "";
      return acc;
    }, {} as { [key: string]: string | number });

    setFilterValues(initialFilterValues);
    setDateFilter(DateFilterType.All);
    setStartDate(null);
    setEndDate(null);
  };

  const fetchAllItems = async () => {
    setIsLoading(true);
    setDataLoaded(false);
    try {
      const fetchedItems = await fetchItems();
      console.log("Fetched items:", fetchedItems);

      if (!Array.isArray(fetchedItems)) {
        console.error("Fetched items is not an array:", fetchedItems);
        setSearchResults([]);
        return;
      }

      const initialSwitchStatus = fetchedItems.reduce((statusMap, item) => {
        if (item && getItemId(item)) {
          statusMap[getItemId(item)] = getItemActiveStatus(item);
        }
        return statusMap;
      }, {} as { [key: number]: boolean });

      setSwitchStatus(initialSwitchStatus);
      setSearchResults(fetchedItems);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error fetching items:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAndClose = useCallback(
    (rowIndex: number) => {
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
    },
    [searchResults, dataLoaded, onClose, onSelect, getItemId]
  );

  const handleSwitchChange = async (item: ExtendedItem<T>, checked: boolean) => {
    try {
      debugger;
      // Toggle the status from the current state
      const newStatus = checked ? "Y" : "N"; // Update to 'Y' if checked, else 'N'

      // Update the status in the backend or perform the action
      const success = await updateActiveStatus(getItemId(item), newStatus === "Y"); // Pass boolean for status change

      if (success) {
        // Update the local state after the backend has successfully updated
        setSwitchStatus((prev) => ({ ...prev, [getItemId(item)]: checked }));
        setSearchResults((prev) => prev.map((row) => (getItemId(row) === getItemId(item) ? { ...row, rActiveYN: newStatus } : row)));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const dataWithIndex: ExtendedItem<T>[] = searchResults.map((item, index) => ({
    ...item,
    serialNumber: index + 1,
    Status: item.rActiveYN === "Y" ? "Active" : "Hidden",
  }));

  const enhancedColumns = React.useMemo(() => {
    const editColumn: Column<ExtendedItem<T>> | null = isEditButtonVisible
      ? {
          key: "edit" as keyof ExtendedItem<T> & string,
          header: "Edit",
          visible: true,
          sortable: false,
          render: (item: ExtendedItem<T>) => {
            return <CustomButton text="Edit" onClick={() => handleEditClick(item)} icon={Edit} size="small" disabled={isLoading || !dataLoaded} />;
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
            // Check if the item is active based on rActiveYN or default to true
            const isItemActive = item.rActiveYN === "Y" || item.rActiveYN === undefined;
            const shouldBeVisible = (typeof isStatusVisible === "function" ? isStatusVisible(item) : isStatusVisible) && isItemActive;

            return shouldBeVisible ? <Typography variant="body2">{isItemActive ? "Active" : "Hidden"}</Typography> : null;
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
            // Check if the item is active based on rActiveYN or default to true
            const isItemActive = item.rActiveYN === "Y" || item.rActiveYN === undefined;
            const shouldBeVisible = (typeof isActionVisible === "function" ? isActionVisible(item) : isActionVisible) && isItemActive;

            return shouldBeVisible ? (
              <CustomSwitch size="small" color="secondary" checked={isItemActive} onChange={(event) => handleSwitchChange(item, event.target.checked)} disabled={isLoading} />
            ) : null;
          },
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
  }, [
    isEditButtonVisible,
    isStatusVisible,
    isActionVisible,
    originalColumns,
    switchStatus,
    searchResults,
    isLoading,
    dataLoaded,
    user?.adminYN,
    handleEditAndClose,
    handleSwitchChange,
  ]);

  const handleDialogClose = () => {
    setSearchTerm("");
    onClose();
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    if (onSearchChange) {
      onSearchChange(newSearchTerm);
    }
    if (onSearch) {
      onSearch(newSearchTerm);
    }
  };

  const handleFilterChange = (filterName: string, event: SelectChangeEvent) => {
    const value = event.target.value;
    console.log(`Filter changed in component: ${filterName} = ${value}`);

    setFilterValues((prev) => ({ ...prev, [filterName]: value }));

    if (onFilterChange) {
      onFilterChange(filterName, value);
    }
  };

  const handleDateFilterChange = (event: SelectChangeEvent) => {
    const value = Number(event.target.value);
    console.log(`Date filter changed in component: ${value}`);

    setDateFilter(value as DateFilterType);

    if (dateFilterOptions?.onDateFilterChange) {
      dateFilterOptions.onDateFilterChange(value as DateFilterType);
    }
  };

  const handleDateRangeChange = (type: "start" | "end", date: Date | null) => {
    if (type === "start") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }

    if (dateFilterOptions?.onDateRangeChange) {
      if (type === "start" && endDate) {
        dateFilterOptions.onDateRangeChange(date, endDate);
      } else if (type === "end" && startDate) {
        dateFilterOptions.onDateRangeChange(startDate, date);
      }
    }
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <Grid container spacing={2} mb={2}>
        {filterConfigs.map((config) => (
          <Grid size={{ xs: 12, md: 3 }} key={config.name}>
            <FormControl fullWidth size="small">
              <InputLabel id={`${config.name}-label`}>{config.label}</InputLabel>
              <Select
                labelId={`${config.name}-label`}
                id={`${config.name}-select`}
                label={config.label}
                value={filterValues[config.name]?.toString() || ""}
                onChange={(e) => handleFilterChange(config.name, e)}
              >
                {config.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}

        {dateFilterOptions?.showDateFilter && (
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="date-filter-label">Date Filter</InputLabel>
              <Select labelId="date-filter-label" id="date-filter-select" label="Date Filter" value={dateFilter.toString()} onChange={handleDateFilterChange}>
                <MenuItem value={DateFilterType.All}>All</MenuItem>
                <MenuItem value={DateFilterType.Today}>Today</MenuItem>
                <MenuItem value={DateFilterType.Yesterday}>Yesterday</MenuItem>
                <MenuItem value={DateFilterType.ThisWeek}>This Week</MenuItem>
                <MenuItem value={DateFilterType.ThisMonth}>This Month</MenuItem>
                <MenuItem value={DateFilterType.ThisYear}>This Year</MenuItem>
                <MenuItem value={DateFilterType.DateRange}>Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {dateFilter === DateFilterType.DateRange && (
          <>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormField
                type="date"
                label="Start Date"
                value={startDate ? startDate.toISOString().split("T")[0] : ""}
                onChange={(e) => handleDateRangeChange("start", e.target.value ? new Date(e.target.value) : null)}
                name="startDate"
                ControlID="StartDateField"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormField
                type="date"
                label="End Date"
                value={endDate ? endDate.toISOString().split("T")[0] : ""}
                onChange={(e) => handleDateRangeChange("end", e.target.value ? new Date(e.target.value) : null)}
                name="endDate"
                ControlID="EndDateField"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  const dialogContent = (
    <>
      <Box>
        <Grid container mb={2}>
          <Grid size={{ xs: 12 }}>
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
        </Grid>

        {renderFilters()}
      </Box>

      <CustomGrid
        columns={enhancedColumns}
        data={dataWithIndex}
        searchTerm={searchTerm}
        showExportCSV={showExportCSV}
        showExportPDF={showExportPDF}
        pagination={pagination}
        customFilter={customFilter ? (item: ExtendedItem<T>, searchValue: string) => customFilter(item as T, searchValue) : undefined}
      />
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

export default EnhancedGenericAdvanceSearch;
