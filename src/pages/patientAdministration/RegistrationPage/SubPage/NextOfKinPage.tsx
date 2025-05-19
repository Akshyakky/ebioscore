import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from "react";
import { Grid, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PatNokDetailsDto } from "@/interfaces/PatientAdministration/PatNokDetailsDto";
import { PatNokService } from "@/services/PatientAdministrationServices/RegistrationService/PatNokService";
import { showAlert } from "@/utils/Common/showAlert";
import NextOfKinGrid from "../SubPage/NextOfKinGrid";
import CustomButton from "@/components/Button/CustomButton";
import { useLoading } from "@/context/LoadingContext";
import NextOfKinForm from "./NextOfKinForm";

interface NextOfKinPageProps {
  pChartID: number;
  shouldClearData: boolean;
}

const NextOfKinPageWithZod: React.ForwardRefRenderFunction<any, NextOfKinPageProps> = ({ pChartID, shouldClearData }, ref) => {
  const [showKinPopup, setShowKinPopup] = useState(false);
  const [editingKinData, setEditingKinData] = useState<PatNokDetailsDto | undefined>(undefined);
  const [gridKinData, setGridKinData] = useState<PatNokDetailsDto[]>([]);
  const { setLoading } = useLoading();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    saveKinDetails,
  }));

  // Save all kin details to the server
  const saveKinDetails = useCallback(
    async (pChartID: number) => {
      if (!gridKinData.length) return; // No data to save

      setLoading(true);
      try {
        const saveOperations = gridKinData.map((kin) => {
          const kinData = { ...kin, pChartID: pChartID };
          return PatNokService.saveNokDetails(kinData);
        });

        await Promise.all(saveOperations);
        return true;
      } catch (error) {
        console.error("Error saving kin details:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [gridKinData, setLoading]
  );

  // Handle kin edit action
  const handleEditKin = useCallback((kin: PatNokDetailsDto) => {
    setEditingKinData(kin);
    setShowKinPopup(true);
  }, []);

  // Handle kin delete action
  const handleDeleteKin = useCallback(
    async (kin: PatNokDetailsDto) => {
      setLoading(true);
      try {
        // Instead of true deletion, mark as inactive
        const updatedKin = {
          ...kin,
          pChartID: pChartID,
          rActiveYN: "N", // Mark as inactive
        };

        const result = await PatNokService.saveNokDetails(updatedKin);
        if (result.success) {
          // Remove from grid
          setGridKinData((prevData) => prevData.filter((item) => item.pNokID !== kin.pNokID));
          showAlert("Success", "Next of Kin record deactivated successfully", "success");
        } else {
          showAlert("Error", "Failed to deactivate Next of Kin record", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while deactivating the record", "error");
      } finally {
        setLoading(false);
      }
    },
    [pChartID, setLoading]
  );

  // Generate a new ID for temporary items
  const generateNewId = useCallback(<T extends { ID: number }>(data: T[]): number => {
    const maxId = data.reduce((max, item) => (item.ID > max ? item.ID : max), 0);
    return maxId + 1;
  }, []);

  // Handle saving kin data from form
  const handleSaveKin = useCallback(
    (kinDetails: PatNokDetailsDto) => {
      setLoading(true);
      try {
        const kinWithDefaults = {
          ...kinDetails,
          rActiveYN: "Y",
        };

        setGridKinData((prevData) => {
          // Case 1: New record without ID
          if (!kinWithDefaults.pNokID && !kinWithDefaults.ID) {
            return [...prevData, { ...kinWithDefaults, ID: generateNewId(prevData) }];
          }

          // Case 2: Temporary record (has ID but no pNokID)
          if (!kinWithDefaults.pNokID) {
            return prevData.map((item) => (item.ID === kinWithDefaults.ID ? kinWithDefaults : item));
          }

          // Case 3: Existing record (has pNokID)
          return prevData.map((item) => (item.pNokID === kinWithDefaults.pNokID ? kinWithDefaults : item));
        });

        setShowKinPopup(false);
        showAlert("Success", "The Kin Details Saved successfully", "success");
      } finally {
        setLoading(false);
      }
    },
    [generateNewId, setLoading]
  );

  // Fetch kin data from server
  const fetchKinData = useCallback(async () => {
    if (!pChartID) return;

    setLoading(true);
    try {
      const kinDetails = await PatNokService.getNokDetailsByPChartID(pChartID);
      if (kinDetails.success && kinDetails.data) {
        // Filter active records only
        const formattedData = kinDetails.data
          .filter((kin) => kin.rActiveYN === "Y")
          .map((kin) => ({
            ...kin,
            pNokDob: kin.pNokDob,
          }));

        setGridKinData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching kin data:", error);
    } finally {
      setLoading(false);
    }
  }, [pChartID, setLoading]);

  // Initial data load
  useEffect(() => {
    fetchKinData();
  }, [fetchKinData]);

  // Clear data when requested
  useEffect(() => {
    if (shouldClearData) {
      setGridKinData([]);
    }
  }, [shouldClearData]);

  // Open/close form handlers
  const handleOpenKinPopup = useCallback(() => {
    setEditingKinData(undefined);
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
        <Grid>
          <Typography variant="h6" id="nok-details-header">
            Next Of Kin
          </Typography>
        </Grid>
        <Grid>
          <CustomButton text="Add Next Of Kin" onClick={handleOpenKinPopup} icon={AddIcon} color="primary" variant="text" />
        </Grid>
      </Grid>
      {memoizedNextOfKinForm}
      {memoizedNextOfKinGrid}
    </>
  );
};

export default forwardRef(NextOfKinPageWithZod);
