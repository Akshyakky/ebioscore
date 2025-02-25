import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { investigationDto } from "@/interfaces/Laboratory/LInvMastDto";
import { investigationlistService } from "@/services/Laboratory/LaboratoryService";
import React from "react";

interface InvestigationListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (investigation: investigationDto) => void;
  onEdit?: (investigation: investigationDto) => void;
}

const InvestigationListSearch: React.FC<InvestigationListSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    const result = await investigationlistService.getAll();
    return result.success && result.data ? result.data : [];
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    try {
      const result = await investigationlistService.updateActiveStatus(id, status);

      if (result) {
        await fetchItems();
      }
      return result;
    } catch (error) {
      console.error("Error updating status:", error);
      return false;
    }
  };

  const columns = [
    { key: "invCode", header: "Investigation Code", visible: true, render: (item: investigationDto) => item.lInvMastDto?.invCode || "" },
    { key: "invName", header: "Name", visible: true, render: (item: investigationDto) => item.lInvMastDto?.invName || "" },
    { key: "invShortName", header: "Short Name", visible: true, render: (item: investigationDto) => item.lInvMastDto?.invShortName || "" },
    { key: "invType", header: "Type", visible: true, render: (item: investigationDto) => item.lInvMastDto?.invType || "" },
  ];

  return (
    <GenericAdvanceSearch<investigationDto>
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="INVESTIGATION SEARCH LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={(item) => item.lInvMastDto?.invID || 0}
      getItemActiveStatus={(item) => item.lInvMastDto?.rActiveYN === "Y"}
      searchPlaceholder="Search by Investigation Code, Name, Type, Department"
      isEditButtonVisible={true}
      isActionVisible={true}
      isStatusVisible={true}
    />
  );
};

export default InvestigationListSearch;
