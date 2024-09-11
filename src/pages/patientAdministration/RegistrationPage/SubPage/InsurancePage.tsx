import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { Grid, Typography } from "@mui/material";
import CustomButton from "../../../../components/Button/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import { OPIPInsurancesDto } from "../../../../interfaces/PatientAdministration/InsuranceDetails";
import PatientInsuranceForm from "./PatientInsuranceForm";
import PatientInsuranceGrid from "./PatientInsuranceGrid";
import { InsuranceCarrierService } from "../../../../services/CommonServices/InsuranceCarrierService";
import useDayjs from "../../../../hooks/Common/useDateTime";

interface InsurancePageProps {
  pChartID: number;
  shouldClearData: boolean;
}

const InsurancePage: React.ForwardRefRenderFunction<any, InsurancePageProps> = (
  { pChartID, shouldClearData },
  ref
) => {
  const [showInsurancePopup, setShowInsurancePopup] = useState(false);
  const [editingInsuranceData, setEditingInsuranceData] = useState<
    OPIPInsurancesDto | undefined
  >(undefined);
  const [gridInsuranceData, setGridInsuranceData] = useState<
    OPIPInsurancesDto[]
  >([]);
  const { formatDate, parse, formatDateYMD } = useDayjs();


  useImperativeHandle(ref, () => ({
    saveInsuranceDetails,
  }));

  const saveInsuranceDetails = async (pChartID: number) => {
    try {
      const saveOperations = gridInsuranceData.map((insurance) => {
        const insuranceData = { ...insurance, pChartID: pChartID };
        return InsuranceCarrierService.addOrUpdateOPIPInsurance(
          insuranceData
        );
      });

      const results = await Promise.all(saveOperations);
      console.log("Insurance details saved successfully:", results);
    } catch (error) {
      console.error("Error saving insurance details:", error);
    }
  };

  const handleEditInsurance = (insurance: OPIPInsurancesDto) => {
    setEditingInsuranceData(insurance);
    setShowInsurancePopup(true);
  };

  const handleDeleteInsurance = (id: number) => {
    const updatedGridData = gridInsuranceData.filter(
      (insurance) => insurance.oPIPInsID !== id
    );
    setGridInsuranceData(updatedGridData);
  };

  const handleSaveInsurance = (insuranceData: OPIPInsurancesDto) => {
    setGridInsuranceData((prevData) => {
      if (!insuranceData.oPIPInsID && !insuranceData.ID) {
        return [...prevData, { ...insuranceData, ID: generateNewId(prevData) }];
      }
      if (!insuranceData.oPIPInsID) {
        return prevData.map((item) =>
          item.ID === insuranceData.ID ? insuranceData : item
        );
      }
      return prevData.map((item) =>
        item.oPIPInsID === insuranceData.oPIPInsID ? insuranceData : item
      );
    });
    handleCloseInsurancePopup();
  };

  const generateNewId = <T extends { ID: number }>(data: T[]): number => {
    const maxId = data.reduce(
      (max, item) => (item.ID > max ? item.ID : max),
      0
    );
    return maxId + 1;
  };

  const fetchInsuranceData = useCallback(async () => {
    if (!pChartID) return;
    try {
      const insuranceDetails = await InsuranceCarrierService.getOPIPInsuranceByPChartID(pChartID);
      if (insuranceDetails.success && insuranceDetails.data) {
        const formattedData = insuranceDetails.data.map((insur) => ({
          ...insur,
          policyStartDt: formatDateYMD(parse(insur.policyStartDt, 'DD/MM/YYYY')),
          policyEndDt: formatDateYMD(parse(insur.policyEndDt, 'DD/MM/YYYY')),
        }));
        setGridInsuranceData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching insurance data:", error);
    }
  }, [pChartID]);

  useEffect(() => {
    fetchInsuranceData();
  }, [fetchInsuranceData]);

  const handleOpenInsurancePopup = () => {
    setShowInsurancePopup(true);
  };

  const handleCloseInsurancePopup = () => {
    setShowInsurancePopup(false);
  };

  useEffect(() => {
    if (shouldClearData) {
      setGridInsuranceData([]);
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
            onClick={handleOpenInsurancePopup}
            icon={AddIcon}
            color="primary"
            variant="text"
          />
        </Grid>
      </Grid>
      <PatientInsuranceForm
        show={showInsurancePopup}
        handleClose={handleCloseInsurancePopup}
        handleSave={handleSaveInsurance}
        editData={editingInsuranceData}
      />
      <PatientInsuranceGrid
        insuranceData={gridInsuranceData}
        onEdit={handleEditInsurance}
        onDelete={handleDeleteInsurance}
      />
    </>
  );
};

export default forwardRef(InsurancePage);
