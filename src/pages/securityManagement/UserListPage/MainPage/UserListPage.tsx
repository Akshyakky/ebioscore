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
import { notifyError, } from "../../../../utils/Common/toastManager";
import axios from "axios";

interface OperationPermissionProps {
  profileID: number;
  appUserName: string;
}

const UserListPage: React.FC<OperationPermissionProps> = ({
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
    handleCloseSearchDialog();
    setIsSaved(false); 
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
          allowYN: permission.allowYN, 
          rActiveYN: permission.rActiveYN, 
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
          return permission; 
        }
      } catch (error) {
        console.error(
          `Error saving module permission ${permission.operationID}:`,
          error
        );
        notifyError(`Error saving module permission ${permission.operationID}`);
        return permission;
      }
    }
  };

  const saveUserReportPermission = async (permission: OperationPermissionDetailsDto) => {
    if (selectedUser && token) {
      try {
        const result = await UserListService.saveOrUpdateUserReportPermission(
          token,
          {
            auAccessID: permission.profDetID || 0,
            appID: selectedUser.appID,
            appUName: selectedUser.appUserName,
            aOPRID: permission.operationID, 
            allowYN: permission.allowYN, 
            rActiveYN: permission.rActiveYN, 
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
            repID: permission.repID,
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
          return permission;
        }
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error("Server responded with status:", error.response.status);
            console.error("Response data:", error.response.data);
            notifyError(`Server responded with status: ${error.response.status}`);
          } else if (error.request) {
            console.error("No response received:", error.request);
            notifyError("No response received from server");
          } else {
            console.error("Error setting up request:", error.message);
            notifyError("Error setting up request to server");
          }
        } else {
          console.error("Other error occurred:", error.message);
          notifyError("Unknown error occurred");
        }
        return permission; 
      }
    } else {
      console.error("Selected user or token is missing.");
      notifyError(
        "Unable to save report permission: Selected user or token is missing."
      );
      return permission; 
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
          isEditMode={!!selectedUser} 
          refreshUsers={refreshUsers}
          updateUserStatus={updateUserStatus}
        />
        {isSaved && selectedUser && (
          <OperationPermissionDetails
              profileID={selectedUser.profileID!}
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
