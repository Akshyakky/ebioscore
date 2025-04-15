// src/pages/inventoryManagement/MedicationListPage/SubPage/MedicationListSearch.tsx
import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { MedicationListDto } from "@/interfaces/ClinicalManagement/MedicationListDto";
import { createEntityService } from "@/utils/Common/serviceFactory";
import React, { useMemo } from "react";

interface MedicationListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (medicationList: MedicationListDto) => void;
}

const MedicationListSearch: React.FC<MedicationListSearchProps> = ({ open, onClose, onSelect }) => {
  const medicationListService = useMemo(() => createEntityService<MedicationListDto>("MedicationList", "clinicalManagementURL"), []);
  const fetchItems = async () => {
    try {
      const items = await medicationListService.getAll();
      return items.data || [];
    } catch (error) {
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      return await medicationListService.updateActiveStatus(id, status);
    } catch (error) {
      console.error("Error updating medication list active status:", error);
      return false;
    }
  };

  const getItemId = (item: MedicationListDto) => item.mlID;
  const getItemActiveStatus = (item: MedicationListDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "mlCode", header: "Medication Code", visible: true },
    { key: "medText", header: "Medication Text", visible: true },
    { key: "mfName", header: "Medication Form", visible: true },
    { key: "mGenName", header: "Generic Name", visible: true },
    { key: "calcQtyYN", header: "Calculate Quantity", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter medication code or text"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default MedicationListSearch;
