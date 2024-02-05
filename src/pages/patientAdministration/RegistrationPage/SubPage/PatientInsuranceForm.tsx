import React, { useEffect, useState } from "react";
import { InsuranceFormState } from "../../../../interfaces/PatientAdministration/InsuranceDetails";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { InsuranceCarrierService } from "../../../../services/CommonService/InsuranceCarrierService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import useDropdownChange from "../../../../hooks/useDropdownChange";
import { AppModifyListService } from "../../../../services/CommonService/AppModifyListService";
import { ConstantValues } from "../../../../services/CommonService/ConstantValuesService";
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

interface PatientInsuranceModalProps {
  show: boolean;
  handleClose: () => void;
  handleSave: (insuranceData: InsuranceFormState) => void;
  editData?: InsuranceFormState | null;
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
  const insuranceFormInitialState: InsuranceFormState = {
    ID: 0,
    OPIPInsID: 0,
    PChartID: 0,
    InsurID: 0,
    InsurCode: "",
    InsurName: "",
    PolicyNumber: "",
    PolicyHolder: "",
    GroupNumber: "",
    PolicyStartDt: new Date().toISOString().split("T")[0],
    PolicyEndDt: new Date().toISOString().split("T")[0],
    Guarantor: "",
    RelationVal: "",
    Relation: "",
    Address1: "",
    Address2: "",
    Phone1: "",
    Phone2: "",
    RActiveYN: "Y",
    RCreatedID: userInfo.userID !== null ? userInfo.userID : 0,
    RCreatedBy: userInfo.userName !== null ? userInfo.userName : "",
    RCreatedOn: new Date().toISOString().split("T")[0],
    RModifiedID: userInfo.userID !== null ? userInfo.userID : 0,
    RModifiedBy: userInfo.userName !== null ? userInfo.userName : "",
    RModifiedOn: new Date().toISOString().split("T")[0],
    RNotes: "",
    CompID: userInfo.compID !== null ? userInfo.compID : 0,
    CompCode: userInfo.compCode !== null ? userInfo.compCode : "",
    CompName: userInfo.compName !== null ? userInfo.compName : "",
    InsurStatusCode: "",
    InsurStatusName: "",
    PChartCode: "",
    PChartCompID: "0",
    ReferenceNo: "",
    TransferYN: "N",
    CoveredVal: "",
    CoveredFor: "",
  };

  const [insuranceForm, setInsuranceForm] = useState<InsuranceFormState>(
    insuranceFormInitialState
  );
  const [insuranceOptions, setInsuranceOptions] = useState<DropdownOption[]>(
    []
  );
  const [relationValues, setRelationValues] = useState<DropdownOption[]>([]);
  const [coverForValues, setCoverForValues] = useState<DropdownOption[]>([]);

  const { handleDropdownChange } =
    useDropdownChange<InsuranceFormState>(setInsuranceForm);

  const resetInsuranceFormData = () => {
    setInsuranceForm(insuranceFormInitialState);
  };

  useEffect(() => {
    if (editData) {
      setInsuranceForm(editData);
    }
  }, [editData]);
  // Function to handle form submission
  const handleSubmit = () => {
    setIsSubmitted(true);
    if (insuranceForm.InsurName.trim()) {
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
              value={String(insuranceForm.InsurID)}
              options={insuranceOptions}
              onChange={handleDropdownChange(
                ["InsurID"],
                ["InsurName"],
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
              value={insuranceForm.PolicyHolder}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  PolicyHolder: e.target.value,
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
              value={insuranceForm.PolicyNumber}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  PolicyNumber: e.target.value,
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
              value={insuranceForm.GroupNumber}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  GroupNumber: e.target.value,
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
              value={insuranceForm.PolicyStartDt}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  PolicyStartDt: e.target.value,
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
              value={insuranceForm.PolicyEndDt}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  PolicyEndDt: e.target.value,
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
              value={insuranceForm.Guarantor}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Guarantor: e.target.value,
                })
              }
            />
          </Grid>
          <Grid item md={3} lg={3} sm={12} xs={12} xl={3}>
            <DropdownSelect
              label="Relationship"
              name="Relationship"
              value={insuranceForm.RelationVal}
              options={relationValues}
              onChange={handleDropdownChange(
                ["RelationVal"],
                ["Relation"],
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
              value={String(insuranceForm.CoveredVal)}
              options={coverForValues}
              onChange={handleDropdownChange(
                ["CoveredVal"],
                ["CoveredFor"],
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
              value={insuranceForm.Address1}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Address1: e.target.value,
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
              value={insuranceForm.Address2}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Address2: e.target.value,
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
              value={insuranceForm.Phone1}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Phone1: e.target.value,
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
              value={insuranceForm.Phone2}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  Phone2: e.target.value,
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
              value={insuranceForm.RNotes}
              onChange={(e) =>
                setInsuranceForm({
                  ...insuranceForm,
                  RNotes: e.target.value,
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
