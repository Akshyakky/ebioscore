import React, { useCallback, useState, useEffect } from "react";
import { Box, SelectChangeEvent, Typography } from "@mui/material";
import { ThumbUp } from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import FormField from "@/components/FormField/FormField";
import CustomButton from "@/components/Button/CustomButton";
import useDropdownValues from "@/hooks/PatientAdminstration/useDropdownValues";
import { showAlert } from "@/utils/Common/showAlert";
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
  const [selectedDeptId, setSelectedDeptId] = useState<number>(initialDeptId);
  const [deptName, setDeptName] = useState<string>("");
  const dropdownValues = useDropdownValues(["department"]);
  const isSubmitted = false;
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedDeptId(initialDeptId);
  }, [initialDeptId, open]);

  const handleDropdownChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const deptId = Number(event.target.value);
      setSelectedDeptId(deptId);

      const selectedDept = dropdownValues.department?.find((dept) => parseInt(dept.value) === deptId);
      if (selectedDept) {
        setDeptName(selectedDept.label);
      }
    },
    [dropdownValues.department]
  );

  const handleClose = useCallback(async () => {
    if (requireSelection) {
      const isSelectDept = await showAlert("Warning", "Please select a department before closing.", "warning", true);
      if (isSelectDept) return;
      navigate(-1);
    }
    onClose();
  }, [onClose, selectedDeptId, requireSelection]);

  const handleOkClick = useCallback(() => {
    if (selectedDeptId === 0) {
      showAlert("Warning", "Please select a department to continue.", "warning");
    } else {
      onSelectDepartment(selectedDeptId, deptName);
      notifySuccess("Department selected successfully!");
      onClose();
    }
  }, [selectedDeptId, deptName, onSelectDepartment, onClose]);

  return (
    <GenericDialog open={open} onClose={handleClose} title={dialogTitle} maxWidth="sm" disableBackdropClick={true}>
      <Typography variant="h6" gutterBottom>
        Please select a department
      </Typography>
      <FormField
        type="select"
        label="Department"
        name="departmentId"
        ControlID="Department"
        value={selectedDeptId === 0 ? "" : String(selectedDeptId)}
        options={dropdownValues.department || []}
        onChange={handleDropdownChange}
        isMandatory={true}
        isSubmitted={isSubmitted}
        gridProps={{ xs: 12, sm: 6, md: 6 }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
        <CustomButton variant="contained" onClick={handleClose} text="Close" sx={{ marginRight: 1 }} color="error" icon={Close} />
        <CustomButton variant="contained" onClick={handleOkClick} text="Select" color="success" icon={ThumbUp} />
      </Box>
    </GenericDialog>
  );
};

export default DepartmentSelectionDialog;
