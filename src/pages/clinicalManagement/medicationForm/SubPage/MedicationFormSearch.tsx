import React, { useMemo } from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { MedicationFormDto } from "../../../../interfaces/ClinicalManagement/MedicationFormDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";

interface MedicationFormSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (medicationForm: MedicationFormDto) => void;
}

const MedicationFormSearch: React.FC<MedicationFormSearchProps> = ({ open, onClose, onSelect }) => {
  const medicationFormService = useMemo(() => createEntityService<MedicationFormDto>("MedicationForm", "clinicalManagementURL"), []);

  const fetchItems = async () => {
    try {
      const items = await medicationFormService.getAll();
      return items.data || [];
    } catch (error) {
      console.error("Error fetching medication forms:", error);
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      return await medicationFormService.updateActiveStatus(id, status);
    } catch (error) {
      console.error("Error updating medication form active status:", error);
      return false;
    }
  };

  const getItemId = (item: MedicationFormDto) => item.mFID;
  const getItemActiveStatus = (item: MedicationFormDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "mFCode", header: "Medication Form Code", visible: true },
    { key: "mFName", header: "Medication Form Name", visible: true },
    { key: "modifyYN", header: "Modify", visible: true },
    { key: "defaultYN", header: "Default", visible: true },
    { key: "rNotes", header: "Notes", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="MEDICATION FORM"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter medication form code or text"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default MedicationFormSearch;
