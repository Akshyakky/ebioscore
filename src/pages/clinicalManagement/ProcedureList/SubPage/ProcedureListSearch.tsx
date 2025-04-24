// src/pages/clinicalManagement/ProcedureList/SubPage/ProcedureListSearch.tsx
import React from "react";
import { MedicalEntitySearch } from "../../Components/MedicalEntitySearch/MedicalEntitySearch";
import { OTProcedureListDto } from "@/interfaces/ClinicalManagement/ProcedureListDto";

interface ProcedureSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: OTProcedureListDto) => void;
}

const ProcedureSearch: React.FC<ProcedureSearchProps> = ({ open, onClose, onSelect }) => {
  const columns = [
    { key: "procedureCode", header: "Procedure Code", visible: true, sortable: true },
    { key: "procedureName", header: "Procedure Name", visible: true, sortable: true },
    { key: "procedureNameLong", header: "Procedure Long Name", visible: true, sortable: true },
    { key: "procType", header: "Procedure Type", visible: true, sortable: true },
  ];

  // Custom filter function to search across multiple fields
  const customFilter = (item: OTProcedureListDto, searchValue: string) => {
    const searchLower = searchValue.toLowerCase();
    return (
      !!(item.procedureCode && item.procedureCode.toLowerCase().includes(searchLower)) ||
      !!(item.procedureName && item.procedureName.toLowerCase().includes(searchLower)) ||
      !!(item.procedureNameLong && item.procedureNameLong.toLowerCase().includes(searchLower))
    );
  };

  return (
    <MedicalEntitySearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="PROCEDURE LIST"
      entityName="ProcedureList"
      serviceUrl="clinicalManagementURL"
      columns={columns}
      getItemId={(item: OTProcedureListDto) => item.procedureID}
      searchPlaceholder="Enter Procedure code or name"
      isStatusVisible={true}
      isActionVisible={true}
      customFilter={customFilter}
    />
  );
};

export default React.memo(ProcedureSearch);
