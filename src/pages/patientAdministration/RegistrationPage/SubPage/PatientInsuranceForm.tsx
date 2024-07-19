import React, { useEffect, useState } from "react";
import { OPIPInsurancesDto } from "../../../../interfaces/PatientAdministration/InsuranceDetails";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { InsuranceCarrierService } from "../../../../services/CommonServices/InsuranceCarrierService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { AppModifyListService } from "../../../../services/CommonServices/AppModifyListService";
import { ConstantValues } from "../../../../services/CommonServices/ConstantValuesService";
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CustomButton from "../../../../components/Button/CustomButton";
import { format } from "date-fns";

interface PatientInsuranceModalProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (insuranceData: OPIPInsurancesDto) => void;
  editData?: OPIPInsurancesDto | null;
}

const PatientInsuranceForm: React.FC<PatientInsuranceModalProps> = ({
  show,
  handleClose,
  handleSave,
  editData,
}) => {
  const userInfo = useSelector((state: RootState) => state.userDetails);
  const token = userInfo.token!;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const insuranceFormInitialState: OPIPInsurancesDto = {
    ID: 0,
    oPIPInsID: 0,
    pChartID: 0,
    insurID: 0,
    insurCode: "",
    insurName: "",
    policyNumber: "",
    policyHolder: "",
    groupNumber: "",
    policyStartDt: format(new Date(), "yyyy-MM-dd"),
    policyEndDt: format(new Date(), "yyyy-MM-dd"),
    guarantor: "",
    relationVal: "",
    relation: "",
    address1: "",
    address2: "",
    phone1: "",
    phone2: "",
    rActiveYN: "Y",
    rCreatedID: userInfo.userID !== null ? userInfo.userID : 0,
    rCreatedBy: userInfo.userName !== null ? userInfo.userName : "",
    rCreatedOn: new Date(),
    rModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
    rModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
    rModifiedOn: new Date(),
    rNotes: "",
    compID: userInfo.compID !== null ? userInfo.compID : 0,
    compCode: userInfo.compCode !== null ? userInfo.compCode : "",
    compName: userInfo.compName !== null ? userInfo.compName : "",
    insurStatusCode: "",
    insurStatusName: "",
    pChartCode: "",
    pChartCompID: 0,
    referenceNo: "",
    transferYN: "N",
    coveredVal: "",
    coveredFor: "",
  };

  const [insuranceForm, setInsuranceForm] = useState<OPIPInsurancesDto>(
    insuranceFormInitialState
  );
  const [insuranceOptions, setInsuranceOptions] = useState<DropdownOption[]>(
    []
  );
  const [relationValues, setRelationValues] = useState<DropdownOption[]>([]);
  const [coverForValues, setCoverForValues] = useState<DropdownOption[]>([]);

  const { handleDropdownChange } =
    useDropdownChange<OPIPInsurancesDto>(setInsuranceForm);

  const resetInsuranceFormData = () => {
    setInsuranceForm(insuranceFormInitialState);
  };

  useEffect(() => {
    if (editData) {
      setInsuranceForm({
        ...editData,
        policyStartDt: format(new Date(editData.policyStartDt), "yyyy-MM-dd"),
        policyEndDt: format(new Date(editData.policyEndDt), "yyyy-MM-dd"),
      });
    }
  }, [editData]);

  // Function to handle form submission
  const handleSubmit = () => {
    setIsSubmitted(true);
    if (insuranceForm.insurName.trim()) {
      handleSave(insuranceForm);
      resetInsuranceFormData();
      handleClose();
      setIsSubmitted(false);
    }
  };

  const handleCloseWithClear = () => {
    resetInsuranceFormData();
    handleClose();
    setIsSubmitted(false);
  };

  const endpoint = "GetAllActiveForDropDown";
  const endPointAppModifyList = "GetActiveAppModifyFieldsAsync";
  const endpointConstantValues = "GetConstantValues";

  useEffect(() => {
    const loadDropdownData = async () => {
      const InsuranceCarrier =
        await InsuranceCarrierService.fetchInsuranceOptions(token, endpoint);
      const InsuranceCarrierOptions: DropdownOption[] = InsuranceCarrier.map(
        (item) => ({
          value: item.value,
          label: item.label,
        })
      );
      setInsuranceOptions(InsuranceCarrierOptions);
      const responseRelation = await AppModifyListService.fetchAppModifyList(
        token,
        endPointAppModifyList,
        "RELATION"
      );
      const transformedRelationData: DropdownOption[] = responseRelation.map(
        (item) => ({
          value: item.value,
          label: item.label,
        })
      );
      setRelationValues(transformedRelationData);
      const responseCoverFor = await ConstantValues.fetchConstantValues(
        token,
        endpointConstantValues,
        "COVR"
      );
      const transformedCoverForData: DropdownOption[] = responseCoverFor.map(
        (item) => ({
          value: item.value,
          label: item.label,
        })
      );
      setCoverForValues(transformedCoverForData);
    };
    loadDropdownData();
  }, [token]);

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Patient Insurance</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <DropdownSelect
              label="Insurance"
              name="Insurance"
              value={
                insuranceForm.insurID === 0
                  ? ""
                  : insuranceForm.insurID.toString()
              }
              options={insuranceOptions}
              onChange={handleDropdownChange(
                ["insurID"],
                ["insurName"],
                insuranceOptions
              )}
              isMandatory={true}
              isSubmitted={isSubmitted}
              size="small"
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="PolicyHolder"
              title="Policy Holder"
              type="text"
              size="small"
              placeholder="Policy Holder"
              value={insuranceForm.policyHolder}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  policyHolder: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="PolicyNumber"
              title="Policy Number"
              type="text"
              size="small"
              placeholder="Policy Number"
              value={insuranceForm.policyNumber}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  policyNumber: e.target.value,
                })
              }
              isMandatory={true}
              isSubmitted={isSubmitted}
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="GroupNumber"
              title="Group Number"
              type="text"
              size="small"
              placeholder="Group Number"
              value={insuranceForm.groupNumber}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  groupNumber: e.target.value,
                })
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="PolicyStartDate"
              title="Policy Start Date"
              type="date"
              size="small"
              placeholder="Policy Start Date"
              value={insuranceForm.policyStartDt}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  policyStartDt: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="PolicyEndDate"
              title="Policy End Date"
              type="date"
              size="small"
              placeholder="Policy End Date"
              value={insuranceForm.policyEndDt}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  policyEndDt: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="Guarantor"
              title="Guarantor"
              type="text"
              size="small"
              placeholder="Guarantor"
              value={insuranceForm.guarantor}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  guarantor: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <DropdownSelect
              label="Relationship"
              name="Relationship"
              value={insuranceForm.relationVal}
              options={relationValues}
              onChange={handleDropdownChange(
                ["relationVal"],
                ["relation"],
                relationValues
              )}
              size="small"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <DropdownSelect
              label="CoveredFor"
              name="Covered For"
              value={String(insuranceForm.coveredVal)}
              options={coverForValues}
              onChange={handleDropdownChange(
                ["coveredVal"],
                ["coveredFor"],
                coverForValues
              )}
              size="small"
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="Address1"
              title="Address 1"
              type="text"
              size="small"
              placeholder="Address 1"
              value={insuranceForm.address1}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  address1: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="Address2"
              title="Address 2"
              type="text"
              size="small"
              placeholder="Address 2"
              value={insuranceForm.address2}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  address2: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="Phone1"
              title="Phone 1"
              type="text"
              size="small"
              placeholder="Phone 1"
              value={insuranceForm.phone1}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  phone1: e.target.value,
                })
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="Phone2"
              title="Phone 2"
              type="text"
              size="small"
              placeholder="Phone 2"
              value={insuranceForm.phone2}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  phone2: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <FloatingLabelTextBox
              ControlID="Remarks"
              title="Remarks"
              type="text"
              size="small"
              placeholder="Remarks"
              value={insuranceForm.rNotes}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  rNotes: e.target.value,
                })
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <CustomButton
          text="Close"
          icon={CloseIcon}
          variant="contained"
          size="medium"
          color="secondary"
          onClick={handleCloseWithClear}
        />
        <CustomButton
          text="Save"
          icon={SaveIcon}
          variant="contained"
          size="medium"
          color="success"
          onClick={handleSubmit}
        />
      </DialogActions>
    </Dialog>
  );
};

export default PatientInsuranceForm;
