import React, { useCallback, useContext, useEffect, useState } from "react";
import Add from "@mui/icons-material/Add";
import { UserListData } from "@/interfaces/SecurityManagement/UserListData";
import { UserListSearchContext } from "@/context/SecurityManagement/UserListSearchContext";
import CustomButton from "@/components/Button/CustomButton";
import GenericAdvanceSearch from "@/components/GenericDialog/GenericAdvanceSearch";

interface DeptUsersSearchProps {
  open: boolean;
  handleClose: () => void;
  onSelectUser: (user: UserListData) => void;
}

const DeptUsersListSearch: React.FC<DeptUsersSearchProps> = ({ open, handleClose, onSelectUser }) => {
  const { fetchAllUsers } = useContext(UserListSearchContext);
  const [users, setUsers] = useState<UserListData[]>([]);

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
        // const userDetails = await UserListService.getUserDetails(user.appID);
        // if (userDetails.success && userDetails.data) {
        //   onSelectUser(userDetails.data);
        //   handleClose();
        // }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    },
    [onSelectUser]
  );

  const columns = [
    {
      key: "addDeptUser",
      header: "Department Access",
      visible: true,
      render: (row: any & { serialNumber: number; Status: string }) => <CustomButton text="Add User" onClick={() => handleSelect(row)} icon={Add} size="small" color="secondary" />,
    },
    { key: "fullName", header: "User Name", visible: true },
    { key: "loginName", header: "Login Name", visible: true },
    { key: "appID", header: "App ID", visible: false },
  ];

  return (
    <GenericAdvanceSearch<UserListData>
      open={open}
      onClose={handleClose}
      onSelect={handleSelect}
      title="Users Search List"
      fetchItems={() => Promise.resolve(users)}
      updateActiveStatus={() => Promise.resolve(true)}
      columns={columns}
      getItemId={(user) => user.appID}
      getItemActiveStatus={(user) => user.rActiveYN === "Y"}
      searchPlaceholder="Enter user name or login name"
      isEditButtonVisible={false}
      isStatusVisible={false}
      isActionVisible={false}
    />
  );
};

export default DeptUsersListSearch;
