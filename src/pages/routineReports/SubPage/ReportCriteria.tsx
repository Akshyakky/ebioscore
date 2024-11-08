// components/ReportCriteria/ReportCriteria.tsx
import React, { useEffect, useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, SelectChangeEvent, Typography } from "@mui/material";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomButton from "../../../components/Button/CustomButton";
import PrintIcon from "@mui/icons-material/Print";
import CancelIcon from "@mui/icons-material/Cancel";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { CompanyService } from "../../../services/CommonServices/CompanyService";
import { Company } from "../../../types/Common/Company.type";
import MultiSelectDropdown from "../../../components/DropDown/MultiSelectDropdown";
import { ExportService } from "../../../services/RoutineReportService/ExportService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/reducers";
import PdfViewer from "../../../components/PDFViewer/PdfViewer";

interface ReportCriteriaProps {
  onExportExcel: (reportId: string, fromDate: string, toDate: string, selectedCompanies: string[]) => void;
  onPrintPDF: () => void;
  reportName: string;
  reportId: number;
  isModalOpen: boolean;
  handleCloseModal: () => void;
}
const ReportCriteria: React.FC<ReportCriteriaProps> = ({ onExportExcel, onPrintPDF, reportName, reportId, isModalOpen, handleCloseModal }) => {
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const formatDate = (date: Date | null) => (date ? date.toISOString().split("T")[0] : "");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  const handleToDateChange = (newDateValue: string) => {
    const newToDate = new Date(newDateValue);
    if (fromDate && newToDate < fromDate) {
      // If new toDate is before fromDate, keep toDate the same as fromDate
      setToDate(fromDate);
    } else {
      setToDate(newToDate);
    }
  };
  const handleFromDateChange = (newDateValue: string) => {
    const newFromDate = new Date(newDateValue);
    setFromDate(newFromDate);
    if (toDate && newFromDate > toDate) {
      setToDate(newFromDate); // Adjust toDate if it's before the new fromDate
    }
  };
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await CompanyService.getCompanies();
        setCompanies(data);
        if (data.length === 1) {
          setSelectedCompanies([data[0].compIDCompCode]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCompanies();
  }, []);

  const handleCompanyChange = (event: SelectChangeEvent<unknown>) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    setSelectedCompanies(typeof value === "string" ? value.split(",") : (value as string[]));
  };
  // Corrected function without 'props' prefix
  const handleExportExcel = async () => {
    // Dummy token for example purposes. Replace with actual token retrieval.

    try {
      await ExportService.exportToExcel({
        reportId: reportId,
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        selectedCompanies: selectedCompanies,
      });
      console.log("Excel exported successfully.");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const handlePrintPDF = async () => {
    // Dummy token for example purposes. Replace with actual token retrieval.
    try {
      await ExportService.generatePDF({
        reportId: reportId,
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        selectedCompanies: selectedCompanies,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  const handleViewPDF = async () => {
    try {
      const pdfUrl = await ExportService.generatePDFForView({
        reportId: reportId,
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        selectedCompanies: selectedCompanies,
      });
      setPdfUrl(pdfUrl); // Set the state with the PDF URL
      setIsPdfViewerOpen(true); // Show the PDF viewer component
    } catch (error) {
      console.error("Error viewing PDF:", error);
    }
  };
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <Dialog
      open={isModalOpen}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleCloseModal();
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">{`Printing: ${reportName}`}</Typography>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" gap={2} marginBottom={2}>
          <FloatingLabelTextBox
            ControlID="FromDate"
            title="From Date"
            type="date"
            value={formatDate(fromDate)}
            onChange={(e) => handleFromDateChange(e.target.value)}
            size="small"
          />

          <FloatingLabelTextBox ControlID="ToDate" title="To Date" type="date" value={formatDate(toDate)} onChange={(e) => handleToDateChange(e.target.value)} size="small" />
        </Box>
        <MultiSelectDropdown
          label="Select Companies"
          name="selectedCompanies"
          value={selectedCompanies}
          options={companies.map((company) => ({
            value: company.compIDCompCode,
            label: company.compName,
          }))}
          onChange={handleCompanyChange}
          defaultText="Select Companies"
          size="small"
          multiple={true}
        />
        {isPdfViewerOpen && <PdfViewer pdfUrl={pdfUrl} onClose={() => setIsPdfViewerOpen(false)} open={isPdfViewerOpen} reportName={reportName} />}
      </DialogContent>
      <DialogActions>
        <CustomButton text="Cancel" onClick={handleCloseModal} icon={CancelIcon} color="error" />
        <CustomButton variant="contained" icon={PrintIcon} text="View PDF" onClick={handleViewPDF} color="secondary" />
        <CustomButton variant="contained" icon={PictureAsPdfIcon} text="Export PDF" onClick={handlePrintPDF} color="success" />
        <CustomButton variant="contained" icon={CloudDownloadIcon} text="Export Excel" onClick={handleExportExcel} color="primary" />
      </DialogActions>
    </Dialog>
  );
};

export default ReportCriteria;
