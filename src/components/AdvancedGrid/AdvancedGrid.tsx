import React, { useMemo, useState, useEffect } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Checkbox, Radio } from "@mui/material";
import { styled } from "@mui/material/styles";

export interface ColumnConfig {
  key: string;
  label: string;
  group?: string;
  input?: boolean;
  editable?: boolean;
  type?: "number" | "text" | "readonly" | "checkbox" | "Radio" | "undefined";
  width?: string;
  align?: "left" | "center" | "right";
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, row: any) => void;
}

interface GenericGridProps<T> {
  data: T[];
  columns: ColumnConfig[];
  onRowChange?: (updatedData: T[]) => void;
  onRowSelect?: (rowIndex: number) => void;
  maxHeight?: string;
}

const rowColors = [
  "rgba(255, 229, 204, 0.8)",
  "rgba(204, 255, 229, 0.8)",
  "rgba(229, 204, 255, 0.8)",
  "rgba(255, 255, 204, 0.8)",
  "rgba(204, 229, 255, 0.8)",
  "rgba(255, 204, 229, 0.8)",
  "rgba(229, 255, 204, 0.8)",
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  textAlign: "center",
  padding: theme.spacing(1),
  color: theme.palette.mode === "dark" ? "#f0f0f0" : "#000", // Light text for dark mode
  "&.header": {
    backgroundColor: theme.palette.mode === "dark" ? "#424242" : theme.palette.primary.main,
    color: theme.palette.mode === "dark" ? "#ffffff" : theme.palette.primary.contrastText,
    fontWeight: "bold",
  },
  "&.subheader": {
    backgroundColor: theme.palette.mode === "dark" ? "#616161" : theme.palette.primary.light,
    color: theme.palette.mode === "dark" ? "#e0e0e0" : theme.palette.primary.contrastText,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: "500px",
  overflowY: "auto",
  overflowX: "auto",
  backgroundColor: theme.palette.mode === "dark" ? "#303030" : "#ffffff", // Dark background
  "&::-webkit-scrollbar": {
    height: "6px",
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.mode === "dark" ? "#424242" : theme.palette.grey[100],
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.mode === "dark" ? "#757575" : theme.palette.grey[400],
    borderRadius: "3px",
    "&:hover": {
      background: theme.palette.mode === "dark" ? "#bdbdbd" : theme.palette.grey[600],
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    filter: "brightness(0.9)",
  },
  backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#ffffff",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.mode === "dark" ? "#616161" : "#fff",
    fontSize: "0.875rem",
    color: theme.palette.mode === "dark" ? "#e0e0e0" : "#000",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "4px",
    "& fieldset": {
      borderColor: theme.palette.mode === "dark" ? "#757575" : theme.palette.grey[300],
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const AdvancedGrid = <T extends Record<string, any>>({ data: initialData, columns, onRowChange, maxHeight = "500px", onRowSelect }: GenericGridProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const groupedColumns = useMemo(() => {
    const groups: Record<string, ColumnConfig[]> = {};
    columns.forEach((col) => {
      const group = col.group || "default";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(col);
    });
    return groups;
  }, [columns]);

  const handleInputChange = <K extends keyof T>(e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, columnKey: K) => {
    if (!columns.find((col) => col.key === columnKey)?.editable) return;

    const updatedValue = e.target.value;
    const updatedData = [...data];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [columnKey]: updatedValue };

    setData(updatedData);
    if (onRowChange) onRowChange(updatedData);
  };

  const handleSelectRow = (rowIndex: number) => {
    setSelectedRow(rowIndex);
    if (onRowSelect) {
      onRowSelect(rowIndex); // Call the callback if it exists
    }
  };

  const renderGroupedHeaders = () => (
    <TableRow>
      {Object.entries(groupedColumns).map(([group, cols]) => (
        <StyledTableCell
          key={group}
          className="header"
          colSpan={cols.length}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 3,
            backgroundColor: "inherit",
          }}
        >
          {group !== "default" ? group : ""}
        </StyledTableCell>
      ))}
    </TableRow>
  );

  const renderSubHeaders = () => (
    <TableRow>
      {columns.map((col) => (
        <StyledTableCell
          key={col.key}
          className="subheader"
          align={col.align || "center"}
          sx={{
            position: "sticky",
            top: Object.keys(groupedColumns).length > 1 ? 48 : 0,
            zIndex: 2,
          }}
        >
          {col.label}
        </StyledTableCell>
      ))}
    </TableRow>
  );

  const renderDataRows = () =>
    data.map((row, rowIndex) => (
      <StyledTableRow
        key={rowIndex}
        sx={{
          backgroundColor: rowColors[rowIndex % rowColors.length],
        }}
      >
        {columns.map((col) => {
          if (col.key === "select" && col.type === "Radio") {
            return (
              <StyledTableCell key={col.key} align="center">
                <Radio checked={selectedRow === rowIndex} onChange={() => handleSelectRow(rowIndex)} />
              </StyledTableCell>
            );
          }

          return (
            <StyledTableCell key={col.key} align={col.align || "center"}>
              {col.input && col.editable ? (
                <StyledTextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  type={col.type === "number" ? "number" : "text"}
                  value={row[col.key] || ""}
                  onChange={(e: any) => handleInputChange(e, rowIndex, col.key)}
                  InputProps={{
                    style: { backgroundColor: "#fff" },
                  }}
                />
              ) : (
                row[col.key] || ""
              )}
            </StyledTableCell>
          );
        })}
      </StyledTableRow>
    ));

  const totalWidth = columns.reduce((sum, col) => sum + parseInt(col.width || "150", 10), 50);
  return (
    <Box sx={{ maxHeight, maxWidth: "100%", overflow: "auto" }}>
      <Paper sx={{ maxHeight }}>
        <StyledTableContainer>
          <Table stickyHeader sx={{ minWidth: `${totalWidth}px` }}>
            <TableHead>
              {Object.keys(groupedColumns).length > 1 && renderGroupedHeaders()}
              {renderSubHeaders()}
            </TableHead>
            <TableBody>{renderDataRows()}</TableBody>
          </Table>
        </StyledTableContainer>
      </Paper>
    </Box>
  );
};

export default AdvancedGrid;
