import React, { useContext, useEffect, useRef, useState } from "react";
import { Container, Paper, Grid, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import InsurancePage from "../../RegistrationPage/SubPage/InsurancePage";
import { useLoading } from "../../../../context/LoadingContext";
import { InsuranceFormState } from "../../../../interfaces/PatientAdministration/InsuranceDetails";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";

import {
  Search as SearchIcon,
  Print as PrintIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { PatientSearchContext } from "../../../../context/PatientSearchContext";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";

const AdmissionPage: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const insurancePageRef = useRef<any>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const { performSearch } = useContext(PatientSearchContext);
  const token = userInfo.token!;
  const [selectedPChartID, setSelectedPChartID] = useState<number | 0>(0);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] =
    useState(false);
  const [triggerInsuranceSave, setTriggerInsuranceSave] = useState(false);
  const { setLoading } = useLoading();

  useEffect(() => {
    if (shouldClearInsuranceData) {
      setShouldClearInsuranceData(false);
    }
  }, [shouldClearInsuranceData]);

  const handleClear = () => {
    setShouldClearInsuranceData(true);
    setSelectedPChartID(0);
  };

  const handleSave = () => {
    setTriggerInsuranceSave(true);
  };

  const handleAdvancedSearch = async () => {
    setShowPatientSearch(true);
    await performSearch("");
  };

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
    {
      variant: "contained",
      icon: PrintIcon,
      text: "Print Form",
      size: "medium",
    },
  ];

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} />
      </Box>
      <Paper variant="outlined" sx={{ padding: 2 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item></Grid>
        </Grid>
        <InsurancePage
          ref={insurancePageRef}
          pChartID={selectedPChartID}
          shouldClearData={shouldClearInsuranceData}
        />
      </Paper>
      <Box sx={{ marginTop: 2 }}>
        <FormSaveClearButton
          clearText="Clear"
          saveText="Save"
          onClear={handleClear}
          onSave={handleSave}
          clearIcon={DeleteIcon}
          saveIcon={SaveIcon}
        />
      </Box>
    </Container>
  );
};

export default AdmissionPage;
