import React from "react";
import { DepartmentDto } from "../../../../interfaces/Billing/DepartmentDto";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { departmentService } from "../../../../services/CommonServices/CommonModelServices";

interface DepartmentListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (departmentDto: DepartmentDto) => void;
}

const DepartmentListSearch: React.FC<DepartmentListSearchProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const fetchItems = () =>
    departmentService.getAll().then(
      (result) => result.data || []
    );

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await departmentService.updateActiveStatus(
      id,
      status
    );
    return result;
  };

  const getItemId = (item: DepartmentDto) => item.deptID;
  const getItemActiveStatus = (item: DepartmentDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl No", visible: true, sortable: true },
    { key: "deptCode", header: "Department Code", visible: true },
    { key: "deptName", header: "Department Name", visible: true },
    { key: "deptType", header: "Department Type", visible: true },
    { key: "rNotes", header: "Remarks", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="DEPARTMENT LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter department name or code"
      isActionVisible={true}
      isStatusVisible={true}
    />
  );
};

export default DepartmentListSearch;
