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
import {
  ProfileDetailDto,
  ProfileListSearchResult,
} from "../../../../interfaces/SecurityManagement/ProfileListData";
import OperationPermissionDetails from "../SubPage/OperationPermissionDetails";
import { OperationResult } from "../../../../interfaces/Common/OperationResult";
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";
import { RootState } from "../../../../store/reducers";
import { useSelector } from "react-redux";

interface ModuleOperation {
  profDetID?: number;
  operationID: number;
  operationName: string;
  allow: boolean;
}

interface OperationPermissionProps {
  profileID: number;
  profileName: string;
  handleSelectAllChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileListPage: React.FC<OperationPermissionProps> = ({
  profileID,
  profileName,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<ProfileListSearchResult | null>(null);
  const { fetchAllProfiles, updateProfileStatus } = useContext(
    ProfileListSearchContext
  );
  const { token, compID } = useSelector(
    (state: RootState) => state.userDetails
  );
  const [permissions, setPermissions] = useState<ModuleOperation[]>([]);
  const [, setSelectAllChecked] = useState(false);
 

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

  const saveProfileDetails = async (permission: ProfileDetailDto): Promise<void> => {
    if (selectedProfile && token) {
      try {
        const result = await ProfileService.saveOrUpdateProfileDetail(token, {
          profDetID: permission.profDetID || 0,
          profileID: selectedProfile.profileID || 0,
          profileName: selectedProfile.profileName,
          aOPRID: permission.aOPRID, // Assuming 'operationID' is 'aOPRID'
          compID: permission.compID || 0,
          rActiveYN: permission.rActiveYN,
          rNotes: permission.rNotes,
          reportYN: permission.reportYN,
        });
  
        if (result.success) {
          const updatedPermission = {
            ...permission,
            profDetID: result.data?.profDetID,
          };
          console.log("Updated permission:", updatedPermission);
        } else {
          console.error(
            `Error saving module permission ${permission.aOPRID}: ${result.errorMessage}`
          );
        }
      } catch (error) {
        console.error(
          `Error saving module permission ${permission.aOPRID}:`,
          error
        );
      }
    }
  };

  const handleSelectAllChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const allow = event.target.checked;
    const updatedPermissions = permissions.map((permission) => ({
      ...permission,
      allow,
    }));

    setPermissions(updatedPermissions);
    setSelectAllChecked(allow);

    if (profileID) {
      try {
        const profileDetails: ProfileDetailDto[] = updatedPermissions.map(
          (permission) => ({
            profDetID: permission.profDetID || 0,
            profileID: profileID,
            profileName: profileName,
            aOPRID: permission.operationID,
            compID: compID!,
            rActiveYN: allow ? "Y" : "N",
            rNotes: "",
            reportYN: "N",
          })
        );

        for (const detail of profileDetails) {
          const result: OperationResult<ProfileDetailDto> =
            await ProfileService.saveOrUpdateProfileDetail(token!, detail);
          if (result.success) {
            const updatedPermission = permissions.find(
              (permission) => permission.operationID === detail.aOPRID
            );
            if (updatedPermission) {
              updatedPermission.profDetID = result.data?.profDetID;
            }
          } else {
            console.error(
              `Error saving permission ${detail.aOPRID}: ${result.errorMessage}`
            );
          }
        }
      } catch (error) {
        console.error("Error saving permissions:", error);
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
            saveModulePermission={saveProfileDetails}
            saveReportPermission={saveProfileDetails}
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






























