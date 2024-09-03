import React, { useCallback, useContext } from "react";
import { ProfileListSearchResult } from "../../../../interfaces/SecurityManagement/ProfileListData";
import { ProfileListSearchContext } from "../../../../context/SecurityManagement/ProfileListSearchContext";
import GenericAdvanceSearch from "../../../../components/GenericDialog/GenericAdvanceSearch";
import { debounce } from "../../../../utils/Common/debounceUtils";
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
  const { performSearch, searchResults } = useContext(ProfileListSearchContext);

  const fetchItems = useCallback(async () => {
    return searchResults;
  }, [searchResults]);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, 300),
    [performSearch]
  );

  const updateActiveStatus = async (id: number, status: boolean) => {
    const result = await ProfileService.updateProfileActiveStatus(id, status);
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
      getItemActiveStatus={() => true}//(item) => item.status !== "Hidden"
      searchPlaceholder="Enter profile code or name"
      onSearch={debouncedSearch}
    />
  );
};

export default ProfileListSearch;