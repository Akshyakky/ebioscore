import React from "react";
import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { AppModifiedMast } from "@/interfaces/HospitalAdministration/AppModifiedListDto";
import { appModifiedMastService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";

interface AppModifiedMastSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (category: AppModifiedMast) => void;
}

const AppModifiedMastSearch: React.FC<AppModifiedMastSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = async () => {
    try {
      const items = await appModifiedMastService.getAll();
      return items.data || [];
    } catch (error) {
      return [];
    }
  };

  const updateActiveStatus = async (id: number, status: boolean): Promise<boolean> => {
    const result = await appModifiedMastService.updateActiveStatus(id, status);
    return result.success;
  };

  const getItemId = (item: AppModifiedMast) => item.fieldID;
  const getItemActiveStatus = (item: AppModifiedMast) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "fieldCode", header: "Field Code", visible: true },
    { key: "fieldName", header: "Field Name", visible: true },
    { key: "compName", header: "Company Name", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      isEditButtonVisible={true}
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Modified Categories"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter field code or name"
    />
  );
};

export default AppModifiedMastSearch;
