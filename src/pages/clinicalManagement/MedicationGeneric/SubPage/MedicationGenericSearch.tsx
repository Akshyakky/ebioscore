import React, { useCallback, useMemo } from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { MedicationGenericDto } from "../../../../interfaces/ClinicalManagement/MedicationGenericDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { showAlert } from "../../../../utils/Common/showAlert";
import CustomButton from "@/components/Button/CustomButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface MedicationGemericSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (diagnosis: MedicationGenericDto) => void;
}

const MedicationGenricSearch: React.FC<MedicationGemericSearchProps> = ({ open, onClose, onSelect }) => {
  const MedicationGenericService = useMemo(() => createEntityService<MedicationGenericDto>("MedicationGeneric", "clinicalManagementURL"), []);

  const fetchItems = useCallback(async () => {
    try {
      const result = await MedicationGenericService.getAll();
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Error fetching Medication generic list", error);
      showAlert("Error", "Failed to fetch Medication generic list.", "error");
      return [];
    }
  }, [MedicationGenericService]);

  const handleDelete = useCallback(
    async (row: MedicationGenericDto) => {
      try {
        const updatedItem = { ...row, rActiveYN: "N" };
        const result = await MedicationGenericService.save(updatedItem);
        if (result) {
          showAlert("Success", `${row.mGenName} deactivated successfully`, "success");
          fetchItems();
        } else {
          showAlert("Error", "Failed to deactivate Medication Generic", "error");
        }
      } catch (error) {
        showAlert("Error", "An error occurred while deactivating the Medication Generic", "error");
      }
    },
    [MedicationGenericService, fetchItems]
  );

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await MedicationGenericService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
          fetchItems();
        }
        return result;
      } catch (error) {
        console.error("Error updating Medication generic active status:", error);
        showAlert("Error", "Failed to update status.", "error");
        return false;
      }
    },
    [MedicationGenericService, fetchItems]
  );

  const getItemId = useCallback((item: MedicationGenericDto) => item.mGenID, []);
  const getItemActiveStatus = useCallback((item: MedicationGenericDto) => item.rActiveYN === "Y", []);

  const columns = useMemo(
    () => [
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
      {
        key: "delete",
        header: "Delete",
        visible: true,
        render: (row: MedicationGenericDto) => {
          if (row.modifyYN === "Y") {
            return <CustomButton onClick={() => handleDelete(row)} icon={DeleteIcon} text="Delete" variant="contained" color="error" size="small" />;
          }
          return null;
        },
      },
    ],
    [handleDelete]
  );

  return (
    <GenericAdvanceSearch
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
      isEditButtonVisible={true}
    />
  );
};

export default React.memo(MedicationGenricSearch);
