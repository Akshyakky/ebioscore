import React from "react";
import { InsuranceListDto } from "@/interfaces/HospitalAdministration/InsuranceListDto";
import { insuranceListService } from "@/services/HospitalAdministrationServices/hospitalAdministrationService";
import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";

interface InsuranceListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (insuranceListDto: InsuranceListDto) => void;
}

const InsuranceListSearch: React.FC<InsuranceListSearchProps> = ({ open, onClose, onSelect }) => {
  const fetchItems = () => insuranceListService.getAll().then((result) => result.data || []);
  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await insuranceListService.updateActiveStatus(id, status);
    return result;
  };

  const getItemId = (item: InsuranceListDto) => item.insurID;
  const getItemActiveStatus = (item: InsuranceListDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl No", visible: true },
    { key: "insurName", header: "Insurance Name", visible: true },
    { key: "insurCode", header: "Insurance Code", visible: true },
    { key: "insurID", header: "Insurance ID", visible: true },
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
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default InsuranceListSearch;
