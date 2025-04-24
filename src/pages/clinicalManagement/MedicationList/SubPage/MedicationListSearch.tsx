// src/pages/clinicalManagement/MedicationList/SubPage/MedicationListSearch.tsx
import React from "react";
import { MedicalEntitySearch } from "../../Components/MedicalEntitySearch/MedicalEntitySearch";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";

interface MedicationListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: MedicationListDto) => void;
}

const MedicationListSearch: React.FC<MedicationListSearchProps> = ({ open, onClose, onSelect }) => {
  const columns = [
    { key: "mlCode", header: "Medication Code", visible: true, sortable: true },
    { key: "medText", header: "Medication Text", visible: true, sortable: true },
    { key: "mfName", header: "Medication Form", visible: true, sortable: true },
    { key: "mGenName", header: "Generic Name", visible: true, sortable: true },
    {
      key: "calcQtyYN",
      header: "Calculate Quantity",
      visible: true,
      render: (row: MedicationListDto) => (row.calcQtyYN === "Y" ? "Yes" : "No"),
    },
  ];

  // Custom filter function to search across multiple fields
  const customFilter = (item: MedicationListDto, searchValue: string) => {
    const searchLower = searchValue.toLowerCase();
    return !!(
      (item.mlCode && item.mlCode.toLowerCase().includes(searchLower)) ||
      (item.medText && item.medText.toLowerCase().includes(searchLower)) ||
      (item.mfName && item.mfName.toLowerCase().includes(searchLower)) ||
      (item.mGenName && item.mGenName.toLowerCase().includes(searchLower))
    );
  };

  return (
    <MedicalEntitySearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION LIST"
      entityName="MedicationList"
      serviceUrl="clinicalManagementURL"
      columns={columns}
      getItemId={(item: MedicationListDto) => item.mlID}
      searchPlaceholder="Enter medication code or text"
      isStatusVisible={true}
      isActionVisible={true}
      // customFilter={customFilter}
    />
  );
};

export default MedicationListSearch;
