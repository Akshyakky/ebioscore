// src/pages/clinicalManagement/DiagnosisList/SubPage/DiagnosisSearch.tsx
import React from "react";
import { IcdDetailDto } from "@/interfaces/ClinicalManagement/IcdDetailDto";
import MedicalEntitySearch from "../../Components/MedicalEntitySearch/MedicalEntitySearch";

interface DiagnosisSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (diagnosis: IcdDetailDto) => void;
}

const DiagnosisSearch: React.FC<DiagnosisSearchProps> = ({ open, onClose, onSelect }) => {
  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "icddCode", header: "ICD Code", visible: true },
    { key: "icddName", header: "ICD Name", visible: true },
    { key: "icddVer", header: "Version", visible: true },
    { key: "icddNameGreek", header: "Greek Name", visible: true },
  ];

  return (
    <MedicalEntitySearch<IcdDetailDto>
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="ICD DETAIL LIST"
      entityName="IcdDetail"
      serviceUrl="clinicalManagementURL"
      columns={columns}
      getItemId={(item) => item.icddId}
      searchPlaceholder="Enter ICD code or name"
    />
  );
};

export default React.memo(DiagnosisSearch);
