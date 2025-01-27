import React from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { MedicationFormDto } from "../../../../interfaces/ClinicalManagement/MedicationFormDto";
import { medicationFormService } from "@/services/ClinicalManagementServices/clinicalManagementService";

interface MedicationFormSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (medicationForm: MedicationFormDto) => void;
}

const MedicationFormSearch: React.FC<MedicationFormSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    try {
      const items = await medicationFormService.getAll();
      return items.data || [];
    } catch (error) {
      console.error("Error fetching medication dosage:", error);
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
    { key: "mFSnomedCode", header: "Medication Form Snomed Code", visible: true },
    { key: "mFName", header: "Medication Form Name", visible: true },
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
    <GenericAdvanceSearch
      isEditButtonVisible={true}
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
      isStatusVisible={(item: MedicationFormDto) => item.modifyYN === "Y"}
      isActionVisible={(item: MedicationFormDto) => item.modifyYN === "Y"}
    />
  );
};

export default MedicationFormSearch;
