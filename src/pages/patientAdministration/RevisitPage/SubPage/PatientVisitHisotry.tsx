import React, { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import { GetPatientVisitHistory } from "@/interfaces/PatientAdministration/revisitFormData";
import useDayjs from "@/hooks/Common/useDateTime";
import { RevisitService } from "@/services/PatientAdministrationServices/RevisitService/RevisitService";
import CustomGrid, { Column } from "@/components/CustomGrid/CustomGrid";
interface PatientVisitHistoryProps {
  pChartID: number;
}

const PatientVisitHistory: React.FC<PatientVisitHistoryProps> = ({ pChartID }) => {
  const [patientHistoryData, setPatientHistoryData] = useState<GetPatientVisitHistory[]>([]);
  const { formatDateTime } = useDayjs();

  useEffect(() => {
    if (pChartID) {
      const fetchPatientHistory = async () => {
        const historyData = await RevisitService.getPatientHistoryByPChartID(pChartID);
        if (historyData.success && historyData.data) {
          setPatientHistoryData(historyData.data);
        }
      };
      fetchPatientHistory();
    } else {
      setPatientHistoryData([]);
    }
  }, [pChartID]);

  const gridPatientHistoryColumns: Column<GetPatientVisitHistory>[] = [
    {
      key: "SlNo",
      header: "#",
      visible: true,
      render: (_row: GetPatientVisitHistory, index: number) => (index + 1).toString(),
    },
    {
      key: "visitDate",
      header: "Visit Date & Time",
      visible: true,
      render: (row: GetPatientVisitHistory) => formatDateTime(row.visitDate),
    },
    {
      key: "departmentName",
      header: "Department",
      visible: true,
    },
    {
      key: "attendingPhysicianName",
      header: "Attending Physician",
      visible: true,
    },
    {
      key: "facName",
      header: "Speciality",
      visible: true,
    },
    {
      key: "visitType",
      header: "Visit Type",
      visible: true,
    },
    {
      key: "modifiedBy",
      header: "Created By",
      visible: true,
    },
  ];

  return (
    <section aria-labelledby="patient-history-header">
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h6" id="patient-history-header">
            Patient History
          </Typography>
        </Grid>
        <Grid container justifyContent="space-between">
          <Grid item xs={12} sm={12} lg={12} xl={12}>
            <CustomGrid columns={gridPatientHistoryColumns} data={patientHistoryData} />
          </Grid>
        </Grid>
      </Grid>
    </section>
  );
};

export default PatientVisitHistory;
