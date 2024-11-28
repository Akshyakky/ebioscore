import React from "react";
import { WardCategoryDto } from "../../../../interfaces/hospitalAdministration/WardCategoryDto";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { wardCategoryService } from "../../../../services/HospitalAdministrationServices/hospitalAdministrationService";

interface WardCategorySearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (wardCategory: WardCategoryDto) => void;
}

const WardCategorySearch: React.FC<WardCategorySearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = () => wardCategoryService.getAll().then((result) => result.data || []);

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await wardCategoryService.updateActiveStatus(id, status);
    return result;
  };

  const getItemId = (item: WardCategoryDto) => item.wCatID;
  const getItemActiveStatus = (item: WardCategoryDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl No", visible: true },
    { key: "wCatCode", header: "Ward Category Code", visible: true },
    { key: "wCatName", header: "Ward Category Name", visible: true },
    { key: "rNotes", header: "Remarks", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Ward Category List"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter Ward Category name or code"
      isStatusVisible={true}
      isActionVisible={true}
      isEditButtonVisible={true}
    />
  );
};

export default WardCategorySearch;
