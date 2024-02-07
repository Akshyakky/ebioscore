import React, { useEffect, useState } from "react";
import { InsuranceFormState } from "../../../../interfaces/PatientAdministration/InsuranceDetails";
import PatientInsuranceForm from "./PatientInsuranceForm";
import PatientInsuranceGrid from "./PatientInsuranceGrid";
import { Grid, Typography } from "@mui/material";
import CustomButton from "../../../../components/Button/CustomButton";
import addIcon from "@mui/icons-material/Add";
import { RegistrationService } from "../../../../services/RegistrationService/RegistrationService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
type SaveInsuranceCallback = () => void;
interface InsurancePageProps {
  pChartID: number;
  token: string;
  onSaveInsurance: SaveInsuranceCallback;
  shouldClearData: boolean;
}
const InsurancePage: React.FC<InsurancePageProps> = ({
  pChartID,
  token,
  onSaveInsurance,
  shouldClearData,
}) => {
  const [showInsurancePopup, setInsurancePopup] = useState(false);
  const [editingPatientInsuranceData, setEditingPatientInsuranceData] =
    useState<InsuranceFormState | undefined>(undefined);
  const [gridPatientInsuranceData, setGridPatientInsuranceData] = useState<
    InsuranceFormState[]
  >([]);
  const userInfo = useSelector((state: RootState) => state.userDetails);

  const handleFinalSavePatientInsuranceDetails = async () => {
    try {
      // Create an array of save operations
      const saveOperations = gridPatientInsuranceData.map((pInsurance) => {
        const pInsuranceData = { ...pInsurance, PChartID: pChartID };
        return RegistrationService.savePatientInsuranceDetails(
          token,
          pInsuranceData
        );
      });

      // Wait for all operations to complete
      const results = await Promise.all(saveOperations);
      console.log("Patient Insurance details saved successfully:", results);

      // Call onSaveInsurance after all details are saved
      if (onSaveInsurance) {
        onSaveInsurance();
      }
    } catch (error) {
      console.error(
        "An error occurred while saving Patient Insurance details:",
        error
      );
    }
  };

  // Call handleFinalSavePatientInsuranceDetails when gridPatientInsuranceData changes
  useEffect(() => {
    if (gridPatientInsuranceData.length > 0 && pChartID) {
      handleFinalSavePatientInsuranceDetails();
    }
  }, [gridPatientInsuranceData, pChartID, token]);

  const handleEditPatientInsurance = (PatientInsurance: InsuranceFormState) => {
    console.log("triggered");
    setEditingPatientInsuranceData(PatientInsurance);
    setInsurancePopup(true);
  };

  const handleDeletePatientInsurance = (id: number) => {
    const updatedGridData = gridPatientInsuranceData.filter(
      (Insurance) => Insurance.OPIPInsID !== id
    );
    setGridPatientInsuranceData(updatedGridData);
  };

  const handleSaveInsurance = (insuranceData: InsuranceFormState) => {
    setGridPatientInsuranceData((prevData) => {
      if (!insuranceData.OPIPInsID && !insuranceData.ID) {
        return [...prevData, { ...insuranceData, ID: generateNewId(prevData) }];
      }
      if (!insuranceData.OPIPInsID) {
        return prevData.map((item) =>
          item.ID === insuranceData.ID ? insuranceData : item
        );
      }
      return prevData.map((item) =>
        item.OPIPInsID === insuranceData.OPIPInsID ? insuranceData : item
      );
    });
    handleClosePInsurancePopup();
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
      const fetchInsuranceData = async () => {
        try {
          const insuranceDetails =
            await RegistrationService.getPatientInsuranceDetails(
              token,
              pChartID
            );
          if (insuranceDetails.success) {
            const transfermedData = transformDataToMatchInsuranceDataStructure(
              insuranceDetails.data
            );
            setGridPatientInsuranceData(transfermedData);
          }
        } catch (error) {
          console.error("Error fetching insurance data:", error);
        }
      };

      fetchInsuranceData();
    }
  }, [pChartID, token]);

  const transformDataToMatchInsuranceDataStructure = (
    data: any[]
  ): InsuranceFormState[] => {
    return data.map((ins) => ({
      ID: 0,
      OPIPInsID: ins.opipInsID,
      PChartID: ins.pChartID,
      InsurID: ins.insurID,
      InsurCode: ins.insurCode,
      InsurName: ins.insurName,
      PolicyNumber: ins.policyNumber,
      PolicyHolder: ins.policyHolder,
      GroupNumber: ins.groupNumber,
      PolicyStartDt: ins.policyStartDt.split("T")[0],
      PolicyEndDt: ins.policyEndDt.split("T")[0],
      Guarantor: ins.guarantor,
      RelationVal: ins.relationVal,
      Relation: ins.relation,
      Address1: ins.address1,
      Address2: ins.address2,
      Phone1: ins.phone1,
      Phone2: ins.phone2,
      RActiveYN: ins.rActiveYN,
      RCreatedID: ins.rCreatedID,
      RCreatedBy: ins.rCreatedBy,
      RCreatedOn: ins.rCreatedOn.split("T")[0],
      RModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
      RModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
      RModifiedOn: new Date().toISOString().split("T")[0],
      RNotes: ins.rNotes,
      CompID: userInfo.compID !== null ? userInfo.compID : 0,
      CompCode: userInfo.compCode !== null ? userInfo.compCode : "",
      CompName: userInfo.compName !== null ? userInfo.compName : "",
      InsurStatusCode: ins.insurStatusCode,
      InsurStatusName: ins.insurStatusName,
      PChartCode: ins.pChartCode,
      PChartCompID: ins.pChartCompID,
      ReferenceNo: ins.referenceNo,
      TransferYN: ins.transferYN,
      CoveredVal: ins.coveredVal,
      CoveredFor: ins.coveredFor,
    }));
  };

  const handleOpenPInsurancePopup = () => {
    setInsurancePopup(true);
  };

  const handleClosePInsurancePopup = () => {
    setInsurancePopup(false);
  };

  useEffect(() => {
    if (shouldClearData) {
      setGridPatientInsuranceData([]); // Clear the insurance data
    }
  }, [shouldClearData]);

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h6" id="insurance-details-header">
            Insurance Details
          </Typography>
        </Grid>
        <Grid item>
          <CustomButton
            text="Add Insurance Details"
            onClick={handleOpenPInsurancePopup}
            icon={addIcon}
            color="primary"
            variant="text"
          />
        </Grid>
      </Grid>
      <PatientInsuranceForm
        show={showInsurancePopup}
        handleClose={handleClosePInsurancePopup}
        handleSave={handleSaveInsurance}
        editData={editingPatientInsuranceData}
      />
      <PatientInsuranceGrid
        insuranceData={gridPatientInsuranceData}
        onEdit={handleEditPatientInsurance}
        onDelete={handleDeletePatientInsurance}
      />
    </>
  );
};

export default InsurancePage;
