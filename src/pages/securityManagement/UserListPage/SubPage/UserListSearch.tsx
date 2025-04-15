import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";
import { UserListDto } from "@/interfaces/SecurityManagement/UserListData";
import { userListServices } from "@/services/SecurityManagementServices/UserListServices";
import { createEntityService } from "@/utils/Common/serviceFactory";
import { showAlert } from "@/utils/Common/showAlert";
import React, { useCallback, useMemo } from "react";

interface UserListSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (userListDto: UserListDto) => void;
}
const UserListSearch: React.FC<UserListSearchProps> = ({ open, onClose, onSelect }) => {
  const userListService = useMemo(() => createEntityService<UserListDto>("AppUser", "securityManagementURL"), []);
  const fetchItems = useCallback(async () => {
    try {
      const result: any = await userListServices.getAllAppUsers();
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Error fetching User:", error);
      showAlert("Error", "Failed to User.", "error");
      return [];
    }
  }, [userListService]);

  const updateActiveStatus = useCallback(
    async (id: number, status: boolean) => {
      try {
        const result = await userListService.updateActiveStatus(id, status);
        if (result) {
          showAlert("Success", "Status updated successfully.", "success");
        }
        return result;
      } catch (error) {
        console.error("Error updating User active status:", error);
        showAlert("Error", "Failed to update user status.", "error");
        return false;
      }
    },
    [userListService]
  );

  const getItemId = (item: UserListDto) => item.appID;
  const getItemActiveStatus = (item: UserListDto) => item.rActiveYN === "Y";
  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true, sortable: true },
    { key: "appCode", header: "Username", visible: true },
    { key: "appUcatType", header: "Category Type", visible: true },
  ];
  return (
    <GenericAdvanceSearch
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      title="USERS LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={getItemId}
      getItemActiveStatus={getItemActiveStatus}
      searchPlaceholder="Enter Username"
      isActionVisible={true}
      isEditButtonVisible={true}
      isStatusVisible={true}
    />
  );
};

export default UserListSearch;
