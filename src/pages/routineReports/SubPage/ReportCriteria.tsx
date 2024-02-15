// components/ReportCriteria/ReportCriteria.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../components/DropDown/DropdownSelect";
import CustomButton from "../../../components/Button/CustomButton";
import PrintIcon from "@mui/icons-material/Print";
import CancelIcon from "@mui/icons-material/Cancel";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { CompanyService } from "../../../services/CommonService/CompanyService";
import { Company } from "../../../types/Common/Company.type";

interface ReportCriteriaProps {
  onExportExcel: () => void;
  onPrintPDF: () => void;
  reportName: string;
  isModalOpen: boolean;
  handleCloseModal: () => void;
}
const ReportCriteria: React.FC<ReportCriteriaProps> = ({
  onExportExcel,
  onPrintPDF,
  reportName,
  isModalOpen,
  handleCloseModal,
}) => {
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split("T")[0] : "";

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
          setSelectedCompany(data[0].compIDCompCode);
        }
      } catch (err) {
        // Handle errors as needed
        console.error(err);
      }
    };

    fetchCompanies();
  }, []);

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

          <FloatingLabelTextBox
            ControlID="ToDate"
            title="To Date"
            type="date"
            value={formatDate(toDate)}
            onChange={(e) => handleToDateChange(e.target.value)}
            size="small"
          />
        </Box>
        <DropdownSelect
          label="Select Company"
          name="selectedCompany"
          value={selectedCompany}
          options={companies.map((c) => ({
            value: c.compIDCompCode,
            label: c.compName,
          }))}
          onChange={(event) => setSelectedCompany(event.target.value as string)}
          defaultText="Select Company"
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <CustomButton
          text="Cancel"
          onClick={handleCloseModal}
          icon={CancelIcon}
          color="error"
        />
        <CustomButton
          variant="contained"
          icon={PrintIcon}
          text="View PDF"
          onClick={onPrintPDF}
          color="secondary"
        />
        <CustomButton
          variant="contained"
          icon={PictureAsPdfIcon}
          text="Export PDF"
          onClick={onPrintPDF}
          color="success"
        />
        <CustomButton
          variant="contained"
          icon={CloudDownloadIcon}
          text="Export Excel"
          onClick={onExportExcel}
          color="primary"
        />
      </DialogActions>
    </Dialog>
  );
};

export default ReportCriteria;
