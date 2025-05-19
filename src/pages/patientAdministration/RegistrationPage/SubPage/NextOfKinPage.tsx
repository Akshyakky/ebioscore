import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from "react";
import { Grid, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { PatNokService } from "@/services/PatientAdministrationServices/RegistrationService/PatNokService";
import { showAlert } from "@/utils/Common/showAlert";
import NextOfKinGrid from "./NextOfKinGrid";
import CustomButton from "@/components/Button/CustomButton";
import NextOfKinForm from "./NextOfKinForm";

interface NextOfKinPageProps {
  pChartID: number;
  shouldClearData: boolean;
}

const EnhancedNextOfKinPage: React.ForwardRefRenderFunction<any, NextOfKinPageProps> = ({ pChartID, shouldClearData }, ref) => {
  const [showKinPopup, setShowKinPopup] = useState(false);
  const [editingKinData, setEditingKinData] = useState<PatNokDetailsDto | undefined>(undefined);
  const [gridKinData, setGridKinData] = useState<PatNokDetailsDto[]>([]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    saveKinDetails,
  }));

  // Save all next of kin records
  const saveKinDetails = useCallback(
    async (pChartID: number) => {
      try {
        const saveOperations = gridKinData.map((kin) => {
          const kinData = { ...kin, pChartID: pChartID };
          return PatNokService.saveNokDetails(kinData);
        });

        await Promise.all(saveOperations);
        return true;
      } catch (error) {
        console.error("Error saving next of kin details:", error);
        return false;
      }
    },
    [gridKinData]
  );

  // Edit handler
  const handleEditKin = useCallback((kin: PatNokDetailsDto) => {
    setEditingKinData(kin);
    setShowKinPopup(true);
  }, []);

  // Delete handler
  const handleDeleteKin = useCallback(
    async (kin: PatNokDetailsDto) => {
      try {
        const updatedKin = {
          ...kin,
          pChartID: pChartID,
          rActiveYN: "N",
        };
        const result = await PatNokService.saveNokDetails(updatedKin);
        if (result.success) {
          setGridKinData((prevData) => prevData.filter((item) => item.pNokID !== kin.pNokID));
          showAlert("Success", "Next of Kin record deactivated successfully", "success");
        } else {
          showAlert("Error", "Failed to deactivate Next of Kin record", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while deactivating the record", "error");
      }
    },
    [pChartID]
  );

  // Generate temporary ID for new records
  const generateNewId = useCallback(<T extends { ID: number }>(data: T[]): number => {
    const maxId = data.reduce((max, item) => (item.ID > max ? item.ID : max), 0);
    return maxId + 1;
  }, []);

  // Save handler
  const handleSaveKin = useCallback(
    (kinDetails: PatNokDetailsDto) => {
      const kinWithDefaults = {
        ...kinDetails,
        rActiveYN: "Y",
      };

      setGridKinData((prevData) => {
        if (!kinWithDefaults.pNokID && !kinWithDefaults.ID) {
          return [...prevData, { ...kinWithDefaults, ID: generateNewId(prevData) }];
        }
        if (!kinWithDefaults.pNokID) {
          return prevData.map((item) => (item.ID === kinWithDefaults.ID ? kinWithDefaults : item));
        }
        return prevData.map((item) => (item.pNokID === kinWithDefaults.pNokID ? kinWithDefaults : item));
      });
      setShowKinPopup(false);
      showAlert("Success", "The Kin Details Saved successfully", "success");
    },
    [generateNewId]
  );

  // Fetch existing kin data when pChartID changes
  const fetchKinData = useCallback(async () => {
    if (!pChartID) return;
    try {
      const kinDetails = await PatNokService.getNokDetailsByPChartID(pChartID);
      if (kinDetails.success && kinDetails.data) {
        const formattedData = kinDetails.data
          .filter((kin) => kin.rActiveYN === "Y")
          .map((kin) => ({
            ...kin,
            pNokDob: kin.pNokDob,
          }));
        setGridKinData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching next of kin details:", error);
    }
  }, [pChartID]);

  // Fetch data when pChartID changes
  useEffect(() => {
    fetchKinData();
  }, [fetchKinData]);

  // Clear data when requested
  useEffect(() => {
    if (shouldClearData) {
      setGridKinData([]);
    }
  }, [shouldClearData]);

  // Popup handlers
  const handleOpenKinPopup = useCallback(() => {
    setEditingKinData(undefined); // Clear editing data to ensure we're adding a new record
    setShowKinPopup(true);
  }, []);

  const handleCloseKinPopup = useCallback(() => {
    setShowKinPopup(false);
    setEditingKinData(undefined);
  }, []);

  // Memoized components to prevent unnecessary re-renders
  const memoizedNextOfKinForm = useMemo(
    () => <NextOfKinForm show={showKinPopup} handleClose={handleCloseKinPopup} handleSave={handleSaveKin} editData={editingKinData} />,
    [showKinPopup, handleCloseKinPopup, handleSaveKin, editingKinData]
  );

  const memoizedNextOfKinGrid = useMemo(
    () => <NextOfKinGrid kinData={gridKinData} onEdit={handleEditKin} onDelete={handleDeleteKin} />,
    [gridKinData, handleEditKin, handleDeleteKin]
  );

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid size="grow">
          <Typography variant="h6" id="nok-details-header">
            Next Of Kin
          </Typography>
        </Grid>
        <Grid size="grow">
          <CustomButton text="Add Next Of Kin" onClick={handleOpenKinPopup} icon={AddIcon} color="primary" variant="text" />
        </Grid>
      </Grid>
      {memoizedNextOfKinForm}
      {memoizedNextOfKinGrid}
    </>
  );
};

export default forwardRef(EnhancedNextOfKinPage);
