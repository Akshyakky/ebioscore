import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

// Define a generic type with an index signature
type GenericObject = { [key: string]: any };

interface Column<T> {
  key: string;
  header: string;
  visible: boolean;
  render?: (item: T) => JSX.Element | string;
  formatter?: (value: any) => string;
}

interface CustomGridProps<T> {
  columns: Column<T>[];
  data: T[];
  maxHeight?: string; // Optional max height
  minHeight?: string;
}

// Ensure T extends GenericObject to provide an index signature
const CustomGrid = <T extends GenericObject>({
  columns,
  data,
  maxHeight,
  minHeight,
}: CustomGridProps<T>) => {
  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    } else if (column.formatter) {
      return column.formatter(item[column.key]);
    }
    return item[column.key];
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.dark, // Adjust color to match your theme
      color: theme.palette.common.white,
      fontWeight: "bold",
      textAlign: "left",
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      // Other body styles...
    },
  }));

  return (
    <TableContainer
      component={Paper}
      style={{ maxHeight: maxHeight, minHeight: minHeight }}
    >
      <Table stickyHeader size="small" aria-label="customized table">
        <TableHead>
          <StyledTableRow>
            {columns
              .filter((col) => col.visible)
              .map((col) => (
                <StyledTableCell key={col.key}>{col.header}</StyledTableCell>
              ))}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {data.map((item, rowIndex) => (
            <StyledTableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              key={`row-${rowIndex}`}
            >
              {columns
                .filter((col) => col.visible)
                .map((col) => (
                  <StyledTableCell key={`${col.key}-${rowIndex}`}>
                    {renderCell(item, col)}
                  </StyledTableCell>
                ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomGrid;
