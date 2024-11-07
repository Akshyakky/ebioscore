import React, { useState, useContext } from "react";
import { Box, Container } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ActionButtonGroup from "../../../../components/Button/ActionButtonGroup";
import { UserListSearchContext } from "../../../../context/SecurityManagement/UserListSearchContext";
import UserListSearch from "../../CommonPage/AdvanceSearch/UserListSearch";
import UserDetails from "../SubPage/UserDetails";
import { UserListData } from "../../../../interfaces/SecurityManagement/UserListData";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";
import { UserListService } from "../../../../services/SecurityManagementServices/UserListService";
import OperationPermissionDetails, { ModuleOperation } from "../../CommonPage/OperationPermissionDetails";
import { OperationPermissionDetailsDto } from "../../../../interfaces/SecurityManagement/OperationPermissionDetailsDto";

interface OperationPermissionProps {
  profileID: number;
  appUserName: string;
}

const UserListPage: React.FC<OperationPermissionProps> = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const { fetchAllUsers } = useContext(UserListSearchContext);
  const { token, compID } = useSelector((state: RootState) => state.userDetails);

  const [selectedUser, setSelectedUser] = useState<UserListData | null>(null);
  const [isSuperUser, setIsSuperUser] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<ModuleOperation[]>([]);

  const handleSuperUserChange = (isSuper: boolean) => {
    if (selectedUser) {
      setSelectedUser({
        ...selectedUser,
        adminUserYN: isSuper ? "Y" : "N",
      });
      setIsSuperUser(isSuper);
    }
  };

  const handleEditUser = (profile: UserListData) => {
    setSelectedUser(profile);
    setIsSuperUser(profile.adminUserYN === "Y");
    setIsSaved(true);
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
        const result = await UserListService.saveOrUpdateUserPermission({
          auAccessID: permission.auAccessID || 0,
          appID: selectedUser.appID,
          appUName: selectedUser.appUserName,
          aOPRID: permission.aOPRID || 0,
          allowYN: permission.allowYN,
          rActiveYN: permission.rActiveYN,
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
          const updatedPermission = {
            ...permission,
            auAccessID: result.data?.auAccessID,
          };

          const updatedPermissions = permissions.map((perm) =>
            perm.operationID === permission.aOPRID ? { ...perm, auAccessID: result.data?.auAccessID, allow: result.data?.rActiveYN === "Y" } : perm
          );
          setPermissions(updatedPermissions);
        } else {
          console.error(`Error saving module permission ${permission.aOPRID}: ${result.errorMessage}`);
        }
      } catch (error) {
        console.error(`Error saving module permission ${permission.aOPRID}:`, error);
      }
    }
  };

  const saveUserReportPermission = async (permission: OperationPermissionDetailsDto): Promise<void> => {
    if (selectedUser && token) {
      try {
        const result = await UserListService.saveOrUpdateUserReportPermission({
          auAccessID: permission.auAccessID,
          appID: selectedUser.appID,
          appUName: selectedUser.appUserName,
          aOPRID: permission.aOPRID || 0,
          allowYN: permission.allowYN,
          rActiveYN: permission.rActiveYN,
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
          profDetID: permission.profDetID,
        });

        if (result.success) {
          const updatedPermission = {
            ...permission,
            profDetID: result.data?.profDetID,
          };

          const updatedPermissions = permissions.map((perm) =>
            perm.operationID === permission.aOPRID ? { ...perm, profDetID: result.data?.profDetID, allow: result.data?.rActiveYN === "Y" } : perm
          );
          setPermissions(updatedPermissions);
        } else {
          console.error(`Error saving report permission ${permission.aOPRID}: ${result.errorMessage}`);
        }
      } catch (error) {
        console.error(`Error saving report permission ${permission.aOPRID}:`, error);
      }
    }
  };

  return (
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
        onSuperUserChange={handleSuperUserChange}
      />

      {isSaved && selectedUser && !isSuperUser && (
        <OperationPermissionDetails
          profileID={selectedUser.profileID}
          profileName={selectedUser.appUserName}
          saveModulePermission={saveUserPermission}
          saveReportPermission={saveUserReportPermission}
          permissions={permissions}
          setPermissions={setPermissions}
        />
      )}

      <UserListSearch show={isSearchDialogOpen} handleClose={handleCloseSearchDialog} onEditProfile={handleEditUser} />
    </Container>
  );
};

export default UserListPage;
