import React from 'react';
import { Table } from 'react-bootstrap';

interface Column {
  key: string;
  header: string;
}

interface CustomGridProps {
  columns: Column[];
  data: any[]; // Replace `any` with a specific type corresponding to your data items
}

const CustomGrid: React.FC<CustomGridProps> = ({ columns, data }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((col, colIndex) => (
              <td key={colIndex}>{item[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default CustomGrid;
