import React from "react";
import { DeptUserDto } from "../../../../../interfaces/Billing/DeptUserDto";
import { DeptUserListService } from "../../../../../services/BillingServices/DeptUserListService";
import { DepartmentListService } from "../../../../../services/BillingServices/DepartmentListService";
import GenericAdvanceSearch from "../../../../../components/GenericDialog/GenericAdvanceSearch";

interface DeptUsersListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (deptUserDto: DeptUserDto) => void;
}

const DeptUsersListSearch: React.FC<DeptUsersListSearchProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const fetchItems = () =>
    DeptUserListService.getDeptUsersByDeptId(1).then(
      (result) => result.data || []
    );

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await DepartmentListService.updateDepartmentActiveStatus(
      id,
      status
    );
    return result.success;
  };

  const getItemId = (item: DeptUserDto) => item.deptUserID;
  const getItemActiveStatus = (item: DeptUserDto) => item.rActiveYN === "Y";

  const columns = [
    { key: "serialNumber", header: "Sl No", visible: true },
    { key: "deptCode", header: "User Name", visible: true },
    { key: "deptName", header: "Category", visible: true },
  ];

  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="Users List"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter users names"
    />
  );
};

export default DeptUsersListSearch;
