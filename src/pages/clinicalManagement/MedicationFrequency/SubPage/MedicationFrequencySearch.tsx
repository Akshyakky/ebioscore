// src/pages/clinicalManagement/MedicationFrequency/SubPage/MedicationFrequencySearch.tsx
import React from "react";
import { MedicalEntitySearch } from "../../Components/MedicalEntitySearch/MedicalEntitySearch";
import { MedicationFrequencyDto } from "@/interfaces/ClinicalManagement/MedicationFrequencyDto";

interface MedicationFrequencySearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: MedicationFrequencyDto) => void;
}

const MedicationFrequencySearch: React.FC<MedicationFrequencySearchProps> = ({ open, onClose, onSelect }) => {
  const columns = [
    { key: "mFrqCode", header: "Medication Frequency Code", visible: true, sortable: true },
    { key: "mFrqSnomedCode", header: "Medication Frequency Snomed Code", visible: true, sortable: true },
    { key: "mFrqName", header: "Medication Frequency Name", visible: true, sortable: true },
    {
      key: "modifyYN",
      header: "Modifiable",
      visible: true,
      render: (row: MedicationFrequencyDto) => (row.modifyYN === "Y" ? "Yes" : "No"),
    },
    {
      key: "defaultYN",
      header: "Default",
      visible: true,
      render: (row: MedicationFrequencyDto) => (row.defaultYN === "Y" ? "Yes" : "No"),
    },
    { key: "rNotes", header: "Notes", visible: true },
  ];

  return (
    <MedicalEntitySearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION FREQUENCY"
      entityName="MedicationFrequency"
      serviceUrl="clinicalManagementURL"
      columns={columns}
      getItemId={(item: MedicationFrequencyDto) => item.mFrqId}
      searchPlaceholder="Enter medication frequency code or name"
      isStatusVisible={(item: MedicationFrequencyDto) => item.modifyYN === "Y"}
      isActionVisible={(item: MedicationFrequencyDto) => item.modifyYN === "Y"}
    />
  );
};

export default MedicationFrequencySearch;
