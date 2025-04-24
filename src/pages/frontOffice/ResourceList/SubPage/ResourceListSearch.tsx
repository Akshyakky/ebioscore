import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { ResourceListData } from "@/interfaces/FrontOffice/ResourceListData";
import { resourceListService } from "@/services/FrontOfficeServices/FrontOfiiceApiServices";
import React from "react";

interface ResourceListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (PIC: ResourceListData) => void;
}

const ResourceListSearch: React.FC<ResourceListSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    const result = await resourceListService.getAll();
    return result.success && result.data ? result.data : [];
  };

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await resourceListService.updateActiveStatus(id, status);
    return result;
  };

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "rLCode", header: "Resource Code", visible: true },
    { key: "rLName", header: "Resource Name", visible: true },
    { key: "rLOtYN", header: "Is Operation Theatre", visible: true },
    { key: "rLValidateYN", header: "Is Validate", visible: true },
  ];

  return (
    <GenericAdvanceSearch<ResourceListData>
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="RESOURCE SEARCH LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={(item) => item.rLID}
      getItemActiveStatus={(item) => item.rActiveYN === "Y"}
      searchPlaceholder="Enter resource name or code"
      isEditButtonVisible={true}
      isActionVisible={true}
    />
  );
};

export default ResourceListSearch;
