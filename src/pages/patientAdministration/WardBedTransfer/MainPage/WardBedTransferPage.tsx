// src/pages/patientAdministration/WardBedTransferPage/MainPage/WardBedTransferPage.tsx
import React, { useState, useCallback, useRef } from "react";
import { Container, Box } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useLoading } from "@/hooks/Common/useLoading";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
import { AdmissionHistoryDto } from "@/interfaces/PatientAdministration/AdmissionHistoryDto";
import { showAlert } from "@/utils/Common/showAlert";
import { extendedAdmissionService } from "@/services/PatientAdministrationServices/admissionService";
import ActionButtonGroup, { ButtonProps } from "@/components/Button/ActionButtonGroup";
import CustomAccordion from "@/components/Accordion/CustomAccordion";
import WardBedTransferDetails from "../SubPage/WardBedTransferDetails";
import AdmissionHistory from "../../AdmissionPage/SubPage/AdmissionHistory";
import AdmissionListSearch from "../../AdmissionPage/SubPage/AdmissionListSearch";

const WardBedTransferPage: React.FC = () => {
  // State Management
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionDto | undefined>(undefined);
  const [admissionHistory, setAdmissionHistory] = useState<AdmissionHistoryDto[]>([]);
  const transferDetailsRef = useRef<{ focusUhidInput: () => void }>(null);
  const { setLoading } = useLoading();

  // Event Handlers
  const handleAdvancedSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    transferDetailsRef.current?.focusUhidInput();
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedAdmission(undefined);
    setAdmissionHistory([]);
    transferDetailsRef.current?.focusUhidInput();
  }, []);

  const validateAdmissionForTransfer = useCallback((admission: AdmissionDto): boolean => {
    if (!admission.ipAdmissionDto) {
      showAlert("Warning", "Invalid admission record", "warning");
      return false;
    }

    if (admission.ipAdmissionDto.dischgYN === "Y") {
      showAlert("Warning", `Patient was discharged on ${new Date(admission.ipAdmissionDto.dischgDate).toLocaleDateString()}`, "warning");
      return false;
    }

    if (admission.ipAdmissionDto.rActiveYN !== "Y") {
      showAlert("Warning", "This admission is not active", "warning");
      return false;
    }

    if (!admission.wrBedDetailsDto?.bedID) {
      showAlert("Warning", "No bed assignment found for this admission", "warning");
      return false;
    }

    return true;
  }, []);

  const handleSelect = useCallback(
    async (admission: AdmissionDto) => {
      setLoading(true);
      try {
        if (!validateAdmissionForTransfer(admission)) {
          return;
        }

        setSelectedAdmission(admission);

        if (admission.ipAdmissionDto?.pChartID) {
          const result = await extendedAdmissionService.getPatientAdmissionStatus(admission.ipAdmissionDto.pChartID);
          if (result.success && result.data?.admissionHistory) {
            const formattedHistory = extendedAdmissionService.formatAdmissionHistoryForDisplay(result.data.admissionHistory);
            setAdmissionHistory(formattedHistory);
          }
        } else {
          setAdmissionHistory([]);
        }
        setIsSearchOpen(false);
      } catch (error) {
        console.error("Error fetching admission history:", error);
        showAlert("Error", "Failed to fetch admission history", "error");
        setAdmissionHistory([]);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, validateAdmissionForTransfer]
  );

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      icon: Search,
      text: "Search Admission",
      onClick: handleAdvancedSearch,
      color: "primary",
    },
  ];

  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} />
      </Box>

      <CustomAccordion title="Transfer Details" defaultExpanded>
        <WardBedTransferDetails ref={transferDetailsRef} selectedAdmission={selectedAdmission} onAdmissionSelect={handleSelect} onClear={handleClearAll} />
      </CustomAccordion>

      <CustomAccordion title="Admission History">
        <AdmissionHistory admissionHistory={admissionHistory} />
      </CustomAccordion>

      <AdmissionListSearch open={isSearchOpen} onClose={handleCloseSearch} onSelect={handleSelect} />
    </Container>
  );
};

export default WardBedTransferPage;
