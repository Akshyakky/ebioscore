import React, { useMemo } from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { MedicationDosageDto } from "@/interfaces/ClinicalManagement/MedicationDosageDto";

interface MedicationDosageSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (MedicationDosage: MedicationDosageDto) => void;
}

const MedicationDosageSearch: React.FC<MedicationDosageSearchProps> = ({ open, onClose, onSelect }) => {
  const medicationDosageService = useMemo(() => createEntityService<MedicationDosageDto>("MedicationDosage", "clinicalManagementURL"), []);

  const fetchItems = async () => {
    try {
      const items = await medicationDosageService.getAll();
      return items.data || [];
    } catch (error) {
      console.error("Error fetching medication dosage:", error);
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      return await medicationDosageService.updateActiveStatus(id, status);
    } catch (error) {
      console.error("Error updating medication Dosage active status:", error);
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
    { key: "modifyYN", header: "Modify", visible: true },
    { key: "defaultYN", header: "Default", visible: true },
    { key: "rNotes", header: "Notes", visible: true },
  ];

  return (
    <GenericAdvanceSearch
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
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};
export default MedicationDosageSearch;
