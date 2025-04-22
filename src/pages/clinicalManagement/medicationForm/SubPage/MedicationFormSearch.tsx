// src/pages/clinicalManagement/medicationForm/SubPage/MedicationFormSearch.tsx
import React from "react";
import { MedicalEntitySearch } from "../../Components/MedicalEntitySearch/MedicalEntitySearch";
import { MedicationFormDto } from "@/interfaces/ClinicalManagement/MedicationFormDto";

interface MedicationFormSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: MedicationFormDto) => void;
}

const MedicationFormSearch: React.FC<MedicationFormSearchProps> = ({ open, onClose, onSelect }) => {
  const columns = [
    { key: "mFCode", header: "Medication Form Code", visible: true, sortable: true },
    { key: "mFSnomedCode", header: "Medication Form Snomed Code", visible: true, sortable: true },
    { key: "mFName", header: "Medication Form Name", visible: true, sortable: true },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      render: (row: MedicationFormDto) => (row.modifyYN === "Y" ? "Yes" : "No"),
    },
    {
      key: "defaultYN",
      header: "Default",
      visible: true,
      render: (row: MedicationFormDto) => (row.defaultYN === "Y" ? "Yes" : "No"),
    },
    { key: "rNotes", header: "Notes", visible: true },
  ];

  return (
    <MedicalEntitySearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION FORM"
      entityName="MedicationForm"
      serviceUrl="clinicalManagementURL"
      columns={columns}
      getItemId={(item: MedicationFormDto) => item.mFID}
      searchPlaceholder="Enter medication form code or name"
      isStatusVisible={(item: MedicationFormDto) => item.modifyYN === "Y"}
      isActionVisible={(item: MedicationFormDto) => item.modifyYN === "Y"}
    />
  );
};

export default MedicationFormSearch;
