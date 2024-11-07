import React, { useContext, useState } from "react";
import { Box, Container } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ActionButtonGroup, { ButtonProps } from "../../../../components/Button/ActionButtonGroup";
import ProfileDetails from "../SubPage/ProfileDetails";
import ProfileListSearch from "../../CommonPage/AdvanceSearch/ProfileListSearch";
import { ProfileListSearchContext } from "../../../../context/SecurityManagement/ProfileListSearchContext";
import { ProfileListSearchResult } from "../../../../interfaces/SecurityManagement/ProfileListData";
import OperationPermissionDetails, { ModuleOperation } from "../../CommonPage/OperationPermissionDetails";
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";
import { OperationPermissionDetailsDto } from "../../../../interfaces/SecurityManagement/OperationPermissionDetailsDto";

const ProfileListPage: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileListSearchResult | null>(null);
  const { fetchAllProfiles } = useContext(ProfileListSearchContext);
  const { token } = useSelector((state: RootState) => state.userDetails);
  const [permissions, setPermissions] = useState<ModuleOperation[]>([]);

  const handleAdvancedSearch = async () => {
    setIsSearchDialogOpen(true);
    await fetchAllProfiles();
  };

  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false);
  };

  const handleEditProfile = (profile: ProfileListSearchResult) => {
    setSelectedProfile(profile);
    handleCloseSearchDialog();
    setIsSaved(true);
  };

  const handleSave = (profile: ProfileListSearchResult) => {
    setIsSaved(true);
    setSelectedProfile(profile);
  };

  const handleClear = () => {
    setIsSaved(false);
    setSelectedProfile(null);
  };

  const refreshProfiles = async () => {
    await fetchAllProfiles();
  };

  const saveProfileDetails = async (permission: OperationPermissionDetailsDto): Promise<void> => {
    if (selectedProfile && token) {
      try {
        // Construct the payload with necessary fields
        const payload = {
          profDetID: permission.profDetID || 0,
          profileID: selectedProfile.profileID || 0,
          profileName: selectedProfile.profileName,
          aOPRID: permission.aOPRID,
          compID: permission.compID || 0,
          rActiveYN: permission.rActiveYN,
          rNotes: permission.rNotes,
          reportYN: permission.reportYN,
        };

        const result = await ProfileService.saveOrUpdateProfileDetail(payload);
        if (result.success && result.data) {
          const updatedPermission = {
            ...permission,
            profDetID: result.data?.profDetID,
          };

          // Update permissions array
          const updatedPermissions = permissions.map((perm) =>
            perm.operationID === permission.aOPRID
              ? {
                  ...perm,
                  profDetID: result.data?.profDetID,
                  allow: result.data?.rActiveYN === "Y",
                }
              : perm
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

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];
  return (
    <Container maxWidth={false}>
      <Box sx={{ marginBottom: 2 }}>
        <ActionButtonGroup buttons={actionButtons} />
      </Box>
      <ProfileDetails onSave={handleSave} onClear={handleClear} profile={selectedProfile} isEditMode={!!selectedProfile} refreshProfiles={refreshProfiles} />
      {isSaved && selectedProfile && (
        <OperationPermissionDetails
          profileID={selectedProfile.profileID}
          profileName={selectedProfile.profileName}
          saveModulePermission={saveProfileDetails}
          saveReportPermission={saveProfileDetails}
          permissions={permissions}
          setPermissions={setPermissions}
        />
      )}
      <ProfileListSearch open={isSearchDialogOpen} onClose={handleCloseSearchDialog} onEditProfile={handleEditProfile} />
    </Container>
  );
};

export default ProfileListPage;
