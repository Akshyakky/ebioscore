import CustomButton from "@/components/Button/CustomButton";
import GenericDialog from "@/components/GenericDialog/GenericDialog";
import { UserListSearchContext } from "@/context/SecurityManagement/UserListSearchContext";
import { DeptUserDto } from "@/interfaces/Billing/DeptUserDto";
import { UserListData } from "@/interfaces/SecurityManagement/UserListData";
import { DeptUserListService } from "@/services/BillingServices/DeptUserListService";

import { showAlert } from "@/utils/Common/showAlert";
import React, { useContext, useEffect, useState } from "react";
import DeptUsersList from "./DeptUsersList";
import DeptUsersListSearch from "./DeptUsersSearch";
import AddIcon from "@mui/icons-material/Add";

interface DeptUsersListPageProps {
  deptId: number;
  deptName: string;
  openDialog: boolean;
  handleCloseDialog: () => void;
}

export const DeptUsersPage: React.FC<DeptUsersListPageProps> = ({ deptId, deptName, openDialog, handleCloseDialog }) => {
  const [deptUsers, setDeptUsers] = useState<DeptUserDto[]>([]);
  const { fetchAllUsers } = useContext(UserListSearchContext);
  //
  const [isDUSearchOpen, setIsDUSearchOpen] = useState(false);

  const handleDeptUsersSearch = async () => {
    setIsDUSearchOpen(true);
    await fetchAllUsers();
  };

  const handleDeptUsersSearchClose = () => {
    setIsDUSearchOpen(false);
  };
  const handleUserSelect = (selectedUser: UserListData) => {
    const newDeptUser: DeptUserDto = {
      deptUserID: 0,
      deptID: deptId,
      appID: selectedUser.appID,
      appUserName: selectedUser.appUserName,
      appCode: selectedUser.appCode,
      rActiveYN: "Y",
      allowIMYN: "N",
      allowPMYN: "N",
      transferYN: "N",
      rNotes: "",
    };

    if (deptUsers.filter((deptUser) => deptUser.deptID == deptId && newDeptUser.appID === 50).length === 0) {
      setDeptUsers((prevUsers) => [...prevUsers, newDeptUser]);
      handleDeptUserSave(newDeptUser);
    } else {
      showAlert("User already exist", `${newDeptUser.appUserName} is already added`, "warning");
    }
  };
  const handleDeptUserSave = async (newDeptUserDto: DeptUserDto) => {
    try {
      const result = await DeptUserListService.saveDeptUser(newDeptUserDto);
      if (result.success) {
        showAlert("User Added", `${newDeptUserDto.appUserName} is accessible to ${deptName}`, "success");
      } else {
        showAlert("Error", result.errorMessage || "Failed to add user.", "error");
      }
    } catch (error) {
      showAlert("Error", "An unexpected error occurred while saving.", "error");
    } finally {
    }
  };
  //
  const updateDeptUserToggleStatus = async (deptUserID: number, activeStatus: boolean, fieldName: string) => {
    const result = await DeptUserListService.updateDeptUserToggleStatus(deptUserID, activeStatus, fieldName);
    return result.success;
  };
  useEffect(() => {
    if (deptId > 0) {
      DeptUserListService.getDeptUsersByDeptId(deptId)
        .then((result) => {
          const data = result.data;
          if (Array.isArray(data)) {
            setDeptUsers(data);
          } else if (data) {
            setDeptUsers([data]);
          } else {
            setDeptUsers([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching department users:", error);
          setDeptUsers([]);
        });
    }
  }, [deptId]);

  const handleSwitchChange = async (userId: number, field: string, value: boolean) => {
    setDeptUsers((prevUsers) => prevUsers.map((user) => (user.deptUserID === userId ? { ...user, [field]: value ? "Y" : "N" } : user)));
    try {
      const isActive = await updateDeptUserToggleStatus(userId, value, field);
      const fieldText =
        {
          rActiveYN: "Record status",
          allowIMYN: "Inventory",
          allowPMYN: "Pharmacy",
        }[field] || "Unknown field";

      if (isActive) {
        showAlert(value ? "Enabled" : "Disabled", fieldText, value ? "success" : "warning");
      } else {
        showAlert("Error", "Failed to change the status", "error");
      }
    } catch (error) {
      showAlert("Error", "An error occurred while changing the status", "error");
      console.error("Error toggling status:", error);
    }
  };

  return (
    <GenericDialog open={openDialog} onClose={handleCloseDialog} title={`Manage ${deptName} Department's User Access`} fullWidth maxWidth="lg">
      <CustomButton size="medium" onClick={handleDeptUsersSearch} icon={AddIcon} color="secondary" variant="contained" text="Add User" ariaLabel="Add User" />
      <DeptUsersList deptUsers={deptUsers} handleSwitchChange={handleSwitchChange} />
      <DeptUsersListSearch
        open={isDUSearchOpen}
        handleClose={handleDeptUsersSearchClose}
        onSelectUser={handleUserSelect} // Pass selected user back
      />
    </GenericDialog>
  );
};
