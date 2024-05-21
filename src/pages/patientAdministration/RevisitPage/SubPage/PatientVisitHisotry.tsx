import { useEffect, useState } from "react";
import CustomGrid from "../../../../components/CustomGrid/CustomGrid";
import { GetPatientVisitHistory } from "../../../../interfaces/PatientAdministration/revisitFormData";
import { Grid, Typography } from "@mui/material";
import { RevisitService } from "../../../../services/PatientAdministrationServices/RevisitService/RevisitService";
import { formatDate } from "../../../../utils/Common/dateUtils";
interface PatientVisitHistoryProps {
  pChartID: number;
  token: string;
}
const PatientVisitHistory: React.FC<PatientVisitHistoryProps> = ({
  pChartID,
  token,
}) => {
  const [patientHistoryData, setPatientHistoryData] = useState<
    GetPatientVisitHistory[]
  >([]);

  useEffect(() => {
    if (pChartID) {
      const fetchPatientHistory = async () => {
        const historyData = await RevisitService.getPatientHistoryByPChartID(
          token,
          pChartID
        );
        if (historyData.success && historyData.data) {
          setPatientHistoryData(historyData.data);
        }
      };

      fetchPatientHistory();
    } else {
      setPatientHistoryData([]);
    }
  }, [pChartID, token]);
  const gridPatientHistoryColumns = [
    {
      key: "SlNo",
      header: "#",
      visible: true,
    },
    {
      key: "visitDate",
      header: "Visit Date & Time",
      visible: true,
      formatter: (value: string) => formatDate(value),
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
      header: "VisitType",
      visible: true,
    },
    {
      key: "modifiedBy",
      header: "Created By",
      visible: true,
    },
  ];
  return (
    <section aria-labelledby="Insurance-header">
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h6" id="insurance-details-header">
            Patient History
          </Typography>
        </Grid>
        <Grid container justifyContent="space-between">
          <Grid item xs={12} sm={12} lg={12} xl={12}>
            <CustomGrid
              columns={gridPatientHistoryColumns}
              data={patientHistoryData}
            />
          </Grid>
        </Grid>
      </Grid>
    </section>
  );
};
export default PatientVisitHistory;
