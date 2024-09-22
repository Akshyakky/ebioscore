import React, { useRef, useState } from "react";
import { Container, Paper, Box } from "@mui/material";
import InsurancePage from "../../RegistrationPage/SubPage/InsurancePage";
import ActionButtonGroup, { ButtonProps, } from "../../../../components/Button/ActionButtonGroup";
import { Search as SearchIcon, Print as PrintIcon, Delete as DeleteIcon, Save as SaveIcon, } from "@mui/icons-material";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";

const AdmissionPage: React.FC = () => {
  const insurancePageRef = useRef<any>(null);
  const [selectedPChartID, setSelectedPChartID] = useState<number | 0>(0);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);

  const handleClear = () => {
    setSelectedPChartID(0);
  };

  const handleSave = () => { };

  const handleAdvancedSearch = async () => { };

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
      text: "Print Admission Form",
      size: "medium",
    },
  ];

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} />
      </Box>
      <Paper variant="elevation" sx={{ padding: 2 }}>
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
