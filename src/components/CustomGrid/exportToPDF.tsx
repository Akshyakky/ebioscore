import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import { Column } from "./CustomGrid";

interface ExportToPdfProps<T> {
  columns: Column<T>[];
  data: T[];
  filename?: string;
  title?: string;
  subtitle?: string;
}

export const exportToPDF = <T extends Record<string, any>>({ columns, data, filename = "export", title, subtitle }: ExportToPdfProps<T>) => {
  // Create new document instance
  const doc = new jsPDF();
  const visibleColumns = columns.filter((col) => col.visible);

  // Document Configuration
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  let yOffset = margin;

  // Add Title if provided
  if (title) {
    doc.setFontSize(16);
    doc.text(title, margin, yOffset);
    yOffset += 10;
  }

  // Add Subtitle if provided
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, margin, yOffset);
    yOffset += 10;
  }

  // Prepare table headers and data
  const headers = visibleColumns.map((col) => ({
    header: col.header,
    dataKey: col.key,
  }));

  const tableData = data.map((item) =>
    visibleColumns.map((col) => {
      const value = item[col.key];
      if (col.formatter) {
        return col.formatter(value, item);
      }
      if (col.type === "date" && value) {
        return new Date(value).toLocaleDateString();
      }
      return value?.toString() || "";
    })
  );

  // Configure autoTable options
  const tableOptions: UserOptions = {
    startY: yOffset,
    head: [headers.map((h) => h.header)],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      halign: "left",
    },
    columnStyles: {},
    margin: {
      top: margin,
      right: margin,
      bottom: margin,
      left: margin,
    },
    didDrawPage: (data) => {
      // Add page number at the bottom
      doc.setFontSize(8);
      doc.text(`Page ${data.pageNumber} of ${doc.getNumberOfPages()}`, pageWidth / 2, doc.internal.pageSize.height - 5, { align: "center" });
    },
  };

  // Correctly call autoTable with both document and options
  autoTable(doc, tableOptions);
  // Or alternatively:
  // doc.autoTable(doc, tableOptions);

  // Save the PDF
  doc.save(`${filename}.pdf`);
};
