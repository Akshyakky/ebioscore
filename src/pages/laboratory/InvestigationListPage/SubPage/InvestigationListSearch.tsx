import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { investigationDto } from "@/interfaces/Laboratory/LInvMastDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import { useAlert } from "@/providers/AlertProvider";
import React, { useCallback } from "react";

interface InvestigationListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (investigation: investigationDto) => void;
  // onEdit?: (investigation: investigationDto) => void;
}

const InvestigationListSearch: React.FC<InvestigationListSearchProps> = ({ open, onClose, onSelect }) => {
  const { showAlert } = useAlert();
  const fetchItems = useCallback(async () => {
    try {
      const result: any = await investigationlistService.getAll();
      if (result.success && result.data) {
        const invListDatas: any = result.data.map((item: investigationDto) => item.lInvMastDto);
        return invListDatas;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error fetching User:", error);
      showAlert("Error", "Failed to User.", "error");
      return [];
    }
  }, [investigationlistService]);

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await investigationlistService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
        }
        return result.success;
      } catch (error) {
        console.error("Error updating User active status:", error);
        showAlert("Error", "Failed to update user status.", "error");
        return false;
      }
    },
    [investigationlistService]
  );

  const getItemId = (item: any) => item.invID;
  const getItemActiveStatus = (item: any) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "invCode", header: "Investigation Code", visible: true },
    { key: "invName", header: "Investigation Name", visible: true },
    { key: "invShortName", header: "Investigation SName", visible: true },
    { key: "invType", header: "Investigation Type", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="INVESTIGATION SEARCH LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Search by Investigation Code, Name, Type, Department"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default InvestigationListSearch;
