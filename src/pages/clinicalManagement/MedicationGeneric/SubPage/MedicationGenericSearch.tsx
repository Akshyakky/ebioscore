import React from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { MedicationGenericDto } from "../../../../interfaces/ClinicalManagement/MedicationGenericDto";
import { medicationGenericService } from "@/services/ClinicalManagementServices/clinicalManagementService";

interface MedicationGemericSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (diagnosis: MedicationGenericDto) => void;
}

const MedicationGenricSearch: React.FC<MedicationGemericSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    try {
      const items = await medicationGenericService.getAll();
      return items.data || [];
    } catch (error) {
      console.error("Error fetching medication dosage:", error);
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      return await medicationGenericService.updateActiveStatus(id, status);
    } catch (error) {
      console.error("Error updating medication form active status:", error);
      return false;
    }
  };

  const getItemId = (item: MedicationGenericDto) => item.mGenID;

  const getItemActiveStatus = (item: MedicationGenericDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "mGenCode", header: "Generic Code", visible: true },
    { key: "mGenName", header: "Generic Name", visible: true },
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
    <GenericAdvanceSearch
      isEditButtonVisible={true}
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION GENERIC LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter Medication Generic code or name"
      isStatusVisible={(item: MedicationGenericDto) => item.modifyYN === "Y"}
      isActionVisible={(item: MedicationGenericDto) => item.modifyYN === "Y"}
    />
  );
};

export default React.memo(MedicationGenricSearch);
