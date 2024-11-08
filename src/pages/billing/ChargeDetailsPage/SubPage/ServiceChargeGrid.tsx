import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

interface WardCategory {
  value: string;
  label: string;
}

interface GridData {
  picName: string;
  backgroundColor?: string;
  [key: string]: any;
}

interface GroupedCustomGridProps {
  selectedWardCategories?: WardCategory[];
  data?: GridData[];
  onSelectionChange?: (row: GridData) => void;
  maxHeight?: string;
}

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
  overflowY: "auto",
  overflowX: "auto", // Enable horizontal scrolling
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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

export const GroupedCustomGrid: React.FC<GroupedCustomGridProps> = ({ selectedWardCategories = [], data = [], onSelectionChange, maxHeight = "500px" }) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [gridData, setGridData] = useState<GridData[]>(data); // State for editable grid data

  const handleRowSelect = (row: GridData, index: number) => {
    setSelectedRow(index);
    onSelectionChange?.(row);
  };

  // Function to handle input changes in editable cells
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, rowIndex: number, field: string) => {
    const newValue = e.target.value; // Keep input as a string during typing
    const updatedData = [...gridData];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [field]: newValue, // Temporarily store unformatted value
    };

    // If updating Dr Amt or Hosp Amt, recalculate Tot Amt
    const categoryPrefix = field.split("_")[0];
    if (field.includes("drAmt") || field.includes("hospAmt")) {
      const drAmt = parseFloat(updatedData[rowIndex][`${categoryPrefix}_drAmt`] || "0");
      const hospAmt = parseFloat(updatedData[rowIndex][`${categoryPrefix}_hospAmt`] || "0");
      updatedData[rowIndex][`${categoryPrefix}_totAmt`] = (drAmt + hospAmt).toFixed(2);
    }

    setGridData(updatedData); // Update the state with new values
  };

  const renderGroupedHeaders = () => (
    <TableRow>
      <StyledTableCell className="header" rowSpan={2}>
        Select
      </StyledTableCell>
      <StyledTableCell className="header" rowSpan={2}>
        PIC Name
      </StyledTableCell>
      {selectedWardCategories.map((category) => (
        <StyledTableCell key={category.value} className="header" colSpan={3} align="center">
          {category.label}
        </StyledTableCell>
      ))}
    </TableRow>
  );

  const renderSubHeaders = () => (
    <TableRow>
      {selectedWardCategories.map((category) => (
        <React.Fragment key={`${category.value}-subheaders`}>
          <StyledTableCell className="subheader">Dr Amt</StyledTableCell>
          <StyledTableCell className="subheader">Hosp Amt</StyledTableCell>
          <StyledTableCell className="subheader">Tot Amt</StyledTableCell>
        </React.Fragment>
      ))}
    </TableRow>
  );

  const renderDataRows = () =>
    gridData.map((row, rowIndex) => (
      <StyledTableRow
        key={rowIndex}
        sx={{
          backgroundColor: row.backgroundColor || "inherit",
        }}
      >
        <StyledTableCell>
          <input type="radio" name="rowSelect" checked={selectedRow === rowIndex} onChange={() => handleRowSelect(row, rowIndex)} />
        </StyledTableCell>
        <StyledTableCell>{row.picName}</StyledTableCell>
        {selectedWardCategories.map((category) => (
          <React.Fragment key={`${category.value}-data-${rowIndex}`}>
            <StyledTableCell>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                value={row[`${category.label}_drAmt`] || ""}
                onChange={(e) => handleInputChange(e, rowIndex, `${category.label}_drAmt`)}
                placeholder="0.00"
                inputProps={{ inputMode: "decimal" }}
              />
            </StyledTableCell>
            <StyledTableCell>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                value={row[`${category.label}_hospAmt`] || ""}
                onChange={(e) => handleInputChange(e, rowIndex, `${category.label}_hospAmt`)}
                placeholder="0.00"
                inputProps={{ inputMode: "decimal" }}
              />
            </StyledTableCell>
            <StyledTableCell>
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                value={parseFloat(row[`${category.label}_totAmt`] || "0").toFixed(2)}
                placeholder="0.00"
                inputProps={{ readOnly: true }}
              />
            </StyledTableCell>
          </React.Fragment>
        ))}
      </StyledTableRow>
    ));

  return (
    <Box sx={{ maxHeight, maxWidth: "100%", overflowY: "auto", overflowX: "auto" }}>
      {" "}
      {/* Enable both horizontal and vertical scrolling */}
      <Paper sx={{ maxHeight }}>
        <StyledTableContainer>
          <Table stickyHeader sx={{ minWidth: `${selectedWardCategories.length * 300 + 300}px` }}>
            {" "}
            {/* Set dynamic width based on columns */}
            <TableHead>
              {renderGroupedHeaders()}
              {renderSubHeaders()}
            </TableHead>
            <TableBody>{renderDataRows()}</TableBody>
          </Table>
        </StyledTableContainer>
      </Paper>
    </Box>
  );
};
