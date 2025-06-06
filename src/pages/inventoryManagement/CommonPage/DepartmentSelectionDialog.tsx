import React, { useCallback, useState, useEffect } from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, FormHelperText } from "@mui/material";
import { ThumbUp } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import CustomButton from "@/components/Button/CustomButton";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { useAlert } from "@/providers/AlertProvider";
import { useNavigate } from "react-router-dom";
import { notifySuccess } from "@/utils/Common/toastManager";

interface DepartmentSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectDepartment: (deptId: number, deptName: string) => void;
  initialDeptId?: number;
  dialogTitle?: string;
  requireSelection?: boolean;
}

const DepartmentSelectionDialog: React.FC<DepartmentSelectionDialogProps> = ({
  open,
  onClose,
  onSelectDepartment,
  initialDeptId = 0,
  dialogTitle = "Select Department",
  requireSelection = true,
}) => {
  const { showAlert } = useAlert();
  const [selectedDeptId, setSelectedDeptId] = useState<number>(initialDeptId);
  const [deptName, setDeptName] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const dropdownValues = useDropdownValues(["department"]);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedDeptId(initialDeptId);
    setHasError(false);
  }, [initialDeptId, open]);

  const handleDropdownChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      const deptId = Number(event.target.value);
      setSelectedDeptId(deptId);
      setHasError(false);

      const selectedDept = dropdownValues.department?.find((dept) => parseInt(dept.value.toString()) === deptId);
      if (selectedDept) {
        setDeptName(selectedDept.label);
      }
    },
    [dropdownValues.department]
  );

  const handleClose = useCallback(async () => {
    if (requireSelection && selectedDeptId === 0) {
      const isSelectDept = await showAlert("Warning", "Please select a department before closing.", "warning", true);
      if (isSelectDept) return;
      navigate(-1);
    }
    onClose();
  }, [onClose, selectedDeptId, requireSelection, showAlert, navigate]);

  const handleOkClick = useCallback(() => {
    if (selectedDeptId === 0) {
      setHasError(true);
      showAlert("Warning", "Please select a department to continue.", "warning");
    } else {
      onSelectDepartment(selectedDeptId, deptName);
      notifySuccess("Department selected successfully!");
      onClose();
    }
  }, [selectedDeptId, deptName, onSelectDepartment, onClose, showAlert]);

  return (
    <GenericDialog open={open} onClose={handleClose} title={dialogTitle} maxWidth="sm" disableBackdropClick={true}>
      <Typography variant="h6" gutterBottom>
        Please select a department
      </Typography>

      <FormControl fullWidth variant="outlined" size="small" error={hasError} required sx={{ mt: 2 }}>
        <InputLabel id="department-select-label">Department</InputLabel>
        <Select labelId="department-select-label" id="department-select" value={selectedDeptId === 0 ? "" : selectedDeptId} onChange={handleDropdownChange} label="Department">
          <MenuItem value="">
            <em>Select a department</em>
          </MenuItem>
          {dropdownValues.department?.map((dept) => (
            <MenuItem key={dept.value} value={parseInt(dept.value.toString())}>
              {dept.label}
            </MenuItem>
          ))}
        </Select>
        {hasError && <FormHelperText>Department selection is required</FormHelperText>}
      </FormControl>

      <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 3 }}>
        <CustomButton variant="contained" onClick={handleClose} text="Close" sx={{ marginRight: 1 }} color="error" icon={Close} />
        <CustomButton variant="contained" onClick={handleOkClick} text="Select" color="success" icon={ThumbUp} />
      </Box>
    </GenericDialog>
  );
};

export default DepartmentSelectionDialog;
