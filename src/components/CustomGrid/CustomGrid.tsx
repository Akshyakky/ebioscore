import { Table } from "react-bootstrap";

// Define a generic type with an index signature
type GenericObject = { [key: string]: any };

interface Column<T> {
  key: string;
  header: string;
  visible: boolean;
  render?: (item: T) => JSX.Element | string;
}

interface CustomGridProps<T> {
  columns: Column<T>[];
  data: T[];
}

// Ensure T extends GenericObject to provide an index signature
const CustomGrid = <T extends GenericObject>({
  columns,
  data,
}: CustomGridProps<T>) => {
  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    return item[column.key];
  };

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          {columns
            .filter((col) => col.visible)
            .map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {columns
              .filter((col) => col.visible)
              .map((col) => (
                <td key={`${col.key}-${rowIndex}`}>{renderCell(item, col)}</td>
              ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default CustomGrid;
