import React, { useContext, useState } from "react";
import { Box, Container } from "@mui/material";
import MainLayout from "../../../../layouts/MainLayout/MainLayout";
import SearchIcon from "@mui/icons-material/Search";
import ActionButtonGroup, {
  ButtonProps,
} from "../../../../components/Button/ActionButtonGroup";
import ProfileDetails from "../SubPage/ProfileDetails";
import AccesDetails from "../SubPage/AccessDetails";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/reducers";
import ProfileListSearch from "../../CommonPage/AdvanceSearch/ProfileListSearch";
import { ProfileListSearchContext } from "../../../../context/SecurityManagement/ProfileListSearchContext";
import { ProfileListSearchResult } from "../../../../interfaces/SecurityManagement/ProfileListData";

const ProfileListPage: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileListSearchResult | null>(null);
  const { fetchAllProfiles, searchResults, updateProfileStatus } = useContext(
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
  };

  const userInfo = useSelector((state: RootState) => state.userDetails);
  const effectiveUserID = userInfo
    ? userInfo.adminYN === "Y"
      ? 0
      : userInfo.userID
    : -1;

  const actionButtons: ButtonProps[] = [
    {
      variant: "contained",
      size: "medium",
      icon: SearchIcon,
      text: "Advanced Search",
      onClick: handleAdvancedSearch,
    },
  ];

  const handleSave = () => {
    setIsSaved(true);
    setSelectedProfile(null); // Clear selected profile after saving
  };

  const handleClear = () => {
    setIsSaved(false);
    setSelectedProfile(null); // Clear selected profile after clearing
  };

  const refreshProfiles = async () => {
    await fetchAllProfiles();
  };

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
          refreshProfiles={refreshProfiles} // Pass the refresh function
          updateProfileStatus={updateProfileStatus} // Pass the updateProfileStatus function
        />
        {isSaved && (
          <AccesDetails userID={effectiveUserID} token={userInfo.token} />
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
