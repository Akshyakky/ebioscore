//src/pages/patientAdministration/AdmissionPage/MainPage/AdmissionPage.tsx
import React, { useMemo, useRef, useState } from "react";
import { Container, Box } from "@mui/material";
import InsurancePage from "../../RegistrationPage/SubPage/InsurancePage";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import { Search as SearchIcon, Print as PrintIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import AdmissionDetails from "../SubPage/AdmissionDetails";
import { AdmissionDto, IPAdmissionDto, IPAdmissionDetailsDto, WrBedDetailsDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import { extendedAdmissionService } from "../../../../services/PatientAdministrationServices/patientAdministrationService";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import CustomAccordion from "../../../../components/Accordion/CustomAccordion";
import { WrBedDto } from "../../../../interfaces/HospitalAdministration/Room-BedSetUpDto";
import CustomButton from "../../../../components/Button/CustomButton";
import GenericDialog from "../../../../components/GenericDialog/GenericDialog";
import ManageBedDetails from "../../ManageBed/SubPage/ManageBedDetails";
import { usePatientAutocomplete } from "../../../../hooks/PatientAdminstration/usePatientAutocomplete";

const AdmissionPage: React.FC = () => {
  const [formData, setFormData] = useState<AdmissionDto>({
    IPAdmissionDto: {} as IPAdmissionDto,
    IPAdmissionDetailsDto: {} as IPAdmissionDetailsDto,
    WrBedDetailsDto: {} as WrBedDetailsDto
  });
  const insurancePageRef = useRef<any>(null);
  const [shouldClearInsuranceData, setShouldClearInsuranceData] = useState(false);
  const { handleDropdownChange } = useDropdownChange<AdmissionDto>(setFormData);
  const [isBedSelectionOpen, setIsBedSelectionOpen] = useState(false);

  const handleOpenBedSelection = () => {
    setIsBedSelectionOpen(true);
  };

  const handleCloseBedSelection = () => {
    setIsBedSelectionOpen(false);
  };

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

  const { fetchPatientSuggestions } = usePatientAutocomplete();

  const handlePatientSelect = (pChartID: number | null) => {
    if (pChartID) {

    }
  };

  const handleBedSelect = (bed: WrBedDto) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        WrBedDetailsDto: {
          ...prev.WrBedDetailsDto,
          bedID: bed.bedID,
          bedName: bed.bedName,
          rGrpID: bed.roomList?.roomGroup?.rGrpID || 0,
          rGrpName: bed.roomList?.roomGroup?.rGrpName || ""
        },
        IPAdmissionDetailsDto: {
          ...prev.IPAdmissionDetailsDto,
          rlID: bed.rlID,
          rName: bed.roomList?.rName || "",
          wCatID: bed.wbCatID || 0,
          wCatName: bed.wbCatName || ""
        },
      };
      return newFormData;
    });
    handleCloseBedSelection();
  };

  const actionButtons: ButtonProps[] = useMemo(() => [
    {
      variant: 'contained',
      size: 'medium',
      icon: SearchIcon,
      text: 'Advanced Search',
      onClick: handleAdvancedSearch,
    },
    {
      variant: 'contained',
      icon: PrintIcon,
      text: 'Print Admission Form',
      size: 'medium',
      onClick: () => {/* Implement print logic */ },
    },
  ], [handleAdvancedSearch]);

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
        <CustomButton
          variant="outlined"
          text="Select Bed from Ward View"
          onClick={handleOpenBedSelection}
        />
      </CustomAccordion>
      <GenericDialog
        open={isBedSelectionOpen}
        onClose={handleCloseBedSelection}
        title="Select a Bed"
        maxWidth="xl"
        fullWidth
      >
        <ManageBedDetails
          onBedSelect={handleBedSelect}
          isSelectionMode={true}
        />
      </GenericDialog>
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