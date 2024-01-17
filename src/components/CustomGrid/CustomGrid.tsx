import { CSSProperties } from "react";
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
  maxHeight?: string; // Optional max height
}

// Ensure T extends GenericObject to provide an index signature
const CustomGrid = <T extends GenericObject>({
  columns,
  data,
  maxHeight,
}: CustomGridProps<T>) => {
  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    return item[column.key];
  };
  // Custom styles for the container
  const containerStyle: CSSProperties = {
    maxHeight: maxHeight,
    overflowY: "auto",
  };

  const stickyHeaderStyle: CSSProperties = {
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    zIndex: 1020, // higher than the z-index of elements below
    boxShadow: "0 2px 2px -1px rgba(0, 0, 0, 0.4)",
  };
 

  return (
    <div style={containerStyle}>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            {columns
              .filter((col) => col.visible)
              .map((col) => (
                <th key={col.key} style={stickyHeaderStyle}>
                  {col.header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {columns
                .filter((col) => col.visible)
                .map((col) => (
                  <td key={`${col.key}-${rowIndex}`}>
                    {renderCell(item, col)}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CustomGrid;
