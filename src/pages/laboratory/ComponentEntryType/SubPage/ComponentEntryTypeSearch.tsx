import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { LComponentEntryTypeDto } from "@/interfaces/Laboratory/LInvMastDto";
import { componentEntryTypeService } from "@/services/Laboratory/LaboratoryService";
import React from "react";

interface ComponentEntryTypeSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (PIC: LComponentEntryTypeDto) => void;
}

const ComponentEntryTypeSearch: React.FC<ComponentEntryTypeSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    const result = await componentEntryTypeService.getAll();
    return result.success && result.data ? result.data : [];
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await componentEntryTypeService.updateActiveStatus(id, status);
    return result;
  };

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "lCentName", header: "CompCenter Name", visible: true },
    { key: "lCentDesc", header: "CompCenter Description", visible: true },
    { key: "lCentType", header: "Component Type", visible: true },
    { key: "langType", header: "Language", visible: true },
  ];

  const getItemId = (item: LComponentEntryTypeDto) => item.lCentID;
  const getItemActiveStatus = (item: LComponentEntryTypeDto) => item.rActiveYN === "Y";

  return (
    <GenericAdvanceSearch<LComponentEntryTypeDto>
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="COMPONENT ENTRYTYPE SEARCH LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter resource name or code"
      isEditButtonVisible={true}
      isActionVisible={true}
    />
  );
};

export default ComponentEntryTypeSearch;
