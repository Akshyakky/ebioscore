import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  Checkbox,
  IconButton,
  Tooltip,
  Button,
  Popover,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FilterList as FilterListIcon, GetApp as ExportIcon, ExpandMore, ExpandLess } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExportCSV from '../../utils/Common/ExportCSV';

export interface Column<T> {
  key: string;
  header: string;
  visible: boolean;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T, rowIndex: number, columnIndex: number) => React.ReactNode;
  formatter?: (value: any) => string;
  type?: 'text' | 'date' | 'status' | 'number';
  width?: number;
}


interface CustomGridProps<T> {
  columns: Column<T>[];
  data: T[];
  maxHeight?: string;
  minHeight?: string;
  searchTerm?: string;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  onRowClick?: (item: T) => void;
  pagination?: boolean;
  expandableRows?: boolean;
  renderExpandedRow?: (item: T) => React.ReactNode;
  showExportCSV?: boolean;
  showExportPDF?: boolean;
  exportFileName?: string;
}
const CustomGrid = <T extends Record<string, any>>({
  columns,
  data,
  maxHeight = '500px',
  minHeight,
  searchTerm = '',
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  onRowClick,
  pagination = false,
  expandableRows = false,
  renderExpandedRow,
  showExportCSV = false,
  showExportPDF = false,
  exportFileName = 'table_data',
}: CustomGridProps<T>) => {
  const [orderBy, setOrderBy] = useState<keyof T | ''>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [selected, setSelected] = useState<T[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [filterColumn, setFilterColumn] = useState<Column<T> | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(col => col.key));
  const [resizing, setResizing] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleSort = useCallback((property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(filteredData);
      onSelectionChange?.(filteredData);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleClick = (event: React.MouseEvent<unknown>, item: T) => {
    if (!selectable) {
      onRowClick?.(item);
      return;
    }

    const selectedIndex = selected.indexOf(item);
    let newSelected: T[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, item);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>, column: Column<T>) => {
    setFilterAnchorEl(event.currentTarget);
    setFilterColumn(column);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setFilterColumn(null);
  };

  const handleFilterApply = (value: any) => {
    if (filterColumn) {
      setFilters(prev => ({ ...prev, [filterColumn.key]: value }));
    }
    handleFilterClose();
    setPage(0);
  };

  const handleExpandRow = (rowIndex: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  };

  const handleColumnReorder = (dragIndex: number, hoverIndex: number) => {
    const newColumnOrder = [...columnOrder];
    const draggedColumn = newColumnOrder[dragIndex];
    newColumnOrder.splice(dragIndex, 1);
    newColumnOrder.splice(hoverIndex, 0, draggedColumn);
    setColumnOrder(newColumnOrder);
  };

  const handleColumnResize = (columnKey: string, width: number) => {
    const newColumns = columns.map(col =>
      col.key === columnKey ? { ...col, width } : col
    );
    // Update columns state or prop here
  };

  const isSelected = (item: T) => selected.indexOf(item) !== -1;

  const sortedData = useMemo(() => {
    if (!orderBy) return data;
    return [...data].sort((a, b) => {
      if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, order, orderBy]);

  const filteredData = useMemo(() => {
    return sortedData.filter((item) =>
      Object.entries(filters).every(([key, value]) => {
        const column = columns.find(col => col.key === key);
        if (!column) return true;
        const cellValue = item[key];

        switch (column.type) {
          case 'date':
            const date = new Date(cellValue);
            const filterDate = new Date(value);
            return date.toDateString() === filterDate.toDateString();
          case 'status':
            return cellValue === value;
          case 'number':
            return cellValue === Number(value);
          default:
            return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
        }
      })
    );
  }, [sortedData, filters, columns]);

  const searchedData = useMemo(() => {
    if (!searchTerm) return filteredData;
    return filteredData.filter((item) =>
      columns.some((col) => {
        const cellContent = item[col.key];
        return (
          typeof cellContent === 'string' &&
          cellContent.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    );
  }, [filteredData, searchTerm, columns]);

  const paginatedData = useMemo(() => {
    if (!pagination) return searchedData;
    return searchedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [searchedData, page, rowsPerPage, pagination]);

  const highlightMatch = useCallback((text: string, term: string) => {
    const parts = text.split(new RegExp(`(${term})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === term.toLowerCase() ? (
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
  }, []);

  const renderCell = useCallback((
    item: T,
    column: Column<T>,
    rowIndex: number,
    columnIndex: number,
  ) => {
    const cellContent = item[column.key];

    if (searchTerm && typeof cellContent === "string") {
      return highlightMatch(cellContent, searchTerm);
    } else if (column.render) {
      return (
        <Box sx={{ minWidth: column.width || 'auto' }}>
          {column.render(item, rowIndex, columnIndex)}
        </Box>
      );
    } else if (column.formatter) {
      return column.formatter(cellContent);
    }

    switch (column.type) {
      case 'date':
        return format(new Date(cellContent), 'dd/MM/yyyy');
      case 'status':
        return (
          <Box
            sx={{
              backgroundColor: cellContent === 'Active' ? 'green' : 'red',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'inline-block',
            }}
          >
            {cellContent}
          </Box>
        );
      default:
        return cellContent;
    }
  }, [searchTerm, highlightMatch]);

  const exportToCSV = () => {
    // CSVLink component will handle the CSV export
  };

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    if (tableRef.current && 'autoTable' in doc) {
      (doc as any).autoTable({ html: tableRef.current });
      doc.save(`${exportFileName}.pdf`);
    } else {
      console.error('autoTable is not available on the jsPDF instance');
    }
  }, [exportFileName]);

  const renderFilterContent = () => {
    if (!filterColumn) return null;

    switch (filterColumn.type) {
      case 'date':
        return (
          <DatePicker
            label="Filter by date"
            onChange={(newValue) => handleFilterApply(newValue)}
          />
        );
      case 'status':
        return (
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters[filterColumn.key] || ''}
              onChange={(e) => handleFilterApply(e.target.value)}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        );
      default:
        return (
          <TextField
            label="Filter"
            value={filters[filterColumn.key] || ''}
            onChange={(e) => handleFilterApply(e.target.value)}
          />
        );
    }
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
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

  const handleFilterChange = useCallback((columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value,
    }));
    setPage(0);
  }, []);

  return (
    <>
      {(showExportCSV || showExportPDF) && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {showExportCSV && (
            <ExportCSV
              data={filteredData}
              columns={columns}
              filename={`${exportFileName}.csv`}
            />
          )}
          {showExportPDF && (
            <Button startIcon={<ExportIcon />} onClick={exportToPDF}>
              Export PDF
            </Button>
          )}
        </Box>
      )}
      <StyledTableContainer>
        <Table ref={tableRef} stickyHeader size="small" aria-label="customized table">
          <TableHead>
            <TableRow>
              {expandableRows && <StyledTableCell />}
              {selectable && (
                <StyledTableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < searchedData.length}
                    checked={searchedData.length > 0 && selected.length === searchedData.length}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'select all items',
                    }}
                  />
                </StyledTableCell>
              )}
              {columnOrder.map((columnKey) => {
                const col = columns.find(c => c.key === columnKey);
                if (!col || !col.visible) return null;
                return (
                  <StyledTableCell
                    key={col.key}
                    style={{ width: col.width }}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', col.key)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedColumnKey = e.dataTransfer.getData('text');
                      const dragIndex = columnOrder.indexOf(draggedColumnKey);
                      const hoverIndex = columnOrder.indexOf(col.key);
                      handleColumnReorder(dragIndex, hoverIndex);
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      {col.sortable ? (
                        <TableSortLabel
                          active={orderBy === col.key}
                          direction={orderBy === col.key ? order : 'asc'}
                          onClick={() => handleSort(col.key as keyof T)}
                        >
                          {col.header}
                        </TableSortLabel>
                      ) : (
                        col.header
                      )}
                      {col.filterable && (
                        <IconButton size="small" onClick={(e) => handleFilterClick(e, col)}>
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '5px',
                        cursor: 'col-resize',
                      }}
                      onMouseDown={() => setResizing(col.key)}
                    />
                  </StyledTableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, rowIndex) => {
              const isItemSelected = isSelected(item);
              const isExpanded = expandedRows.has(rowIndex);
              return (
                <React.Fragment key={`row-${rowIndex}`}>
                  <StyledTableRow
                    key={`row-${rowIndex}`}
                    hover
                    onClick={(event) => handleClick(event, item)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                  >
                    {expandableRows && (
                      <StyledTableCell>
                        <IconButton size="small" onClick={() => handleExpandRow(rowIndex)}>
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </StyledTableCell>
                    )}
                    {selectable && (
                      <StyledTableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': `enhanced-table-checkbox-${rowIndex}`,
                          }}
                        />
                      </StyledTableCell>
                    )}
                    {columnOrder.map((columnKey, columnIndex) => {
                      const col = columns.find(c => c.key === columnKey);
                      if (!col || !col.visible) return null;
                      return (
                        <StyledTableCell key={`${col.key}-${rowIndex}`} style={{ width: col.width || 'auto' }}>
                          {renderCell(item, col, rowIndex, columnIndex)}
                        </StyledTableCell>
                      );
                    })}
                  </StyledTableRow>
                  {expandableRows && isExpanded && (
                    <TableRow>
                      <TableCell colSpan={columns.length + (selectable ? 2 : 1)}>
                        {renderExpandedRow && renderExpandedRow(item)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </StyledTableContainer>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={searchedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {renderFilterContent()}
      </Popover>
    </>
  );
};

export default CustomGrid;