import React, { useRef, useCallback } from "react";
import { Button, ButtonProps } from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { CSVLink } from "react-csv";

// Type definitions
export interface ExportProps<T> extends Omit<ButtonProps, "onClick"> {
  data: T[];
  columns: Array<{
    key: string;
    header: string;
    visible?: boolean;
    formatter?: (value: any) => any;
  }>;
  filename?: string;
  buttonLabel?: string;
}

const ExportCSV = <T extends Record<string, any>>({ data, columns, filename = "export.csv", buttonLabel = "Export CSV", ...buttonProps }: ExportProps<T>) => {
  // Use correct ref type for CSVLink
  const csvLinkRef = useRef<CSVLink>(null);

  // Format headers for CSV
  const headers = React.useMemo(
    () =>
      columns
        .filter((col) => col.visible !== false)
        .map((col) => ({
          label: col.header,
          key: col.key,
        })),
    [columns]
  );

  // Format data for CSV
  const csvData = React.useMemo(
    () =>
      data.map((item) => {
        const rowData: Record<string, any> = {};
        columns
          .filter((col) => col.visible !== false)
          .forEach((col) => {
            const value = item[col.key];
            if (col.formatter) {
              const formattedValue = col.formatter(value);
              // Handle React elements and convert to string
              rowData[col.key] = React.isValidElement(formattedValue) ? (formattedValue.props as any)?.children || "" : String(formattedValue);
            } else {
              rowData[col.key] = value;
            }
          });
        return rowData;
      }),
    [data, columns]
  );

  // Handle export click
  const handleExportClick = useCallback(() => {
    if (csvLinkRef.current) {
      // Trigger click on the hidden CSVLink
      const linkElement = csvLinkRef.current as unknown as HTMLElement;
      linkElement.click();
    }
  }, []);

  return (
    <>
      <Button startIcon={<GetAppIcon />} onClick={handleExportClick} {...buttonProps}>
        {buttonLabel}
      </Button>
      <CSVLink
        data={csvData}
        headers={headers}
        filename={filename}
        ref={csvLinkRef as any} // Type assertion to handle ref
        style={{ display: "none" }}
        asyncOnClick={true}
      />
    </>
  );
};

export default React.memo(ExportCSV) as typeof ExportCSV;
