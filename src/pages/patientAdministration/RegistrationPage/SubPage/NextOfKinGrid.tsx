import React, { useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import useDayjs from "@/hooks/Common/useDateTime";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import CustomButton from "@/components/Button/CustomButton";

// Define column interface for type safety
interface Column<T> {
  key: string;
  header: string;
  visible?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface NextOfKinGridProps {
  kinData: PatNokDetailsDto[];
  onEdit: (kin: PatNokDetailsDto) => void;
  onDelete: (kin: PatNokDetailsDto) => void;
}

const NextOfKinGrid: React.FC<NextOfKinGridProps> = ({ kinData, onEdit, onDelete }) => {
  const { formatDate } = useDayjs();

  const handleEdit = useCallback(
    async (row: PatNokDetailsDto) => {
      try {
        if (row.pNokPChartID) {
          const response = await PatientService.getPatientDetails(row.pNokPChartID);
          if (response.success && response.data) {
            row.pNokPChartCode = response.data.patRegisters.pChartCode || "";
          }
        }
      } catch (error) {
        console.error("Error fetching patient details for edit:", error);
      } finally {
        onEdit(row);
      }
    },
    [onEdit]
  );

  const gridKinColumns = useMemo(
    () => [
      {
        key: "edit",
        header: "Edit",
        visible: true,
        render: (row: PatNokDetailsDto) => <CustomButton size="small" onClick={() => handleEdit(row)} icon={EditIcon} color="primary" />,
      },
      { key: "pNokRegStatus", header: "NOK Type", visible: true },
      {
        key: "pNokFName",
        header: "Name",
        visible: true,
        render: (row: PatNokDetailsDto) => `${row.pNokFName} ${row.pNokLName}`,
      },
      { key: "pNokRelName", header: "Relationship", visible: true },
      {
        key: "pNokDob",
        header: "DOB",
        visible: true,
        render: (row: PatNokDetailsDto) => formatDate(row.pNokDob),
      },
      { key: "pNokPostcode", header: "Post Code", visible: true },
      {
        key: "Address",
        header: "Address",
        visible: true,
        render: (row: PatNokDetailsDto) => `${row.pNokStreet} Area: ${row.pNokArea} City: ${row.pNokCity} Country: ${row.pNokActualCountry} Nationality: ${row.pNokCountryVal}`,
      },
      { key: "pAddPhone1", header: "Mobile", visible: true },
      {
        key: "pNokPssnID",
        header: "Passport Id/No",
        visible: true,
      },
      {
        key: "delete",
        header: "Delete",
        visible: true,
        render: (row: PatNokDetailsDto) => <CustomButton size="small" onClick={() => onDelete(row)} icon={DeleteIcon} color="error" />,
      },
    ],
    [handleEdit, onDelete, formatDate]
  );

  // Filter visible columns
  const visibleColumns = gridKinColumns.filter((column) => column.visible !== false);

  // Function to render cell content safely with appropriate typing
  const renderCellContent = (row: PatNokDetailsDto, column: Column<PatNokDetailsDto>): React.ReactNode => {
    if (column.render) {
      return column.render(row);
    }

    // Get the raw value using the column key
    const value = row[column.key as keyof PatNokDetailsDto];

    // Handle different value types appropriately
    if (value === undefined || value === null) {
      return "";
    }

    // Convert Date objects to string
    if (value instanceof Date) {
      return formatDate(value);
    }

    // Return value as string for safe rendering
    return String(value);
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="next of kin table">
        <TableHead>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableCell
                key={column.key}
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  backgroundColor: "#f5f5f5",
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {kinData.length > 0 ? (
            kinData.map((row, rowIndex) => (
              <TableRow key={row.pNokID || `row-${rowIndex}`} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={`${row.pNokID || rowIndex}-${column.key}`}
                    sx={{
                      padding: "8px 16px",
                      fontSize: "0.875rem",
                    }}
                  >
                    {renderCellContent(row, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns.length} align="center">
                No next of kin data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(NextOfKinGrid);
