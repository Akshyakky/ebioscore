//src/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage.tsx
import React, { useRef, useState } from "react";
import { Container, Box, styled } from "@mui/material";
import InsurancePage from "../../RegistrationPage/SubPage/InsurancePage";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import { Search as SearchIcon, Print as PrintIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import AdmissionDetails from "../SubPage/AdmissionDetails";
import { AdmissionDto, IPAdmissionDto, IPAdmissionDetailsDto, WrBedDetailsDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import { extendedAdmissionService } from "../../../../services/PatientAdministrationServices/patientAdministrationService";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import CustomAccordion from "../../../../components/Accordion/CustomAccordion";

const AdmissionPage: React.FC = () => {
  const [formData, setFormData] = useState<AdmissionDto>({
    IPAdmissionDto: {} as IPAdmissionDto,
    IPAdmissionDetailsDto: {} as IPAdmissionDetailsDto,
    WrBedDetailsDto: {} as WrBedDetailsDto
  });
  const insurancePageRef = useRef<any>(null);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);
  const { handleDropdownChange } = useDropdownChange<AdmissionDto>(setFormData);

  const handleChange = (field: keyof AdmissionDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setFormData({
      IPAdmissionDto: {} as IPAdmissionDto,
      IPAdmissionDetailsDto: {} as IPAdmissionDetailsDto,
      WrBedDetailsDto: {} as WrBedDetailsDto
    });
    setShouldClearInsuranceData(true);
  };

  const handleSave = async () => {
    try {
      const result = await extendedAdmissionService.admitPatient(formData);
      console.log("Admission saved:", result);
    } catch (error) {
      console.error("Error saving admission:", error);
    }
  };

  const handleAdvancedSearch = async () => {
    // Implement advanced search logic
  };

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
      <CustomAccordion title="Admission Details" defaultExpanded>
        <AdmissionDetails
          formData={formData}
          onChange={handleChange}
          onDropdownChange={handleDropdownChange}
          fetchPatientSuggestions={fetchPatientSuggestions}
          handlePatientSelect={handlePatientSelect}
        />
      </CustomAccordion>
      <CustomAccordion title="Payer Details">
        <InsurancePage
          ref={insurancePageRef}
          pChartID={formData.IPAdmissionDto.pChartID || 0}
          shouldClearData={shouldClearInsuranceData}
        />
      </CustomAccordion>
      <CustomAccordion title="Principal Diagnosis">
        <></>
      </CustomAccordion>
      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
    </Container>
  );
};

export default AdmissionPage;