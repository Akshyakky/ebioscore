import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";
import { medicationDosageService } from "@/services/ClinicalManagementServices/clinicalManagementService";
import React from "react";

interface MedicationDosageSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (MedicationDosage: MedicationDosageDto) => void;
}

const MedicationDosageSearch: React.FC<MedicationDosageSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    try {
      const items = await medicationDosageService.getAll();
      return items.data || [];
    } catch (error) {
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      return await medicationDosageService.updateActiveStatus(id, status);
    } catch (error) {
      return false;
    }
  };

  const getItemId = (item: MedicationDosageDto) => item.mDId;
  const getItemActiveStatus = (item: MedicationDosageDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "mDCode", header: "Medication Dosage Code", visible: true },
    { key: "mDSnomedCode", header: "Medication Dosage Snomed Code", visible: true },
    { key: "mDName", header: "Medication Dosage Name", visible: true },
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
    <GenericAdvanceSearch
      isEditButtonVisible={true}
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION DOSAGE"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter medication Dosage code or text"
      isStatusVisible={(item: MedicationDosageDto) => item.modifyYN === "Y"}
      isActionVisible={(item: MedicationDosageDto) => item.modifyYN === "Y"}
    />
  );
};
export default MedicationDosageSearch;
