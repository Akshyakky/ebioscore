import { Grid, Paper } from "@mui/material";
import React from "react";
import DepartmentInfoChange from "../../CommonPage/DepartmentInfoChange";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";

interface GRNHeaderProps {
  handleDepartmentChange: () => void;
}
const GRNHeader: React.FC<GRNHeaderProps> = ({ handleDepartmentChange }) => {
  const dispatch = useDispatch<AppDispatch>();
  const dropdownValues = useDropdownValues(["department"]);
  const departmentInfo = useSelector((state: RootState) => state.grn.departmentInfo) ?? { departmentId: 0, departmentName: "" };
  const { departmentId, departmentName } = departmentInfo;
  return (
    <Paper variant="elevation" sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <DepartmentInfoChange deptName={departmentName || "Select Department"} handleChangeClick={handleDepartmentChange} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GRNHeader;
