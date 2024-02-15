import React, { useState } from "react";
import MainLayout from "../../../layouts/MainLayout/MainLayout";
import FloatingLabelTextBox from "../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import CustomGrid from "../../../components/CustomGrid/CustomGrid";
import {
  Column,
  RoutineReports,
} from "../../../interfaces/RoutineReports/RoutineReports.interface";
import { fetchReports } from "../../../services/ReportService/ReportService";
import CustomButton from "../../../components/Button/CustomButton";
import PrintIcon from "@mui/icons-material/Print";
import { Box, Grid, Paper, Typography } from "@mui/material";
import useReportsData from "../../../hooks/RoutineReports/useReportsData";
import useSearch from "../../../hooks/RoutineReports/useSearch";
import ReportCriteria from "../SubPage/ReportCriteria";
interface ListOfReportsPageProps {
  // Your props here
}

const ListOfReportsPage: React.FC<ListOfReportsPageProps> = () => {
  const [selectedReportName, setSelectedReportName] = useState("");
  const { data: reports } = useReportsData<RoutineReports>(fetchReports, 4);
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    searchTerm,
    setSearchTerm,
    filteredData: filteredReports,
  } = useSearch<RoutineReports>(reports, ["repName"]);

  const columns: Column<RoutineReports>[] = [
    { key: "repName", header: "Report Name", visible: true },
    {
      key: "repID", // Use repID for key since 'print' is not a property of RoutineReports
      header: "Actions",
      visible: true,
      render: (report) => (
        <CustomButton
          onClick={() => openCriteriaModal(report.repName)}
          text="Print"
          icon={PrintIcon}
        />
      ),
    },
  ];
  // Handlers for the ReportCriteria actions
  const handleExportExcel = () => {
    console.log("Exporting to Excel");
    // Implement the export functionality here
  };

  const handlePrintPDF = () => {
    console.log("Printing to PDF");
    // Implement the print functionality here
  };
  const openCriteriaModal = (reportName: string) => {
    setSelectedReportName(reportName);
    setIsCriteriaOpen(true); // Ensure ReportCriteria is rendered
    setIsModalOpen(true); // Open the modal
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  return (
    <MainLayout>
      <Box padding={3}>
        <Paper elevation={3}>
          <Box padding={2}>
            <Typography variant="h4" gutterBottom>
              List of Reports
            </Typography>
            <Box mb={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FloatingLabelTextBox
                    ControlID="searchReports"
                    title="Search Reports"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search..."
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <CustomGrid<RoutineReports>
                  columns={columns}
                  data={filteredReports}
                  maxHeight="600px"
                  searchTerm={searchTerm}
                />
              </Grid>
            </Grid>
          </Box>

          {isCriteriaOpen && (
            <ReportCriteria
              onExportExcel={handleExportExcel}
              onPrintPDF={handlePrintPDF}
              reportName={selectedReportName}
              isModalOpen={isModalOpen}
              handleCloseModal={handleCloseModal}
            />
          )}
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default ListOfReportsPage;
