import React, { useMemo, useState, useEffect } from "react";
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export interface ColumnConfig {
  key: string;
  label: string;
  group?: string;
  input?: boolean;
  editable?: boolean;
  type?: "text" | "number" | "readonly";
  width?: string;
  align?: "left" | "center" | "right";
}

interface GenericGridProps<T> {
  data: T[];
  columns: ColumnConfig[];
  onRowChange?: (updatedData: T[]) => void;
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
  "&.header": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
  },
  "&.subheader": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: "500px",
  overflowY: "auto", // Vertical scrolling
  overflowX: "auto", // Horizontal scrolling
  "&::-webkit-scrollbar": {
    height: "6px",
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.grey[100],
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.grey[400],
    borderRadius: "3px",
    "&:hover": {
      background: theme.palette.grey[600],
    },
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:hover": {
    filter: "brightness(0.95)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    padding: theme.spacing(1),
    backgroundColor: "#fff",
    fontSize: "0.875rem",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "4px",
    "& fieldset": {
      borderColor: theme.palette.grey[300],
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const AdvancedGrid = <T extends Record<string, any>>({ data: initialData, columns, onRowChange, maxHeight = "500px" }: GenericGridProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);

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
    const updatedValue = e.target.value;
    const updatedData = [...data];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [columnKey]: updatedValue };
    setData(updatedData);
    if (onRowChange) onRowChange(updatedData);
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
        {columns.map((col) => (
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
        ))}
      </StyledTableRow>
    ));

  const totalWidth = columns.length * 150;
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
