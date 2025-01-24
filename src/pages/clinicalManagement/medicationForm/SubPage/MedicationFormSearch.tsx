import React, { useMemo, useCallback } from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { MedicationFormDto } from "../../../../interfaces/ClinicalManagement/MedicationFormDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { showAlert } from "../../../../utils/Common/showAlert";
import CustomButton from "@/components/Button/CustomButton";
import DeleteIcon from "@mui/icons-material/Delete";

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

  const handleDelete = useCallback(
    async (row: MedicationFormDto) => {
      try {
        const updatedItem = { ...row, rActiveYN: "N" };
        const result = await medicationFormService.save(updatedItem);
        if (result) {
          showAlert("Success", `${row.mFName} deactivated successfully`, "success");
        } else {
          showAlert("Error", "Failed to deactivate medication form", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while deactivating the medication form", "error");
      }
    },
    [medicationFormService]
  );

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
    {
      key: "delete",
      header: "Delete",
      visible: true,
      render: (row: MedicationFormDto) => {
        if (row.modifyYN === "Y") {
          return <CustomButton onClick={() => handleDelete(row)} icon={DeleteIcon} text="Delete" variant="contained" color="error" size="small" />;
        }
        return null;
      },
    },
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
      isEditButtonVisible={true}
    />
  );
};

export default MedicationFormSearch;
