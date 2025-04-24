// src/pages/clinicalManagement/MedicationGeneric/SubPage/MedicationGenericSearch.tsx
import React from "react";
import { MedicalEntitySearch } from "../../Components/MedicalEntitySearch/MedicalEntitySearch";
import { MedicationGenericDto } from "@/interfaces/ClinicalManagement/MedicationGenericDto";

interface MedicationGenericSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: MedicationGenericDto) => void;
}

const MedicationGenericSearch: React.FC<MedicationGenericSearchProps> = ({ open, onClose, onSelect }) => {
  const columns = [
    { key: "mGenCode", header: "Generic Code", visible: true, sortable: true },
    { key: "mGenName", header: "Generic Name", visible: true, sortable: true },
    { key: "mSnomedCode", header: "Snomed Code", visible: true, sortable: true },
    {
      key: "defaultYN",
      header: "Default",
      visible: true,
      render: (row: MedicationGenericDto) => (row.defaultYN === "Y" ? "Yes" : "No"),
    },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      render: (row: MedicationGenericDto) => (row.modifyYN === "Y" ? "Yes" : "No"),
    },
  ];

  return (
    <MedicalEntitySearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION GENERIC LIST"
      entityName="MedicationGeneric"
      serviceUrl="clinicalManagementURL"
      columns={columns}
      getItemId={(item: MedicationGenericDto) => item.mGenID}
      searchPlaceholder="Enter Medication Generic code or name"
      isStatusVisible={(item: MedicationGenericDto) => item.modifyYN === "Y"}
      isActionVisible={(item: MedicationGenericDto) => item.modifyYN === "Y"}
    />
  );
};

export default React.memo(MedicationGenericSearch);
