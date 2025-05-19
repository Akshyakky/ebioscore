import CustomButton from "@/components/Button/CustomButton";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";
import FormField from "@/components/FormField/FormField";
import { useLoading } from "@/context/LoadingContext";
import { useServerDate } from "@/hooks/Common/useServerDate";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DepartmentDto } from "@/interfaces/Billing/DepartmentDto";
import { departmentService } from "@/services/CommonServices/CommonModelServices";

import { showAlert } from "@/utils/Common/showAlert";
import { Grid, Paper, SelectChangeEvent, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { DeptUsersPage } from "./DeptUsers/DeptUsersPage";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
interface DepartmentListDetailsProps {
  editData?: DepartmentDto;
}

const DepartmentListDetails: React.FC<DepartmentListDetailsProps> = ({ editData }) => {
  const [{ compID, compCode, compName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College" });
  const [formData, setFormData] = useState<DepartmentDto>({
    deptID: 0,
    deptCode: "",
    deptName: "",
    deptType: "",
    rNotes: "",
    unit: "",
    deptLocation: "",
    dlNumber: "",
    isUnitYN: "N",
    autoConsumptionYN: "N",
    deptStorePhYN: "N",
    deptStore: "N",
    isStoreYN: "N",
    deptSalesYN: "N",
    dischargeNoteYN: "N",
    superSpecialityYN: "N",
    rActiveYN: "Y",
    transferYN: "N",
    compID: compID ?? 0,
    compCode: compCode ?? "",
    compName: compName ?? "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const { setLoading } = useLoading();
  const serverDate = useServerDate();
  const dropdownValues = useDropdownValues(["departmentTypes"]);

  const isEditMode = formData.deptID > 0;

  useEffect(() => {
    if (editData) {
      setFormData((prevState) => ({ ...prevState, ...editData }));
    } else {
      handleClear();
    }
  }, [editData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  }, []);

  const handleSwitchChange = useCallback(
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setFormData((prevState) => ({ ...prevState, [name]: checked ? "Y" : "N" }));
    },
    []
  );

  const handleSave = async () => {
    setIsSubmitted(true);
    if (!formData.deptCode || !formData.deptName || !formData.deptType) {
      return;
    }

    setLoading(true);
    try {
      const result = await departmentService.save(formData);
      if (result.success) {
        showAlert(`Department ${isEditMode ? "Updated" : "Saved"}`, `${formData.deptName} ${isEditMode ? "updated" : "saved"} successfully!`, "success", {
          onConfirm: isEditMode ? handleClear : () => console.log("Hello", formData.deptID),
        });
      } else {
        showAlert("Error", result.errorMessage || "Failed to save Department.", "error");
      }
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormData({
      deptID: 0,
      deptCode: "",
      deptName: "",
      deptType: "",
      rNotes: "",
      unit: "",
      deptLocation: "",
      dlNumber: "",
      isUnitYN: "N",
      autoConsumptionYN: "N",
      deptStorePhYN: "N",
      deptStore: "N",
      isStoreYN: "N",
      deptSalesYN: "N",
      dischargeNoteYN: "N",
      superSpecialityYN: "N",
      rActiveYN: "Y",
      transferYN: "N",
      compID: compID ?? 0,
      compCode: compCode ?? "",
      compName: compName ?? "",
    });
    setIsSubmitted(false);
  }, []);

  const handleSelectChange = useCallback((event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  }, []);

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="department-list-header">
        Department List - {isEditMode ? "Edit Mode" : "Add New"}
      </Typography>

      <section>
        {isEditMode && (
          <CustomButton text="Manage Users Access" size="small" onClick={() => setOpenDialog(true)} variant="contained" color="info" aria-label="Manage Department Users Access" />
        )}
        <Grid container spacing={2}>
          <FormField
            type="text"
            label="Department Code"
            value={formData.deptCode}
            onChange={handleInputChange}
            isSubmitted={isSubmitted}
            name="deptCode"
            ControlID="deptCode"
            placeholder="Department Code"
            isMandatory
          />
          <FormField
            type="text"
            label="Department Name"
            value={formData.deptName}
            onChange={handleInputChange}
            isSubmitted={isSubmitted}
            name="deptName"
            ControlID="deptName"
            placeholder="Department Name"
            isMandatory
          />
          <FormField
            type="select"
            label="Department Type"
            value={formData.deptType}
            onChange={handleSelectChange}
            options={dropdownValues.departmentTypes || []}
            isSubmitted={isSubmitted}
            name="deptType"
            ControlID="deptType"
            isMandatory
          />
          <FormField
            type="text"
            label="Department Location"
            value={formData.deptLocation}
            onChange={handleInputChange}
            isSubmitted={isSubmitted}
            name="deptLocation"
            ControlID="deptLocation"
            placeholder="Department Location"
          />
          <FormField
            type="text"
            label="Department Unit"
            value={formData.unit}
            onChange={handleInputChange}
            isSubmitted={isSubmitted}
            name="unit"
            ControlID="unit"
            placeholder="Department Unit"
          />
          <FormField type="textarea" label="Remarks" value={formData.rNotes} onChange={handleInputChange} name="rNotes" ControlID="rNotes" placeholder="Remarks" />
        </Grid>
        <Grid container spacing={2}>
          {isEditMode && (
            <FormField
              type="switch"
              label={formData.rActiveYN === "Y" ? "Active" : "Hidden"}
              value={formData.rActiveYN}
              checked={formData.rActiveYN === "Y"}
              onChange={handleSwitchChange("rActiveYN")}
              name="rActiveYN"
              ControlID="rActiveYN"
            />
          )}
          <FormField
            type="switch"
            label="Registration"
            value={formData.isUnitYN}
            checked={formData.isUnitYN === "Y"}
            onChange={handleSwitchChange("isUnitYN")}
            name="isUnitYN"
            ControlID="isUnitYN"
          />
          <FormField
            type="switch"
            label="Auto Consumption"
            value={formData.autoConsumptionYN}
            checked={formData.autoConsumptionYN === "Y"}
            onChange={handleSwitchChange("autoConsumptionYN")}
            name="autoConsumptionYN"
            ControlID="autoConsumptionYN"
          />
          <FormField
            type="switch"
            label="Main Store"
            value={formData.isStoreYN}
            checked={formData.isStoreYN === "Y"}
            onChange={handleSwitchChange("isStoreYN")}
            name="isStoreYN"
            ControlID="isStoreYN"
          />
          <FormField
            type="switch"
            label="Sales"
            value={formData.deptSalesYN}
            checked={formData.deptSalesYN === "Y"}
            onChange={handleSwitchChange("deptSalesYN")}
            name="deptSalesYN"
            ControlID="deptSalesYN"
          />
          <FormField
            type="switch"
            label="Discharge Note"
            value={formData.dischargeNoteYN}
            checked={formData.dischargeNoteYN === "Y"}
            onChange={handleSwitchChange("dischargeNoteYN")}
            name="dischargeNoteYN"
            ControlID="dischargeNoteYN"
          />
          <FormField
            type="switch"
            label="Super Speciality"
            value={formData.superSpecialityYN}
            checked={formData.superSpecialityYN === "Y"}
            onChange={handleSwitchChange("superSpecialityYN")}
            name="superSpecialityYN"
            ControlID="superSpecialityYN"
          />
          <FormField
            type="switch"
            label="Pharmacy"
            value={formData.deptStore}
            checked={formData.deptStore === "Y"}
            onChange={handleSwitchChange("deptStore")}
            name="deptStore"
            ControlID="deptStore"
          />
        </Grid>
        {formData.deptStore === "Y" && (
          <Grid container spacing={2}>
            <FormField
              type="text"
              label="DL Number"
              value={formData.dlNumber}
              onChange={handleInputChange}
              isSubmitted={isSubmitted}
              name="dlNumber"
              ControlID="dlNumber"
              placeholder="DL Number"
            />
          </Grid>
        )}
        <FormSaveClearButton
          clearText="Clear"
          saveText={isEditMode ? "Update" : "Save"}
          onClear={handleClear}
          onSave={handleSave}
          clearIcon={DeleteIcon}
          saveIcon={isEditMode ? EditIcon : SaveIcon}
        />
      </section>
      <DeptUsersPage deptId={formData.deptID} deptName={formData.deptName} openDialog={openDialog} handleCloseDialog={() => setOpenDialog(false)} />
    </Paper>
  );
};

export default DepartmentListDetails;
