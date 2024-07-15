import React, { useState, useContext } from "react";
import { Box, Container } from "@mui/material";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import SearchIcon from "@mui/icons-material/Search";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import { UserListSearchContext } from "../../../../context/SecurityManagement/UserListSearchContext";
import UserListSearch from "../../CommonPage/UserListSearch";
import UserDetails from "../SubPage/UserDetails";
import { UserListData } from "../../../../interfaces/SecurityManagement/UserListData";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";
import { UserListService } from "../../../../services/SecurityManagementServices/UserListService";
import OperationPermissionDetails from "../../ProfileListPage/SubPage/OperationPermissionDetails";
import { OperationPermissionDetailsDto } from "../../../../interfaces/SecurityManagement/OperationPermissionDetailsDto";
import { notifyError } from "../../../../utils/Common/toastManager";

interface OperationPermissionProps {
  profileID: number;
  appUserName: string;
}

const UserListPage: React.FC<OperationPermissionProps> = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListData | null>(null);
  const { fetchAllUsers, updateUserStatus } = useContext(UserListSearchContext);
  const { token, compID } = useSelector(
    (state: RootState) => state.userDetails
  );

  const handleEditUser = (user: UserListData) => {
    setSelectedUser(user);
    setIsSaved(true); // Assuming you want to trigger saving on edit
    handleCloseSearchDialog();
  };

  const handleSave = async (profile: UserListData) => {
    setIsSaved(true);
    setSelectedUser(profile);
  };

  const handleClear = () => {
    setIsSaved(false);
    setSelectedUser(null);
  };

  const refreshUsers = async () => {
    await fetchAllUsers();
  };

  const handleAdvancedSearch = async () => {
    setIsSearchDialogOpen(true);
    await fetchAllUsers();
  };

  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false);
  };


  const saveUserPermission = async (permission: OperationPermissionDetailsDto): Promise<void> => {
    if (selectedUser && token) {
      try {
        const result = await UserListService.saveOrUpdateUserPermission(token, {
          auAccessID: permission.auAccessID || 0, // Ensure this is correctly set
          appID: selectedUser.appID,
          appUName: selectedUser.appUserName,
          aOPRID: permission.aOPRID || 0, // Ensure it's a number if it's an ID
          allowYN: permission.allowYN, // Ensure it's a boolean if it represents permission
          rActiveYN: permission.rActiveYN, // Ensure it's a boolean
          rCreatedID: permission.rCreatedID || 0,
          rCreatedBy: permission.rCreatedBy || "",
          rCreatedOn: permission.rCreatedOn || new Date().toISOString(),
          rModifiedID: permission.rModifiedID || 0,
          rModifiedBy: permission.rModifiedBy || "",
          rModifiedOn: permission.rModifiedOn || new Date().toISOString(),
          rNotes: permission.rNotes || "",
          compID: compID || 0,
          compCode: permission.compCode || "",
          compName: permission.compName || "",
          profileID: selectedUser.profileID || 0,
          repID: permission.repID || 0,
        });
  
        if (result.success) {
          // Handle success case if needed
        } else {
          console.error(
            `Error saving module permission ${permission.aOPRID}: ${result.errorMessage}`
          );
          notifyError(`Error saving module permission ${permission.aOPRID}`);
        }
      } catch (error) {
        console.error(
          `Error saving module permission ${permission.aOPRID}:`,
          error
        );
        notifyError(`Error saving module permission ${permission.aOPRID}`);
      }
    } else {
      console.error("Selected user or token is missing.");
      notifyError(
        "Unable to save module permission: Selected user or token is missing."
      );
    }
  };
  
  const saveUserReportPermission = async (permission: OperationPermissionDetailsDto): Promise<void> => {
    if (selectedUser && token) {
      try {
        const result = await UserListService.saveOrUpdateUserReportPermission(token, {
          auAccessID: permission.auAccessID || 0, // Ensure this is correctly set
          appID: selectedUser.appID,
          appUName: selectedUser.appUserName,
          aOPRID: permission.aOPRID || 0, // Ensure it's a number if it's an ID
          allowYN: permission.allowYN , // Ensure it's a boolean if it represents permission
          rActiveYN: permission.rActiveYN , // Ensure it's a boolean
          rCreatedID: permission.rCreatedID || 0,
          rCreatedBy: permission.rCreatedBy || "",
          rCreatedOn: permission.rCreatedOn || new Date().toISOString(),
          rModifiedID: permission.rModifiedID || 0,
          rModifiedBy: permission.rModifiedBy || "",
          rModifiedOn: permission.rModifiedOn || new Date().toISOString(),
          rNotes: permission.rNotes || "",
          compID: compID || 0,
          compCode: permission.compCode || "",
          compName: permission.compName || "",
          profileID: selectedUser.profileID || 0,
          repID: permission.repID || 0,
        });
  
        if (result.success) {
          // Handle success case if needed
        } else {
          console.error(
            `Error saving report permission ${permission.repID}: ${result.errorMessage}`
          );
          notifyError(`Error saving report permission ${permission.repID}`);
        }
      } catch (error) {
        console.error(
          `Error saving report permission ${permission.repID}:`,
          error
        );
        notifyError(`Error saving report permission ${permission.repID}`);
      }
    } else {
      console.error("Selected user or token is missing.");
      notifyError(
        "Unable to save report permission: Selected user or token is missing."
      );
    }
  };
  return (
    <MainLayout>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup
            buttons={[
              {
                variant: "contained",
                size: "medium",
                icon: SearchIcon,
                text: "Advanced Search",
                onClick: handleAdvancedSearch,
              },
            ]}
          />
        </Box>
        <UserDetails
          onSave={handleSave}
          onClear={handleClear}
          user={selectedUser}
          isEditMode={!!selectedUser} // Adjust as per your logic
          refreshUsers={refreshUsers}
          updateUserStatus={updateUserStatus}
        />
        {isSaved && selectedUser && (
          <OperationPermissionDetails
            profileID={selectedUser.profileID || 0} // Ensure it's correctly mapped
            profileName={selectedUser.appUserName}
            saveModulePermission={saveUserPermission}
            saveReportPermission={saveUserReportPermission}
          />
        )}
        <UserListSearch
          show={isSearchDialogOpen}
          handleClose={handleCloseSearchDialog}
          onEditProfile={handleEditUser}
        />
      </Container>
    </MainLayout>
  );
};

export default UserListPage;
