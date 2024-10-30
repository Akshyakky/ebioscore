import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from "react";
import { Grid, Typography } from "@mui/material";
import CustomButton from "../../../../components/Button/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import { PatNokDetailsDto } from "../../../../interfaces/PatientAdministration/PatNokDetailsDto";
import NextOfKinForm from "./NextOfKinForm";
import NextOfKinGrid from "./NextOfKinGrid";
import { PatNokService } from "../../../../services/PatientAdministrationServices/RegistrationService/PatNokService";
import useDayjs from "../../../../hooks/Common/useDateTime";
import { showAlert } from "../../../../utils/Common/showAlert";

interface NextOfKinPageProps {
  pChartID: number;
  shouldClearData: boolean;
}

const NextOfKinPage: React.ForwardRefRenderFunction<any, NextOfKinPageProps> = ({ pChartID, shouldClearData }, ref) => {
  const [showKinPopup, setShowKinPopup] = useState(false);
  const [editingKinData, setEditingKinData] = useState<PatNokDetailsDto | undefined>(undefined);
  const [gridKinData, setGridKinData] = useState<PatNokDetailsDto[]>([]);
  const { formatDate, parse, formatDateYMD } = useDayjs();

  useImperativeHandle(ref, () => ({
    saveKinDetails,
  }));

  const saveKinDetails = useCallback(
    async (pChartID: number) => {
      try {
        const saveOperations = gridKinData.map((kin) => {
          const kinData = { ...kin, pChartID: pChartID };
          return PatNokService.saveNokDetails(kinData);
        });

        const results = await Promise.all(saveOperations);
      } catch (error) {
        console.error("An error occurred while saving Next Of Kin details:", error);
      }
    },
    [gridKinData]
  );

  const handleEditKin = useCallback((kin: PatNokDetailsDto) => {
    setEditingKinData(kin);
    setShowKinPopup(true);
  }, []);

  const handleDeleteKin = useCallback((id: number) => {
    setGridKinData((prevData) => prevData.filter((kin) => kin.pNokID !== id));
  }, []);

  const generateNewId = useCallback(<T extends { ID: number }>(data: T[]): number => {
    const maxId = data.reduce((max, item) => (item.ID > max ? item.ID : max), 0);
    return maxId + 1;
  }, []);

  const handleSaveKin = useCallback(
    (kinDetails: PatNokDetailsDto) => {
      setGridKinData((prevData) => {
        if (!kinDetails.pNokID && !kinDetails.ID) {
          return [...prevData, { ...kinDetails, ID: generateNewId(prevData) }];
        }
        if (!kinDetails.pNokID) {
          return prevData.map((item) => (item.ID === kinDetails.ID ? kinDetails : item));
        }
        return prevData.map((item) => (item.pNokID === kinDetails.pNokID ? kinDetails : item));
      });
      setShowKinPopup(false); // Close the form after saving
      showAlert("Success", "The Kin Details Saved succesfully", "success");
    },
    [generateNewId]
  );

  const fetchKinData = useCallback(async () => {
    if (!pChartID) return;
    try {
      const kinDetails = await PatNokService.getNokDetailsByPChartID(pChartID);
      if (kinDetails.success && kinDetails.data) {
        const formattedData = kinDetails.data.map((kin) => ({
          ...kin,
          pNokDob: kin.pNokDob,
        }));
        setGridKinData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching Next Of Kin data:", error);
    }
  }, [pChartID]);

  useEffect(() => {
    fetchKinData();
  }, [fetchKinData]);

  useEffect(() => {
    if (shouldClearData) {
      setGridKinData([]);
    }
  }, [shouldClearData]);

  const handleOpenKinPopup = useCallback(() => {
    setShowKinPopup(true);
  }, []);

  const handleCloseKinPopup = useCallback(() => {
    setShowKinPopup(false);
    setEditingKinData(undefined);
  }, []);

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
        <Grid item>
          <Typography variant="h6" id="nok-details-header">
            Next Of Kin
          </Typography>
        </Grid>
        <Grid item>
          <CustomButton text="Add Next Of Kin" onClick={handleOpenKinPopup} icon={AddIcon} color="primary" variant="text" />
        </Grid>
      </Grid>
      {memoizedNextOfKinForm}
      {memoizedNextOfKinGrid}
    </>
  );
};

export default forwardRef(NextOfKinPage);
