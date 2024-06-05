import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

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
  maxHeight?: string;
  minHeight?: string;
  searchTerm?: string;
}

const CustomGrid = <T extends GenericObject>({
  columns,
  data,
  maxHeight,
  minHeight,
  searchTerm,
}: CustomGridProps<T>) => {
  const highlightMatch = (text: string, searchTerm: string) => {
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <span key={index} style={{ backgroundColor: "yellow" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const renderCell = (item: T, column: Column<T>, searchTerm: string = "") => {
    const cellContent = item[column.key];

    if (searchTerm && typeof cellContent === "string") {
      return highlightMatch(cellContent, searchTerm);
    } else if (column.render) {
      return column.render(item);
    } else if (column.formatter) {
      return column.formatter(item[column.key]);
    }
    return cellContent;
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.common.white,
      fontWeight: "bold",
      textAlign: "left",
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
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
                    {renderCell(item, col, searchTerm)}
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
