import React, { useCallback, useEffect, useState } from "react";
import { Grid, Paper, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

import { DeptUnitListDto } from "@/interfaces/HospitalAdministration/DeptUnitListDto";
import { useLoading } from "@/context/LoadingContext";
import useDropdownChange from "@/hooks/useDropdownChange";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { DeptUnitListService } from "@/services/HospitalAdministrationServices/DeptUnitListService/DeptUnitListService";
import { showAlert } from "@/utils/Common/showAlert";
import FormField from "@/components/FormField/FormField";
import FormSaveClearButton from "@/components/Button/FormSaveClearButton";

interface DeptUnitListDetailsProps {
  editData?: DeptUnitListDto;
}

const DeptUnitListDetails: React.FC<DeptUnitListDetailsProps> = ({ editData }) => {
  const [formState, setFormState] = useState({
    dulID: 0,
    deptID: 0,
    deptName: "",
    unitDesc: "",
    rcCompID: 0,
    rmCompID: 0,
    rActiveYN: "Y",
    rNotes: "",
    transferYN: "N",
  });
  const [{ compID, compCode, compName, userID, userName }, setCompData] = useState({ compID: 1, compCode: "KVG", compName: "KVG Medical College", userID: 0, userName: "Akshay" });
  const { setLoading } = useLoading();
  const { handleDropdownChange } = useDropdownChange(setFormState);
  const dropdownValues = useDropdownValues(["department"]);

  useEffect(() => {
    if (editData) {
      setFormState({
        dulID: editData.dulID || 0,
        deptID: editData.deptID || 0,
        deptName: editData.deptName || "",
        unitDesc: editData.unitDesc || "",
        rcCompID: editData.rcCompID || 0,
        rmCompID: editData.rmCompID || 0,
        rActiveYN: editData.rActiveYN || "Y",
        rNotes: editData.rNotes || "",
        transferYN: editData.transferYN || "N",
      });
    } else {
      handleClear();
    }
  }, [editData, compID, compCode, compName, userID, userName]);

  const handleClear = useCallback(() => {
    setFormState({
      dulID: 0,
      deptID: 0,
      deptName: "",
      unitDesc: "",
      rcCompID: 0,
      rmCompID: 0,
      rActiveYN: "Y",
      rNotes: "",
      transferYN: "N",
    });
  }, []);

  const createDeptUnitListDto = useCallback(
    (): DeptUnitListDto => ({
      dulID: formState.dulID,
      deptID: formState.deptID,
      deptName: formState.deptName,
      unitDesc: formState.unitDesc,
      rcCompID: formState.rcCompID,
      rmCompID: formState.rmCompID,
      rActiveYN: formState.rActiveYN,
      rNotes: formState.rNotes,
      compID: compID || 0,
      transferYN: formState.transferYN,
      compCode: compCode || "",
      compName: compName || "",
    }),
    [formState]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSwitchChange = useCallback(
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      setFormState((prev) => ({ ...prev, [name]: checked ? "Y" : "N" }));
    },
    []
  );

  const handleSave = async () => {
    setFormState((prev) => ({ ...prev, isSubmitted: true }));
    setLoading(true);

    try {
      const deptUnitListData = createDeptUnitListDto();
      const result = await DeptUnitListService.saveDeptUnitList(deptUnitListData);
      if (result.success) {
        showAlert("Success", "Department Unit List saved successfully!", "success", {
          onConfirm: handleClear,
        });
      } else {
        showAlert("Error", "Failed to save Department Unit List.", "error");
      }
    } catch (error) {
      console.error("Error saving Department Unit List:", error);
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Typography variant="h6" id="dept-unit-details-header">
        DEPARTMENT UNIT DETAILS
      </Typography>
      <Grid container spacing={2}>
        <FormField
          type="select"
          label="Department"
          name="deptID"
          value={formState.deptID.toString()}
          onChange={handleDropdownChange(["deptID"], ["deptName"], dropdownValues.department || [])}
          options={dropdownValues.department || []}
          ControlID="deptID"
          isMandatory={true}
        />
        <FormField
          type="text"
          label="Unit Name"
          value={formState.unitDesc}
          onChange={handleInputChange}
          name="unitDesc"
          ControlID="unitDesc"
          placeholder="Enter unit description"
          isMandatory
          size="small"
        />
      </Grid>
      <Grid container spacing={2}>
        <FormField type="textarea" label="Notes" value={formState.rNotes} onChange={handleInputChange} name="rNotes" ControlID="rNotes" placeholder="Notes" maxLength={4000} />
      </Grid>

      <Grid container spacing={2}>
        <FormField
          type="switch"
          label={formState.rActiveYN === "Y" ? "Active" : "Inactive"}
          value={formState.rActiveYN}
          checked={formState.rActiveYN === "Y"}
          onChange={handleSwitchChange("rActiveYN")}
          name="rActiveYN"
          ControlID="rActiveYN"
          size="medium"
        />
      </Grid>

      <FormSaveClearButton clearText="Clear" saveText="Save" onClear={handleClear} onSave={handleSave} clearIcon={DeleteIcon} saveIcon={SaveIcon} />
    </Paper>
  );
};

export default DeptUnitListDetails;
