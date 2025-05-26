import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

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
  gridStyle?: React.CSSProperties;
  customFilter?: (item: T, searchValue: string) => boolean;
}

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
  const [columns, setColumns] = useState<Column<T>[]>(initialColumns);

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
    return item[column.key];
  };

  return (
    <TableContainer sx={{ maxHeight, minHeight, ...gridStyle }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} style={column.headerStyle} align={column.align || "left"}>
                <Typography>{column.header}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                {searchTerm ? `No results found for "${searchTerm}"` : emptyStateMessage}
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((item, rowIndex) => (
              <TableRow
                key={rowKeyField ? String(item[rowKeyField]) : rowIndex}
                onClick={() => onRowClick && onRowClick(item)}
                style={customRowStyle ? customRowStyle(item) : undefined}
                hover={!!onRowClick}
                sx={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((column, columnIndex) => (
                  <TableCell
                    key={`${rowIndex}-${column.key}`}
                    style={{
                      ...(column.cellStyle || {}),
                      ...(customCellStyle ? customCellStyle(item, column) : {}),
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
  );
};

export default React.memo(CustomGrid) as typeof CustomGrid;
