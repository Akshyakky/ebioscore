import { Grid, Paper, Typography } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLoading } from "../../../../context/LoadingContext";
import { store } from "../../../../store/store";
import { showAlert } from "../../../../utils/Common/showAlert";
import { useServerDate } from "../../../../hooks/Common/useServerDate";
import { DepartmentDto } from "./../../../../interfaces/Billing/DepartmentDto";
import { DepartmentListService } from "../../../../services/BillingServices/DepartmentListService";
import { ConstantValues } from "../../../../services/CommonServices/ConstantValuesService";
import useDropdown from "../../../../hooks/useDropdown";
import { DropdownOption } from "../../../../interfaces/Common/DropdownOption";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";
import FormField from "../../../../components/FormField/FormField";

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    switch (name) {
      case "deptCode":
        setDeptCode(value);
        break;
      case "deptName":
        setDeptName(value);
        break;
      case "deptType":
        setDeptType(value);
        break;
      case "rNotes":
        setRNotes(value);
        break;
      case "unit":
        setUnit(value);
        break;
      case "deptLocation":
        setDeptLocation(value);
        break;
      case "dlNumber":
        setDlNumber(value);
        break;
      default:
        break;
    }
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="department-list-header">
        Department List
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Department Code"
          value={deptCode}
          onChange={handleInputChange}
          isSubmitted={isSubmitted}
          name="deptCode"
          ControlID="deptCode"
          placeholder="Department Code"
        />
        <FormField
          type="text"
          label="Department Name"
          value={deptName}
          onChange={handleInputChange}
          isSubmitted={isSubmitted}
          name="deptName"
          ControlID="deptName"
          placeholder="Department Name"
        />
        <FormField
          type="select"
          label="Department Type"
          value={deptType}
          onChange={(e) => setDeptType(e.target.value)}
          options={deptTypeValues}
          isSubmitted={isSubmitted}
          name="deptType"
          ControlID="deptType"
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="text"
          label="Department Location"
          value={deptLocation}
          onChange={handleInputChange}
          isSubmitted={isSubmitted}
          name="deptLocation"
          ControlID="deptLocation"
          placeholder="Department Location"
        />
        <FormField
          type="text"
          label="Department Unit"
          value={unit}
          onChange={handleInputChange}
          isSubmitted={isSubmitted}
          name="unit"
          ControlID="unit"
          placeholder="Department Unit"
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="textarea"
          label="Remarks"
          value={rNotes}
          onChange={handleInputChange}
          name="rNotes"
          ControlID="rNotes"
          placeholder="Remarks"
          maxLength={250}
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label={rActiveYN === "Y" ? "Active" : "Hidden"}
          value={rActiveYN}
          checked={rActiveYN === "Y"}
          onChange={(e) => setRActiveYN(e.target.checked ? "Y" : "N")}
          name="rActiveYN"
          ControlID="rActiveYN"
        />
        <FormField
          type="switch"
          label="Registration"
          value={isUnitYN}
          checked={isUnitYN === "Y"}
          onChange={(e, checked) => setIsUnitYN(checked ? "Y" : "N")}
          name="isUnitYN"
          ControlID="isUnitYN"
        />
        <FormField
          type="switch"
          label="Auto Consumption"
          value={autoConsumptionYN}
          checked={autoConsumptionYN === "Y"}
          onChange={(e, checked) => setAutoConsumptionYN(checked ? "Y" : "N")}
          name="autoConsumptionYN"
          ControlID="autoConsumptionYN"
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label="Main Store"
          value={isStoreYN}
          checked={isStoreYN === "Y"}
          onChange={(e, checked) => setIsStoreYN(checked ? "Y" : "N")}
          name="isStoreYN"
          ControlID="isStoreYN"
        />
        <FormField
          type="switch"
          label="Sales"
          value={deptSalesYN}
          checked={deptSalesYN === "Y"}
          onChange={(e, checked) => setDeptSalesYN(checked ? "Y" : "N")}
          name="deptSalesYN"
          ControlID="deptSalesYN"
        />
        <FormField
          type="switch"
          label="Discharge Note"
          value={dischargeNoteYN}
          checked={dischargeNoteYN === "Y"}
          onChange={(e, checked) => setDischargeNoteYN(checked ? "Y" : "N")}
          name="dischargeNoteYN"
          ControlID="dischargeNoteYN"
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField
          type="switch"
          label="Super Speciality"
          value={superSpecialityYN}
          checked={superSpecialityYN === "Y"}
          onChange={(e, checked) => setSuperSpecialityYN(checked ? "Y" : "N")}
          name="superSpecialityYN"
          ControlID="superSpecialityYN"
        />
        <FormField
          type="switch"
          label="Inventory"
          value={deptStorePhYN}
          checked={deptStorePhYN === "Y"}
          onChange={(e, checked) => setDeptStorePhYN(checked ? "Y" : "N")}
          name="deptStorePhYN"
          ControlID="deptStorePhYN"
        />
      </Grid>
      <Grid container marginTop={0} spacing={2}>
        <FormField
          type="switch"
          label="Pharmacy"
          value={deptStore}
          checked={deptStore === "Y"}
          onChange={(e, checked) => setDeptStore(checked ? "Y" : "N")}
          name="deptStore"
          ControlID="deptStore"
        />
        {deptStore === "Y" && (
          <FormField
            type="text"
            label="DL Number"
            value={dlNumber}
            onChange={handleInputChange}
            isSubmitted={isSubmitted}
            name="dlNumber"
            ControlID="dlNumber"
            placeholder="DL Number"
          />
        )}
      </Grid>
      <FormSaveClearButton
        clearText="Clear"
        saveText="Save"
        onClear={handleClear}
        onSave={handleSave}
        clearIcon={DeleteIcon}
        saveIcon={SaveIcon}
      />
    </Paper>
  );
};

export default DepartmentListDetails;
