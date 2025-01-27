import React, { useCallback, useMemo } from "react";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { MedicationGenericDto } from "../../../../interfaces/ClinicalManagement/MedicationGenericDto";
import { createEntityService } from "../../../../utils/Common/serviceFactory";
import { showAlert } from "../../../../utils/Common/showAlert";
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

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await MedicationGenericService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
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
      { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
      { key: "mGenCode", header: "Generic Code", visible: true },
      { key: "mGenName", header: "Generic Name", visible: true },
      { key: "defaultYN", header: "Default", visible: true },
    ],
    []
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
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default React.memo(MedicationGenricSearch);
