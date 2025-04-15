import CustomButton from "@/components/Button/CustomButton";
import { ChangeCircleRounded } from "@mui/icons-material";
import React from "react";

interface DepartmentInfoChangeProps {
  deptName: string | undefined;
  handleChangeClick: () => void;
}

const DepartmentInfoChange: React.FC<DepartmentInfoChangeProps> = ({ deptName, handleChangeClick }) => {
  return <CustomButton onClick={handleChangeClick} text={deptName || "Not Selected"} variant="contained" icon={ChangeCircleRounded} size="small" color="inherit" />;
};

export default DepartmentInfoChange;
