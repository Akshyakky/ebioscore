// PatientSearch.tsx
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Grid, Box, debounce, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, TextField, InputAdornment } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { PatientSearchContext } from "@/context/PatientSearchContext";
import useDayjs from "@/hooks/Common/useDateTime";
import { PatientRegistrationDto } from "@/interfaces/PatientAdministration/PatientFormData";
import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";

interface PatientSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditPatient: (patientId: string, pChartCode: string) => void;
}

// Define the Column type similar to what was used in CustomGrid
interface Column<T> {
  key: string;
  header: string;
  visible?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  render?: (row: T) => React.ReactNode;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ show, handleClose, onEditPatient }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { performSearch, searchResults } = useContext(PatientSearchContext);
  const dayjs = useDayjs();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery) {
        performSearch(searchQuery);
      }
    }, 500),
    [performSearch]
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);

  // Reset pagination when dialog opens or search results change
  useEffect(() => {
    setPage(0);
  }, [show, searchResults]);

  const handleEditAndClose = (patientId: string, pChartCode: string) => {
    onEditPatient(patientId, pChartCode);
    handleClose();
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns: Column<PatientRegistrationDto>[] = [
    {
      key: "edit",
      header: "Edit",
      visible: true,
      width: 80,
      render: (row) => (
        <CustomButton
          text="Edit"
          onClick={() => handleEditAndClose(row.patRegisters?.pChartID.toString() || "", row.patRegisters?.pChartCode || "")}
          icon={EditIcon}
          size="small"
        />
      ),
    },
    {
      key: "patRegisters.pChartCode",
      header: "UHID",
      visible: true,
      width: 130,
      minWidth: 100,
      maxWidth: 150,
      render: (row) => row.patRegisters?.pChartCode || "",
    },
    {
      key: "patientName",
      header: "Patient Name",
      visible: true,
      width: 200,
      render: (row) => `${row.patRegisters?.pFName || ""} ${row.patRegisters?.pLName || ""}`,
    },
    {
      key: "patRegisters.pRegDate",
      header: "Registration Date",
      visible: true,
      width: 150,
      render: (row) => dayjs.formatDate(row.patRegisters?.pRegDate) || "",
    },
    {
      key: "patRegisters.pGender",
      header: "Gender",
      visible: true,
      width: 100,
      render: (row) => row.patRegisters?.pGender || "",
    },
    {
      key: "patAddress.pAddPhone1",
      header: "Mobile No",
      visible: true,
      width: 150,
      render: (row) => row.patAddress?.pAddPhone1 || "",
    },
    {
      key: "patRegisters.pDob",
      header: "DOB",
      visible: true,
      width: 150,
      render: (row) => dayjs.formatDate(row.patRegisters?.pDob) || "",
    },
    {
      key: "patRegisters.indentityValue",
      header: "Adhar No",
      visible: true,
      width: 180,
      render: (row) => row.patRegisters?.indentityValue || "",
    },
    {
      key: "patRegisters.pTypeName",
      header: "Payment Source",
      visible: true,
      width: 160,
      render: (row) => row.patRegisters?.pTypeName || "",
    },
  ];

  // Get visible columns
  const visibleColumns = columns.filter((col) => col.visible !== false);

  // Apply pagination to results
  const paginatedResults = searchResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderTableCell = (row: PatientRegistrationDto, column: Column<PatientRegistrationDto>) => {
    if (column.render) {
      return column.render(row);
    }
    return "";
  };

  const dialogContent = (
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextField
              id="SearchTerm"
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter UHID, name, or mobile number"
              size="small"
              fullWidth
              variant="outlined"
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ mt: 2, height: "400px", display: "flex", flexDirection: "column" }}>
        <TableContainer
          component={Paper}
          sx={{
            flex: 1,
            overflow: "auto",
            maxHeight: "350px",
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    sx={{
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      whiteSpace: "nowrap",
                      fontWeight: "bold",
                    }}
                  >
                    {column.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedResults.length > 0 ? (
                paginatedResults.map((row, index) => (
                  <TableRow key={row.patRegisters?.pChartID || index} hover>
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={`${row.patRegisters?.pChartID || index}-${column.key}`}
                        sx={{
                          width: column.width,
                          minWidth: column.minWidth,
                          maxWidth: column.maxWidth,
                        }}
                      >
                        {renderTableCell(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} align="center">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={searchResults.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </>
  );

  const dialogActions = <CustomButton variant="contained" text="Close" icon={CloseIcon} size="medium" onClick={handleClose} color="secondary" />;

  return (
    <GenericDialog
      open={show}
      onClose={handleClose}
      title="Patient Search"
      maxWidth="xl"
      fullWidth
      disableBackdropClick
      dialogContentSx={{
        minHeight: "480px", // Increased to accommodate pagination control
        maxHeight: "480px",
      }}
      actions={[dialogActions]}
    >
      {dialogContent}
    </GenericDialog>
  );
};

export default PatientSearch;
