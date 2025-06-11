import { ViewCompact as CompactIcon, ViewModule as LargeIcon, ViewStream as MediumIcon } from "@mui/icons-material";
import { Box, SxProps, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Theme, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import React, { useMemo, useState } from "react";

export interface ColumnFilter {
  type: "text" | "number" | "date" | "select";
  value: any;
  options?: { label: string; value: any }[];
}

type SingleArgumentFormatter = (value: any) => string | React.ReactNode;
type TwoArgumentFormatter<T> = (value: any, row: T) => string | React.ReactNode;

export type GridDensity = "small" | "medium" | "large";

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
  align?: "left" | "center" | "right";
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
  gridStyle?: SxProps<Theme>;
  customFilter?: (item: T, searchValue: string) => boolean;
  density?: GridDensity;
  onDensityChange?: (density: GridDensity) => void;
  showDensityControls?: boolean;
}

// Density configuration
const densityConfig = {
  small: {
    size: "small" as const,
    cellPadding: "4px 8px",
    fontSize: "0.75rem",
    lineHeight: 1.2,
    minHeight: "32px",
  },
  medium: {
    size: "medium" as const,
    cellPadding: "8px 12px",
    fontSize: "0.875rem",
    lineHeight: 1.4,
    minHeight: "40px",
  },
  large: {
    size: "small" as const, // MUI doesn't have large, so we use small but with custom padding
    cellPadding: "12px 16px",
    fontSize: "0.875rem",
    lineHeight: 1.6,
    minHeight: "52px",
  },
};

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
  density = "medium",
  onDensityChange,
  showDensityControls = true,
}: CustomGridProps<T>) => {
  const [columns, setColumns] = useState<Column<T>[]>(initialColumns);

  const currentDensityConfig = densityConfig[density];

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) => {
      if (customFilter) {
        return customFilter(item, searchTerm);
      }

      return columns.some((column) => {
        // Only search in visible columns
        if (!column.visible) return false;

        const value = item[column.key];

        if (value === null || value === undefined) return false;

        const stringValue = String(value).toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();

        return stringValue.includes(searchTermLower);
      });
    });
  }, [data, searchTerm, columns, customFilter]);

  const renderCell = (item: T, column: Column<T>, rowIndex: number, columnIndex: number) => {
    if (column.render) {
      return column.render(item, rowIndex, columnIndex);
    }

    const value = item[column.key];

    // Apply formatter if available
    if (column.formatter) {
      return typeof column.formatter === "function" && column.formatter.length === 2
        ? (column.formatter as TwoArgumentFormatter<T>)(value, item)
        : (column.formatter as SingleArgumentFormatter)(value);
    }

    // Handle long text based on density
    if (typeof value === "string" && value.length > 50 && density === "small") {
      return (
        <Tooltip title={value} arrow>
          <Typography
            variant="body2"
            sx={{
              fontSize: currentDensityConfig.fontSize,
              lineHeight: currentDensityConfig.lineHeight,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: column.width || "200px",
            }}
          >
            {value}
          </Typography>
        </Tooltip>
      );
    }

    return (
      <Typography
        variant="body2"
        sx={{
          fontSize: currentDensityConfig.fontSize,
          lineHeight: currentDensityConfig.lineHeight,
          wordBreak: density === "large" ? "break-word" : "normal",
        }}
      >
        {value}
      </Typography>
    );
  };

  const handleDensityChange = (event: React.MouseEvent<HTMLElement>, newDensity: GridDensity | null) => {
    if (newDensity && onDensityChange) {
      onDensityChange(newDensity);
    }
  };

  return (
    <Box>
      {/* Density Controls */}
      {showDensityControls && onDensityChange && (
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <ToggleButtonGroup value={density} exclusive onChange={handleDensityChange} size="small" aria-label="grid density">
            <ToggleButton value="small" aria-label="compact view">
              <Tooltip title="Compact">
                <CompactIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="medium" aria-label="medium view">
              <Tooltip title="Medium">
                <MediumIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="large" aria-label="comfortable view">
              <Tooltip title="Comfortable">
                <LargeIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Table Container */}
      <TableContainer sx={{ maxHeight, minHeight, ...(gridStyle || {}) }}>
        <Table stickyHeader size={currentDensityConfig.size}>
          <TableHead>
            <TableRow>
              {columns
                .filter((column) => column.visible)
                .map((column) => (
                  <TableCell
                    key={column.key}
                    style={{
                      ...column.headerStyle,
                      padding: currentDensityConfig.cellPadding,
                      minHeight: currentDensityConfig.minHeight,
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }}
                    align={column.align || "left"}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{
                        fontSize: currentDensityConfig.fontSize,
                        lineHeight: currentDensityConfig.lineHeight,
                      }}
                    >
                      {column.header}
                    </Typography>
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.filter((c) => c.visible).length} align="center">
                  <Typography variant="body2">Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.filter((c) => c.visible).length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? `No results found for "${searchTerm}"` : emptyStateMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, rowIndex) => (
                <TableRow
                  key={rowKeyField ? String(item[rowKeyField]) : rowIndex}
                  onClick={() => onRowClick && onRowClick(item)}
                  style={customRowStyle ? customRowStyle(item) : {}}
                  hover={!!onRowClick}
                  sx={{
                    ...(onRowClick ? { cursor: "pointer" } : {}),
                    minHeight: currentDensityConfig.minHeight,
                  }}
                >
                  {columns
                    .filter((column) => column.visible)
                    .map((column, columnIndex) => (
                      <TableCell
                        key={`${rowIndex}-${column.key}`}
                        style={{
                          ...(column.cellStyle || {}),
                          ...(customCellStyle ? customCellStyle(item, column) : {}),
                          padding: currentDensityConfig.cellPadding,
                          minHeight: currentDensityConfig.minHeight,
                          width: column.width,
                          minWidth: column.minWidth,
                          maxWidth: column.maxWidth,
                          verticalAlign: "top",
                        }}
                        align={column.align || "left"}
                      >
                        {renderCell(item, column, rowIndex, columnIndex)}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default React.memo(CustomGrid) as typeof CustomGrid;
