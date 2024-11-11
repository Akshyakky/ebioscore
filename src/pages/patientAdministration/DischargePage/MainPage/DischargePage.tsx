import React, { useState, useCallback } from "react";
import { Container, Box } from "@mui/material";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import Search from "@mui/icons-material/Search";
import DischargeDetails from "../SubPage/DischargeDetails";
import AdmissionListSearch from "../../AdmissionPage/SubPage/AdmissionListSearch";
import { AdmissionDto } from "../../../../interfaces/PatientAdministration/AdmissionDto";
import { AdmissionHistoryDto } from "../../../../interfaces/PatientAdministration/AdmissionHistoryDto";
import CustomAccordion from "../../../../components/Accordion/CustomAccordion";
import AdmissionHistory from "../../AdmissionPage/SubPage/AdmissionHistory";
import { extendedAdmissionService } from "../../../../services/PatientAdministrationServices/admissionService";

const DischargePage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionDto | undefined>(undefined);
  const [admissionHistory, setAdmissionHistory] = useState<AdmissionHistoryDto[]>([]);

  const handleAdvancedSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedAdmission(undefined);
    setAdmissionHistory([]);
  }, []);

  const handleSelect = useCallback(async (admission: AdmissionDto) => {
    setSelectedAdmission(admission);

    if (admission.ipAdmissionDto?.pChartID) {
      try {
        debugger;
        const result = await extendedAdmissionService.getPatientAdmissionStatus(admission.ipAdmissionDto.pChartID);
        if (result.success && result.data?.admissionHistory) {
          const formattedHistory = extendedAdmissionService.formatAdmissionHistoryForDisplay(result.data.admissionHistory);
          setAdmissionHistory(formattedHistory);
        }
      } catch (error) {
        console.error("Error fetching admission history:", error);
        setAdmissionHistory([]);
      }
    } else {
      setAdmissionHistory([]);
    }
  }, []);

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Search Admission",
      onClick: handleAdvancedSearch,
    },
  ];

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} orientation="horizontal" />
      </Box>

      <CustomAccordion title="Discharge Details" defaultExpanded>
        <DischargeDetails selectedAdmission={selectedAdmission} onAdmissionSelect={handleSelect} onClear={handleClearAll} />
      </CustomAccordion>

      <CustomAccordion title="Admission History">
        <AdmissionHistory admissionHistory={admissionHistory} />
      </CustomAccordion>

      <AdmissionListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default DischargePage;
