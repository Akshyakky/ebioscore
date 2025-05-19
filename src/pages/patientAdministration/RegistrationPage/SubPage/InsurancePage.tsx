import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Grid, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { OPIPInsurancesDto } from "@/interfaces/PatientAdministration/InsuranceDetails";
import { InsuranceCarrierService } from "@/services/CommonServices/InsuranceCarrierService";
import { useLoading } from "@/context/LoadingContext";
import { showAlert } from "@/utils/Common/showAlert";
import CustomButton from "@/components/Button/CustomButton";
import PatientInsuranceGrid from "../SubPage/PatientInsuranceGrid";
import PatientInsuranceForm from "./PatientInsuranceForm";

interface InsurancePageProps {
  pChartID: number;
  shouldClearData: boolean;
}

const InsurancePageWithZod: React.ForwardRefRenderFunction<any, InsurancePageProps> = ({ pChartID, shouldClearData }, ref) => {
  const [showInsurancePopup, setShowInsurancePopup] = useState(false);
  const [editingInsuranceData, setEditingInsuranceData] = useState<OPIPInsurancesDto | undefined>(undefined);
  const [gridInsuranceData, setGridInsuranceData] = useState<OPIPInsurancesDto[]>([]);
  const { setLoading } = useLoading();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    saveInsuranceDetails,
  }));

  // Save all insurance records to the server
  const saveInsuranceDetails = useCallback(
    async (pChartID: number) => {
      if (!gridInsuranceData.length) return; // No data to save

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
    },
    [gridInsuranceData, setLoading]
  );

  // Handle insurance edit action
  const handleEditInsurance = useCallback((insurance: OPIPInsurancesDto) => {
    setEditingInsuranceData(insurance);
    setShowInsurancePopup(true);
  }, []);

  // Handle insurance delete action
  const handleDeleteInsurance = useCallback((id: number) => {
    setGridInsuranceData((prevData) => prevData.filter((insurance) => insurance.oPIPInsID !== id));
    showAlert("Success", "Insurance record removed successfully", "success");
  }, []);

  // Generate a new ID for temporary items
  const generateNewId = useCallback(<T extends { ID: number }>(data: T[]): number => {
    const maxId = data.reduce((max, item) => (item.ID > max ? item.ID : max), 0);
    return maxId + 1;
  }, []);

  // Handle saving insurance data from form
  const handleSaveInsurance = useCallback(
    (insuranceData: OPIPInsurancesDto) => {
      setGridInsuranceData((prevData) => {
        // Case 1: New record without ID
        if (!insuranceData.oPIPInsID && !insuranceData.ID) {
          return [...prevData, { ...insuranceData, ID: generateNewId(prevData) }];
        }

        // Case 2: Temporary record (has ID but no oPIPInsID)
        if (!insuranceData.oPIPInsID) {
          return prevData.map((item) => (item.ID === insuranceData.ID ? insuranceData : item));
        }

        // Case 3: Existing record (has oPIPInsID)
        return prevData.map((item) => (item.oPIPInsID === insuranceData.oPIPInsID ? insuranceData : item));
      });

      setShowInsurancePopup(false);
      showAlert("Success", "Insurance details saved successfully", "success");
    },
    [generateNewId]
  );

  // Fetch insurance data from server
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

  // Initial data load
  useEffect(() => {
    fetchInsuranceData();
  }, [fetchInsuranceData]);

  // Clear data when requested
  useEffect(() => {
    if (shouldClearData) {
      setGridInsuranceData([]);
    }
  }, [shouldClearData]);

  // Open/close form handlers
  const handleOpenInsurancePopup = useCallback(() => {
    setEditingInsuranceData(undefined);
    setShowInsurancePopup(true);
  }, []);

  const handleCloseInsurancePopup = useCallback(() => {
    setShowInsurancePopup(false);
    setEditingInsuranceData(undefined);
  }, []);

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid>
          <Typography variant="h6" id="insurance-details-header">
            Insurance Details
          </Typography>
        </Grid>
        <Grid>
          <CustomButton text="Add Insurance Details" onClick={handleOpenInsurancePopup} icon={AddIcon} color="primary" variant="text" />
        </Grid>
      </Grid>

      <PatientInsuranceForm show={showInsurancePopup} handleClose={handleCloseInsurancePopup} handleSave={handleSaveInsurance} editData={editingInsuranceData} />

      <PatientInsuranceGrid insuranceData={gridInsuranceData} onEdit={handleEditInsurance} onDelete={handleDeleteInsurance} />
    </>
  );
};

export default forwardRef(InsurancePageWithZod);
