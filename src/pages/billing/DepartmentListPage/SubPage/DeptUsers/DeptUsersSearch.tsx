import React, { useEffect, useState, useContext, useCallback } from "react";
import { UserListData } from "../../../../../interfaces/SecurityManagement/UserListData";
import { UserListSearchContext } from "../../../../../context/SecurityManagement/UserListSearchContext";
import GenericAdvanceSearch from "../../../../../components/GenericDialog/GenericAdvanceSearch";
import { UserListService } from "../../../../../services/SecurityManagementServices/UserListService";
import CustomButton from "../../../../../components/Button/CustomButton";
import Add from "@mui/icons-material/Add";

interface DeptUsersSearchProps {
  open: boolean;
  handleClose: () => void;
  onSelectUser: (user: UserListData) => void; // Pass selected user to parent
}

const DeptUsersListSearch: React.FC<DeptUsersSearchProps> = ({
  open,
  handleClose,
  onSelectUser,
}) => {
  const { fetchAllUsers } = useContext(UserListSearchContext);
  const [users, setUsers] = useState<UserListData[]>([]);

  // Fetch users when the search dialog is opened
  useEffect(() => {
    if (open) {
      fetchAllUsers()
        .then((fetchedUsers) => {
          setUsers(fetchedUsers);
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
        });
    }
  }, [open, fetchAllUsers]);

  const handleSelect = useCallback(
    async (user: UserListData) => {
      try {
        const userDetails = await UserListService.getUserDetails(user.appID);
        if (userDetails.success && userDetails.data) {
          onSelectUser(userDetails.data);
          handleClose();
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    },
    [onSelectUser]
  );

  const columns = [
    { key: "fullName", header: "User Name", visible: true },
    { key: "loginName", header: "Login Name", visible: true },
    { key: "appID", header: "App ID", visible: false },
    {
      key: "addDeptUser",
      header: "Department Access",
      visible: true,
      render: (row: any & { serialNumber: number; Status: string }) => (
        <CustomButton
          text="Add User"
          onClick={() => handleSelect(row)}
          icon={Add}
          size="small"
          color="secondary"
        />
      ),
    },
  ];

  return (
    <GenericAdvanceSearch<UserListData>
      open={open}
      onClose={handleClose}
      onSelect={handleSelect}
      title="Users Search List"
      fetchItems={() => Promise.resolve(users)} // Use the fetched users
      updateActiveStatus={() => Promise.resolve(true)} // Can be implemented as needed
      columns={columns}
      getItemId={(user) => user.appID}
      getItemActiveStatus={(user) => user.rActiveYN === "Y"}
      searchPlaceholder="Enter user name or login name"
    />
  );
};

export default DeptUsersListSearch;
