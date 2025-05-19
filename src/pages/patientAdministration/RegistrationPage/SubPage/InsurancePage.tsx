import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Grid, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { InsuranceCarrierService } from "@/services/CommonServices/InsuranceCarrierService";
import CustomButton from "@/components/Button/CustomButton";
import PatientInsuranceForm from "./PatientInsuranceForm";
import PatientInsuranceGrid from "./PatientInsuranceGrid";
import { showAlert } from "@/utils/Common/showAlert";
import { useLoading } from "@/context/LoadingContext";

interface InsurancePageProps {
  pChartID: number;
  shouldClearData: boolean;
}

const InsurancePage: React.ForwardRefRenderFunction<any, InsurancePageProps> = ({ pChartID, shouldClearData }, ref) => {
  const [showInsurancePopup, setShowInsurancePopup] = useState(false);
  const [editingInsuranceData, setEditingInsuranceData] = useState<OPIPInsurancesDto | undefined>(undefined);
  const [gridInsuranceData, setGridInsuranceData] = useState<OPIPInsurancesDto[]>([]);
  const { setLoading } = useLoading();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    saveInsuranceDetails,
  }));

  // Save all insurance records
  const saveInsuranceDetails = async (pChartID: number) => {
    if (!gridInsuranceData.length) return true;

    setLoading(true);
    try {
      const saveOperations = gridInsuranceData.map((insurance) => {
        const insuranceData = { ...insurance, pChartID: pChartID };
        return InsuranceCarrierService.addOrUpdateOPIPInsurance(insuranceData);
      });

      await Promise.all(saveOperations);
      return true;
    } catch (error) {
      console.error("Error saving insurance details:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Edit handler
  const handleEditInsurance = (insurance: OPIPInsurancesDto) => {
    setEditingInsuranceData(insurance);
    setShowInsurancePopup(true);
  };

  // Delete handler
  const handleDeleteInsurance = (id: number) => {
    showAlert("Confirm Delete", "Are you sure you want to delete this insurance record?", "warning", {
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      onConfirm: () => {
        const updatedGridData = gridInsuranceData.filter((insurance) => insurance.oPIPInsID !== id);
        setGridInsuranceData(updatedGridData);
        showAlert("Success", "Insurance record deleted successfully", "success");
      },
    });
  };

  // Generate temporary ID for new records
  const generateNewId = <T extends { ID: number }>(data: T[]): number => {
    const maxId = data.reduce((max, item) => (item.ID > max ? item.ID : max), 0);
    return maxId + 1;
  };

  // Save handler
  const handleSaveInsurance = (insuranceData: OPIPInsurancesDto) => {
    // Check if this is a new record or an edit
    setGridInsuranceData((prevData) => {
      if (!insuranceData.oPIPInsID && !insuranceData.ID) {
        // New record with generated temporary ID
        return [...prevData, { ...insuranceData, ID: generateNewId(prevData) }];
      } else if (!insuranceData.oPIPInsID) {
        // Editing a record that hasn't been saved to the server yet (has temp ID)
        return prevData.map((item) => (item.ID === insuranceData.ID ? insuranceData : item));
      } else {
        // Editing an existing record from the database
        return prevData.map((item) => (item.oPIPInsID === insuranceData.oPIPInsID ? insuranceData : item));
      }
    });

    setShowInsurancePopup(false);
    showAlert("Success", "Insurance details saved successfully", "success");
  };

  // Fetch insurance data when pChartID changes
  const fetchInsuranceData = useCallback(async () => {
    if (!pChartID) return;

    setLoading(true);
    try {
      const insuranceDetails = await InsuranceCarrierService.getOPIPInsuranceByPChartID(pChartID);
      if (insuranceDetails.success && insuranceDetails.data) {
        const formattedData = insuranceDetails.data.map((insur) => ({
          ...insur,
          policyStartDt: insur.policyStartDt,
          policyEndDt: insur.policyEndDt,
        }));
        setGridInsuranceData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching insurance data:", error);
    } finally {
      setLoading(false);
    }
  }, [pChartID, setLoading]);

  // Fetch data when pChartID changes
  useEffect(() => {
    fetchInsuranceData();
  }, [fetchInsuranceData]);

  // Clear data when requested
  useEffect(() => {
    if (shouldClearData) {
      setGridInsuranceData([]);
      setEditingInsuranceData(undefined);
    }
  }, [shouldClearData]);

  // Popup handlers
  const handleOpenInsurancePopup = () => {
    setEditingInsuranceData(undefined); // Clear editing data to ensure we're adding a new record
    setShowInsurancePopup(true);
  };

  const handleCloseInsurancePopup = () => {
    setShowInsurancePopup(false);
    setEditingInsuranceData(undefined);
  };

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Grid size="grow">
          <Typography variant="h6" id="insurance-details-header">
            Insurance Details
          </Typography>
        </Grid>
        <Grid size="grow">
          <CustomButton text="Add Insurance Details" onClick={handleOpenInsurancePopup} icon={AddIcon} color="primary" variant="text" />
        </Grid>
      </Grid>

      <PatientInsuranceForm show={showInsurancePopup} handleClose={handleCloseInsurancePopup} handleSave={handleSaveInsurance} editData={editingInsuranceData} />

      <PatientInsuranceGrid insuranceData={gridInsuranceData} onEdit={handleEditInsurance} onDelete={handleDeleteInsurance} />
    </>
  );
};

export default forwardRef(InsurancePage);
