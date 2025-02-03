import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { OTProcedureListDto } from "@/interfaces/ClinicalManagement/ProcedureListDto";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import React, { useCallback, useMemo } from "react";
interface ProcedureSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (diagnosis: OTProcedureListDto) => void;
}
const ProcedureSearch: React.FC<ProcedureSearchProps> = ({ open, onClose, onSelect }) => {
  const procedireService = useMemo(() => createEntityService<OTProcedureListDto>("ProcedureList", "clinicalManagementURL"), []);

  const fetchItems = useCallback(async () => {
    try {
      const result = await procedireService.getAll();
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Error fetching ICD details:", error);
      showAlert("Error", "Failed to fetch ICD details.", "error");
      return [];
    }
  }, [procedireService]);

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await procedireService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
        }
        return result;
      } catch (error) {
        console.error("Error updating ICD detail active status:", error);
        showAlert("Error", "Failed to update status.", "error");
        return false;
      }
    },
    [procedireService]
  );

  const getItemId = useCallback((item: OTProcedureListDto) => item.procedureID, []);
  const getItemActiveStatus = useCallback((item: OTProcedureListDto) => item.rActiveYN === "Y", []);

  const columns = useMemo(
    () => [
      { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
      { key: "procedureCode", header: "Procedure Code", visible: true },
      { key: "procedureName", header: "Procedure Name", visible: true },
      { key: "procedureNameLong", header: "Procedure Long Name", visible: true },
      { key: "procType", header: "Procedure Type", visible: true },
    ],
    []
  );

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="PROCEDURE LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter Procedure code or name"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default React.memo(ProcedureSearch);
