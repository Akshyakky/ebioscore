import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Grid, Typography } from "@mui/material";
import CustomButton from "../../../../components/Button/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import { PatNokDetailsDto } from "../../../../interfaces/PatientAdministration/PatNokDetailsDto";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import NextOfKinForm from "./NextOfKinForm";
import NextOfKinGrid from "./NextOfKinGrid";
import { PatNokService } from "../../../../services/PatientAdministrationServices/RegistrationService/PatNokService";
import { format } from "date-fns";

interface NextOfKinPageProps {
  pChartID: number;
  token: string;
  shouldClearData: boolean;
}

const NextOfKinPage: React.ForwardRefRenderFunction<any, NextOfKinPageProps> = (
  { pChartID, token, shouldClearData },
  ref
) => {
  const [showKinPopup, setShowKinPopup] = useState(false);
  const [editingKinData, setEditingKinData] = useState<
    PatNokDetailsDto | undefined
  >(undefined);
  const [gridKinData, setGridKinData] = useState<PatNokDetailsDto[]>([]);

  const userInfo = useSelector((state: RootState) => state.userDetails);

  useImperativeHandle(ref, () => ({
    saveKinDetails,
  }));

  const saveKinDetails = async (pChartID: number) => {
    try {
      const saveOperations = gridKinData.map((kin) => {
        const kinData = { ...kin, pChartID: pChartID };
        return PatNokService.saveNokDetails(token, kinData);
      });

      const results = await Promise.all(saveOperations);
      console.log("Next Of Kin details saved successfully:", results);
    } catch (error) {
      console.error(
        "An error occurred while saving Next Of Kin details:",
        error
      );
    }
  };

  const handleEditKin = (kin: PatNokDetailsDto) => {
    setEditingKinData(kin);
    setShowKinPopup(true);
  };

  const handleDeleteKin = (id: number) => {
    const updatedGridData = gridKinData.filter((kin) => kin.pNokID !== id);
    setGridKinData(updatedGridData);
  };

  const handleSaveKin = (kinDetails: PatNokDetailsDto) => {
    setGridKinData((prevData) => {
      if (!kinDetails.pNokID && !kinDetails.ID) {
        return [...prevData, { ...kinDetails, ID: generateNewId(prevData) }];
      }
      if (!kinDetails.pNokID) {
        return prevData.map((item) =>
          item.ID === kinDetails.ID ? kinDetails : item
        );
      }
      return prevData.map((item) =>
        item.pNokID === kinDetails.pNokID ? kinDetails : item
      );
    });
    handleCloseKinPopup();
  };

  const generateNewId = <T extends { ID: number }>(data: T[]): number => {
    const maxId = data.reduce(
      (max, item) => (item.ID > max ? item.ID : max),
      0
    );
    return maxId + 1;
  };

  useEffect(() => {
    if (pChartID) {
      const fetchKinData = async () => {
        try {
          const kinDetails = await PatNokService.getNokDetailsByPChartID(
            token,
            pChartID
          );
          if (kinDetails.success && kinDetails.data) {
            const formattedData = kinDetails.data.map((kin) => ({
              ...kin,
              pNokDob: format(new Date(kin.pNokDob), "yyyy-MM-dd"),
            }));
            setGridKinData(formattedData);
          }
        } catch (error) {
          console.error("Error fetching Next Of Kin data:", error);
        }
      };

      fetchKinData();
    }
  }, [pChartID, token]);

  const handleOpenKinPopup = () => {
    setShowKinPopup(true);
  };

  const handleCloseKinPopup = () => {
    setShowKinPopup(false);
  };

  useEffect(() => {
    if (shouldClearData) {
      setGridKinData([]);
    }
  }, [shouldClearData]);

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h6" id="nok-details-header">
            Next Of Kin
          </Typography>
        </Grid>
        <Grid item>
          <CustomButton
            text="Add Next Of Kin"
            onClick={handleOpenKinPopup}
            icon={AddIcon}
            color="primary"
            variant="text"
          />
        </Grid>
      </Grid>
      <NextOfKinForm
        show={showKinPopup}
        handleClose={handleCloseKinPopup}
        handleSave={handleSaveKin}
        editData={editingKinData}
      />
      <NextOfKinGrid
        kinData={gridKinData}
        onEdit={handleEditKin}
        onDelete={handleDeleteKin}
      />
    </>
  );
};

export default forwardRef(NextOfKinPage);
