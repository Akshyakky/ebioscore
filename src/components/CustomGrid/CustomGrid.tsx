import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface Column<T> {
  key: string;
  header: string;
  visible: boolean;
  sortable?: boolean;
  render?: (item: T, rowIndex: number, columnIndex: number) => JSX.Element | string;
  formatter?: (value: any) => string;
}

interface CustomGridProps<T> {
  columns: Column<T>[];
  data: T[];
  maxHeight?: string;
  minHeight?: string;
  searchTerm?: string;
}

const CustomGrid = <T extends Record<string, any>>({
  columns,
  data,
  maxHeight = '500px',
  minHeight,
  searchTerm = '',
}: CustomGridProps<T>) => {

  const [orderBy, setOrderBy] = useState<keyof T | ''>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    if (!orderBy) return data;
    return [...data].sort((a, b) => {
      if (orderBy === 'siNo') {
        return order === 'asc'
          ? Number(a[orderBy]) - Number(b[orderBy])
          : Number(b[orderBy]) - Number(a[orderBy]);
      }
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, order, orderBy]);

  const highlightMatch = (text: string, searchTerm: string) => {
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <span key={index} style={{
              backgroundColor: "rgba(63, 81, 181, 0.2)",
              color: "#1a237e",
              fontWeight: 'bold',
              padding: '2px 0',
              borderRadius: '2px'
            }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const renderCell = (
    item: T,
    column: Column<T>,
    rowIndex: number,
    columnIndex: number,
    searchTerm: string = ""
  ) => {
    const cellContent = item[column.key];

    if (searchTerm && typeof cellContent === "string") {
      return highlightMatch(cellContent, searchTerm);
    } else if (column.render) {
      return column.render(item, rowIndex, columnIndex);
    } else if (column.formatter) {
      return column.formatter(item[column.key]);
    }
    return cellContent;
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
      backgroundColor: theme.palette.primary.dark,
      color: theme.palette.common.white,
      fontWeight: 'bold',
      textAlign: 'left',
    },
    '&.MuiTableCell-body': {
      fontSize: 14,
    },
  }));

  const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    maxHeight,
    minHeight,
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      height: '6px',
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.grey[200],
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.main,
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: theme.palette.primary.dark,
    },
  }));

  const visibleColumns = useMemo(() => columns.filter((col) => col.visible), [columns]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    return sortedData.filter((item) =>
      visibleColumns.some((col) => {
        const cellContent = item[col.key];
        return (
          typeof cellContent === 'string' &&
          cellContent.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }, [sortedData, searchTerm, visibleColumns]);

  return (
    <StyledTableContainer as={Paper}>
      <Table stickyHeader size="small" aria-label="customized table">
        <TableHead>
          <StyledTableRow>
            {visibleColumns.map((col) => (
              <StyledTableCell key={col.key}>
                {col.sortable ? (
                  <TableSortLabel
                    active={orderBy === col.key}
                    direction={orderBy === col.key ? order : 'asc'}
                    onClick={() => handleSort(col.key as keyof T)}
                    style={{ color: 'white' }}
                  >
                    {col.header}
                  </TableSortLabel>
                ) : (
                  col.header
                )}
              </StyledTableCell>
            ))}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {filteredData.map((item, rowIndex) => (
            <StyledTableRow key={`row-${rowIndex}`}>
              {visibleColumns.map((col, columnIndex) => (
                <StyledTableCell key={`${col.key}-${rowIndex}`}>
                  {renderCell(item, col, rowIndex, columnIndex, searchTerm)}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default CustomGrid;
