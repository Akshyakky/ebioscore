// src/pages/clinicalManagement/MedicationDosage/SubPage/MedicationDosageSearch.tsx
import React from "react";
import { MedicalEntitySearch } from "../../Components/MedicalEntitySearch/MedicalEntitySearch";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";

interface MedicationDosageSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: MedicationDosageDto) => void;
}

const MedicationDosageSearch: React.FC<MedicationDosageSearchProps> = ({ open, onClose, onSelect }) => {
  const columns = [
    { key: "mDCode", header: "Medication Dosage Code", visible: true, sortable: true },
    { key: "mDSnomedCode", header: "Medication Dosage Snomed Code", visible: true, sortable: true },
    { key: "mDName", header: "Medication Dosage Name", visible: true, sortable: true },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      render: (row: MedicationDosageDto) => (row.modifyYN === "Y" ? "Yes" : "No"),
    },
    {
      key: "defaultYN",
      header: "Default",
      visible: true,
      render: (row: MedicationDosageDto) => (row.defaultYN === "Y" ? "Yes" : "No"),
    },
    { key: "rNotes", header: "Notes", visible: true },
  ];

  return (
    <MedicalEntitySearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION DOSAGE"
      entityName="MedicationDosage"
      serviceUrl="clinicalManagementURL"
      columns={columns}
      getItemId={(item: MedicationDosageDto) => item.mDId}
      searchPlaceholder="Enter medication dosage code or name"
      isStatusVisible={(item: MedicationDosageDto) => item.modifyYN === "Y"}
      isActionVisible={(item: MedicationDosageDto) => item.modifyYN === "Y"}
    />
  );
};

export default MedicationDosageSearch;
