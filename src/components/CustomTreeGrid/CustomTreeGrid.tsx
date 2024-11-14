import React, { useMemo, useState } from "react";
import { DataGridPro, GridColDef, GridRenderCellParams, GridRowsProp, DataGridProProps } from "@mui/x-data-grid-pro";

export interface Column<T> {
  key: string;
  header: string;
  visible: boolean;
  sortable?: boolean;
  render?: (item: T, searchTerm: string) => JSX.Element | string;
  formatter?: (value: any) => string;
  width?: number;
}

interface CustomTreeGridProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  maxHeight?: string;
  minHeight?: string;
  searchTerm?: string;
  getTreeDataPath?: (row: T) => string[];
  treeField: string;
  rowKey: string;
}

const CustomTreeGrid = <T extends Record<string, any>>({ columns, data, maxHeight = "500px", minHeight, searchTerm = "", getTreeDataPath, treeField }: CustomTreeGridProps<T>) => {
  const [orderBy, setOrderBy] = useState<keyof T | "">("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    if (!orderBy) return data;
    return [...data].sort((a, b) => {
      if (orderBy === "siNo") {
        return order === "asc" ? Number(a[orderBy as keyof T]) - Number(b[orderBy as keyof T]) : Number(b[orderBy as keyof T]) - Number(a[orderBy as keyof T]);
      }
      const aValue = a[orderBy as keyof T];
      const bValue = b[orderBy as keyof T];
      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, order, orderBy]);

  const highlightMatch = (text: string, searchTerm: string) => {
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <span
              key={index}
              style={{
                backgroundColor: "rgba(63, 81, 181, 0.2)",
                color: "#1a237e",
                fontWeight: "bold",
                padding: "2px 0",
                borderRadius: "2px",
              }}
            >
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const renderCell = (params: GridRenderCellParams<any>, column: Column<T>, searchTerm: string = "") => {
    const cellContent = params.value;

    if (searchTerm && typeof cellContent === "string") {
      return highlightMatch(cellContent, searchTerm);
    } else if (column.render) {
      return column.render(params.row as T, searchTerm);
    } else if (column.formatter) {
      return column.formatter(cellContent);
    }
    return cellContent;
  };

  const visibleColumns = useMemo(() => columns.filter((col) => col.visible), [columns]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    return sortedData.filter((item) =>
      visibleColumns.some((col) => {
        const cellContent = item[col.key as keyof T];
        return typeof cellContent === "string" && cellContent.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [sortedData, searchTerm, visibleColumns]);

  const gridColumns: GridColDef[] = visibleColumns.map((col) => ({
    field: col.key,
    headerName: col.header,
    sortable: col.sortable ?? false,
    renderCell: (params) => renderCell(params, col, searchTerm),
    width: col.width,
  }));

  const rows: GridRowsProp = filteredData.map((item, index) => ({
    ...item,
    id: item.id || index,
  }));

  const defaultGetTreeDataPath: DataGridProProps["getTreeDataPath"] = (row) => {
    const path = row[treeField];
    return typeof path === "string" ? path.split("/") : path;
  };

  return (
    <div style={{ height: maxHeight, minHeight, width: "100%" }}>
      <DataGridPro
        rows={rows}
        columns={gridColumns}
        autoPageSize
        checkboxSelection
        disableRowSelectionOnClick
        style={{ maxHeight, minHeight }}
        treeData
        getTreeDataPath={getTreeDataPath || defaultGetTreeDataPath}
      />
    </div>
  );
};

export default CustomTreeGrid;
