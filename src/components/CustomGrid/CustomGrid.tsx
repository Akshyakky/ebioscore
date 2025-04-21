import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Checkbox,
  IconButton,
  Button,
  Popover,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Drawer,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FilterList as FilterListIcon, GetApp as ExportIcon, ExpandMore, ExpandLess, DragIndicator, Settings as SettingsIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import "jspdf-autotable";
import { exportToPDF } from "./exportToPDF";

export interface ColumnFilter {
  type: "text" | "number" | "date" | "select";
  value: any;
  options?: { label: string; value: any }[];
}
type SingleArgumentFormatter = (value: any) => string | React.ReactNode;
type TwoArgumentFormatter<T> = (value: any, row: T) => string | React.ReactNode;
export interface Column<T> {
  key: string;
  header: string;
  visible: boolean;
  sortable?: boolean;
  filterable?: boolean;
  filter?: ColumnFilter;
  render?: (item: T, rowIndex: number, columnIndex: number) => React.ReactNode;
  formatter?: SingleArgumentFormatter | TwoArgumentFormatter<T>;
  type?: "text" | "date" | "status" | "number" | "custom";
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  cellStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
}

export interface CustomGridProps<T> {
  columns: Column<T>[];
  data: T[];
  maxHeight?: string;
  minHeight?: string;
  searchTerm?: string;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  onRowClick?: (item: T) => void;
  pagination?: boolean;
  expandableRows?: boolean;
  renderExpandedRow?: (item: T) => React.ReactNode;
  showExportCSV?: boolean;
  showExportPDF?: boolean;
  exportFileName?: string;
  onColumnOrderChange?: (newOrder: string[]) => void;
  onColumnResize?: (columnKey: string, newWidth: number) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  rowKeyField?: keyof T;
  customRowStyle?: (item: T) => React.CSSProperties;
  customCellStyle?: (item: T, column: Column<T>) => React.CSSProperties;
  virtualScroll?: boolean;
  loading?: boolean;
  error?: string;
  emptyStateMessage?: string;
  showColumnCustomization?: boolean;
  initialSortBy?: { field: keyof T; direction: "asc" | "desc" };
  gridStyle?: React.CSSProperties;
  customFilter?: (item: T, searchValue: string) => boolean;
}

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  position: "relative",
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.grey[200],
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.primary.main,
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  // Add these properties
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 2,
  "& .MuiTableCell-head": {
    background: theme.palette.mode === "light" ? "#1976d2" : "#2979ff",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "14px",
    padding: "7px 7px",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 2,
    borderBottom: "none",
    "&:not(:last-child)": {
      borderRight: `1px solid ${theme.palette.mode === "light" ? "#1565c0" : "#1e88e5"}`,
    },
  },
}));

const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
  color: "#ffffff !important",
  "&.MuiTableSortLabel-root": {
    color: "#ffffff",
  },
  "&.MuiTableSortLabel-root:hover": {
    color: "#ffffff",
  },
  "&.MuiTableSortLabel-root.Mui-active": {
    color: "#ffffff",
  },
  "& .MuiTableSortLabel-icon": {
    color: "#ffffff !important",
  },
}));

const ResizeHandle = styled("div")({
  position: "absolute",
  right: 0,
  top: 0,
  bottom: 0,
  width: "4px",
  cursor: "col-resize",
  userSelect: "none",
  touchAction: "none",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
});

// Component Implementation
const CustomGrid = <T extends Record<string, any>>({
  columns: initialColumns,
  data,
  maxHeight = "500px",
  minHeight,
  searchTerm = "",
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  onRowClick,
  pagination = false,
  expandableRows = false,
  renderExpandedRow,
  showExportCSV = false,
  showExportPDF = false,
  exportFileName = "grid_export",
  onColumnResize,
  onFilterChange,
  rowKeyField,
  customRowStyle,
  customCellStyle,
  virtualScroll = false,
  loading = false,
  error,
  emptyStateMessage = "No data available",
  showColumnCustomization = false,
  initialSortBy,
  gridStyle,
  customFilter,
}: CustomGridProps<T>) => {
  // State Management
  const [columns, setColumns] = useState<Column<T>[]>(initialColumns);
  const [orderBy, setOrderBy] = useState<keyof T | "">(initialSortBy?.field || "");
  const [order, setOrder] = useState<"asc" | "desc">(initialSortBy?.direction || "asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [selected, setSelected] = useState<T[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [filterColumn, setFilterColumn] = useState<Column<T> | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible }), {}));

  const tableRef = useRef<HTMLTableElement>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);
  const virtualScrollRef = useRef<HTMLDivElement>(null);

  const applyFormatter = (formatter: SingleArgumentFormatter | TwoArgumentFormatter<T>, value: any, row: T): string | React.ReactNode => {
    if (formatter.length === 1) {
      return (formatter as SingleArgumentFormatter)(value);
    }
    return (formatter as TwoArgumentFormatter<T>)(value, row);
  };

  const renderCell = (item: T, column: Column<T>, rowIndex: number, columnIndex: number) => {
    if (column.render) {
      return column.render(item, rowIndex, columnIndex);
    }

    const value = item[column.key];

    if (column.formatter) {
      return applyFormatter(column.formatter, value, item);
    }

    return value;
  };

  const processedData = useMemo(() => {
    let result = [...data];

    // Apply Filters
    result = result.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        const column = columns.find((col) => col.key === key);
        if (!column || !value) return true;

        const cellValue = item[key];
        switch (column.type) {
          case "date":
            return format(new Date(cellValue), "yyyy-MM-dd") === format(new Date(value), "yyyy-MM-dd");
          case "number":
            return Number(cellValue) === Number(value);
          case "status":
            return String(cellValue).toLowerCase() === String(value).toLowerCase();
          default:
            return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
        }
      })
    );

    // Apply Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      // Use customFilter if provided, otherwise use the default filter logic
      if (customFilter) {
        result = result.filter((item) => customFilter(item, term));
      } else {
        result = result.filter((item) =>
          columns.some((col) => {
            const value = item[col.key];
            return String(value).toLowerCase().includes(term);
          })
        );
      }
    }

    // Apply Sorting
    if (orderBy) {
      result.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return order === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filters, searchTerm, orderBy, order, columns, customFilter]);

  // Virtual Scroll Implementation
  const virtualScrollData = useMemo(() => {
    if (!virtualScroll) return processedData;

    const rowHeight = 48; // Adjust based on your row height
    const containerHeight = virtualScrollRef.current?.clientHeight || 0;
    const visibleRows = Math.ceil(containerHeight / rowHeight);
    const startIndex = Math.max(0, page * rowsPerPage);
    const endIndex = Math.min(startIndex + visibleRows + 3, processedData.length);

    return processedData.slice(startIndex, endIndex);
  }, [processedData, virtualScroll, page, rowsPerPage]);

  // Event Handlers
  const handleSort = useCallback(
    (property: keyof T) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    },
    [orderBy, order]
  );

  const handleResizeStart = useCallback(
    (event: React.MouseEvent, columnKey: string) => {
      const column = columns.find((col) => col.key === columnKey);
      if (!column?.resizable) return;

      event.preventDefault();
      setResizingColumn(columnKey);
      resizeStartX.current = event.clientX;
      resizeStartWidth.current = column.width || 100;

      const handleResizeMove = (moveEvent: MouseEvent) => {
        if (resizingColumn) {
          const diff = moveEvent.clientX - resizeStartX.current;
          const newWidth = Math.max(column.minWidth || 50, Math.min(resizeStartWidth.current + diff, column.maxWidth || 500));

          setColumns((prevColumns) => prevColumns.map((col) => (col.key === columnKey ? { ...col, width: newWidth } : col)));

          onColumnResize?.(columnKey, newWidth);
        }
      };

      const handleResizeEnd = () => {
        setResizingColumn(null);
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };

      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    },
    [columns, onColumnResize]
  );

  // Export Functions
  const exportToCSV = useCallback(() => {
    const headers = columns.filter((col) => col.visible).map((col) => col.header);

    const csvData = processedData.map((item) =>
      columns
        .filter((col) => col.visible)
        .map((col) => {
          const value = item[col.key];
          if (col.formatter) {
            return col.formatter(value, item);
          }
          return value;
        })
    );

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${exportFileName}.csv`);
  }, [columns, processedData, exportFileName]);

  const handleExportPDF = useCallback(() => {
    exportToPDF({
      columns,
      data: processedData,
      filename: exportFileName,
      title: "Export Report",
      subtitle: new Date().toLocaleString(),
    });
  }, [columns, processedData, exportFileName]);
  // Column Customization
  const renderColumnCustomization = () => (
    <Drawer anchor="right" open={customizationOpen} onClose={() => setCustomizationOpen(false)}>
      <Box sx={{ width: 300, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Column Customization
        </Typography>
        {columns.map((column, index) => (
          <Box
            key={column.key}
            sx={{
              display: "flex",
              alignItems: "center",
              py: 1,
              borderBottom: "1px solid rgba(0,0,0,0.12)",
            }}
          >
            <DragIndicator sx={{ mr: 1, cursor: "grab" }} />
            <Checkbox
              checked={columnVisibility[column.key]}
              onChange={(e) => {
                setColumnVisibility((prev) => ({
                  ...prev,
                  [column.key]: e.target.checked,
                }));
                setColumns((prev) => prev.map((col) => (col.key === column.key ? { ...col, visible: e.target.checked } : col)));
              }}
            />
            <Typography>{column.header}</Typography>
          </Box>
        ))}
      </Box>
    </Drawer>
  );

  // Main Render
  return (
    <Box sx={{ position: "relative", ...gridStyle }}>
      {/* Toolbar */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        {showExportCSV && (
          <Button startIcon={<ExportIcon />} onClick={exportToCSV} variant="outlined" size="small">
            Export CSV
          </Button>
        )}
        {showExportPDF && (
          <Button startIcon={<ExportIcon />} onClick={handleExportPDF} variant="outlined" size="small">
            Export PDF
          </Button>
        )}
        {showColumnCustomization && (
          <Button startIcon={<SettingsIcon />} onClick={() => setCustomizationOpen(true)} variant="outlined" size="small">
            Customize Columns
          </Button>
        )}
      </Box>

      {/* Main Grid */}
      <StyledTableContainer sx={{ maxHeight, minHeight }} ref={virtualScrollRef}>
        <Table ref={tableRef} stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
          <StyledTableHead>
            <TableRow>
              {expandableRows && <TableCell padding="none" width={48} align="center" />}
              {selectable && (
                <TableCell padding="checkbox" align="center">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < processedData.length}
                    checked={processedData.length > 0 && selected.length === processedData.length}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelected(processedData);
                        onSelectionChange?.(processedData);
                      } else {
                        setSelected([]);
                        onSelectionChange?.([]);
                      }
                    }}
                    sx={{
                      color: "#ffffff",
                      "&.Mui-checked": {
                        color: "#ffffff",
                      },
                      "&.MuiCheckbox-indeterminate": {
                        color: "#ffffff",
                      },
                    }}
                  />
                </TableCell>
              )}
              {columns
                .filter((col) => col.visible)
                .map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.key === "edit" ? "center" : "left"}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      position: "relative",
                      ...column.headerStyle,
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent={column.key === "edit" ? "center" : "flex-start"}>
                      {column.sortable ? (
                        <StyledTableSortLabel active={orderBy === column.key} direction={orderBy === column.key ? order : "asc"} onClick={() => handleSort(column.key as keyof T)}>
                          {column.header}
                        </StyledTableSortLabel>
                      ) : (
                        column.header
                      )}
                      {column.filterable && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setFilterAnchorEl(e.currentTarget);
                            setFilterColumn(column);
                          }}
                          sx={{
                            color: filters[column.key] ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                            padding: "4px",
                            marginLeft: "4px",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    {column.resizable && <ResizeHandle onMouseDown={(e) => handleResizeStart(e, column.key)} className="resize-handle" data-column-key={column.key} />}
                  </TableCell>
                ))}
            </TableRow>
          </StyledTableHead>

          {/* Table Body */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.filter((col) => col.visible).length + (selectable ? 1 : 0) + (expandableRows ? 1 : 0)} align="center">
                  <Box sx={{ p: 2 }}>Loading...</Box>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.filter((col) => col.visible).length + (selectable ? 1 : 0) + (expandableRows ? 1 : 0)} align="center">
                  <Box sx={{ p: 2, color: "error.main" }}>{error}</Box>
                </TableCell>
              </TableRow>
            ) : virtualScrollData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.filter((col) => col.visible).length + (selectable ? 1 : 0) + (expandableRows ? 1 : 0)} align="center">
                  <Box sx={{ p: 2 }}>{emptyStateMessage}</Box>
                </TableCell>
              </TableRow>
            ) : (
              virtualScrollData.map((item, rowIndex) => {
                const isItemSelected = selected.includes(item);
                const isExpanded = expandedRows.has(rowIndex);
                const rowKey = rowKeyField ? item[rowKeyField] : rowIndex;

                return (
                  <React.Fragment key={`row-${rowKey}`}>
                    <TableRow
                      hover
                      onClick={(event) => {
                        if (selectable) {
                          const newSelected = isItemSelected ? selected.filter((i) => i !== item) : [...selected, item];
                          setSelected(newSelected);
                          onSelectionChange?.(newSelected);
                        } else {
                          onRowClick?.(item);
                        }
                      }}
                      selected={isItemSelected}
                      style={customRowStyle?.(item)}
                    >
                      {expandableRows && (
                        <TableCell padding="none">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedRows((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(rowIndex)) {
                                  newSet.delete(rowIndex);
                                } else {
                                  newSet.add(rowIndex);
                                }
                                return newSet;
                              });
                            }}
                          >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                      )}
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} />
                        </TableCell>
                      )}
                      {columns
                        .filter((col) => col.visible)
                        .map((column, columnIndex) => (
                          <TableCell
                            key={`${rowIndex}-${column.key}`}
                            style={{
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              ...column.cellStyle,
                              ...customCellStyle?.(item, column),
                            }}
                          >
                            {renderCell(item, column, rowIndex, columnIndex)}
                          </TableCell>
                        ))}
                    </TableRow>
                    {expandableRows && isExpanded && renderExpandedRow && (
                      <TableRow>
                        <TableCell colSpan={columns.filter((col) => col.visible).length + (selectable ? 1 : 0) + 1}>{renderExpandedRow(item)}</TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          component="div"
          count={processedData.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={() => {
          setFilterAnchorEl(null);
          setFilterColumn(null);
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          {filterColumn?.filter?.type === "select" ? (
            <FormControl fullWidth size="small">
              <InputLabel>Filter by {filterColumn.header}</InputLabel>
              <Select
                value={filters[filterColumn.key] || ""}
                onChange={(e) => {
                  const newFilters = {
                    ...filters,
                    [filterColumn.key]: e.target.value,
                  };
                  setFilters(newFilters);
                  onFilterChange?.(newFilters);
                }}
                label={`Filter by ${filterColumn.header}`}
              >
                <MenuItem value="">All</MenuItem>
                {filterColumn.filter.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : filterColumn?.filter?.type === "date" ? (
            <DatePicker
              label={`Filter by ${filterColumn.header}`}
              value={filters[filterColumn.key] || null}
              onChange={(newValue) => {
                const newFilters = {
                  ...filters,
                  [filterColumn.key]: newValue,
                };
                setFilters(newFilters);
                onFilterChange?.(newFilters);
              }}
            />
          ) : (
            <TextField
              fullWidth
              size="small"
              label={`Filter by ${filterColumn?.header}`}
              value={filters[filterColumn?.key || ""] || ""}
              onChange={(e) => {
                const newFilters = {
                  ...filters,
                  [filterColumn?.key || ""]: e.target.value,
                };
                setFilters(newFilters);
                onFilterChange?.(newFilters);
              }}
            />
          )}
        </Box>
      </Popover>

      {/* Column Customization Drawer */}
      {renderColumnCustomization()}
    </Box>
  );
};

export default React.memo(CustomGrid) as typeof CustomGrid;
