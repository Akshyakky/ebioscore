import React, { useState, useContext } from "react";
import { Box, Container, Snackbar } from "@mui/material";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import SearchIcon from "@mui/icons-material/Search";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import { UserListSearchContext } from "../../../../context/SecurityManagement/UserListSearchContext";
import UserListSearch from "../../CommonPage/UserListSearch";
import UserDetails from "../SubPage/UserDetails";
import { UserListData } from "../../../../interfaces/SecurityManagement/UserListData";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import FormSaveClearButton from "../../../../components/Button/FormSaveClearButton";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";
import { UserListService } from "../../../../services/SecurityManagementServices/UserListService";
import OperationPermissionDetails from "../../ProfileListPage/SubPage/OperationPermissionDetails";
import { OperationPermissionDetailsDto } from "../../../../interfaces/SecurityManagement/OperationPermissionDetailsDto";
import { notifyError, notifySuccess } from "../../../../utils/Common/toastManager";

interface OperationPermissionProps {
  profileID: number;
  appUserName: string;
}

const UserListPage: React.FC<OperationPermissionProps> = ({
  profileID,
  appUserName,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListData | null>(null);
  const { fetchAllUsers, updateUserStatus } = useContext(UserListSearchContext);
  const { token, compID } = useSelector(
    (state: RootState) => state.userDetails
  );

  const handleEditUser = (user: UserListData) => {
    setSelectedUser(user);
    setIsSearchDialogOpen(false);
    setIsSaved(true);
  };

  const handleSave = async (user: UserListData) => {
    setIsSaved(true);
    setSelectedUser(user);
    try {
      // Example logging data
      console.log("User data saved:", user);
      notifySuccess("Profile saved successfully");
      // Clear fields after successful save
      handleClear();
    } catch (error) {
      console.error("Error logging data:", error);
      notifyError("Error saving profile");
    }
  };

  const handleSaveWithoutArgs = async () => {
    if (selectedUser) {
      try {
        await handleSave(selectedUser);
      } catch (error) {
        console.error("Error saving user data:", error);
        notifyError("Error saving profile");
      }
    }
  };

  const handleClear = () => {
    setIsSaved(false);
    setSelectedUser(null);
  };

  const refreshUsers = async () => {
    await fetchAllUsers();
  };

  const handleAdvancedSearch = () => {
    setIsSearchDialogOpen(true);
  };

  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false);
  };

  const saveUserPermission = async (permission: OperationPermissionDetailsDto) => {
    if (selectedUser && token) {
      try {
        const result = await UserListService.saveOrUpdateUserPermission(token, {
          auAccessID: permission.profDetID || 0,
          appID: selectedUser.appID,
          appUName: selectedUser.appUserName,
          aOPRID: permission.operationID, 
          allowYN: permission.allow ? "Y" : "N",
          rActiveYN: permission.allow ? "Y" : "N",
          rCreatedID: 0,
          rCreatedBy: "",
          rCreatedOn: new Date().toISOString(),
          rModifiedID: 0,
          rModifiedBy: "",
          rModifiedOn: new Date().toISOString(),
          rNotes: "",
          compID: compID || 0,
          compCode: "",
          compName: "",
          profileID: selectedUser.profileID || 0,
          repID: 0,
        });
  
        if (result.success) {
          const updatedPermission = {
            ...permission,
            profDetID: result.data?.auAccessID,
          };
          return updatedPermission;
        } else {
          console.error(
            `Error saving module permission ${permission.operationID}: ${result.errorMessage}`
          );
          notifyError(`Error saving module permission ${permission.operationID}`);
          return permission; // Return original permission on error
        }
      } catch (error) {
        console.error(
          `Error saving module permission ${permission.operationID}:`,
          error
        );
        notifyError(`Error saving module permission ${permission.operationID}`);
        return permission; // Return original permission on error
      }
    }
  };
  

  const saveUserReportPermission = async (
    permission: OperationPermissionDetailsDto
  ) => {
    if (selectedUser && token) {
      try {
        const result = await UserListService.saveOrUpdateUserReportPermission(
          token,
          {
            auAccessID: permission.auAccessID || 0,
            appID: permission.appID,
            appUName: permission.appUName,
            aOPRID: permission.aOPRID,
            allowYN: permission.allowYN,
            rActiveYN: permission.rActiveYN,
            rCreatedID: permission.rCreatedID,
            rCreatedBy: permission.rCreatedBy,
            rCreatedOn: permission.rCreatedOn,
            rModifiedID: permission.rModifiedID,
            rModifiedBy: permission.rModifiedBy,
            rModifiedOn: permission.rModifiedOn,
            rNotes: permission.rNotes,
            compID: permission.compID,
            compCode: permission.compCode,
            compName: permission.compName,
            profileID: permission.profileID,
            repID: permission.repID || 0,
          }
        );
  
        if (result.success) {
          const updatedPermission = {
            ...permission,
            repID: result.data?.repID,
          };
          return updatedPermission;
        } else {
          console.error(
            `Error saving report permission ${permission.repID}: ${result.errorMessage}`
          );
          notifyError(`Error saving report permission ${permission.repID}`);
          return permission; // Return original permission on error
        }
      } catch (error) {
        console.error(
          `Error saving report permission ${permission.repID}:`,
          error
        );
        notifyError(`Error saving report permission ${permission.repID}`);
        return permission; // Return original permission on error
      }
    } else {
      console.error("Selected user or token is missing.");
      notifyError("Unable to save report permission: Selected user or token is missing.");
      return permission; // Return original permission if selectedUser or token is missing
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
          isEditMode={!!selectedUser} // Set isEditMode to true if selectedUser exists
          refreshUsers={refreshUsers}
          updateUserStatus={updateUserStatus}
        />
        {isSaved && selectedUser && (
          <>
            <OperationPermissionDetails
              profileID={selectedUser.profileID!}
              profileName={selectedUser.appUserName}
              saveModulePermission={saveUserPermission}
              saveReportPermission={saveUserReportPermission}
            />
            <FormSaveClearButton
              saveIcon={SaveIcon}
              clearText="Clear"
              saveText="Save Report Permissions"
              clearIcon={DeleteIcon}
              onClear={handleClear}
              onSave={handleSaveWithoutArgs} // Use the wrapper function here
            />
          </>
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
