import React, { useContext, useCallback } from "react";
import { UserListData } from "../../../../interfaces/SecurityManagement/UserListData";
import { UserListSearchContext } from "../../../../context/SecurityManagement/UserListSearchContext";
import { UserListService } from "../../../../services/SecurityManagementServices/UserListService";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";

interface UserListSearchProps {
  show: boolean;
  handleClose: () => void;
  onEditProfile: (user: UserListData) => void;
}

const UserListSearch: React.FC<UserListSearchProps> = ({
  show,
  handleClose,
  onEditProfile,
}) => {
  const { fetchAllUsers } = useContext(UserListSearchContext);

  const updateActiveStatus = useCallback(async (appID: number, status: boolean) => {
    try {
      const result = await UserListService.updateUserActiveStatus(appID, status);
      return result.success;
    } catch (error) {
      console.error("Error updating user status:", error);
      return false;
    }
  }, []);

  const handleSelect = useCallback(async (user: UserListData) => {
    try {
      const userDetails = await UserListService.getUserDetails(user.appID);
      if (userDetails.success && userDetails.data) {
        onEditProfile(userDetails.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [onEditProfile]);

  const columns = [
    { key: "fullName", header: "User Name", visible: true },
    { key: "loginName", header: "Login Name", visible: true },
    { key: "rNotes", header: "Notes", visible: true },
    { key: "appID", header: "App ID", visible: false },
  ];

  return (
    <GenericAdvanceSearch<UserListData>
      open={show}
      onClose={handleClose}
      onSelect={handleSelect}
      title="USER SEARCH LIST"
      fetchItems={fetchAllUsers}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={(user) => user.appID}
      getItemActiveStatus={(user) => user.rActiveYN === "Y"}
      searchPlaceholder="Enter user name or login name"
      dialogProps={{
        maxWidth: "lg",
        fullWidth: true,
        dialogContentSx: { minHeight: "600px", maxHeight: "600px", overflowY: "auto" },
      }}
      isActionVisible={true}
      isStatusVisible={true}
    />
  );
};

export default UserListSearch;