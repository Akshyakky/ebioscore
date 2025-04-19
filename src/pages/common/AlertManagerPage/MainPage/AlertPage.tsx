// src/pages/common/AlertManagerPage/MainPage/AlertPage.tsx
import React, { useState, useContext } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import ActionButtonGroup from "@/components/Button/ActionButtonGroup";
import SearchIcon from "@mui/icons-material/Search";
import AlertDetails from "../SubPage/AlertDetails";
import PatientSearch from "@/pages/patientAdministration/CommonPage/AdvanceSearch/PatientSearch";
import { PatientSearchContext } from "@/context/PatientSearchContext";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { AlertManagerProvider } from "@/context/Common/AlertManagerContext";

const AlertPage: React.FC = () => {
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const { performSearch } = useContext(PatientSearchContext);
  const [selectedPatient, setSelectedPatient] = useState<{ pChartID: number; pChartCode: string } | null>(null);

  const handleAdvancedSearch = async () => {
    setShowPatientSearch(true);
    await performSearch("");
  };

  const handlePatientSelect = (selectedSuggestion: string, pChartCode: string) => {
    const pChartID = parseInt(pChartCode.replace(/[^0-9]/g, "")) || 0;
    setSelectedPatient({
      pChartID,
      pChartCode,
    });
    setShowPatientSearch(false);
  };

  return (
    <AlertManagerProvider>
      <Container maxWidth={false}>
        {/* <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <NotificationsActiveIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h5" fontWeight="medium">
            Alert Manager
          </Typography>
        </Box> */}

        <Box sx={{ mb: 3 }}>
          <ActionButtonGroup
            buttons={[
              {
                variant: "contained",
                size: "medium",
                icon: SearchIcon,
                text: "Advanced Patient Search",
                onClick: handleAdvancedSearch,
              },
            ]}
          />
        </Box>

        <PatientSearch show={showPatientSearch} handleClose={() => setShowPatientSearch(false)} onEditPatient={handlePatientSelect} />

        <Paper variant="outlined" sx={{ padding: 3 }}>
          <AlertDetails
            editData={
              selectedPatient
                ? {
                    oPIPAlertID: 0,
                    pChartID: selectedPatient.pChartID,
                    pChartCode: selectedPatient.pChartCode,
                    // Other required properties with defaults
                    oPIPNo: 0,
                    oPIPCaseNo: 0,
                    patOPIPYN: "Y",
                    alertDescription: "",
                    oPIPDate: new Date(),
                    category: "",
                    oldPChartID: 0,
                    oPVID: 0,
                    rActiveYN: "Y",
                  }
                : undefined
            }
          />
        </Paper>
      </Container>
    </AlertManagerProvider>
  );
};

export default AlertPage;
