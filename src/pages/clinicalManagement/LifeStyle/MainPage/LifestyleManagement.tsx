import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { OPIPLifestyleDto } from "@/interfaces/ClinicalManagement/OPIPLifestyleDto";
import LifeStyleForm from "@/pages/clinicalManagement/LifeStyle/Form/LifeStyleForm";
import { useLifestyle } from "@/pages/clinicalManagement/LifeStyle/hook/useLifeStyle";
import { useAlert } from "@/providers/AlertProvider";
import { Box, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";

interface LifestyleManagementProps {
  open: boolean;
  onClose: () => void;
  pChartID: number;
  patientName: string;
}

const LifestyleManagement: React.FC<LifestyleManagementProps> = ({ open, onClose, pChartID, patientName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lifestyleData, setLifestyleData] = useState<OPIPLifestyleDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { getLifestyleById } = useLifestyle();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (open && pChartID) {
      fetchLifestyleForPatient();
    }
  }, [open, pChartID]);

  const fetchLifestyleForPatient = async () => {
    try {
      setIsLoading(true);

      const patientLifestyle = await getLifestyleById(pChartID);

      if (patientLifestyle) {
        setLifestyleData(patientLifestyle.data);
      } else {
        // No lifestyle record exists for this patient
        setLifestyleData(null);
      }
    } catch (error) {
      console.error("Error fetching lifestyle data:", error);
      showAlert("Error", "Failed to load lifestyle data", "error");
    } finally {
      setIsLoading(false);
      setIsFormOpen(true);
    }
  };

  const handleFormClose = (refreshData?: boolean) => {
    setIsFormOpen(false);
    if (refreshData) {
      // Refresh the lifestyle data after save
      fetchLifestyleForPatient();
    } else {
      // Close the main dialog if no refresh needed
      onClose();
    }
  };

  const getInitialData = (): OPIPLifestyleDto | null => {
    if (lifestyleData) {
      return lifestyleData;
    }

    // Return new record with pChartID pre-filled
    return {
      opipLSID: 0,
      pChartID: pChartID,
      dietType: "",
      smokingStatus: "",
      alcoholStatus: "",
      exerciseFrequency: "",
      rActiveYN: "Y",
      transferYN: "N",
    } as OPIPLifestyleDto;
  };

  return (
    <GenericDialog open={open} onClose={onClose} title={`Lifestyle Management - ${patientName}`} maxWidth="md" fullWidth showCloseButton>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : (
        <>{isFormOpen && <LifeStyleForm open={isFormOpen} onClose={handleFormClose} initialData={getInitialData()} viewOnly={false} />}</>
      )}
    </GenericDialog>
  );
};

export default LifestyleManagement;
