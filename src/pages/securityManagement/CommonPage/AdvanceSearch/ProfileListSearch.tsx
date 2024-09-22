import React, { useCallback, useContext, useState } from "react";
import { ProfileListSearchResult } from "../../../../interfaces/SecurityManagement/ProfileListData";
import { ProfileListSearchContext } from "../../../../context/SecurityManagement/ProfileListSearchContext";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { ProfileService } from "../../../../services/SecurityManagementServices/ProfileListServices";

interface ProfileListSearchProps {
  open: boolean;
  onClose: () => void;
  onEditProfile: (profile: ProfileListSearchResult) => void;
}

const ProfileListSearch: React.FC<ProfileListSearchProps> = ({
  open,
  onClose,
  onEditProfile,
}) => {
  const { fetchAllProfiles } = useContext(ProfileListSearchContext);
  const [profiles, setProfiles] = useState<ProfileListSearchResult[]>([]);

  const fetchItems = useCallback(async () => {
    const fetchedProfiles = await fetchAllProfiles();
    setProfiles(fetchedProfiles);
    return fetchedProfiles;
  }, [fetchAllProfiles]);

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await ProfileService.updateProfileActiveStatus(id, status);
    if (result.success) {
      await fetchItems();
    }
    return result.success;
  };

  const columns = [
    { key: "serialNumber", header: "Sl.No", visible: true },
    { key: "profileCode", header: "Profile Code", visible: true },
    { key: "profileName", header: "Profile Name", visible: true },
    { key: "rNotes", header: "Notes", visible: true },
  ];

  return (
    <GenericAdvanceSearch<ProfileListSearchResult>
      open={open}
      onClose={onClose}
      onSelect={onEditProfile}
      title="PROFILE SEARCH LIST"
      fetchItems={fetchItems}
      updateActiveStatus={updateActiveStatus}
      columns={columns}
      getItemId={(item) => item.profileID}
      getItemActiveStatus={(item) => item.rActiveYN === "Y"}
      searchPlaceholder="Enter profile code or name"
      isEditButtonVisible={true}
      isActionVisible={true}
      isStatusVisible={true}
    />
  );
};

export default ProfileListSearch;
