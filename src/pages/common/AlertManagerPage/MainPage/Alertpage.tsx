import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import { useLoading } from "@/context/LoadingContext";
import { PatientSearchContext } from "@/context/PatientSearchContext";
import { AlertDto } from "@/interfaces/Common/AlertManager";
import PatientSearch from "@/pages/patientAdministration/CommonPage/AdvanceSearch/PatientSearch";
import { alertService } from "@/services/CommonServices/CommonModelServices";
import { PatientService } from "@/services/PatientAdministrationServices/RegistrationService/PatientService";
import { showAlertPopUp } from "@/utils/Common/alertMessage";
import { showAlert } from "@/utils/Common/showAlert";
import extractNumbers from "@/utils/PatientAdministration/extractNumbers";
import { Box, Container, Paper } from "@mui/material";
import React, { useContext, useState } from "react";
import AlertDetails from "../SubPage/AlertDetails";
import SearchIcon from "@mui/icons-material/Search";

const AlertPage: React.FC = () => {
  const [selectedData, setSelectedData] = useState<AlertDto | undefined>(undefined);
  const { setLoading } = useLoading();
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const { performSearch } = useContext(PatientSearchContext);
  const [, setSelectedPChartID] = useState<number>(0);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);

  const handlePatientSelect = async (selectedSuggestion: string, pChartCode: string) => {
    setLoading(true);
    try {
      const numbersArray = extractNumbers(pChartCode);
      const pChartID = numbersArray.length > 0 ? numbersArray[0] : null;
      if (pChartID) {
        await fetchPatientDetailsAndUpdateForm(pChartID);
        setSelectedPChartID(pChartID);

        const alertResult = await alertService.getById(pChartID);

        if (alertResult.success && alertResult.data) {
          const activeAlerts = alertResult.data.filter((alert: AlertDto) => alert.rActiveYN === "Y");

          setSelectedData({
            ...alertResult.data,
            pChartCode: pChartCode,
          });
          setAlerts(activeAlerts);

          if (activeAlerts.length > 0) {
            showAlertPopUp(activeAlerts);
          } else {
            console.info("No active alerts found.");
          }
        } else {
          console.error("Failed to fetch alert details.");
          setAlerts([]);
        }
      } else {
        showAlert("Error", "Unable to select patient. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error in handlePatientSelect:", error);
      showAlert("Error", "An unexpected error occurred while selecting the patient.", "error");
    } finally {
      setLoading(false);
    }
  };
  const fetchPatientDetailsAndUpdateForm = async (pChartID: number) => {
    setLoading(true);
    try {
      const patientDetails = await PatientService.getPatientDetails(pChartID);
      if (patientDetails.success && patientDetails.data) {
      } else {
        console.error("Fetching patient details was not successful or data is undefined");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async () => {
    setShowPatientSearch(true);
    await performSearch("");
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup
          buttons={[
            {
              variant: "contained",
              size: "medium",
              icon: SearchIcon,
              text: "Advanced Search",
              onClick: handleAdvancedSearch,
            },
          ]}
        />
      </Box>
      <PatientSearch show={showPatientSearch} handleClose={() => setShowPatientSearch(false)} onEditPatient={handlePatientSelect} />
      <Paper variant="outlined" sx={{ padding: 2 }}>
        <AlertDetails editData={selectedData} alerts={alerts} />
      </Paper>
    </Container>
  );
};

export default AlertPage;
