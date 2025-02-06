import React, { useCallback, useState } from "react";
import { Container } from "@mui/material";
import DischargeSummaryDetails from "../SubPage/DischargeSummaryDetails";
import { AdmissionDto } from "@/interfaces/PatientAdministration/AdmissionDto";
const DischargeSummaryDetailsPage: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionDto | undefined>(undefined);
  const handleClearAll = useCallback(() => {}, []);
  const handleSelect = useCallback(async (admission: AdmissionDto) => {
    setSelectedAdmission(admission);
  }, []);
  return (
    <Container maxWidth={false}>
      <h3>Discharge Summary Details</h3>
      <hr />
      <DischargeSummaryDetails selectedAdmission={selectedAdmission} onAdmissionSelect={setSelectedAdmission} onClear={handleClearAll} />
    </Container>
  );
};
export default DischargeSummaryDetailsPage;
