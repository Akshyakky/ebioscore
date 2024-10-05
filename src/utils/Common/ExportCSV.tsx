import React, { useRef } from 'react';
import { Button } from '@mui/material';
import { GetApp as ExportIcon } from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import { Column } from '../../components/CustomGrid/CustomGrid';

interface ExportProps<T> {
    data: T[];
    columns: Column<T>[];
    filename?: string;
}

const ExportCSV = <T extends Record<string, any>>({ data, columns, filename = 'table_data.csv' }: ExportProps<T>) => {
    const csvLink = useRef<CSVLink & HTMLAnchorElement>(null);

    const headers = columns
        .filter(col => col.visible)
        .map(col => ({ label: col.header, key: col.key }));

    const csvData = data.map(item =>
        columns
            .filter(col => col.visible)
            .reduce((acc, col) => {
                acc[col.key] = col.formatter ? col.formatter(item[col.key]) : item[col.key];
                return acc;
            }, {} as Record<string, any>)
    );

    const handleExportClick = () => {
        csvLink.current?.link.click();
    };

    return (
        <>
            <Button startIcon={<ExportIcon />} onClick={handleExportClick}>
                Export CSV
            </Button>
            <CSVLink
                data={csvData}
                headers={headers}
                filename={filename}
                ref={csvLink}
                style={{ display: 'none' }}
            />
        </>
    );
};

export default ExportCSV;