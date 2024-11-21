import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import FormField from "../../../../components/FormField/FormField";
import { DropdownOption } from "@/interfaces/Common/DropdownOption";
import { BChargeDetailsDto } from "@/interfaces/Billing/BChargeDetails";

interface WardCategory {
  value: string;
  label: string;
}

interface GridData {
  picName: string;
  backgroundColor?: string;
  chargeDetails?: BChargeDetailsDto[];
  [key: string]: any;
}

interface GroupedCustomGridProps {
  selectedWardCategories?: WardCategory[];
  data?: GridData[];
  onSelectionChange?: (row: GridData) => void;
  selectedPicValues?: DropdownOption[];
  maxHeight?: string;
  onChargeDetailsChange?: (chargeDetails: BChargeDetailsDto[]) => void;
  createChargeDetail: (picValue: string, categoryValue: string) => BChargeDetailsDto; // Add this
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

const StyledFormField = styled(FormField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 1)",
    },
  },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.05)",
    },
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: "500px",
  overflowY: "auto",
  overflowX: "auto",
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
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));
export const GroupedCustomGrid: React.FC<GroupedCustomGridProps> = ({
  selectedWardCategories = [],
  selectedPicValues = [],
  data: initialData = [],
  onSelectionChange,
  onChargeDetailsChange,
  createChargeDetail,
  maxHeight = "500px",
}) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [data, setData] = useState<GridData[]>(initialData);
  const rowColors = [
    "rgba(236, 242, 255, 0.9)",
    "rgba(255, 245, 238, 0.9)",
    "rgba(240, 255, 244, 0.9)",
    "rgba(255, 248, 240, 0.9)",
    "rgba(245, 240, 255, 0.9)",
    "rgba(240, 255, 255, 0.9)",
    "rgba(255, 240, 245, 0.9)",
  ];

  const handleRowSelect = (row: GridData, index: number) => {
    setSelectedRow(index);
    onSelectionChange?.(row);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number, field: string, categoryId: string) => {
    const newValue = parseFloat(e.target.value) || 0;
    const updatedData = [...data];
    const row = updatedData[rowIndex];

    if (!row.chargeDetails) {
      row.chargeDetails = [];
    }

    // Ensure `chargeDetail` is initialized
    let chargeDetail = row.chargeDetails.find((cd) => cd.wCatID === parseInt(categoryId));
    if (!chargeDetail) {
      chargeDetail = createChargeDetail(row.picName, categoryId);
      row.chargeDetails.push(chargeDetail);
    }

    // Update values
    if (field.includes("drAmt")) {
      chargeDetail.dcValue = newValue; // Update Dr Amount
    } else if (field.includes("hospAmt")) {
      chargeDetail.hcValue = newValue; // Update Hosp Amount
    }

    chargeDetail.chValue = (chargeDetail.dcValue || 0) + (chargeDetail.hcValue || 0); // Compute Total Amount

    row[`${field}`] = newValue; // Update field value in the row
    row[`${field.split("_")[0]}_totAmt`] = chargeDetail.chValue; // Update total field
    setData(updatedData);

    onChargeDetailsChange?.(getAllChargeDetails(updatedData));
  };

  const getAllChargeDetails = (gridData: GridData[]): BChargeDetailsDto[] => {
    return gridData.reduce((acc: BChargeDetailsDto[], row) => {
      if (row.chargeDetails) {
        acc.push(...row.chargeDetails);
      }
      return acc;
    }, []);
  };

  const clearGridData = () => {
    setData([]);
    onChargeDetailsChange?.([]);
  };

  const renderGroupedHeaders = () => (
    <TableRow>
      <StyledTableCell
        className="header"
        rowSpan={2}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 3,
          backgroundColor: "inherit",
        }}
      >
        Select
      </StyledTableCell>
      <StyledTableCell
        className="header"
        rowSpan={2}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 3,
          backgroundColor: "inherit",
        }}
      >
        PIC Name
      </StyledTableCell>
      {selectedWardCategories.map((category) => (
        <StyledTableCell
          key={category.value}
          className="header"
          colSpan={3}
          align="center"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 3,
            backgroundColor: "inherit",
          }}
        >
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
    data
      .filter((row) => selectedPicValues.some((pic) => pic.label === row.picName))
      .map((row, rowIndex) => (
        <StyledTableRow
          key={rowIndex}
          style={{
            backgroundColor: rowColors[rowIndex % rowColors.length], // Apply alternating row colors
          }}
        >
          <StyledTableCell>
            <input
              type="radio"
              name="rowSelect"
              checked={selectedRow === rowIndex}
              onChange={() => handleRowSelect(row, rowIndex)}
              style={{
                backgroundColor: "#fff", // Match StyledFormField colors
              }}
            />
          </StyledTableCell>
          <StyledTableCell>{row.picName}</StyledTableCell>
          {selectedWardCategories.map((category) => {
            const chargeDetail = row.chargeDetails?.find((cd) => cd.wCatID === parseInt(category.value));
            return (
              <React.Fragment key={`${category.value}-data-${rowIndex}`}>
                <StyledTableCell>
                  <FormField
                    type="number"
                    label="0.00"
                    value={chargeDetail?.dcValue || row[`${category.label}_drAmt`] || ""}
                    onChange={(e) => handleInputChange(e, rowIndex, `${category.label}_drAmt`, category.value)}
                    placeholder="0.00"
                    fullWidth
                    size="small"
                    ControlID={`${category.label}_drAmt`}
                    name={`${category.label}_drAmt`}
                    step="any"
                    InputProps={{
                      style: {
                        backgroundColor: "#fff", // Match StyledFormField colors
                      },
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <FormField
                    type="number"
                    label="0.00"
                    value={chargeDetail?.hcValue || row[`${category.label}_hospAmt`] || ""}
                    onChange={(e) => handleInputChange(e, rowIndex, `${category.label}_hospAmt`, category.value)}
                    placeholder="0.00"
                    fullWidth
                    size="small"
                    ControlID={`${category.label}_hospAmt`}
                    name={`${category.label}_hospAmt`}
                    step="any"
                    InputProps={{
                      style: {
                        backgroundColor: "#fff", // Match StyledFormField colors
                      },
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <FormField
                    type="number"
                    label="0.00"
                    value={chargeDetail?.chValue || row[`${category.label}_totAmt`] || ""}
                    placeholder="0.00"
                    readOnly
                    fullWidth
                    size="small"
                    ControlID={`${category.label}_totAmt`}
                    name={`${category.label}_totAmt`}
                    onChange={() => {}}
                    InputProps={{
                      style: {
                        backgroundColor: "#fff", // Match StyledFormField colors
                      },
                    }}
                  />
                </StyledTableCell>
              </React.Fragment>
            );
          })}
        </StyledTableRow>
      ));

  return (
    <Box sx={{ maxHeight, maxWidth: "100%", overflowY: "auto", overflowX: "auto" }}>
      <Paper sx={{ maxHeight }}>
        <StyledTableContainer>
          <Table stickyHeader sx={{ minWidth: `${selectedWardCategories.length * 300 + 300}px` }}>
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
