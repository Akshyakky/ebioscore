import React, { useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import CustomButton from "@/components/Button/CustomButton";
import useDayjs from "@/hooks/Common/useDateTime";

// Define column interface similar to what CustomGrid would use
interface Column<T> {
  key: string;
  header: string;
  visible?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface InsuranceGridProps {
  insuranceData: OPIPInsurancesDto[];
  onEdit: (insurance: OPIPInsurancesDto) => void;
  onDelete: (id: number) => void;
}

const PatientInsuranceGrid: React.FC<InsuranceGridProps> = ({ insuranceData, onEdit, onDelete }) => {
  const { formatDate } = useDayjs();

  const handleEdit = useCallback(
    (row: OPIPInsurancesDto) => {
      onEdit(row);
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (id: number) => {
      onDelete(id);
    },
    [onDelete]
  );

  const gridPatientInsuranceColumns = useMemo(
    () => [
      {
        key: "PInsuredit",
        header: "Edit",
        visible: true,
        render: (row: OPIPInsurancesDto) => <CustomButton size="small" onClick={() => handleEdit(row)} icon={EditIcon} color="primary" />,
      },
      { key: "insurName", header: "Insurance Name", visible: true },
      { key: "policyNumber", header: "Policy Number", visible: true },
      { key: "coveredFor", header: "Covered For", visible: true },
      { key: "policyHolder", header: "Policy Holder", visible: true },
      { key: "groupNumber", header: "Group Number", visible: true },
      {
        key: "policyStartDt",
        header: "Start Date",
        visible: true,
        render: (row: OPIPInsurancesDto) => formatDate(row.policyStartDt),
      },
      {
        key: "policyEndDt",
        header: "End Date",
        visible: true,
        render: (row: OPIPInsurancesDto) => formatDate(row.policyEndDt),
      },
      { key: "guarantor", header: "Guarantor", visible: true },
      { key: "relation", header: "Relation", visible: true },
      {
        key: "PInsurdelete",
        header: "Delete",
        visible: true,
        render: (row: OPIPInsurancesDto) => <CustomButton size="small" onClick={() => handleDelete(row.oPIPInsID)} icon={DeleteIcon} color="error" />,
      },
    ],
    [handleEdit, handleDelete, formatDate]
  );

  // Filter out non-visible columns
  const visibleColumns = gridPatientInsuranceColumns.filter((column) => column.visible !== false);

  // Function to render cell content based on column definition
  const renderCellContent = (row: OPIPInsurancesDto, column: Column<OPIPInsurancesDto>): React.ReactNode => {
    if (column.render) {
      return column.render(row);
    }

    // Return the row value for the column key or empty string if not found
    const value = row[column.key as keyof OPIPInsurancesDto];

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
      <Table size="small" aria-label="patient insurance table">
        <TableHead>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableCell
                key={column.key}
                sx={{
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {insuranceData.length > 0 ? (
            insuranceData.map((row, rowIndex) => (
              <TableRow key={row.oPIPInsID || `row-${rowIndex}`} hover>
                {visibleColumns.map((column) => (
                  <TableCell key={`${row.oPIPInsID || rowIndex}-${column.key}`}>{renderCellContent(row, column)}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumns.length} align="center">
                No insurance data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(PatientInsuranceGrid);
