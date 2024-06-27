import React, { useContext, useState } from "react";
import { Box, Container } from "@mui/material";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import SearchIcon from "@mui/icons-material/Search";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import ProfileDetails from "../SubPage/ProfileDetails";
import ProfileListSearch from "../../CommonPage/AdvanceSearch/ProfileListSearch";
import { ProfileListSearchContext } from "../../../../context/SecurityManagement/ProfileListSearchContext";
import { ProfileListSearchResult } from "../../../../interfaces/SecurityManagement/ProfileListData";
import OperationPermissionDetails from "../SubPage/OperationPermissionDetails";

const ProfileListPage: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileListSearchResult | null>(null);
  const { fetchAllProfiles, updateProfileStatus } = useContext(
    ProfileListSearchContext
  );

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

  const handleSave = async (profile: ProfileListSearchResult) => {
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
    <MainLayout>
      <Container maxWidth={false}>
        <Box sx={{ marginBottom: 2 }}>
          <ActionButtonGroup buttons={actionButtons} />
        </Box>
        <ProfileDetails
          onSave={handleSave}
          onClear={handleClear}
          profile={selectedProfile}
          isEditMode={!!selectedProfile}
          refreshProfiles={refreshProfiles}
          updateProfileStatus={updateProfileStatus}
        />
        {isSaved && selectedProfile && (
          <OperationPermissionDetails
            profileID={selectedProfile.profileID}
            profileName={selectedProfile.profileName}
          />
        )}
        <ProfileListSearch
          show={isSearchDialogOpen}
          handleClose={handleCloseSearchDialog}
          onEditProfile={handleEditProfile}
        />
      </Container>
    </MainLayout>
  );
};

export default ProfileListPage;
