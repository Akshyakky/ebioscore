//src/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage.tsx
import React, { useRef, useState } from "react";
import { Container, Paper, Box, Accordion, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import InsurancePage from "../../RegistrationPage/SubPage/InsurancePage";
import ActionButtonGroup, { ButtonProps, } from "../../../../components/Button/ActionButtonGroup";
import { Search as SearchIcon, Print as PrintIcon, Delete as DeleteIcon, Save as SaveIcon, } from "@mui/icons-material";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import AdmissionDetails from "../SubPage/AdmissionDetails";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AdmissionDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import { extendedAdmissionService } from "../../../../services/PatientAdministrationServices/patientAdministrationService";

const AdmissionPage: React.FC = () => {
  const [formData, setFormData] = useState<Partial<AdmissionDto>>({});
  const insurancePageRef = useRef<any>(null);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);

  const handleChange = (field: keyof AdmissionDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData({});
    setShouldClearInsuranceData(true);
  };

  const handleSave = async () => {
    try {
      const result = await extendedAdmissionService.admitPatient(formData as AdmissionDto);
      // Handle successful save
      console.log("Admission saved:", result);
    } catch (error) {
      // Handle error
      console.error("Error saving admission:", error);
    }
  };

  const handleAdvancedSearch = async () => { };

  const fetchPatientSuggestions = async (input: string): Promise<string[]> => {
    // Implement patient suggestion fetching logic
    return [];
  };

  const handlePatientSelect = (pChartID: number | null) => {
    // Implement patient selection logic
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
        <AdmissionDetails
          formData={formData}
          onChange={handleChange}
          fetchPatientSuggestions={fetchPatientSuggestions}
          handlePatientSelect={handlePatientSelect}
        />
      </Paper>

      <Box sx={{ marginTop: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Payer Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <InsurancePage
              ref={insurancePageRef}
              pChartID={formData.pChartID || 0}
              shouldClearData={shouldClearInsuranceData}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Principal Diagnosis</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Add Principal Diagnosis component here */}
          </AccordionDetails>
        </Accordion>
      </Box>

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
