import { Grid, Paper, Typography } from "@mui/material";
import FloatingLabelTextBox from "../../../../components/TextBox/FloatingLabelTextBox/FloatingLabelTextBox";
import { useState, useEffect, useMemo } from "react";
import TextArea from "../../../../components/TextArea/TextArea";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomSwitch from "../../../../components/Checkbox/ColorSwitch";
import { useLoading } from "../../../../context/LoadingContext";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { DepartmentDto } from "./../../../../interfaces/Billing/DepartmentDto";
import DropdownSelect from "../../../../components/DropDown/DropdownSelect";
import { DepartmentListService } from "../../../../services/BillingServices/DepartmentListService";
import { ConstantValues } from "../../../../services/CommonServices/ConstantValuesService";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import useDropdown from "../../../../hooks/useDropdown";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";

const DepartmentListDetails: React.FC<{ editData?: DepartmentDto }> = ({
  editData,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [deptCode, setDeptCode] = useState("");
  const [deptName, setDeptName] = useState("");
  const [deptType, setDeptType] = useState("");
  const [rNotes, setRNotes] = useState("");
  const [unit, setUnit] = useState("");
  const [deptLocation, setDeptLocation] = useState("");
  const [dlNumber, setDlNumber] = useState("");
  const [isUnitYN, setIsUnitYN] = useState("N");
  const [autoConsumptionYN, setAutoConsumptionYN] = useState("N");
  const [deptStorePhYN, setDeptStorePhYN] = useState("N");
  const [deptStore, setDeptStore] = useState("N");
  const [isStoreYN, setIsStoreYN] = useState("N");
  const [deptSalesYN, setDeptSalesYN] = useState("N");
  const [dischargeNoteYN, setDischargeNoteYN] = useState("N");
  const [superSpecialityYN, setSuperSpecialityYN] = useState("N");
  const [rActiveYN, setRActiveYN] = useState("Y");
  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const { compID, compCode, compName, userID, userName } =
    store.getState().userDetails;
  const { token } = useSelector((state: RootState) => state.userDetails);

  useEffect(() => {
    if (editData) {
      setDeptCode(editData.deptCode || "");
      setDeptName(editData.deptName || "");
      setDeptType(editData.deptType || "");
      setRNotes(editData.rNotes || "");
      setUnit(editData.unit || "");
      setDeptLocation(editData.deptLocation || "");
      setDlNumber(editData.dlNumber || "");
      setIsUnitYN(editData.isUnitYN || "N");
      setAutoConsumptionYN(editData.autoConsumptionYN || "N");
      setDeptStorePhYN(editData.deptStorePhYN || "N");
      setDeptStore(editData.deptStore || "N");
      setIsStoreYN(editData.isStoreYN || "N");
      setDeptSalesYN(editData.deptSalesYN || "N");
      setDischargeNoteYN(editData.dischargeNoteYN || "N");
      setSuperSpecialityYN(editData.superSpecialityYN || "N");
      setRActiveYN(editData.rActiveYN || "Y");
    } else {
      handleClear();
    }
  }, [editData]);

  const transformDeptTypeValues = (data: DropdownOption[]): DropdownOption[] =>
    data.map((item) => ({
      value: item.value.toString(),
      label: item.label,
    }));

  const memoizedParams = useMemo(
    () => [token, "GetConstantValues", "DTYP"],
    [token]
  );

  const deptTypeResult = useDropdown(
    ConstantValues.fetchConstantValues,
    transformDeptTypeValues,
    memoizedParams
  );

  const deptTypeValues = deptTypeResult.options as DropdownOption[];

  const handleSave = async () => {
    setIsSubmitted(true);
    setLoading(true);

    const departmentDto: DepartmentDto = {
      deptID: editData ? editData.deptID : 0,
      deptCode: deptCode,
      deptName: deptName,
      deptType: deptType,
      deptStore: deptStore,
      rActiveYN: rActiveYN,
      rNotes: rNotes,
      deptLocation: deptLocation,
      deptSalesYN: deptSalesYN,
      deptStorePhYN: deptStorePhYN,
      dlNumber: dlNumber,
      isUnitYN: isUnitYN,
      superSpecialityYN: superSpecialityYN,
      unit: unit,
      isStoreYN: isStoreYN,
      autoConsumptionYN: autoConsumptionYN,
      dischargeNoteYN: dischargeNoteYN,
      compID: compID || 0,
      compCode: compCode || "",
      compName: compName || "",
      transferYN: "N",
      rCreatedID: userID || 0,
      rCreatedOn: serverDate || new Date(),
      rCreatedBy: userName || "",
      rModifiedID: userID || 0,
      rModifiedOn: serverDate || new Date(),
      rModifiedBy: userName || "",
    };

    try {
      const result =
        await DepartmentListService.saveDepartmentList(departmentDto);
      if (result.success) {
        showAlert("Success", "Department saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert(
          "Error",
          result.errorMessage || "Failed to save Department.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving Department:", error);
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDeptCode("");
    setDeptName("");
    setDeptType("");
    setRNotes("");
    setDeptStore("");
    setDeptLocation("");
    setUnit("");
    setDlNumber("");
    setRActiveYN("Y");
    setIsUnitYN("N");
    setIsStoreYN("N");
    setDeptStorePhYN("N");
    setDeptSalesYN("N");
    setDischargeNoteYN("N");
    setSuperSpecialityYN("N");
    setAutoConsumptionYN("N");
    setIsSubmitted(false);
  };

  const handleActiveToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRActiveYN(event.target.checked ? "Y" : "N");
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="department-list-header">
        Department List
      </Typography>
      <section>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Department Code"
              placeholder="Department Code"
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value)}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              name="deptCode"
              ControlID="deptCode"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Department Name"
              placeholder="Department Name"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              name="deptName"
              ControlID="deptName"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DropdownSelect
              label="Department Type"
              value={deptType}
              onChange={(e) => setDeptType(e.target.value)}
              options={deptTypeValues}
              isMandatory
              size="small"
              isSubmitted={isSubmitted}
              name="deptType"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Department Location"
              placeholder="Department Location"
              value={deptLocation}
              onChange={(e) => setDeptLocation(e.target.value)}
              size="small"
              isSubmitted={isSubmitted}
              name="deptLocation"
              ControlID="deptLocation"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FloatingLabelTextBox
              title="Department Unit"
              placeholder="Department Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              size="small"
              isSubmitted={isSubmitted}
              name="unit"
              ControlID="unit"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextArea
              label="Remarks"
              name="rNotes"
              value={rNotes}
              placeholder="Remarks"
              onChange={(e) => setRNotes(e.target.value)}
              rows={2}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label={rActiveYN === "Y" ? "Active" : "Hidden"}
              checked={rActiveYN === "Y"}
              onChange={handleActiveToggle}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Registration"
              checked={isUnitYN === "Y"}
              onChange={(e) => setIsUnitYN(e.target.checked ? "Y" : "N")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Auto Consumption"
              checked={autoConsumptionYN === "Y"}
              onChange={(e) =>
                setAutoConsumptionYN(e.target.checked ? "Y" : "N")
              }
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Main Store"
              checked={isStoreYN === "Y"}
              onChange={(e) => setIsStoreYN(e.target.checked ? "Y" : "N")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Sales"
              checked={deptSalesYN === "Y"}
              onChange={(e) => setDeptSalesYN(e.target.checked ? "Y" : "N")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Discharge Note"
              checked={dischargeNoteYN === "Y"}
              onChange={(e) => setDischargeNoteYN(e.target.checked ? "Y" : "N")}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Super Speciality"
              checked={superSpecialityYN === "Y"}
              onChange={(e) =>
                setSuperSpecialityYN(e.target.checked ? "Y" : "N")
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Inventory"
              checked={deptStorePhYN === "Y"}
              onChange={(e) => setDeptStorePhYN(e.target.checked ? "Y" : "N")}
            />
          </Grid>
        </Grid>
        <Grid container marginTop={0} spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <CustomSwitch
              label="Pharmacy"
              checked={deptStore === "Y"}
              onChange={(e) => setDeptStore(e.target.checked ? "Y" : "N")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {deptStore === "Y" && (
              <FloatingLabelTextBox
                title="DL Number"
                placeholder="DL Number"
                value={dlNumber}
                onChange={(e) => setDlNumber(e.target.value)}
                size="small"
                isSubmitted={isSubmitted}
                name="dlNumber"
                ControlID="dlNumber"
              />
            )}
          </Grid>
        </Grid>
        <FormSaveClearButton
          clearText="Clear"
          saveText="Save"
          onClear={handleClear}
          onSave={handleSave}
          clearIcon={DeleteIcon}
          saveIcon={SaveIcon}
        />
      </section>
    </Paper>
  );
};

export default DepartmentListDetails;
